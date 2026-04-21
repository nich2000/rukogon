function getProblemPosition(problem, config) {
  if (typeof problem.x === 'number' && typeof problem.y === 'number') {
    return {
      x: problem.x,
      y: problem.y,
    };
  }

  return {
    x: problem.tileX * config.tileSize + config.tileSize / 2,
    y: problem.tileY * config.tileSize + config.tileSize / 2,
  };
}

function updateEffects(state, deltaTime) {
  state.effects = state.effects
    .map((effect) => ({
      ...effect,
      life: effect.life - deltaTime,
      phase: effect.phase + deltaTime,
    }))
    .filter((effect) => effect.life > 0);
}

function createResolveEffect(problem, position) {
  return {
    id: `effect-${problem.id}-${performance.now()}`,
    type: problem.type,
    x: position.x,
    y: position.y,
    life: 0.8,
    phase: 0,
    portrait: true,
  };
}

function getSolveTime(problem) {
  const baseSolveTime = problem.baseSolveTime ?? problem.solveTime;
  const speedMultiplier = problem.mobile ? 1.5 : 1.2;
  return baseSolveTime / speedMultiplier;
}

function getBurnoutTime(problem, state) {
  const baseBurnoutTime = problem.baseBurnoutTime ?? problem.burnoutTime;
  const slowerBurnout = baseBurnoutTime * 1.2;

  if (problem.mobile) {
    return slowerBurnout;
  }

  const accelerationMultiplier = 1 + state.score * 0.01;
  return slowerBurnout / accelerationMultiplier;
}

export function createProblemResolver() {
  return {
    update(state, config, deltaTime) {
      const player = state.player;
      const radius = config.player.resolveRadius;

      updateEffects(state, deltaTime);

      state.problems = state.problems.filter((problem) => {
        const position = getProblemPosition(problem, config);
        const distance = Math.hypot(position.x - player.x, position.y - player.y);
        const solveTime = getSolveTime(problem);
        const burnoutTime = getBurnoutTime(problem, state);
        problem.animationPhase += deltaTime * 4;
        problem.currentSolveTime = solveTime;
        problem.currentBurnoutTime = burnoutTime;
        problem.waitProgress = Math.min(
          (state.time - problem.createdAt) / burnoutTime,
          1,
        );

        if (problem.waitProgress >= 1) {
          state.phase = 'gameOver';
          state.gameOverReason = `Сгорела проблема: ${problem.label}`;
          state.failedProblem = problem;
          return true;
        }

        if (distance <= radius) {
          problem.caughtByPlayer = Boolean(problem.mobile);
          problem.progress += deltaTime;
          if (problem.progress >= solveTime) {
            state.score += 1;
            state.effects.push(createResolveEffect(problem, position));
            return false;
          }
        } else {
          if (problem.mobile) {
            problem.caughtByPlayer = false;
          }
          problem.progress = Math.max(0, problem.progress - deltaTime * 0.45);
        }

        return true;
      });
    },
  };
}
