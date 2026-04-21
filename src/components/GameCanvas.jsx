import { useEffect, useMemo, useRef, useState } from 'react';

import { createGameSession } from '../game/session';
import { createAutoPilotController } from '../game/systems/autoPilotController';
import { createInputController } from '../game/systems/inputController';
import { renderScene } from '../game/render/renderScene';
import { createUiSnapshot } from '../game/state/createUiSnapshot';
import { serializeSummary } from '../game/state/summary';

export function GameCanvas({
  config,
  isActive,
  audioEnabled,
  autoEnabled,
  onGameOver,
  onReturnToMenu,
  editorMode,
  onPaintTile,
  onMoveLabel,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const dragLabelRef = useRef(null);
  const paintDragRef = useRef(false);
  const lastPaintedTileRef = useRef(null);
  const isActiveRef = useRef(isActive);
  const autoEnabledRef = useRef(autoEnabled);
  const editorModeRef = useRef(editorMode);
  const onGameOverRef = useRef(onGameOver);
  const portraitImageRef = useRef(null);
  const trackPortraitImageRef = useRef(null);
  const boothPortraitImageRef = useRef(null);
  const standsPortraitImageRef = useRef(null);
  const officePortraitImageRef = useRef(null);
  const paddockPortraitImageRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const [canvasViewport, setCanvasViewport] = useState({
    width: config.map.pixelWidth,
    height: config.map.pixelHeight,
  });

  const dimensions = useMemo(
    () => ({
      width: config.map.pixelWidth,
      height: config.map.pixelHeight,
    }),
    [config],
  );

  const criticalValue = snapshot
    ? Math.round(
        Math.max(0, ...snapshot.problems.map((problem) => problem.waitProgress || 0)) * 100,
      )
    : 0;

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    autoEnabledRef.current = autoEnabled;
  }, [autoEnabled]);

  useEffect(() => {
    editorModeRef.current = editorMode;
  }, [editorMode]);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    const assetBase = `${import.meta.env.BASE_URL}assets/`;
    const image = new Image();
    const trackImage = new Image();
    const boothImage = new Image();
    const standsImage = new Image();
    const officeImage = new Image();
    const paddockImage = new Image();

    image.src = `${assetBase}player-portrait.png`;
    trackImage.src = `${assetBase}track-portrait.png`;
    boothImage.src = `${assetBase}booth-portrait.png`;
    standsImage.src = `${assetBase}stands-portrait.png`;
    officeImage.src = `${assetBase}office-portrait.png`;
    paddockImage.src = `${assetBase}paddock-portrait.png`;

    image.onload = () => {
      portraitImageRef.current = image;
    };

    trackImage.onload = () => {
      trackPortraitImageRef.current = trackImage;
    };

    boothImage.onload = () => {
      boothPortraitImageRef.current = boothImage;
    };

    standsImage.onload = () => {
      standsPortraitImageRef.current = standsImage;
    };

    officeImage.onload = () => {
      officePortraitImageRef.current = officeImage;
    };

    paddockImage.onload = () => {
      paddockPortraitImageRef.current = paddockImage;
    };

    return () => {
      portraitImageRef.current = null;
      trackPortraitImageRef.current = null;
      boothPortraitImageRef.current = null;
      standsPortraitImageRef.current = null;
      officePortraitImageRef.current = null;
      paddockPortraitImageRef.current = null;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return undefined;
    }

    const resizeCanvas = () => {
      const bounds = stage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        return;
      }

      const mapAspect = config.map.pixelWidth / config.map.pixelHeight;
      let nextWidth = bounds.width;
      let nextHeight = nextWidth / mapAspect;

      if (nextHeight > bounds.height) {
        nextHeight = bounds.height;
        nextWidth = nextHeight * mapAspect;
      }

      setCanvasViewport({
        width: Math.floor(nextWidth),
        height: Math.floor(nextHeight),
      });
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(stage);
    resizeCanvas();

    return () => {
      observer.disconnect();
    };
  }, [config.map.pixelHeight, config.map.pixelWidth]);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    const input = createInputController();
    const autoPilot = createAutoPilotController();
    const session = createGameSession({
      config,
      audioEnabled,
      onGameOver: (state) => {
        setSnapshot(createUiSnapshot(state));
        onGameOverRef.current(serializeSummary(state));
      },
    });

    const context = canvasRef.current.getContext('2d');
    context.imageSmoothingEnabled = false;

    let frameId = 0;
    let previousTime = performance.now();

    const frame = (time) => {
      const deltaMs = Math.min(time - previousTime, 50);
      previousTime = time;

      const state = session.getState();
      const nextInput = autoEnabledRef.current
        ? autoPilot.getInput(state, config)
        : input.getState();

      if (isActiveRef.current) {
        session.step(deltaMs / 1000, nextInput);
      }

      const nextState = session.getState();
      setSnapshot(createUiSnapshot(nextState));
      renderScene(context, nextState, config, {
        editorMode: editorModeRef.current,
        portraitImage: portraitImageRef.current,
        trackPortraitImage: trackPortraitImageRef.current,
        boothPortraitImage: boothPortraitImageRef.current,
        standsPortraitImage: standsPortraitImageRef.current,
        officePortraitImage: officePortraitImageRef.current,
        paddockPortraitImage: paddockPortraitImageRef.current,
      });
      frameId = window.requestAnimationFrame(frame);
    };

    frameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      input.destroy();
      session.destroy();
    };
  }, [audioEnabled, config]);

  const getCanvasPointerPosition = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !editorMode) {
      return null;
    }

    const bounds = canvas.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left;
    const relativeY = event.clientY - bounds.top;

    if (
      relativeX < 0 ||
      relativeY < 0 ||
      relativeX > bounds.width ||
      relativeY > bounds.height
    ) {
      return null;
    }

    return {
      pixelX: (relativeX / bounds.width) * config.map.pixelWidth,
      pixelY: (relativeY / bounds.height) * config.map.pixelHeight,
    };
  };

  const handleCanvasPointerDown = (event) => {
    const pointer = getCanvasPointerPosition(event);
    if (!pointer) {
      return;
    }

    const { pixelX, pixelY } = pointer;
    const labelEntries = Object.entries(config.map.labelPositions || {});
    const hitLabel = labelEntries.find(([, position]) => (
      pixelX >= position.x - 58 &&
      pixelX <= position.x + 58 &&
      pixelY >= position.y - 22 &&
      pixelY <= position.y + 10
    ));

    if (hitLabel) {
      dragLabelRef.current = {
        key: hitLabel[0],
        offsetX: pixelX - hitLabel[1].x,
        offsetY: pixelY - hitLabel[1].y,
      };
      paintDragRef.current = false;
      lastPaintedTileRef.current = null;
      return;
    }

    const tileX = Math.floor(pixelX / config.tileSize);
    const tileY = Math.floor(pixelY / config.tileSize);

    if (
      tileX < 0 ||
      tileY < 0 ||
      tileX >= config.map.width ||
      tileY >= config.map.height
    ) {
      return;
    }

    paintDragRef.current = true;
    lastPaintedTileRef.current = `${tileX}:${tileY}`;
    onPaintTile({ tileX, tileY });
  };

  const handleCanvasPointerMove = (event) => {
    if (!editorMode) {
      return;
    }

    const pointer = getCanvasPointerPosition(event);
    if (!pointer) {
      return;
    }

    const { pixelX, pixelY } = pointer;
    if (dragLabelRef.current) {
      const nextX = Math.max(
        60,
        Math.min(config.map.pixelWidth - 60, pixelX - dragLabelRef.current.offsetX),
      );
      const nextY = Math.max(
        24,
        Math.min(config.map.pixelHeight - 12, pixelY - dragLabelRef.current.offsetY),
      );

      onMoveLabel({
        key: dragLabelRef.current.key,
        x: nextX,
        y: nextY,
      });
      return;
    }

    if (!paintDragRef.current || (event.buttons & 1) !== 1) {
      return;
    }

    const tileX = Math.floor(pixelX / config.tileSize);
    const tileY = Math.floor(pixelY / config.tileSize);
    if (
      tileX < 0 ||
      tileY < 0 ||
      tileX >= config.map.width ||
      tileY >= config.map.height
    ) {
      return;
    }

    const tileKey = `${tileX}:${tileY}`;
    if (lastPaintedTileRef.current === tileKey) {
      return;
    }

    lastPaintedTileRef.current = tileKey;
    onPaintTile({ tileX, tileY });
  };

  const handleCanvasPointerUp = () => {
    dragLabelRef.current = null;
    paintDragRef.current = false;
    lastPaintedTileRef.current = null;
  };

  const handleCanvasPointerCancel = () => {
    dragLabelRef.current = null;
    paintDragRef.current = false;
    lastPaintedTileRef.current = null;
  };

  return (
    <div className="canvas-shell">
      <div ref={stageRef} className="canvas-stage">
        <canvas
          ref={canvasRef}
          className={`game-canvas ${editorMode ? 'is-editor' : ''}`}
          width={dimensions.width}
          height={dimensions.height}
          style={canvasViewport}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerCancel}
          onPointerLeave={handleCanvasPointerUp}
        />
      </div>
      {snapshot ? (
        <div className="status-bar">
          <div>
            <span>Решено</span>
            <strong>{snapshot.score}</strong>
          </div>
          <div>
            <span>Активно проблем</span>
            <strong>{snapshot.problems.length}</strong>
          </div>
          <div>
            <span>Перегруз</span>
            <strong>{snapshot.pressure.toFixed(0)}%</strong>
          </div>
          <div>
            <span>Критичность</span>
            <strong>{criticalValue}%</strong>
          </div>
          <button type="button" onClick={onReturnToMenu}>
            В меню
          </button>
        </div>
      ) : null}
    </div>
  );
}
