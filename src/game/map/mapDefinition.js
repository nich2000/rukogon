import { TILE_SIZE, TILE_SYMBOLS, TILE_TYPES, ZONE_TYPES } from '../constants';

export const DEFAULT_MAP_ROWS = [
  'GGGGGGGGGGGGAAAAAAAAGGGGGGGGGGGG',
  'GGGGGGGGGGGGAAAAAAAASSSSSSGGGGGG',
  'GGGGGGGGGGGGAAAAAAAASSSSSSGGGGGG',
  'GGHHHHHHGGGGAAATTTAASSSSSSGGGGGG',
  'GGHHHHHHPPPPAAATTTAAAPPPPPPGGGGG',
  'GGHHHHHHPPPPAAAAAAAAAPPPPPPGGGGG',
  'GGHHHHHHPPPPAAAAAAAAAPPPPPPGGGGG',
  'GGGGGGGGGGPPAAAAAAAAAPGGGGGGGGGG',
  'GGGGGGGGGGPPAAAAAAAAAPGGGGGGGGGG',
  'GGGGGGGGGGPPAAAAAAAAAPGGGGGGGGGG',
  'GGGGGGGGGGPPAAAAAAAAAPPPPPGGGGGG',
  'GGBBBBBBGGPPAAAAAAAAADDDDDDDGGGG',
  'GGBBBBBBPPPPAAAAAAAAADDDDDDDGGGG',
  'GGBBBBBBPPPPAAAAAAAAADDDDDDDGGGG',
  'GGGGGGGGPPPPAAAAAAAAADDDDDDDGGGG',
  'GGGGGGGGPPPPPPPPPPPPPPPPPPGGGGGG',
  'GGGGGGGGPPPPPPPPPPPPPPPPPPGGGGGG',
  'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
];

export const DEFAULT_LABEL_POSITIONS = {
  headquarters: { x: 120, y: 130 },
  stands: { x: 810, y: 92 },
  ticketOffice: { x: 118, y: 418 },
  paddock: { x: 760, y: 455 },
  track: { x: 448, y: 58 },
};

const TILE_LEGEND = {
  G: TILE_TYPES.grass,
  A: TILE_TYPES.asphalt,
  P: TILE_TYPES.path,
  H: TILE_TYPES.office,
  S: TILE_TYPES.stands,
  B: TILE_TYPES.booth,
  D: TILE_TYPES.paddock,
  T: TILE_TYPES.barrier,
};

const ZONE_DEFINITIONS = {
  [ZONE_TYPES.track]: {
    label: 'Трасса',
    sourceTile: TILE_TYPES.asphalt,
    useSourceTilesAsSpawns: true,
  },
  [ZONE_TYPES.headquarters]: {
    label: 'Штаб',
    sourceTile: TILE_TYPES.office,
  },
  [ZONE_TYPES.stands]: {
    label: 'Трибуны',
    sourceTile: TILE_TYPES.stands,
  },
  [ZONE_TYPES.ticketOffice]: {
    label: 'Касса',
    sourceTile: TILE_TYPES.booth,
  },
  [ZONE_TYPES.paddock]: {
    label: 'Паддок',
    sourceTile: TILE_TYPES.paddock,
  },
};

function hasAdjacentTiles(tiles, sourceTile, targetTile) {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < tiles[0].length; x += 1) {
      if (tiles[y][x] !== sourceTile) {
        continue;
      }

      for (const direction of directions) {
        const nextX = x + direction.x;
        const nextY = y + direction.y;
        if (
          nextX >= 0 &&
          nextY >= 0 &&
          nextY < tiles.length &&
          nextX < tiles[0].length &&
          tiles[nextY][nextX] === targetTile
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

function collectAdjacentWalkableTiles(tiles, sourceTile, isWalkable) {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  const uniqueTiles = new Map();

  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < tiles[0].length; x += 1) {
      if (tiles[y][x] !== sourceTile) {
        continue;
      }

      for (const direction of directions) {
        const nextX = x + direction.x;
        const nextY = y + direction.y;
        const adjacentTile = tiles[nextY]?.[nextX];

        if (adjacentTile && isWalkable(adjacentTile)) {
          uniqueTiles.set(`${nextX}:${nextY}`, { x: nextX, y: nextY });
        }
      }
    }
  }

  return [...uniqueTiles.values()];
}

function collectSpawnPointsForZone(tiles, zoneDefinition, isWalkable) {
  if (zoneDefinition.useSourceTilesAsSpawns) {
    const spawnPoints = [];

    for (let y = 0; y < tiles.length; y += 1) {
      for (let x = 0; x < tiles[0].length; x += 1) {
        if (tiles[y][x] === zoneDefinition.sourceTile && isWalkable(tiles[y][x])) {
          spawnPoints.push({ x, y });
        }
      }
    }

    return spawnPoints;
  }

  return collectAdjacentWalkableTiles(tiles, zoneDefinition.sourceTile, isWalkable);
}

function createZones(tiles, isWalkable) {
  return Object.fromEntries(
    Object.entries(ZONE_DEFINITIONS).map(([zoneType, definition]) => [
      zoneType,
      {
        label: definition.label,
        spawnPoints: collectSpawnPointsForZone(tiles, definition, isWalkable),
      },
    ]),
  );
}

function findFirstWalkableTile(tiles, isWalkable) {
  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < tiles[0].length; x += 1) {
      if (isWalkable(tiles[y][x])) {
        return { x, y };
      }
    }
  }

  return null;
}

