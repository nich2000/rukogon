const NPC_ARCHETYPES = [
  {
    type: 'photographer',
    label: 'Фотограф',
    quote: 'Только не двигайтесь',
    speed: 56,
    color: '#6f9fbd',
    chaseProblems: false,
  },
  {
    type: 'radio',
    label: 'Человек с рацией',
    quote: 'Приём, приём, без паники',
    speed: 48,
    color: '#8f7bb7',
    chaseProblems: false,
  },
  {
    type: 'blogger',
    label: 'Блогер',
    quote: 'Подписчики, мы на месте',
    speed: 72,
    color: '#d36f8d',
    chaseProblems: true,
  },
];

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

function pickRandomWalkableTarget(config) {
  const points = config.map.walkableTiles;
  return points[Math.floor(Math.random() * points.length)];
}

function setNpcTile(npc, config) {
  npc.tileX = Math.max(0, Math.min(config.map.width - 1, Math.floor(npc.x / config.tileSize)));
  npc.tileY = Math.max(0, Math.min(config.map.height - 1, Math.floor(npc.y / config.tileSize)));
}

function isWalkablePixel(config, x, y) {
  const tileX = Math.floor(x / config.tileSize);
  const tileY = Math.floor(y / config.tileSize);
  if (tileX < 0 || tileY < 0 || tileX >= config.map.width || tileY >= config.map.height) {
    return false;
  }

  return config.map.isWalkable(config.map.tiles[tileY][tileX]);
}

function pickTargetForNpc(npc, state, config) {
  if (npc.chaseProblems && state.problems.length) {
    const targetProblem = state.problems.reduce((earliest, problem) => (
      !earliest || problem.createdAt > earliest.createdAt ? problem : earliest
    ), null);

    if (targetProblem) {
      return {
        x: targetProblem.tileX,
        y: targetProblem.tileY,
      };
    }
  }

  return pickRandomWalkableTarget(config);
}

function createNpc(id, archetype, spawnPoint, config) {
  return {
    id,
    type: archetype.type,
    label: archetype.label,
    quote: archetype.quote,
    color: archetype.color,
    speed: archetype.speed,
    chaseProblems: archetype.chaseProblems,
    tileX: spawnPoint.x,
    tileY: spawnPoint.y,
    x: spawnPoint.x * config.tileSize + config.tileSize / 2,
    y: spawnPoint.y * config.tileSize + config.tileSize / 2,
    targetTile: pickRandomWalkableTarget(config),
    moving: false,
    facing: 'down',
    animationPhase: Math.random() * Math.PI * 2,
  };
}

export function createBackgroundNpcController() {
  return {
    createInitialNpcs(config) {
      if (!config.npcs.enabled) {
        return [];
      }

      return NPC_ARCHETYPES.map((archetype, index) =>
        createNpc(index + 1, archetype, pickRandomWalkableTarget(config), config));
    },
    update(state, config, deltaTime) {
      if (!config.npcs.enabled) {
        state.npcs = [];
        return;
      }

      state.npcs.forEach((npc) => {
        npc.animationPhase += deltaTime * 2.4;

        if (!npc.targetTile) {
          npc.targetTile = pickTargetForNpc(npc, state, config);
        }

        const targetX = npc.targetTile.x * config.tileSize + config.tileSize / 2;
        const targetY = npc.targetTile.y * config.tileSize + config.tileSize / 2;
        const toTarget = { x: targetX - npc.x, y: targetY - npc.y };
        const distanceToTarget = Math.hypot(toTarget.x, toTarget.y);

        if (distanceToTarget <= 10) {
          npc.targetTile = pickTargetForNpc(npc, state, config);
          npc.moving = false;
          setNpcTile(npc, config);
          return;
        }

        const direction = normalize(toTarget);
        const travelDistance = npc.speed * deltaTime;
        const nextX = npc.x + direction.x * travelDistance;
        const nextY = npc.y + direction.y * travelDistance;

        if (!isWalkablePixel(config, nextX, nextY)) {
          npc.targetTile = pickRandomWalkableTarget(config);
          npc.moving = false;
          setNpcTile(npc, config);
          return;
        }

        npc.x = nextX;
        npc.y = nextY;
        npc.moving = true;
        npc.facing =
          Math.abs(direction.x) > Math.abs(direction.y)
            ? direction.x >= 0
              ? 'right'
              : 'left'
            : direction.y >= 0
              ? 'down'
              : 'up';
        setNpcTile(npc, config);
      });
    },
  };
}
