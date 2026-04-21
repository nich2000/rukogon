import { TILE_SIZE } from '../constants';

export function createInitialState(config) {
  const startTile = config.map.startTile;
  const npcs = config.algorithms.backgroundNpcs.createInitialNpcs(config);

  return {
    time: 0,
    elapsedSinceSpawn: 0,
    score: 0,
    pressure: 0,
    phase: 'running',
    gameOverReason: null,
    failedProblem: null,
    player: {
      x: startTile.x * TILE_SIZE + TILE_SIZE / 2,
      y: startTile.y * TILE_SIZE + TILE_SIZE / 2,
      facing: 'down',
      moving: false,
    },
    npcs,
    problems: [],
    effects: [],
    nextProblemId: 1,
  };
}
