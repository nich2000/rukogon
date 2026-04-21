function createEmptyInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
  };
}

function getTileKey(x, y) {
  return `${x}:${y}`;
}

function getProblemTile(problem, config) {
  return {
    x: Math.max(
      0,
      Math.min(config.map.width - 1, Math.floor((problem.x ?? problem.tileX * config.tileSize) / config.tileSize)),
    ),
    y: Math.max(
      0,
      Math.min(config.map.height - 1, Math.floor((problem.y ?? problem.tileY * config.tileSize) / config.tileSize)),
    ),
  };
}

function getPlayerTile(state, config) {
  return {
    x: Math.max(0, Math.min(config.map.width - 1, Math.floor(state.player.x / config.tileSize))),
    y: Math.max(0, Math.min(config.map.height - 1, Math.floor(state.player.y / config.tileSize))),
  };
}

function isWalkableTile(x, y, config) {
  if (x < 0 || y < 0 || x >= config.map.width || y >= config.map.height) {
    return false;
  }

  return config.map.isWalkable(config.map.tiles[y][x]);
}

function buildDistanceMap(startTile, config) {
  const queue = [startTile];
  const distances = new Map([[getTileKey(startTile.x, startTile.y), 0]]);
  const previous = new Map();
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  while (queue.length) {
    const current = queue.shift();
    const currentKey = getTileKey(current.x, current.y);
    const currentDistance = distances.get(currentKey);

    directions.forEach((direction) => {
      const nextX = current.x + direction.x;
      const nextY = current.y + direction.y;
      const nextKey = getTileKey(nextX, nextY);

      if (!isWalkableTile(nextX, nextY, config) || distances.has(nextKey)) {
        return;
      }

      distances.set(nextKey, currentDistance + 1);
      previous.set(nextKey, current);
      queue.push({ x: nextX, y: nextY });
    });
  }

  return { distances, previous };
}

function selectTargetProblem(state, config, distances) {
  let bestProblem = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  state.problems.forEach((problem) => {
    const tile = getProblemTile(problem, config);
    const distance = distances.get(getTileKey(tile.x, tile.y));
    if (distance === undefined) {
      return;
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      bestProblem = problem;
    }
  });

  return bestProblem;
}

function reconstructNextTile(startTile, targetTile, previous) {
  let cursor = targetTile;
  let parent = previous.get(getTileKey(cursor.x, cursor.y));

  while (parent && !(parent.x === startTile.x && parent.y === startTile.y)) {
    cursor = parent;
    parent = previous.get(getTileKey(cursor.x, cursor.y));
  }

  return cursor;
}

function buildInputTowardPoint(player, targetX, targetY) {
  const input = createEmptyInput();
  const deltaX = targetX - player.x;
  const deltaY = targetY - player.y;
  const threshold = 4;

  if (Math.abs(deltaX) > threshold) {
    input.left = deltaX < 0;
    input.right = deltaX > 0;
  }

  if (Math.abs(deltaY) > threshold) {
    input.up = deltaY < 0;
    input.down = deltaY > 0;
  }

  return input;
}

export function createAutoPilotController() {
  return {
    getInput(state, config) {
      if (!state.problems.length) {
        return createEmptyInput();
      }

      const nearestProblemDistance = Math.min(
        ...state.problems.map((problem) =>
          Math.hypot((problem.x ?? problem.tileX * config.tileSize + config.tileSize / 2) - state.player.x,
            (problem.y ?? problem.tileY * config.tileSize + config.tileSize / 2) - state.player.y),
        ),
      );

      if (nearestProblemDistance <= config.player.resolveRadius) {
        return createEmptyInput();
      }

      const playerTile = getPlayerTile(state, config);
      const { distances, previous } = buildDistanceMap(playerTile, config);
      const targetProblem = selectTargetProblem(state, config, distances);

      if (!targetProblem) {
        return createEmptyInput();
      }

      const targetTile = getProblemTile(targetProblem, config);
      const nextTile = reconstructNextTile(playerTile, targetTile, previous);
      const targetX = nextTile.x * config.tileSize + config.tileSize / 2;
      const targetY = nextTile.y * config.tileSize + config.tileSize / 2;

      return buildInputTowardPoint(state.player, targetX, targetY);
    },
  };
}
