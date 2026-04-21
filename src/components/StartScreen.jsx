import { GAME_MODES } from '../game/constants';

export function StartScreen({ mode, bestScore, onStart, reason, mapErrors }) {
  const isGameOver = mode === GAME_MODES.gameOver;
  const canStart = mapErrors.length === 0;
  const title = isGameOver
    ? 'Этап потерян'
    : canStart
      ? 'Гонка начинается'
      : 'Карта требует настройки';
  const heading = isGameOver
    ? 'Контроль над этапом потерян'
    : canStart
      ? 'Держи площадку в ритме'
      : 'Исправь карту перед стартом';

  return (
    <div className="overlay-card">
      <p className="eyebrow">{title}</p>
      <h2>{heading}</h2>
      <p>
        Двигайся стрелками или `WASD` только по дорогам и тропинкам. Подойди к
        проблеме и удерживай позицию, пока шкала решения не заполнится.
      </p>
      {reason ? <p className="danger-text">{reason}</p> : null}
      {mapErrors.length ? (
        <ul className="tips-list">
          {mapErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <p>
        Лучший результат: <strong>{bestScore}</strong>
      </p>
      <ul className="tips-list">
        <li>Трасса: происшествия с анимацией устранения.</li>
        <li>Штаб: срочные документы.</li>
        <li>Трибуны: зрители требуют внимания.</li>
        <li>Касса: злоумышленники давят на вход.</li>
        <li>Паддок: споры между участниками и командами.</li>
      </ul>
      <button type="button" className="start-button" onClick={onStart} disabled={!canStart}>
        {isGameOver ? 'Новый заезд' : 'Старт'}
      </button>
    </div>
  );
}
