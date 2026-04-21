export function Hud({
  bestScore,
  sessions,
  isRunning,
  isPaused,
  canStart,
  onStart,
  onStop,
  onPause,
  onResume,
  audioEnabled,
  onToggleAudio,
  autoEnabled,
  onToggleAuto,
  mouseControlEnabled,
  onToggleMouseControl,
  mobileProblemsEnabled,
  onToggleMobileProblems,
  npcEnabled,
  onToggleNpc,
  editorMode,
  onToggleEditor,
  editorContent,
}) {
  return (
    <aside className="hud-stack">
      <section className="hud-card">
        <p className="eyebrow">Arcade Drift Control</p>
        <h1>Рукогон</h1>
        <p className="lead">
          Руководитель гонки держит этап дрифта под контролем, пока инциденты,
          документы, зрители, злоумышленники и споры не накрыли площадку.
        </p>
        <div className="hud-row">
          <span>Лучший результат</span>
          <strong>{bestScore}</strong>
        </div>
        <div className="hud-row">
          <span>Сессии</span>
          <strong>{sessions}</strong>
        </div>
      </section>

      <section className="hud-card">
        <p className="eyebrow">Управление</p>
        <div className="hud-actions">
          <button
            type="button"
            className="audio-toggle"
            onClick={isRunning || isPaused ? onStop : onStart}
            disabled={!canStart && !isRunning && !isPaused}
          >
            {isRunning || isPaused ? 'Стоп' : 'Старт'}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={isPaused ? onResume : onPause}
            disabled={!isRunning && !isPaused}
          >
            {isPaused ? 'Продолжить' : 'Пауза'}
          </button>
          <button type="button" className="ghost-button" onClick={onToggleEditor}>
            {editorMode ? 'Режим редактирования: вкл' : 'Режим редактирования: выкл'}
          </button>
        </div>
      </section>

      {editorMode ? (
        editorContent
      ) : (
        <section className="hud-card">
          <p className="eyebrow">Опции</p>
          <div className="hud-actions">
            <button type="button" className="ghost-button" onClick={onToggleAudio}>
              Звук: {audioEnabled ? 'вкл' : 'выкл'}
            </button>
            <button type="button" className="ghost-button" onClick={onToggleAuto}>
              Автобот: {autoEnabled ? 'вкл' : 'выкл'}
            </button>
            <button type="button" className="ghost-button" onClick={onToggleMouseControl}>
              Мышь: {mouseControlEnabled ? 'вкл' : 'выкл'}
            </button>
            <button type="button" className="ghost-button" onClick={onToggleMobileProblems}>
              Подвижные проблемы: {mobileProblemsEnabled ? 'вкл' : 'выкл'}
            </button>
            <button type="button" className="ghost-button" onClick={onToggleNpc}>
              NPC: {npcEnabled ? 'вкл' : 'выкл'}
            </button>
          </div>
        </section>
      )}
    </aside>
  );
}
