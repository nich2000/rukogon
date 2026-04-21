export function createPressureModel() {
  return {
    update(state, config) {
      const weightedProblems = state.problems.reduce(
        (total, problem) => total + problem.severity,
        0,
      );
      state.pressure = (weightedProblems / config.gameOverThreshold) * 100;
      if (state.problems.length >= config.gameOverThreshold && state.phase !== 'gameOver') {
        state.phase = 'gameOver';
        state.gameOverReason = 'Площадка перегружена количеством проблем.';
      }
    },
  };
}
