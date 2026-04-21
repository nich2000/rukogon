import { PROBLEM_TYPES, TILE_SIZE, TILE_TYPES, ZONE_TYPES } from './constants';
import { createDefaultGameAlgorithms } from './rules/createDefaultGameAlgorithms';
import { createMapDefinition } from './map/mapDefinition';

export function createGameConfig(mapRows, labelPositions, options = {}) {
  const map = createMapDefinition(mapRows, labelPositions);
  const algorithms = createDefaultGameAlgorithms();

  return {
    tileSize: TILE_SIZE,
    map,
    algorithms,
    player: {
      speed: 140,
      radius: 14,
      resolveRadius: 26,
    },
    mobileProblems: {
      enabled: options.mobileProblemsEnabled ?? true,
      chance: 0.55,
      maxActive: 3,
      speed: 74,
      targetReachRadius: 10,
    },
    gameOverThreshold: 14,
    spawnStrategy: {
      baseInterval: 3.8,
      minimumInterval: 1.4,
      accelerationPerMinute: 0.45,
      maxByZone: 4,
    },
    problemCatalog: {
      [PROBLEM_TYPES.incident]: {
        label: 'Происшествие на трассе',
        zone: ZONE_TYPES.track,
        solveTime: 2.1,
        burnoutTime: 26,
        weight: 1.2,
        severity: 1.3,
      },
      [PROBLEM_TYPES.paperwork]: {
        label: 'Документы в штабе',
        zone: ZONE_TYPES.headquarters,
        solveTime: 1.6,
        burnoutTime: 24,
        weight: 1,
        severity: 1,
      },
      [PROBLEM_TYPES.crowd]: {
        label: 'Зрители на трибунах',
        zone: ZONE_TYPES.stands,
        solveTime: 1.9,
        burnoutTime: 23,
        weight: 0.95,
        severity: 1.05,
      },
      [PROBLEM_TYPES.fraud]: {
        label: 'Злоумышленники у кассы',
        zone: ZONE_TYPES.ticketOffice,
        solveTime: 2,
        burnoutTime: 22,
        weight: 0.9,
        severity: 1.15,
      },
      [PROBLEM_TYPES.dispute]: {
        label: 'Споры в паддоке',
        zone: ZONE_TYPES.paddock,
        solveTime: 1.8,
        burnoutTime: 21,
        weight: 1.1,
        severity: 1.1,
      },
    },
    palette: {
      sky: '#f0d9a7',
      panel: '#172319',
      accent: '#ef7d22',
      accentMuted: '#d35824',
      text: '#f8f2dc',
      grass: '#557f43',
      grassAlt: '#6a9250',
      asphalt: '#30353a',
      roadStripe: '#8d9093',
      path: '#8a714b',
      pathPebble: '#a88a61',
      office: '#57646c',
      stands: '#7a4340',
      booth: '#6b4f2b',
      paddock: '#4d5a38',
      barrier: '#c2b17b',
      danger: '#bf3f36',
      success: '#3da35d',
      warning: '#e5a52d',
    },
  };
}

export { TILE_TYPES };
