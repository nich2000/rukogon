export const TILE_SIZE = 32;

export const TILE_TYPES = {
  grass: 'grass',
  asphalt: 'asphalt',
  path: 'path',
  office: 'office',
  stands: 'stands',
  booth: 'booth',
  paddock: 'paddock',
  barrier: 'barrier',
};

export const ZONE_TYPES = {
  track: 'track',
  headquarters: 'headquarters',
  stands: 'stands',
  ticketOffice: 'ticketOffice',
  paddock: 'paddock',
};

export const PROBLEM_TYPES = {
  incident: 'incident',
  paperwork: 'paperwork',
  crowd: 'crowd',
  fraud: 'fraud',
  dispute: 'dispute',
};

export const GAME_MODES = {
  menu: 'menu',
  running: 'running',
  paused: 'paused',
  gameOver: 'gameOver',
};

export const TILE_SYMBOLS = {
  [TILE_TYPES.grass]: 'G',
  [TILE_TYPES.asphalt]: 'A',
  [TILE_TYPES.path]: 'P',
  [TILE_TYPES.office]: 'H',
  [TILE_TYPES.stands]: 'S',
  [TILE_TYPES.booth]: 'B',
  [TILE_TYPES.paddock]: 'D',
  [TILE_TYPES.barrier]: 'T',
};
