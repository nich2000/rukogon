import { PROBLEM_TYPES, TILE_TYPES } from '../constants';
import {
  renderBackgroundNpc,
  renderBotCarrier,
  renderHeroSprite,
  renderProblemAnimation,
} from './sprites';

function renderMap(context, state, config) {
  const { tileSize, map, palette } = config;

  context.fillStyle = palette.sky;
  context.fillRect(0, 0, map.pixelWidth, map.pixelHeight);

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const tile = map.tiles[y][x];
      const pixelX = x * tileSize;
      const pixelY = y * tileSize;

      if (tile === TILE_TYPES.grass) {
        context.fillStyle = (x + y) % 2 === 0 ? palette.grass : palette.grassAlt;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
      }

      if (tile === TILE_TYPES.asphalt) {
        context.fillStyle = palette.asphalt;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
        context.strokeStyle = palette.roadStripe;
        context.lineWidth = 2;
        context.strokeRect(pixelX + 2, pixelY + 2, tileSize - 4, tileSize - 4);
      }

      if (tile === TILE_TYPES.path) {
        context.fillStyle = palette.path;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
        context.fillStyle = palette.pathPebble;
        context.fillRect(pixelX + 6, pixelY + 10, 5, 5);
        context.fillRect(pixelX + 18, pixelY + 16, 4, 4);
      }

      if (tile === TILE_TYPES.office) {
        context.fillStyle = palette.office;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
      }

      if (tile === TILE_TYPES.stands) {
        context.fillStyle = palette.stands;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
      }

      if (tile === TILE_TYPES.booth) {
        context.fillStyle = palette.booth;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
      }

      if (tile === TILE_TYPES.paddock) {
        context.fillStyle = palette.paddock;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
      }

      if (tile === TILE_TYPES.barrier) {
        context.fillStyle = palette.barrier;
        context.fillRect(pixelX, pixelY, tileSize, tileSize);
        context.fillStyle = palette.warning;
        context.fillRect(pixelX, pixelY + tileSize / 2 - 3, tileSize, 6);
      }
    }
  }

  renderZoneLabels(context, config);
}

function renderZoneLabels(context, config) {
  const labels = [
    { key: 'headquarters', text: 'ШТАБ' },
    { key: 'stands', text: 'ТРИБУНЫ' },
    { key: 'ticketOffice', text: 'КАССА' },
    { key: 'paddock', text: 'ПАДДОК' },
    { key: 'track', text: 'ТРАССА' },
  ];

  context.font = '700 18px monospace';
  context.textAlign = 'center';
  labels.forEach((label) => {
    const position = config.map.labelPositions[label.key];
    if (!position) {
      return;
    }

    context.fillStyle = 'rgba(18, 21, 24, 0.28)';
    context.fillRect(position.x - 55, position.y - 18, 110, 28);
    context.fillStyle = '#f8f2dc';
    context.fillText(label.text, position.x, position.y);
  });
}

function renderProblemQuote(context, problem, x, y) {
  if (!problem.quote) {
    return;
  }

  const text = problem.quote;
  const bubbleY = y - 42;

  context.save();
  context.font = '700 11px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const textWidth = context.measureText(text).width;
  const bubbleWidth = Math.min(168, Math.max(68, textWidth + 16));
  const bubbleHeight = 20;
  const bubbleX = x - bubbleWidth / 2;

  context.fillStyle = 'rgba(18, 21, 24, 0.84)';
  context.strokeStyle = 'rgba(248, 242, 220, 0.22)';
  context.lineWidth = 1.5;
  context.beginPath();
  context.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
  context.fill();
  context.stroke();

  context.beginPath();
  context.moveTo(x - 6, bubbleY + bubbleHeight);
  context.lineTo(x, bubbleY + bubbleHeight + 6);
  context.lineTo(x + 6, bubbleY + bubbleHeight);
  context.closePath();
  context.fill();

  context.fillStyle = '#f8f2dc';
  context.fillText(text, x, bubbleY + bubbleHeight / 2 + 0.5);
  context.restore();
}

