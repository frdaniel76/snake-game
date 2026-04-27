import { TILE, COLORS, ELEM } from './config.js';
import { getTile, gridWidth, gridHeight } from './grid.js';
import { getHead } from './snake.js';
import { SPRITES } from './sprites.js';

const FLOOR_COLOR = '#141425';
const GRID_LINE_COLOR = 'rgba(255,255,255,0.05)';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  // Pre-rendered sprite cache: Map<string, OffscreenCanvas|Canvas>
  const spriteCache = new Map();

  // ---- Sprite caching ----

  function cacheSprite(name, spriteData, s) {
    const size = s * 16;
    let off;
    if (typeof OffscreenCanvas !== 'undefined') {
      off = new OffscreenCanvas(size, size);
    } else {
      off = document.createElement('canvas');
      off.width = size;
      off.height = size;
    }
    const oc = off.getContext('2d');
    for (let py = 0; py < 16; py++) {
      for (let px = 0; px < 16; px++) {
        const color = spriteData[py][px];
        if (color) {
          oc.fillStyle = color;
          oc.fillRect(px * s, py * s, s, s);
        }
      }
    }
    spriteCache.set(name, off);
  }

  function rebuildCache(s) {
    spriteCache.clear();
    for (const [name, data] of Object.entries(SPRITES)) {
      cacheSprite(name, data, s);
    }
  }

  function drawSprite(name, gx, gy) {
    const cached = spriteCache.get(name);
    if (!cached) return;
    const px = gx * TILE * scale + offsetX;
    const py = gy * TILE * scale + offsetY;
    ctx.drawImage(cached, px, py);
  }

  function drawSpriteAt(name, px, py) {
    const cached = spriteCache.get(name);
    if (!cached) return;
    ctx.drawImage(cached, px, py);
  }

  // ---- Direction helpers ----

  function headSpriteName(dir) {
    return 'SNAKE_HEAD_' + (dir || 'RIGHT');
  }

  function tailDirection(tail, prev) {
    // Direction from tail toward the segment it connects to (prev)
    const dx = prev.x - tail.x;
    const dy = prev.y - tail.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    }
    return dy > 0 ? 'DOWN' : 'UP';
  }

  // ---- Public API ----

  return {
    resize(canvasW, canvasH, boardW, boardH) {
      scale = Math.max(1, Math.floor(Math.min(canvasW / (boardW * TILE), canvasH / (boardH * TILE))));
      const totalW = boardW * TILE * scale;
      const totalH = boardH * TILE * scale;
      canvas.width = canvasW;
      canvas.height = canvasH;
      offsetX = Math.floor((canvasW - totalW) / 2);
      offsetY = Math.floor((canvasH - totalH) / 2);
      ctx.imageSmoothingEnabled = false;
      rebuildCache(scale);
    },

    clear() {
      ctx.fillStyle = COLORS.VOID;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawBoard(grid) {
      const w = gridWidth(grid);
      const h = gridHeight(grid);
      const ts = TILE * scale;

      // Draw floor for entire board area
      ctx.fillStyle = FLOOR_COLOR;
      ctx.fillRect(offsetX, offsetY, w * ts, h * ts);

      // Draw grid lines
      ctx.strokeStyle = GRID_LINE_COLOR;
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x++) {
        const px = x * ts + offsetX;
        ctx.beginPath();
        ctx.moveTo(px + 0.5, offsetY);
        ctx.lineTo(px + 0.5, offsetY + h * ts);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y++) {
        const py = y * ts + offsetY;
        ctx.beginPath();
        ctx.moveTo(offsetX, py + 0.5);
        ctx.lineTo(offsetX + w * ts, py + 0.5);
        ctx.stroke();
      }

      // Draw elements
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const tile = getTile(grid, x, y);
          if (!tile) continue;

          switch (tile.type) {
            case ELEM.WALL:
              drawSprite('WALL', x, y);
              break;
            case ELEM.FOOD:
              drawSprite('FOOD', x, y);
              break;
            case ELEM.GOLDEN_FOOD:
              drawSprite('GOLDEN_FOOD', x, y);
              break;
            case ELEM.EXIT:
              if (tile.data?.active) {
                drawSprite('EXIT_ACTIVE', x, y);
              } else {
                drawSprite('EXIT_INACTIVE', x, y);
              }
              break;
            // EMPTY and other types: floor already drawn
          }
        }
      }
    },

    drawSnake(snake, interp, prevSegments) {
      if (!snake || !snake.segments || snake.segments.length === 0) return;

      const segs = snake.segments;
      const prev = prevSegments;
      const ts = TILE * scale;

      for (let i = segs.length - 1; i >= 0; i--) {
        const cur = segs[i];
        let lx = cur.x;
        let ly = cur.y;

        // Interpolate if we have previous positions
        if (prev && prev[i]) {
          lx = prev[i].x + (cur.x - prev[i].x) * interp;
          ly = prev[i].y + (cur.y - prev[i].y) * interp;
        }

        const px = Math.round(lx * ts + offsetX);
        const py = Math.round(ly * ts + offsetY);

        let spriteName;
        if (i === 0) {
          // Head
          spriteName = headSpriteName(snake.dir);
        } else if (i === segs.length - 1) {
          // Tail
          const prevSeg = segs[i - 1];
          const dir = tailDirection(cur, prevSeg);
          spriteName = 'SNAKE_TAIL_' + dir;
        } else {
          // Body - alternate colours
          spriteName = (i % 2 === 0) ? 'SNAKE_BODY' : 'SNAKE_BODY_ALT';
        }

        drawSpriteAt(spriteName, px, py);
      }
    },

    drawHUD(session) {
      if (!session) return;
      // Minimal on-canvas score display in top-right
      const text = `Score: ${session.score}`;
      ctx.font = `${Math.max(14, 12 * scale)}px monospace`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      const tx = canvas.width - 8;
      const ty = 8;
      ctx.fillText(text, tx + 1, ty + 1);
      ctx.fillStyle = COLORS.WHITE;
      ctx.fillText(text, tx, ty);
    },

    // Utility getters
    get scale() { return scale; },
    get ctx() { return ctx; },

    tileToPixel(tx, ty) {
      return {
        x: tx * TILE * scale + offsetX,
        y: ty * TILE * scale + offsetY,
      };
    },
  };
}
