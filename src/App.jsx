import { useMemo, useState } from 'react';

import { GameCanvas } from './components/GameCanvas';
import { Hud } from './components/Hud';
import { MapEditor } from './components/MapEditor';
import { StartScreen } from './components/StartScreen';
import { usePersistentState } from './hooks/usePersistentState';
import { createGameConfig } from './game/config';
import { GAME_MODES, TILE_TYPES, TILE_SYMBOLS } from './game/constants';
import { DEFAULT_LABEL_POSITIONS, DEFAULT_MAP_ROWS } from './game/map/mapDefinition';
import './styles/app.css';

const STORAGE_KEY = 'rukogon-save';

const defaultSave = {
  bestScore: 0,
  sessions: 0,
  audioEnabled: false,
  autoEnabled: false,
  mobileProblemsEnabled: false,
  customMapRows: DEFAULT_MAP_ROWS,
  labelPositions: DEFAULT_LABEL_POSITIONS,
};

function App() {
  const [saveData, setSaveData] = usePersistentState(STORAGE_KEY, defaultSave);
  const [mode, setMode] = useState(GAME_MODES.menu);
  const [runSeed, setRunSeed] = useState(0);
  const [editorMode, setEditorMode] = useState(false);
  const [selectedTileType, setSelectedTileType] = useState(TILE_TYPES.asphalt);
  const [lastGameOverReason, setLastGameOverReason] = useState(null);
  const [importError, setImportError] = useState(null);
  const mapRows = saveData.customMapRows || DEFAULT_MAP_ROWS;
  const labelPositions = saveData.labelPositions || DEFAULT_LABEL_POSITIONS;
  const config = useMemo(
    () => createGameConfig(mapRows, labelPositions, {
      mobileProblemsEnabled: saveData.mobileProblemsEnabled,
    }),
    [labelPositions, mapRows, saveData.mobileProblemsEnabled],
  );

  const handleStart = () => {
    if (!config.map.isPlayable) {
      return;
    }

    if (mode === GAME_MODES.paused) {
      setMode(GAME_MODES.running);
      return;
    }

    setLastGameOverReason(null);
    setRunSeed((seed) => seed + 1);
    setMode(GAME_MODES.running);
    setEditorMode(false);
  };

  const handleGameOver = (summary) => {
    setMode(GAME_MODES.gameOver);
    setLastGameOverReason(summary.reason || 'Контроль над этапом потерян.');
    setSaveData((prev) => ({
      ...prev,
      bestScore: Math.max(prev.bestScore, summary.score),
      sessions: prev.sessions + 1,
    }));
  };

  const handleReturnToMenu = () => {
    setMode(GAME_MODES.menu);
  };

  const handlePause = () => {
    if (mode === GAME_MODES.running) {
      setMode(GAME_MODES.paused);
    }
  };

  const handleToggleAudio = () => {
    setSaveData((prev) => ({
      ...prev,
      audioEnabled: !prev.audioEnabled,
    }));
  };

  const handleToggleAuto = () => {
    setSaveData((prev) => ({
      ...prev,
      autoEnabled: !prev.autoEnabled,
    }));
  };

  const handleToggleMobileProblems = () => {
    setSaveData((prev) => ({
      ...prev,
      mobileProblemsEnabled: !prev.mobileProblemsEnabled,
    }));
  };

  const handleToggleEditor = () => {
    setEditorMode((current) => !current);
    setMode((currentMode) =>
      currentMode === GAME_MODES.running ? GAME_MODES.menu : currentMode,
    );
  };

  const handleResetMap = () => {
    setImportError(null);
    setSaveData((prev) => ({
      ...prev,
      customMapRows: DEFAULT_MAP_ROWS,
      labelPositions: DEFAULT_LABEL_POSITIONS,
    }));
  };

  const handlePaintTile = ({ tileX, tileY }) => {
    if (!editorMode) {
      return;
    }

    setSaveData((prev) => {
      const rows = [...(prev.customMapRows || DEFAULT_MAP_ROWS)];
      const nextRow = rows[tileY].split('');
      nextRow[tileX] = TILE_SYMBOLS[selectedTileType];
      rows[tileY] = nextRow.join('');

      return {
        ...prev,
        customMapRows: rows,
      };
    });
  };

  const handleSaveMap = () => {
    const payload = {
      version: 1,
      mapRows,
      labelPositions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rukogon-map.json';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLoadMap = async (event) => {
    const [file] = Array.from(event.target.files || []);
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validSymbols = new Set(Object.values(TILE_SYMBOLS));
      const nextRows = parsed?.mapRows;
      const nextLabels = parsed?.labelPositions;

      if (!Array.isArray(nextRows) || !nextRows.length) {
        throw new Error('В файле нет массива mapRows.');
      }

      const width = nextRows[0].length;
      const rowsValid = nextRows.every(
        (row) =>
          typeof row === 'string'
          && row.length === width
          && row.split('').every((symbol) => validSymbols.has(symbol)),
      );

      if (!rowsValid) {
        throw new Error('mapRows содержит строки неверного формата или неизвестные тайлы.');
      }

      if (!nextLabels || typeof nextLabels !== 'object') {
        throw new Error('В файле нет объекта labelPositions.');
      }

      const requiredLabels = Object.keys(DEFAULT_LABEL_POSITIONS);
      const labelsValid = requiredLabels.every((key) => {
        const point = nextLabels[key];
        return point && Number.isFinite(point.x) && Number.isFinite(point.y);
      });

      if (!labelsValid) {
        throw new Error('labelPositions содержит неполные или некорректные координаты.');
      }

      setImportError(null);
      setSaveData((prev) => ({
        ...prev,
        customMapRows: nextRows,
        labelPositions: requiredLabels.reduce((acc, key) => {
          acc[key] = {
            x: nextLabels[key].x,
            y: nextLabels[key].y,
          };
          return acc;
        }, {}),
      }));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Не удалось загрузить карту.');
    }
  };

  const handleMoveLabel = ({ key, x, y }) => {
    if (!editorMode) {
      return;
    }

    setSaveData((prev) => ({
      ...prev,
      labelPositions: {
        ...(prev.labelPositions || DEFAULT_LABEL_POSITIONS),
        [key]: { x, y },
      },
    }));
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <main className="app-layout">
        <aside className="app-sidebar">
          <Hud
            bestScore={saveData.bestScore}
            sessions={saveData.sessions}
            isRunning={mode === GAME_MODES.running}
            isPaused={mode === GAME_MODES.paused}
            canStart={config.map.isPlayable}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleStart}
            audioEnabled={saveData.audioEnabled}
            onToggleAudio={handleToggleAudio}
            autoEnabled={Boolean(saveData.autoEnabled)}
            onToggleAuto={handleToggleAuto}
            mobileProblemsEnabled={Boolean(saveData.mobileProblemsEnabled)}
            onToggleMobileProblems={handleToggleMobileProblems}
            editorMode={editorMode}
            onToggleEditor={handleToggleEditor}
            editorContent={
              editorMode ? (
                <MapEditor
                  editorMode={editorMode}
                  selectedTileType={selectedTileType}
                  tileOptions={config.map.editableTiles}
                  onSelectTile={setSelectedTileType}
                  mapErrors={config.map.errors}
                  onSaveMap={handleSaveMap}
                  onLoadMap={handleLoadMap}
                  importError={importError}
                />
              ) : null
            }
          />
        </aside>
        <section className="game-panel">
          {mode !== GAME_MODES.running && mode !== GAME_MODES.paused && !editorMode ? (
            <StartScreen
              mode={mode}
              bestScore={saveData.bestScore}
              onStart={handleStart}
              reason={mode === GAME_MODES.gameOver ? lastGameOverReason : null}
              mapErrors={config.map.errors}
            />
          ) : null}
          <GameCanvas
            key={runSeed}
            config={config}
            isActive={mode === GAME_MODES.running && !editorMode}
            audioEnabled={saveData.audioEnabled}
            autoEnabled={Boolean(saveData.autoEnabled)}
            onGameOver={handleGameOver}
            onReturnToMenu={handleReturnToMenu}
            editorMode={editorMode}
            onPaintTile={handlePaintTile}
            onMoveLabel={handleMoveLabel}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