function renderNpcs(context, state) {
  state.npcs.forEach((npc) => {
    renderBackgroundNpc(context, npc, Math.floor(npc.animationPhase * 2));

    context.save();
    context.font = '700 9px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const text = npc.type === 'blogger' ? 'стрим' : npc.type === 'radio' ? 'прием' : 'щелк';
    const width = context.measureText(text).width + 8;
    context.fillStyle = 'rgba(18, 21, 24, 0.72)';
    context.beginPath();
    context.roundRect(npc.x - width / 2, npc.y - 26, width, 14, 6);
    context.fill();
    context.fillStyle = '#f8f2dc';
    context.fillText(text, npc.x, npc.y - 19);
    context.restore();
  });
}

function renderProblems(context, state, config) {
  state.problems.forEach((problem) => {
    const x =
      typeof problem.x === 'number'
        ? problem.x
        : problem.tileX * config.tileSize + config.tileSize / 2;
    const y =
      typeof problem.y === 'number'
        ? problem.y
        : problem.tileY * config.tileSize + config.tileSize / 2;
    const burnoutRatio = problem.waitProgress || 0;
    const redAlpha = 0.12 + burnoutRatio * 0.38;

    if (problem.type === 'incident') {
      const flicker = Math.sin(problem.animationPhase * 3) * 0.5 + 0.5;
      context.fillStyle = `rgba(255, ${120 - burnoutRatio * 60}, ${40 - burnoutRatio * 20}, ${0.16 + flicker * 0.2 + burnoutRatio * 0.2})`;
      context.beginPath();
      context.arc(x, y, 24 + flicker * 6, 0, Math.PI * 2);
      context.fill();
    }

    context.strokeStyle = `rgba(191, 63, 54, ${redAlpha})`;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, 20 + burnoutRatio * 10, 0, Math.PI * 2);
    context.stroke();

    if (problem.mobile) {
      renderBotCarrier(context, problem, Math.floor(problem.animationPhase * 2));
    } else {
      renderProblemAnimation(context, problem, x, y, problem.animationPhase * 2);
    }

    renderProblemQuote(context, problem, x, y);

    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
    context.fillRect(x - 18, y + 18, 36, 6);
    context.fillStyle = `rgba(191, 63, 54, ${0.45 + burnoutRatio * 0.55})`;
    context.fillRect(x - 18, y + 18, 36 * burnoutRatio, 3);

    if (problem.progress > 0) {
      const progressRatio = Math.min(problem.progress / (problem.currentSolveTime || problem.solveTime), 1);
      context.fillStyle = config.palette.success;
      context.fillRect(x - 18, y + 21, 36 * progressRatio, 3);
    }
  });
}

function renderEffects(context, state, config) {
  state.effects.forEach((effect) => {
    const radius = 10 + effect.phase * 32;
    const alpha = Math.max(0, effect.life / 0.8);
    context.strokeStyle =
      effect.type === 'incident'
        ? `rgba(239, 125, 34, ${alpha})`
        : `rgba(61, 163, 93, ${alpha})`;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    context.stroke();
  });
}

function renderProblemBadge(context, problem, x, y, size, options = {}) {
  const isTrackIncident = problem.type === PROBLEM_TYPES.incident;
  const isBoothProblem = problem.type === PROBLEM_TYPES.fraud;
  const isStandsProblem = problem.type === PROBLEM_TYPES.crowd;
  const isOfficeProblem = problem.type === PROBLEM_TYPES.paperwork;
  const isPaddockProblem = problem.type === PROBLEM_TYPES.dispute;
  const trackPortraitImage = options.trackPortraitImage;
  const boothPortraitImage = options.boothPortraitImage;
  const standsPortraitImage = options.standsPortraitImage;
  const officePortraitImage = options.officePortraitImage;
  const paddockPortraitImage = options.paddockPortraitImage;

  context.save();
  context.fillStyle = 'rgba(17, 22, 19, 0.82)';
  context.strokeStyle = `rgba(239, 125, 34, ${0.35 + problem.waitProgress * 0.45})`;
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(x, y, size, size, 10);
  context.fill();
  context.stroke();

  if (isTrackIncident && trackPortraitImage) {
    context.drawImage(trackPortraitImage, x + 4, y + 4, size - 8, size - 8);
    context.restore();
    return;
  }

  if (isBoothProblem && boothPortraitImage) {
    context.drawImage(boothPortraitImage, x + 4, y + 4, size - 8, size - 8);
    context.restore();
    return;
  }

  if (isStandsProblem && standsPortraitImage) {
    context.drawImage(standsPortraitImage, x + 4, y + 4, size - 8, size - 8);
    context.restore();
    return;
  }

  if (isOfficeProblem && officePortraitImage) {
    context.drawImage(officePortraitImage, x + 4, y + 4, size - 8, size - 8);
    context.restore();
    return;
  }

  if (isPaddockProblem && paddockPortraitImage) {
    context.drawImage(paddockPortraitImage, x + 4, y + 4, size - 8, size - 8);
    context.restore();
    return;
  }

  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const badgeProblem = {
    ...problem,
    animationPhase: problem.animationPhase || 0,
  };

  renderProblemAnimation(context, badgeProblem, centerX, centerY + 2, problem.animationPhase * 2);
  context.restore();
}

