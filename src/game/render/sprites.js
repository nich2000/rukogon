import { PROBLEM_TYPES } from '../constants';

function drawPixelSprite(context, sprite, x, y, scale) {
  sprite.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      if (!color) {
        return;
      }

      context.fillStyle = color;
      context.fillRect(x + colIndex * scale, y + rowIndex * scale, scale, scale);
    });
  });
}

function tintSprite(sprite, fromColor, toColor) {
  return sprite.map((row) => row.map((color) => (color === fromColor ? toColor : color)));
}

const COLORS = {
  skin: '#f3c98b',
  jacket: '#ef7d22',
  dark: '#222034',
  visor: '#88c9f9',
  red: '#bf3f36',
  yellow: '#e5a52d',
  paper: '#f2edd7',
  blue: '#3d6f9e',
  green: '#3da35d',
  crowd: '#7b4d9d',
  white: '#fff5e9',
  orange: '#ff9e3d',
};

const HERO_FRAMES = {
  down: [
    [
      [null, COLORS.dark, COLORS.dark, null],
      [COLORS.skin, COLORS.skin, COLORS.skin, COLORS.skin],
      [COLORS.jacket, COLORS.jacket, COLORS.jacket, COLORS.jacket],
      [COLORS.jacket, COLORS.dark, COLORS.dark, COLORS.jacket],
      [COLORS.dark, null, null, COLORS.dark],
    ],
    [
      [null, COLORS.dark, COLORS.dark, null],
      [COLORS.skin, COLORS.skin, COLORS.skin, COLORS.skin],
      [COLORS.jacket, COLORS.jacket, COLORS.jacket, COLORS.jacket],
      [COLORS.dark, COLORS.jacket, COLORS.jacket, COLORS.dark],
      [null, COLORS.dark, COLORS.dark, null],
    ],
  ],
  up: [
    [
      [null, COLORS.dark, COLORS.dark, null],
      [COLORS.jacket, COLORS.jacket, COLORS.jacket, COLORS.jacket],
      [COLORS.jacket, COLORS.visor, COLORS.visor, COLORS.jacket],
      [COLORS.dark, COLORS.jacket, COLORS.jacket, COLORS.dark],
      [COLORS.dark, null, null, COLORS.dark],
    ],
    [
      [null, COLORS.dark, COLORS.dark, null],
      [COLORS.jacket, COLORS.jacket, COLORS.jacket, COLORS.jacket],
      [COLORS.jacket, COLORS.visor, COLORS.visor, COLORS.jacket],
      [COLORS.jacket, COLORS.dark, COLORS.dark, COLORS.jacket],
      [null, COLORS.dark, COLORS.dark, null],
    ],
  ],
  left: [
    [
      [null, COLORS.dark, null, null],
      [COLORS.skin, COLORS.skin, COLORS.dark, null],
      [COLORS.jacket, COLORS.jacket, COLORS.jacket, null],
      [COLORS.jacket, COLORS.dark, COLORS.jacket, null],
      [COLORS.dark, null, COLORS.dark, null],
    ],
    [
      [null, COLORS.dark, null, null],
      [COLORS.skin, COLORS.skin, COLORS.dark, null],
      [COLORS.jacket, COLORS.jacket, COLORS.jacket, null],
      [COLORS.dark, COLORS.jacket, COLORS.jacket, null],
      [null, COLORS.dark, COLORS.dark, null],
    ],
  ],
  right: [
    [
      [null, null, COLORS.dark, null],
      [null, COLORS.dark, COLORS.skin, COLORS.skin],
      [null, COLORS.jacket, COLORS.jacket, COLORS.jacket],
      [null, COLORS.jacket, COLORS.dark, COLORS.jacket],
      [null, COLORS.dark, null, COLORS.dark],
    ],
    [
      [null, null, COLORS.dark, null],
      [null, COLORS.dark, COLORS.skin, COLORS.skin],
      [null, COLORS.jacket, COLORS.jacket, COLORS.jacket],
      [null, COLORS.jacket, COLORS.jacket, COLORS.dark],
      [null, COLORS.dark, COLORS.dark, null],
    ],
  ],
};

const PROBLEM_FRAMES = {
  [PROBLEM_TYPES.incident]: [
    [null, COLORS.red, null],
    [COLORS.red, COLORS.yellow, COLORS.red],
    [null, COLORS.red, null],
  ],
  [PROBLEM_TYPES.paperwork]: [
    [COLORS.paper, COLORS.paper, COLORS.paper],
    [COLORS.paper, COLORS.blue, COLORS.paper],
    [COLORS.paper, COLORS.paper, COLORS.paper],
  ],
  [PROBLEM_TYPES.crowd]: [
    [COLORS.crowd, null, COLORS.crowd],
    [COLORS.skin, COLORS.skin, COLORS.skin],
    [COLORS.dark, COLORS.dark, COLORS.dark],
  ],
  [PROBLEM_TYPES.fraud]: [
    [COLORS.dark, COLORS.dark, COLORS.dark],
    [COLORS.red, COLORS.dark, COLORS.red],
    [COLORS.yellow, COLORS.dark, COLORS.yellow],
  ],
  [PROBLEM_TYPES.dispute]: [
    [COLORS.blue, null, COLORS.green],
    [COLORS.skin, COLORS.yellow, COLORS.skin],
    [COLORS.dark, COLORS.dark, COLORS.dark],
  ],
};