function collectWalkableTiles(tiles, isWalkable) {
  const points = [];

  for (let y = 0; y < tiles.length; y += 1) {
    for (let x = 0; x < tiles[0].length; x += 1) {
      if (isWalkable(tiles[y][x])) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

function validateMapDefinition({ tiles, zones, isWalkable }) {
  const errors = [];

  Object.entries(zones).forEach(([zoneType, zone]) => {
    if (!zone.spawnPoints.length) {
      errors.push(`Для зоны "${zone.label || zoneType}" нет доступных точек проблем.`);
      return;
    }

    zone.spawnPoints.forEach((point) => {
      const tile = tiles[point.y]?.[point.x];
      if (!tile || !isWalkable(tile)) {
        errors.push(
          `Зона "${zone.label || zoneType}" содержит недостижимую точку (${point.x}, ${point.y}).`,
        );
      }
    });
  });

  if (!hasAdjacentTiles(tiles, TILE_TYPES.stands, TILE_TYPES.asphalt)) {
    errors.push('Трибуны должны граничить с трассой.');
  }

  if (!hasAdjacentTiles(tiles, TILE_TYPES.paddock, TILE_TYPES.asphalt)) {
    errors.push('Паддок должен граничить с трассой.');
  }

  if (!findFirstWalkableTile(tiles, isWalkable)) {
    errors.push('На карте нет ни одного проходимого тайла.');
  }

  return errors;
}

export function serializeTiles(tiles) {
  const typeToSymbol = Object.fromEntries(
    Object.entries(TILE_SYMBOLS).map(([type, symbol]) => [type, symbol]),
  );

  return tiles.map((row) => row.map((tile) => typeToSymbol[tile]).join(''));
}

export function createMapDefinition(
  mapRows = DEFAULT_MAP_ROWS,
  labelPositions = DEFAULT_LABEL_POSITIONS,
) {
  const tiles = mapRows.map((row) => row.split('').map((cell) => TILE_LEGEND[cell]));
  const width = mapRows[0].length;
  const height = mapRows.length;
  const isWalkable = (tileType) =>
    tileType === TILE_TYPES.asphalt || tileType === TILE_TYPES.path;
  const zones = createZones(tiles, isWalkable);
  const walkableTiles = collectWalkableTiles(tiles, isWalkable);
  const startTile = zones[ZONE_TYPES.headquarters].spawnPoints[0]
    || findFirstWalkableTile(tiles, isWalkable)
    || { x: 0, y: 0 };
  const errors = validateMapDefinition({
    tiles,
    zones,
    isWalkable,
  });

  const editableTiles = [
    { type: TILE_TYPES.grass, label: 'Газон' },
    { type: TILE_TYPES.asphalt, label: 'Трасса' },
    { type: TILE_TYPES.path, label: 'Тропа' },
    { type: TILE_TYPES.office, label: 'Штаб' },
    { type: TILE_TYPES.stands, label: 'Трибуны' },
    { type: TILE_TYPES.booth, label: 'Касса' },
    { type: TILE_TYPES.paddock, label: 'Паддок' },
    { type: TILE_TYPES.barrier, label: 'Барьер' },
  ];

  return {
    width,
    height,
    pixelWidth: width * TILE_SIZE,
    pixelHeight: height * TILE_SIZE,
    tiles,
    rawRows: mapRows,
    zones,
    isWalkable,
    startTile,
    errors,
    isPlayable: errors.length === 0,
    editableTiles,
    labelPositions,
    walkableTiles,
  };
}
