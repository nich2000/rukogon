import { useEffect, useMemo, useState } from 'react';

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

function isValidMapRows(mapRows) {
  if (!Array.isArray(mapRows) || !mapRows.length) {
    return false;
  }

  const width = mapRows[0]?.length;
  const validSymbols = new Set(Object.values(TILE_SYMBOLS));

  return mapRows.every(
    (row) =>
      typeof row === 'string'
      && row.length === width
      && row.split('').every((symbol) => validSymbols.has(symbol)),
  );
}

function normalizeLabelPositions(labelPositions) {
  const requiredLabels = Object.keys(DEFAULT_LABEL_POSITIONS);

  if (!labelPositions || typeof labelPositions !== 'object') {
    return null;
  }

  const isValid = requiredLabels.every((key) => {
    const point = labelPositions[key];
    return point && Number.isFinite(point.x) && Number.isFinite(point.y);
  });

  if (!isValid) {
    return null;
  }

  return requiredLabels.reduce((acc, key) => {
    acc[key] = {
      x: labelPositions[key].x,
      y: labelPositions[key].y,
    };
    return acc;
  }, {});
}

function hasLegacyDefaultMap(saveData) {
  if (!Array.isArray(saveData?.customMapRows) || !saveData?.labelPositions) {
    return false;
  }

  return (
    JSON.stringify(saveData.customMapRows) === JSON.stringify(DEFAULT_MAP_ROWS)
    && JSON.stringify(saveData.labelPositions) === JSON.stringify(DEFAULT_LABEL_POSITIONS)
  );
}

const defaultSave = {
  bestScore: 0,
  sessions: 0,
  audioEnabled: false,
  autoEnabled: false,
  mouseControlEnabled: false,
  mobileProblemsEnabled: false,
  npcEnabled: true,
  customMapRows: null,
  labelPositions: null,
};

