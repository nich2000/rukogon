import { createInitialState } from './state/createInitialState';
import { updatePlayerMovement } from './systems/movementSystem';

export function createGameSession({ config, onGameOver }) {
  const state = createInitialState(config);
  const { spawning, mobileProblems, resolution, pressure } = config.algorithms;
  let destroyed = false;
  let gameOverNotified = false;

  return {
    step(deltaTime, inputState) {
      if (destroyed || state.phase === 'gameOver') {
        return;
      }

      state.time += deltaTime;
      updatePlayerMovement(state, inputState, config, deltaTime);
      spawning.update(state, config, deltaTime);
      mobileProblems.update(state, config, deltaTime);
      resolution.update(state, config, deltaTime);
      pressure.update(state, config);

      if (state.phase === 'gameOver' && !gameOverNotified) {
        gameOverNotified = true;
        onGameOver(state);
      }
    },
    getState() {
      return state;
    },
    destroy() {
      destroyed = true;
    },
  };
}
