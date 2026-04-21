export function createUiSnapshot(state) {
  return {
    score: state.score,
    pressure: state.pressure,
    phase: state.phase,
    problems: state.problems.map((problem) => ({
      id: problem.id,
      type: problem.type,
      progress: problem.progress,
      solveTime: problem.currentSolveTime ?? problem.solveTime,
      waitProgress: problem.waitProgress,
      mobile: problem.mobile,
      moving: problem.moving,
    })),
  };
}