function App() {
  const [saveData, setSaveData] = usePersistentState(STORAGE_KEY, defaultSave);
  const [mode, setMode] = useState(GAME_MODES.menu);
  const [runSeed, setRunSeed] = useState(0);
  const [editorMode, setEditorMode] = useState(false);
  const [selectedTileType, setSelectedTileType] = useState(TILE_TYPES.asphalt);
  const [lastGameOverReason, setLastGameOverReason] = useState(null);
  const [importError, setImportError] = useState(null);
  const [defaultTrackData, setDefaultTrackData] = useState({
    mapRows: DEFAULT_MAP_ROWS,
    labelPositions: DEFAULT_LABEL_POSITIONS,
  });
  const mapRows = saveData.customMapRows || defaultTrackData.mapRows;
  const labelPositions = saveData.labelPositions || defaultTrackData.labelPositions;
  const config = useMemo(
    () => createGameConfig(mapRows, labelPositions, {
      mobileProblemsEnabled: saveData.mobileProblemsEnabled,
      npcEnabled: saveData.npcEnabled,
    }),
    [labelPositions, mapRows, saveData.mobileProblemsEnabled, saveData.npcEnabled],
  );

  useEffect(() => {
    let cancelled = false;

    const loadDefaultTrack = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}tracks/default.json`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const parsed = await response.json();
        if (cancelled) {
          return;
        }

        const nextMapRows = isValidMapRows(parsed?.mapRows) ? parsed.mapRows : DEFAULT_MAP_ROWS;
        const nextLabelPositions =
          normalizeLabelPositions(parsed?.labelPositions) || DEFAULT_LABEL_POSITIONS;

        setDefaultTrackData({
          mapRows: nextMapRows,
          labelPositions: nextLabelPositions,
        });
      } catch {
        if (!cancelled) {
          setDefaultTrackData({
            mapRows: DEFAULT_MAP_ROWS,
            labelPositions: DEFAULT_LABEL_POSITIONS,
          });
        }
      }
    };

    loadDefaultTrack();

    return () => {
      cancelled = true;
    };
  }, [setSaveData]);

  useEffect(() => {
    if (!hasLegacyDefaultMap(saveData)) {
      return;
    }

    setSaveData((prev) => {
      if (!hasLegacyDefaultMap(prev)) {
        return prev;
      }

      return {
        ...prev,
        customMapRows: defaultTrackData.mapRows,
        labelPositions: defaultTrackData.labelPositions,
      };
    });
  }, [defaultTrackData.labelPositions, defaultTrackData.mapRows, saveData, setSaveData]);

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

  const handleResume = () => {
    if (mode === GAME_MODES.paused) {
      setMode(GAME_MODES.running);
    }
  };

  const handleStop = () => {
    if (mode === GAME_MODES.running || mode === GAME_MODES.paused) {
      setMode(GAME_MODES.menu);
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

  const handleToggleMouseControl = () => {
    setSaveData((prev) => ({
      ...prev,
      mouseControlEnabled: !prev.mouseControlEnabled,
    }));
  };

  const handleToggleMobileProblems = () => {
    setSaveData((prev) => ({
      ...prev,
      mobileProblemsEnabled: !prev.mobileProblemsEnabled,
    }));
  };

  const handleToggleNpc = () => {
    setSaveData((prev) => ({
      ...prev,
      npcEnabled: !(prev.npcEnabled ?? true),
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
      customMapRows: defaultTrackData.mapRows,
      labelPositions: defaultTrackData.labelPositions,
    }));
  };

  const handlePaintTile = ({ tileX, tileY }) => {
    if (!editorMode) {
      return;
    }

    setSaveData((prev) => {
      const rows = [...(prev.customMapRows || defaultTrackData.mapRows)];
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
      const nextRows = parsed?.mapRows;
      const nextLabels = normalizeLabelPositions(parsed?.labelPositions);

      if (!isValidMapRows(nextRows)) {
        throw new Error('mapRows содержит строки неверного формата или неизвестные тайлы.');
      }

      if (!nextLabels) {
        throw new Error('labelPositions содержит неполные или некорректные координаты.');
      }

      setImportError(null);
      setSaveData((prev) => ({
        ...prev,
        customMapRows: nextRows,
        labelPositions: nextLabels,
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
        ...(prev.labelPositions || defaultTrackData.labelPositions),
        [key]: { x, y },
      },
    }));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (editorMode) {
        return;
      }

      const target = event.target;
      const isTextInput =
        target instanceof HTMLElement
        && (
          target.tagName === 'INPUT'
          || target.tagName === 'TEXTAREA'
          || target.isContentEditable
        );

      if (isTextInput) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();

        if (mode === GAME_MODES.running) {
          handlePause();
          return;
        }

        if (mode === GAME_MODES.paused) {
          handleResume();
          return;
        }

        if (config.map.isPlayable) {
          handleStart();
        }
      }

      if (event.code === 'Escape') {
        if (mode === GAME_MODES.running || mode === GAME_MODES.paused) {
          event.preventDefault();
          handleStop();
        }
      }

      if (event.code === 'Enter') {
        if (mode !== GAME_MODES.running && config.map.isPlayable) {
          event.preventDefault();
          setLastGameOverReason(null);
          setRunSeed((seed) => seed + 1);
          setMode(GAME_MODES.running);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config.map.isPlayable, editorMode, mode]);

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
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
            audioEnabled={saveData.audioEnabled}
            onToggleAudio={handleToggleAudio}
            autoEnabled={Boolean(saveData.autoEnabled)}
            onToggleAuto={handleToggleAuto}
            mouseControlEnabled={Boolean(saveData.mouseControlEnabled)}
            onToggleMouseControl={handleToggleMouseControl}
            mobileProblemsEnabled={Boolean(saveData.mobileProblemsEnabled)}
            onToggleMobileProblems={handleToggleMobileProblems}
            npcEnabled={saveData.npcEnabled ?? true}
            onToggleNpc={handleToggleNpc}
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
            mouseControlEnabled={Boolean(saveData.mouseControlEnabled)}
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
