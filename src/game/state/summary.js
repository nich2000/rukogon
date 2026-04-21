export function serializeSummary(state) {
  return {
    score: state.score,
    pressure: state.pressure,
    remainingProblems: state.problems.length,
    time: state.time,
    reason: state.gameOverReason,
  };
}