function renderStatusSidebar(context, state, config, options = {}) {
  const activeProblem = [...state.problems]
    .filter((problem) => problem.progress > 0)
    .sort((left, right) => right.progress - left.progress)[0];
  const heroPortrait = options.portraitImage;
  const panelX = config.map.pixelWidth - 74;
  let cursorY = 14;

  if (activeProblem && heroPortrait) {
    const solveTime = activeProblem.currentSolveTime || activeProblem.solveTime || 1;
    const progressRatio = Math.max(0, Math.min(1, activeProblem.progress / solveTime));
    const alpha = 0.45 + progressRatio * 0.55;

    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = 'rgba(17, 22, 19, 0.82)';
    context.strokeStyle = `rgba(239, 125, 34, ${0.45 + alpha * 0.45})`;
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(panelX - 6, cursorY - 6, 68, 68, 12);
    context.fill();
    context.stroke();
    context.drawImage(heroPortrait, panelX, cursorY, 56, 56);
    context.restore();
    cursorY += 74;
  }

  state.problems.forEach((problem) => {
    renderProblemBadge(context, problem, panelX + 6, cursorY, 44, options);
    cursorY += 50;
  });
}

function renderPlayerAura(context, state, config) {
  context.fillStyle = 'rgba(255, 255, 255, 0.08)';
  context.beginPath();
  context.arc(
    state.player.x,
    state.player.y,
    config.player.resolveRadius,
    0,
    Math.PI * 2,
  );
  context.fill();
}

function renderEditorGrid(context, config) {
  context.save();
  context.strokeStyle = 'rgba(255,255,255,0.1)';
  context.lineWidth = 1;

  for (let x = 0; x <= config.map.width; x += 1) {
    context.beginPath();
    context.moveTo(x * config.tileSize, 0);
    context.lineTo(x * config.tileSize, config.map.pixelHeight);
    context.stroke();
  }

  for (let y = 0; y <= config.map.height; y += 1) {
    context.beginPath();
    context.moveTo(0, y * config.tileSize);
    context.lineTo(config.map.pixelWidth, y * config.tileSize);
    context.stroke();
  }

  context.restore();
}

function renderEditorLabels(context, config) {
  const labels = [
    { key: 'headquarters', text: 'ШТАБ' },
    { key: 'stands', text: 'ТРИБУНЫ' },
    { key: 'ticketOffice', text: 'КАССА' },
    { key: 'paddock', text: 'ПАДДОК' },
    { key: 'track', text: 'ТРАССА' },
  ];

  context.save();
  context.font = '600 14px monospace';
  context.textAlign = 'center';

  labels.forEach((label) => {
    const position = config.map.labelPositions[label.key];
    if (!position) {
      return;
    }

    context.strokeStyle = 'rgba(239,125,34,0.9)';
    context.strokeRect(position.x - 58, position.y - 22, 116, 32);
    context.fillStyle = 'rgba(239,125,34,0.2)';
    context.fillRect(position.x - 58, position.y - 22, 116, 32);
    context.fillStyle = '#fff5e9';
    context.fillText(label.text, position.x, position.y - 1);
  });

  context.restore();
}

export function renderScene(context, state, config, options = {}) {
  context.clearRect(0, 0, config.map.pixelWidth, config.map.pixelHeight);
  renderMap(context, state, config);
  renderNpcs(context, state);
  renderEffects(context, state, config);
  renderProblems(context, state, config);
  renderPlayerAura(context, state, config);
  renderHeroSprite(context, state.player, Math.floor(state.time * 8));
  renderStatusSidebar(context, state, config, options);

  if (options.editorMode) {
    renderEditorGrid(context, config);
    renderEditorLabels(context, config);
  }
}
