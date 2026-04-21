function getProblemPosition(problem, config) {
  if (typeof problem.x === 'number' && typeof problem.y === 'number') {
    return { x: problem.x, y: problem.y };
  }

  return {
    x: problem.tileX * config.tileSize + config.tileSize / 2,
    y: problem.tileY * config.tileSize + config.tileSize / 2,
  };
}

function pickRandomWalkableTarget(config) {
  const points = config.map.walkableTiles;
  return points[Math.floor(Math.random() * points.length)];
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y);
  if (!length) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function isWalkablePixel(config, x, y) {
  const tileX = Math.floor(x / config.tileSize);
  const tileY = Math.floor(y / config.tileSize);
  if (tileX < 0 || tileY < 0 || tileX >= config.map.width || tileY >= config.map.height) {
    return false;
  }

  return config.map.isWalkable(config.map.tiles[tileY][tileX]);
}

function setProblemTile(problem, config) {
  problem.tileX = Math.max(
    0,
    Math.min(config.map.width - 1, Math.floor(problem.x / config.tileSize)),
  );
  problem.tileY = Math.max(
    0,
    Math.min(config.map.height - 1, Math.floor(problem.y / config.tileSize)),
  );
}

export function createBotProblemController() {
  return {
    update(state, config, deltaTime) {
      if (!config.mobileProblems.enabled) {
        state.problems.forEach((problem) => {
          if (problem.mobile) {
            problem.moving = false;
            problem.targetTile = null;
          }
        });
        return;
      }

      const player = state.player;

      state.problems.forEach((problem) => {
        if (!problem.mobile) {
          return;
        }

        const position = getProblemPosition(problem, config);
        problem.x = position.x;
        problem.y = position.y;

        const distanceToPlayer = Math.hypot(player.x - problem.x, player.y - problem.y);
        problem.caughtByPlayer = distanceToPlayer <= config.player.resolveRadius;

        if (problem.caughtByPlayer) {
          problem.moving = false;
          setProblemTile(problem, config);
          return;
        }

        if (!problem.targetTile) {
          problem.targetTile = pickRandomWalkableTarget(config);
        }

        const targetX = problem.targetTile.x * config.tileSize + config.tileSize / 2;
        const targetY = problem.targetTile.y * config.tileSize + config.tileSize / 2;
        const toTarget = { x: targetX - problem.x, y: targetY - problem.y };
        const distanceToTarget = Math.hypot(toTarget.x, toTarget.y);

        if (distanceToTarget <= config.mobileProblems.targetReachRadius) {
          problem.targetTile = pickRandomWalkableTarget(config);
          problem.moving = false;
          setProblemTile(problem, config);
          return;
        }

        const direction = normalize(toTarget);
        const speedMultiplier = 1 + state.score * 0.01;
        const travelDistance = config.mobileProblems.speed * speedMultiplier * deltaTime;
        const nextX = problem.x + direction.x * travelDistance;
        const nextY = problem.y + direction.y * travelDistance;

        if (!isWalkablePixel(config, nextX, nextY)) {
          problem.targetTile = pickRandomWalkableTarget(config);
          problem.moving = false;
          setProblemTile(problem, config);
          return;
        }

        problem.x = nextX;
        problem.y = nextY;
        problem.moving = true;
        problem.facing =
          Math.abs(direction.x) > Math.abs(direction.y)
            ? direction.x >= 0
              ? 'right'
              : 'left'
            : direction.y >= 0
              ? 'down'
              : 'up';
        setProblemTile(problem, config);
      });
    },
  };
}
