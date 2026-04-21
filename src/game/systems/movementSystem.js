import { TILE_SIZE } from '../constants';

function getDirectionVector(inputState) {
  const direction = { x: 0, y: 0, facing: 'down' };

  if (inputState.left) {
    direction.x -= 1;
    direction.facing = 'left';
  }
  if (inputState.right) {
    direction.x += 1;
    direction.facing = 'right';
  }
  if (inputState.up) {
    direction.y -= 1;
    direction.facing = 'up';
  }
  if (inputState.down) {
    direction.y += 1;
    direction.facing = 'down';
  }

  return direction;
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y);
  if (!length) {
    return vector;
  }

  return {
    ...vector,
    x: vector.x / length,
    y: vector.y / length,
  };
}

function isWalkablePosition(position, map) {
  const tileX = Math.floor(position.x / TILE_SIZE);
  const tileY = Math.floor(position.y / TILE_SIZE);

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return false;
  }

  return map.isWalkable(map.tiles[tileY][tileX]);
}

export function updatePlayerMovement(state, inputState, config, deltaTime) {
  const direction = normalize(getDirectionVector(inputState));
  const distance = config.player.speed * deltaTime;
  const currentPosition = state.player;

  if (!direction.x && !direction.y) {
    currentPosition.moving = false;
    return;
  }

  const nextX = {
    x: currentPosition.x + direction.x * distance,
    y: currentPosition.y,
  };
  const nextY = {
    x: currentPosition.x,
    y: currentPosition.y + direction.y * distance,
  };

  if (isWalkablePosition(nextX, config.map)) {
    currentPosition.x = nextX.x;
  }
  if (isWalkablePosition(nextY, config.map)) {
    currentPosition.y = nextY.y;
  }

  currentPosition.facing = direction.facing;
  currentPosition.moving = true;
}