function renderFireAnimation(context, x, y, pulse) {
  const flicker = Math.sin(pulse * 2.4) * 0.5 + 0.5;
  context.save();
  context.translate(x, y - 8);
  context.fillStyle = `rgba(255, 88, 48, ${0.35 + flicker * 0.35})`;
  context.beginPath();
  context.moveTo(-10, 8);
  context.quadraticCurveTo(-4, -18 - flicker * 10, 0, -10);
  context.quadraticCurveTo(6, -28 - flicker * 12, 12, 8);
  context.closePath();
  context.fill();
  context.fillStyle = `rgba(255, 210, 70, ${0.4 + flicker * 0.3})`;
  context.beginPath();
  context.moveTo(-5, 8);
  context.quadraticCurveTo(-1, -10 - flicker * 8, 2, -4);
  context.quadraticCurveTo(6, -15 - flicker * 8, 8, 8);
  context.closePath();
  context.fill();
  context.restore();
}

function renderPhoneAnimation(context, x, y, pulse) {
  const ring = Math.sin(pulse * 3.2);
  const spread = 10 + Math.abs(ring) * 6;
  context.save();
  context.strokeStyle = `rgba(136, 201, 249, ${0.3 + Math.abs(ring) * 0.5})`;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x - 4, y - 6, spread, -0.9, 0.9);
  context.stroke();
  context.beginPath();
  context.arc(x + 4, y - 6, spread, Math.PI - 0.9, Math.PI + 0.9);
  context.stroke();
  context.restore();
}

function renderRainAnimation(context, x, y, pulse) {
  const drift = Math.sin(pulse * 1.8) * 2;
  context.save();
  context.strokeStyle = 'rgba(136, 201, 249, 0.85)';
  context.lineWidth = 2.5;
  [-14, -4, 6, 16].forEach((offset, index) => {
    const sway = drift * (index % 2 === 0 ? 1 : -1);
    context.beginPath();
    context.moveTo(x + offset + sway, y - 20);
    context.lineTo(x + offset - 4 + sway, y - 8);
    context.stroke();
  });
  context.fillStyle = 'rgba(88, 116, 163, 0.32)';
  context.fillRect(x - 18, y + 8, 36, 4);
  context.restore();
}

function renderTicketAnimation(context, x, y, pulse) {
  const bob = Math.sin(pulse * 2.2) * 2;
  context.save();
  context.translate(0, bob);
  context.fillStyle = 'rgba(242, 237, 215, 0.95)';
  context.strokeStyle = 'rgba(191, 63, 54, 0.85)';
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x - 14, y - 12, 18, 24, 4);
  context.fill();
  context.stroke();
  context.beginPath();
  context.roundRect(x - 2, y - 8, 16, 20, 4);
  context.fill();
  context.stroke();
  context.fillStyle = 'rgba(61, 111, 158, 0.85)';
  context.fillRect(x - 9, y - 4, 8, 3);
  context.fillRect(x + 3, y, 7, 3);
  context.restore();
}

function renderWheelAnimation(context, x, y, pulse) {
  const spin = pulse * 5.2;
  context.save();
  context.strokeStyle = 'rgba(34, 32, 52, 0.95)';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x - 9, y, 10, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(x + 9, y, 10, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = 'rgba(255, 245, 233, 0.85)';
  context.lineWidth = 2;
  [-9, 9].forEach((offset) => {
    context.beginPath();
    context.moveTo(x + offset, y);
    context.lineTo(x + offset + Math.cos(spin) * 7, y + Math.sin(spin) * 7);
    context.moveTo(x + offset, y);
    context.lineTo(x + offset + Math.cos(spin + Math.PI / 2) * 7, y + Math.sin(spin + Math.PI / 2) * 7);
    context.stroke();
  });
  context.restore();
}

export function renderHeroSprite(context, player, animationFrame) {
  const frames = HERO_FRAMES[player.facing] || HERO_FRAMES.down;
  const sprite = frames[player.moving ? animationFrame % frames.length : 0];
  drawPixelSprite(context, sprite, player.x - 12, player.y - 16, 6);
}

export function renderBotCarrier(context, problem, animationFrame) {
  const facing = problem.facing || 'down';
  const frames = HERO_FRAMES[facing] || HERO_FRAMES.down;
  const sprite = frames[problem.moving ? animationFrame % frames.length : 0];

  context.save();
  context.globalAlpha = problem.caughtByPlayer ? 0.8 : 0.95;
  drawPixelSprite(context, sprite, problem.x - 10, problem.y - 14, 5);
  context.restore();
}

export function renderBackgroundNpc(context, npc, animationFrame) {
  const facing = npc.facing || 'down';
  const frames = HERO_FRAMES[facing] || HERO_FRAMES.down;
  const baseSprite = frames[npc.moving ? animationFrame % frames.length : 0];
  const tintedSprite = tintSprite(baseSprite, COLORS.jacket, npc.color || COLORS.blue);

  context.save();
  context.globalAlpha = 0.92;
  drawPixelSprite(context, tintedSprite, npc.x - 9, npc.y - 13, 4);
  context.restore();
}

export function renderProblemSprite(context, problem, x, y, pulse) {
  const sprite = PROBLEM_FRAMES[problem.type];
  const bob = Math.sin(pulse) * 2;

  context.save();
  context.translate(x - 12, y - 12 + bob);
  drawPixelSprite(context, sprite, 0, 0, 8);
  context.restore();
}

export function renderProblemAnimation(context, problem, x, y, pulse) {
  if (problem.type === PROBLEM_TYPES.incident) {
    renderFireAnimation(context, x, y, pulse);
  }

  if (problem.type === PROBLEM_TYPES.paperwork) {
    renderPhoneAnimation(context, x, y, pulse);
  }

  if (problem.type === PROBLEM_TYPES.crowd) {
    renderRainAnimation(context, x, y, pulse);
  }

  if (problem.type === PROBLEM_TYPES.fraud) {
    renderTicketAnimation(context, x, y, pulse);
  }

  if (problem.type === PROBLEM_TYPES.dispute) {
    renderWheelAnimation(context, x, y, pulse);
  }
}
