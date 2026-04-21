export function MapEditor({
  editorMode,
  selectedTileType,
  tileOptions,
  onSelectTile,
  mapErrors,
  onSaveMap,
  onLoadMap,
  importError,
}) {
  return (
    <section className="hud-card editor-card is-open">
      <div className="editor-header">
        <div>
          <p className="eyebrow">Tile Editor</p>
          <h2>Редактор карты</h2>
        </div>
        <p className="editor-note">
          Выберите категорию тайла и кликайте по полю, чтобы перекрашивать карту.
        </p>
      </div>
      <div className="tile-palette">
        {tileOptions.map((tile) => (
          <button
            key={tile.type}
            type="button"
            className={`tile-chip ${selectedTileType === tile.type ? 'is-selected' : ''}`}
            onClick={() => onSelectTile(tile.type)}
          >
            {tile.label}
          </button>
        ))}
      </div>
      <div className="editor-actions">
        <button type="button" className="ghost-button" onClick={onSaveMap}>
          Сохранить карту
        </button>
        <label className="ghost-button file-button">
          Загрузить карту
          <input type="file" accept="application/json,.json" onChange={onLoadMap} />
        </label>
      </div>
      {importError ? <p className="danger-text">{importError}</p> : null}
      {mapErrors.length ? (
        <div className="editor-errors">
          {mapErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : (
        <p className="editor-valid">Все ключевые ограничения карты соблюдены.</p>
      )}
    </section>
  );
}
