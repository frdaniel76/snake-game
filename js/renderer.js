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
  let camera = null;  // camera object (null = no scrolling, full board visible)

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
    const camX = camera ? camera.x : 0;
    const camY = camera ? camera.y : 0;
    const px = (gx - camX) * TILE * scale + offsetX;
    const py = (gy - camY) * TILE * scale + offsetY;
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
      // Use device pixel ratio for crisp rendering, allow fractional scale
      const dpr = window.devicePixelRatio || 1;
      // Reserve 48px top for HUD
      const availH = canvasH - 48;

      // Determine the effective view size in tiles.
      // For small boards (<=15x20), show the full board.
      // For large boards, cap the view at 15x20 (or whatever fits the aspect ratio)
      // so tiles stay a reasonable size, and use camera scrolling.
      const MAX_VIEW_W = 15;
      const MAX_VIEW_H = 20;
      let viewTilesW = boardW;
      let viewTilesH = boardH;

      if (boardW > MAX_VIEW_W || boardH > MAX_VIEW_H) {
        // Large board: cap the viewport
        viewTilesW = Math.min(boardW, MAX_VIEW_W);
        viewTilesH = Math.min(boardH, MAX_VIEW_H);
      }

      const rawScale = Math.min(canvasW / (viewTilesW * TILE), availH / (viewTilesH * TILE));
      // Use the full available scale for maximum board size on mobile
      scale = Math.max(1, rawScale);
      const totalW = viewTilesW * TILE * scale;
      const totalH = viewTilesH * TILE * scale;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      canvas.style.width = canvasW + 'px';
      canvas.style.height = canvasH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      offsetX = Math.floor((canvasW - totalW) / 2);
      offsetY = Math.floor((canvasH - totalH) / 2) + 24; // shift down for HUD
      ctx.imageSmoothingEnabled = false;
      rebuildCache(scale);

      // Return view dimensions so caller can configure camera
      return { viewTilesW, viewTilesH };
    },

    clear() {
      ctx.fillStyle = COLORS.VOID;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawBoard(grid, warpEdges) {
      const w = gridWidth(grid);
      const h = gridHeight(grid);
      const ts = TILE * scale;

      const camX = camera ? camera.x : 0;
      const camY = camera ? camera.y : 0;
      const camVW = camera ? camera.viewW : w;
      const camVH = camera ? camera.viewH : h;

      // Visible tile range (with 1-tile margin for partially visible edge tiles)
      const xMin = Math.max(0, Math.floor(camX) - 1);
      const xMax = Math.min(w - 1, Math.floor(camX) + camVW + 1);
      const yMin = Math.max(0, Math.floor(camY) - 1);
      const yMax = Math.min(h - 1, Math.floor(camY) + camVH + 1);

      // Clip drawing to viewport area to avoid overdraw outside the board area
      ctx.save();
      ctx.beginPath();
      ctx.rect(offsetX, offsetY, camVW * ts, camVH * ts);
      ctx.clip();

      // Draw floor for visible area
      ctx.fillStyle = FLOOR_COLOR;
      ctx.fillRect(offsetX, offsetY, camVW * ts, camVH * ts);

      // Draw grid lines (only visible range)
      ctx.strokeStyle = GRID_LINE_COLOR;
      ctx.lineWidth = 1;
      for (let x = xMin; x <= xMax + 1; x++) {
        const px = (x - camX) * ts + offsetX;
        ctx.beginPath();
        ctx.moveTo(px + 0.5, offsetY);
        ctx.lineTo(px + 0.5, offsetY + camVH * ts);
        ctx.stroke();
      }
      for (let y = yMin; y <= yMax + 1; y++) {
        const py = (y - camY) * ts + offsetY;
        ctx.beginPath();
        ctx.moveTo(offsetX, py + 0.5);
        ctx.lineTo(offsetX + camVW * ts, py + 0.5);
        ctx.stroke();
      }

      // Draw elements (only visible tiles)
      for (let y = yMin; y <= yMax; y++) {
        for (let x = xMin; x <= xMax; x++) {
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
            case ELEM.PORTAL:
              if (tile.data?.color) {
                drawSprite('PORTAL_' + tile.data.color.toUpperCase(), x, y);
              }
              break;
            case ELEM.KEY:
              if (tile.data?.color) {
                drawSprite('KEY_' + tile.data.color.toUpperCase(), x, y);
              }
              break;
            case ELEM.GATE:
              if (tile.data?.color) {
                drawSprite('GATE_' + tile.data.color.toUpperCase(), x, y);
              }
              break;
            case ELEM.BREAKABLE:
              drawSprite('BREAKABLE', x, y);
              break;
            case ELEM.ONE_WAY:
              if (tile.data?.dir) {
                drawSprite('ONE_WAY_' + tile.data.dir, x, y);
              }
              break;
            case ELEM.ICE:
              drawSprite('ICE', x, y);
              break;
            case ELEM.SPEED_PAD:
              drawSprite('SPEED_PAD', x, y);
              break;
            case ELEM.SLOW_PAD:
              drawSprite('SLOW_PAD', x, y);
              break;
            case ELEM.POISON:
              drawSprite('POISON', x, y);
              break;
            case ELEM.MOVING_OBS:
              // Draw patrol path under the obstacle (only visible path points)
              if (tile.data && tile.data.path) {
                for (const p of tile.data.path) {
                  if ((p.x !== x || p.y !== y) && p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax) {
                    drawSprite('MOVING_PATH', p.x, p.y);
                  }
                }
              }
              drawSprite('MOVING_OBS', x, y);
              break;
            case ELEM.TIMED_FOOD: {
              drawSprite('TIMED_FOOD', x, y);
              // Draw countdown ring overlay
              if (tile.data && tile.data.maxTime) {
                const fraction = Math.max(0, tile.data.timeLeft / tile.data.maxTime);
                const cx = (x - camX) * ts + offsetX + ts / 2;
                const cy = (y - camY) * ts + offsetY + ts / 2;
                const radius = ts / 2 - 1;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2, false);
                ctx.strokeStyle = fraction > 0.3 ? '#ffaa00' : '#ff3333';
                ctx.lineWidth = Math.max(2, scale);
                ctx.stroke();
              }
              break;
            }
            case ELEM.HEART:
              drawSprite('HEART', x, y);
              break;
            // EMPTY and other types: floor already drawn
          }
        }
      }

      // Draw warp edge indicators on boundary tiles that have no wall
      if (warpEdges) {
        if (warpEdges.top) for (let x = xMin; x <= xMax; x++) { const t = getTile(grid, x, 0); if (t && t.type === ELEM.EMPTY) drawSprite('WARP_EDGE', x, 0); }
        if (warpEdges.bottom) for (let x = xMin; x <= xMax; x++) { const t = getTile(grid, x, h - 1); if (t && t.type === ELEM.EMPTY) drawSprite('WARP_EDGE', x, h - 1); }
        if (warpEdges.left) for (let y = yMin; y <= yMax; y++) { const t = getTile(grid, 0, y); if (t && t.type === ELEM.EMPTY) drawSprite('WARP_EDGE', 0, y); }
        if (warpEdges.right) for (let y = yMin; y <= yMax; y++) { const t = getTile(grid, w - 1, y); if (t && t.type === ELEM.EMPTY) drawSprite('WARP_EDGE', w - 1, y); }
      }

      ctx.restore();
    },

    drawSnake(snake, interp, prevSegments) {
      if (!snake || !snake.segments || snake.segments.length === 0) return;

      const segs = snake.segments;
      const prev = prevSegments;
      const ts = TILE * scale;
      const camX = camera ? camera.x : 0;
      const camY = camera ? camera.y : 0;
      const camVW = camera ? camera.viewW : Infinity;
      const camVH = camera ? camera.viewH : Infinity;

      // Clip to viewport when camera is active
      if (camera) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(offsetX, offsetY, camVW * ts, camVH * ts);
        ctx.clip();
      }

      for (let i = segs.length - 1; i >= 0; i--) {
        const cur = segs[i];
        let lx = cur.x;
        let ly = cur.y;

        // Interpolate if we have previous positions
        if (prev && prev[i]) {
          lx = prev[i].x + (cur.x - prev[i].x) * interp;
          ly = prev[i].y + (cur.y - prev[i].y) * interp;
        }

        // Skip segments that are outside the visible area (with 1-tile margin)
        if (camera) {
          if (lx < camX - 1 || lx > camX + camVW + 1 || ly < camY - 1 || ly > camY + camVH + 1) continue;
        }

        const px = Math.round((lx - camX) * ts + offsetX);
        const py = Math.round((ly - camY) * ts + offsetY);

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

      if (camera) {
        ctx.restore();
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

    setCamera(cam) {
      camera = cam;
    },

    // Utility getters
    get scale() { return scale; },
    get ctx() { return ctx; },

    tileToPixel(tx, ty) {
      const camX = camera ? camera.x : 0;
      const camY = camera ? camera.y : 0;
      return {
        x: (tx - camX) * TILE * scale + offsetX,
        y: (ty - camY) * TILE * scale + offsetY,
      };
    },
  };
}
