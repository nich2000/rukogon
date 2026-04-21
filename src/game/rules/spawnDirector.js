const PROBLEM_QUOTES = {
  incident: [
    'Где главный?',
    'Это точно не по плану',
    'Тут уже дымит',
    'Кто пустил это на трассу?',
  ],
  paperwork: [
    'Телефон опять звонит',
    'Срочно подпишите',
    'Это надо согласовать',
    'Где печать?',
  ],
  crowd: [
    'Это не дождь, это атмосфера',
    'Нас тут заливает',
    'Кто включил погоду?',
    'Трибуны хотят объяснений',
  ],
  fraud: [
    'Я тут вообще по спискам',
    'Билет был, честно',
    'У меня проход где-то тут',
    'Это VIP недоразумение',
  ],
  dispute: [
    'У нас колесо пропало',
    'Но не наше колесо',
    'Это вообще чьи шины?',
    'Тут спор на четыре колеса',
  ],
};

function pickWeightedProblemType(problemCatalog) {
  const entries = Object.entries(problemCatalog);
  const totalWeight = entries.reduce((sum, [, definition]) => sum + definition.weight, 0);
  let cursor = Math.random() * totalWeight;

  for (const [type, definition] of entries) {
    cursor -= definition.weight;
    if (cursor <= 0) {
      return [type, definition];
    }
  }

  return entries[0];
}

function pickProblemQuote(type) {
  const quotes = PROBLEM_QUOTES[type] || ['Где главный?'];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function createProblem({ type, definition, state, config }) {
  const zone = config.map.zones[definition.zone];
  const point = zone.spawnPoints[Math.floor(Math.random() * zone.spawnPoints.length)];
  const activeMobileProblems = state.problems.filter((problem) => problem.mobile).length;
  const isMobile =
    config.mobileProblems.enabled
    && (
    activeMobileProblems < config.mobileProblems.maxActive
    && Math.random() < config.mobileProblems.chance
    );
  const centerX = point.x * config.tileSize + config.tileSize / 2;
  const centerY = point.y * config.tileSize + config.tileSize / 2;

  return {
    id: state.nextProblemId++,
    type,
    label: definition.label,
    zone: definition.zone,
    tileX: point.x,
    tileY: point.y,
    progress: 0,
    solveTime: definition.solveTime,
    burnoutTime: definition.burnoutTime,
    baseSolveTime: definition.solveTime,
    baseBurnoutTime: definition.burnoutTime,
    currentSolveTime: definition.solveTime,
    currentBurnoutTime: definition.burnoutTime,
    waitProgress: 0,
    severity: definition.severity,
    createdAt: state.time,
    animationPhase: 0,
    quote: pickProblemQuote(type),
    mobile: isMobile,
    moving: false,
    caughtByPlayer: false,
    facing: 'down',
    x: centerX,
    y: centerY,
    targetTile: isMobile ? config.map.walkableTiles[Math.floor(Math.random() * config.map.walkableTiles.length)] : null,
  };
}

function getSpawnInterval(state, config) {
  const minutes = state.time / 60;
  const accelerated =
    config.spawnStrategy.baseInterval -
    minutes * config.spawnStrategy.accelerationPerMinute;

  return Math.max(config.spawnStrategy.minimumInterval, accelerated);
}

function canSpawnInZone(state, zone, config) {
  const zoneProblems = state.problems.filter((problem) => problem.zone === zone);
  return zoneProblems.length < config.spawnStrategy.maxByZone;
}

export function createSpawnDirector() {
  return {
    update(state, config, deltaTime) {
      state.elapsedSinceSpawn += deltaTime;
      if (state.elapsedSinceSpawn < getSpawnInterval(state, config)) {
        return;
      }

      state.elapsedSinceSpawn = 0;

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const [type, definition] = pickWeightedProblemType(config.problemCatalog);
        if (!canSpawnInZone(state, definition.zone, config)) {
          continue;
        }

        state.problems.push(createProblem({ type, definition, state, config }));
        return;
      }
    },
  };
}
