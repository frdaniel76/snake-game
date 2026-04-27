// ---------------------------------------------------------------------------
// Procedural Level Generator — generates 215 new levels for worlds 1-10
// ---------------------------------------------------------------------------
import { ELEM } from './config.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function range(from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) arr.push(i);
  return arr;
}

/** Seeded PRNG (mulberry32) — deterministic from level id */
function seededRng(seed) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle array in-place using seeded rng */
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick random element */
function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

/** Pick N unique random elements from arr */
function pickN(arr, n, rng) {
  const copy = [...arr];
  shuffle(copy, rng);
  return copy.slice(0, Math.min(n, copy.length));
}

/** BFS reachability from a start tile, avoiding walls and boundary */
function reachableTiles(w, h, wallSet, startX, startY) {
  const key = (x, y) => `${x},${y}`;
  const visited = new Set();
  const queue = [{ x: startX, y: startY }];
  visited.add(key(startX, startY));
  while (queue.length > 0) {
    const { x, y } = queue.shift();
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 1 || ny < 1 || nx >= w - 1 || ny >= h - 1) continue;
      const k = key(nx, ny);
      if (visited.has(k) || wallSet.has(k)) continue;
      visited.add(k);
      queue.push({ x: nx, y: ny });
    }
  }
  return visited;
}

/** Convert wall set key back to {x, y} */
function parseKey(k) {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
}

// ---------------------------------------------------------------------------
// Wall Template Functions
// ---------------------------------------------------------------------------

function openArena(w, h, rng, density = 0.08) {
  const walls = [];
  const count = Math.floor((w - 2) * (h - 2) * density / 4);
  const tried = new Set();
  for (let i = 0; i < count; i++) {
    const bx = 2 + Math.floor(rng() * (w - 5));
    const by = 2 + Math.floor(rng() * (h - 5));
    const k = `${bx},${by}`;
    if (tried.has(k)) continue;
    tried.add(k);
    // 2x2 block
    walls.push({ x: bx, y: by }, { x: bx + 1, y: by }, { x: bx, y: by + 1 }, { x: bx + 1, y: by + 1 });
  }
  return walls;
}

function corridorMaze(w, h, rng, complexity = 3) {
  const walls = [];
  const numH = 1 + Math.floor(rng() * complexity);
  const numV = 1 + Math.floor(rng() * complexity);

  // Horizontal walls with gaps
  for (let i = 0; i < numH; i++) {
    const y = 3 + Math.floor(rng() * (h - 6));
    const gapX = 2 + Math.floor(rng() * (w - 4));
    const gapWidth = 2 + Math.floor(rng() * 2);
    for (let x = 1; x < w - 1; x++) {
      if (x >= gapX && x < gapX + gapWidth) continue;
      walls.push({ x, y });
    }
  }
  // Vertical walls with gaps
  for (let i = 0; i < numV; i++) {
    const x = 3 + Math.floor(rng() * (w - 6));
    const gapY = 2 + Math.floor(rng() * (h - 4));
    const gapHeight = 2 + Math.floor(rng() * 2);
    for (let y = 1; y < h - 1; y++) {
      if (y >= gapY && y < gapY + gapHeight) continue;
      walls.push({ x, y });
    }
  }
  return walls;
}

function multiRoom(w, h, rng, rooms = 4) {
  const walls = [];
  // Create a grid of rooms
  const cols = rooms <= 2 ? 2 : rooms <= 4 ? 2 : 3;
  const rows = Math.ceil(rooms / cols);
  const cellW = Math.floor((w - 2) / cols);
  const cellH = Math.floor((h - 2) / rows);

  // Vertical dividers
  for (let c = 1; c < cols; c++) {
    const x = 1 + c * cellW;
    if (x >= w - 1) continue;
    const gapY = 1 + Math.floor(cellH / 2) + Math.floor(rng() * rows) * cellH;
    for (let y = 1; y < h - 1; y++) {
      if (Math.abs(y - gapY) <= 1) continue; // 3-tile gap
      walls.push({ x, y });
    }
  }
  // Horizontal dividers
  for (let r = 1; r < rows; r++) {
    const y = 1 + r * cellH;
    if (y >= h - 1) continue;
    const gapX = 1 + Math.floor(cellW / 2) + Math.floor(rng() * cols) * cellW;
    for (let x = 1; x < w - 1; x++) {
      if (Math.abs(x - gapX) <= 1) continue; // 3-tile gap
      walls.push({ x, y });
    }
  }
  return walls;
}

function spiral(w, h, rng) {
  const walls = [];
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  const layers = Math.min(Math.floor(w / 4), Math.floor(h / 4));

  for (let layer = 1; layer <= layers; layer++) {
    const top = cy - layer * 2;
    const bot = cy + layer * 2;
    const left = cx - layer * 2;
    const right = cx + layer * 2;
    if (left < 1 || top < 1 || right >= w - 1 || bot >= h - 1) continue;

    // Decide which side has the gap based on layer parity
    const gapSide = layer % 4;
    const gapSize = 2 + Math.floor(rng() * 2);

    // Top edge
    if (gapSide !== 0) {
      for (let x = left; x <= right; x++) walls.push({ x, y: top });
    } else {
      const gStart = left + Math.floor(rng() * (right - left - gapSize));
      for (let x = left; x <= right; x++) {
        if (x >= gStart && x < gStart + gapSize) continue;
        walls.push({ x, y: top });
      }
    }
    // Bottom edge
    if (gapSide !== 2) {
      for (let x = left; x <= right; x++) walls.push({ x, y: bot });
    } else {
      const gStart = left + Math.floor(rng() * (right - left - gapSize));
      for (let x = left; x <= right; x++) {
        if (x >= gStart && x < gStart + gapSize) continue;
        walls.push({ x, y: bot });
      }
    }
    // Left edge
    if (gapSide !== 3) {
      for (let y = top + 1; y < bot; y++) walls.push({ x: left, y });
    } else {
      const gStart = top + 1 + Math.floor(rng() * (bot - top - gapSize - 1));
      for (let y = top + 1; y < bot; y++) {
        if (y >= gStart && y < gStart + gapSize) continue;
        walls.push({ x: left, y });
      }
    }
    // Right edge
    if (gapSide !== 1) {
      for (let y = top + 1; y < bot; y++) walls.push({ x: right, y });
    } else {
      const gStart = top + 1 + Math.floor(rng() * (bot - top - gapSize - 1));
      for (let y = top + 1; y < bot; y++) {
        if (y >= gStart && y < gStart + gapSize) continue;
        walls.push({ x: right, y });
      }
    }
  }
  return walls;
}

function symmetricMaze(w, h, rng) {
  const walls = [];
  const halfW = Math.floor(w / 2);
  // Generate walls on left half, mirror to right
  const numSegments = 3 + Math.floor(rng() * 4);
  for (let i = 0; i < numSegments; i++) {
    const sx = 2 + Math.floor(rng() * (halfW - 2));
    const sy = 2 + Math.floor(rng() * (h - 4));
    const horiz = rng() > 0.5;
    const len = 2 + Math.floor(rng() * 4);
    for (let j = 0; j < len; j++) {
      const x = horiz ? sx + j : sx;
      const y = horiz ? sy : sy + j;
      if (x < 1 || x >= halfW || y < 1 || y >= h - 1) continue;
      walls.push({ x, y });
      const mx = w - 1 - x;
      if (mx > halfW && mx < w - 1) walls.push({ x: mx, y });
    }
  }
  return walls;
}

function crossPattern(w, h, rng) {
  const walls = [];
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  const armLen = Math.min(Math.floor(w / 3), Math.floor(h / 3));
  const gapH = 1 + Math.floor(rng() * 2);
  const gapV = 1 + Math.floor(rng() * 2);
  // Horizontal arm
  for (let x = cx - armLen; x <= cx + armLen; x++) {
    if (x < 1 || x >= w - 1) continue;
    if (Math.abs(x - cx) <= gapH) continue;
    walls.push({ x, y: cy });
  }
  // Vertical arm
  for (let y = cy - armLen; y <= cy + armLen; y++) {
    if (y < 1 || y >= h - 1) continue;
    if (Math.abs(y - cy) <= gapV) continue;
    walls.push({ x: cx, y });
  }
  return walls;
}

function diamondPattern(w, h, rng) {
  const walls = [];
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  const size = Math.min(Math.floor(w / 3), Math.floor(h / 3));
  const gapPos = Math.floor(rng() * 4); // which corner gets gap
  for (let d = 0; d <= size; d++) {
    const pts = [
      { x: cx + d, y: cy - size + d },
      { x: cx + d, y: cy + size - d },
      { x: cx - d, y: cy - size + d },
      { x: cx - d, y: cy + size - d },
    ];
    for (let pi = 0; pi < pts.length; pi++) {
      const p = pts[pi];
      if (pi === gapPos && d > size - 2) continue;
      if (p.x < 1 || p.x >= w - 1 || p.y < 1 || p.y >= h - 1) continue;
      walls.push(p);
    }
  }
  return walls;
}

// ---------------------------------------------------------------------------
// Template picker
// ---------------------------------------------------------------------------

const TEMPLATES = [openArena, corridorMaze, multiRoom, spiral, symmetricMaze, crossPattern, diamondPattern];

function pickTemplate(rng, worldId, posInWorld) {
  // Bias template selection by world for variety
  if (posInWorld <= 3) return pick([openArena, symmetricMaze, crossPattern], rng);
  if (posInWorld >= 23) return pick([corridorMaze, multiRoom, spiral], rng);
  return pick(TEMPLATES, rng);
}

// ---------------------------------------------------------------------------
// Board size selection based on difficulty
// ---------------------------------------------------------------------------

function boardSize(difficulty, rng) {
  if (difficulty <= 0.3) return { w: 15, h: 20 };
  if (difficulty <= 0.6) return pick([{ w: 15, h: 20 }, { w: 20, h: 25 }], rng);
  return pick([{ w: 20, h: 25 }, { w: 25, h: 30 }], rng);
}

// ---------------------------------------------------------------------------
// Difficulty curve: position 1-25 within a world
// ---------------------------------------------------------------------------

function difficultyForPosition(pos) {
  // 1-5 easy(0.1-0.3), 6-15 medium(0.3-0.6), 16-20 hard(0.6-0.9), 21 breather(0.25), 22-25 boss(0.8-1.0)
  if (pos <= 5) return 0.1 + (pos - 1) * 0.05;
  if (pos <= 15) return 0.3 + (pos - 6) * 0.03;
  if (pos <= 20) return 0.6 + (pos - 16) * 0.075;
  if (pos === 21) return 0.25;
  return 0.8 + (pos - 22) * 0.066;
}

// ---------------------------------------------------------------------------
// Element placement helpers
// ---------------------------------------------------------------------------

function safeEmptyTiles(w, h, wallSet, occupied) {
  const tiles = [];
  for (let x = 2; x < w - 2; x++) {
    for (let y = 2; y < h - 2; y++) {
      const k = `${x},${y}`;
      if (!wallSet.has(k) && !occupied.has(k)) tiles.push({ x, y });
    }
  }
  return tiles;
}

function placeFood(count, emptyTiles, rng, occupied) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng);
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    const k = `${t.x},${t.y}`;
    if (occupied.has(k)) continue;
    elements.push({ type: ELEM.FOOD, x: t.x, y: t.y });
    occupied.add(k);
    placed++;
  }
  return elements;
}

function placeGoldenFood(count, emptyTiles, rng, occupied) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng);
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    const k = `${t.x},${t.y}`;
    if (occupied.has(k)) continue;
    elements.push({ type: ELEM.GOLDEN_FOOD, x: t.x, y: t.y });
    occupied.add(k);
    placed++;
  }
  return elements;
}

function placePoison(count, emptyTiles, rng, occupied) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng);
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    const k = `${t.x},${t.y}`;
    if (occupied.has(k)) continue;
    elements.push({ type: ELEM.POISON, x: t.x, y: t.y });
    occupied.add(k);
    placed++;
  }
  return elements;
}

function placeIce(w, h, rng, wallSet, occupied, coverage = 0.15) {
  const elements = [];
  // Place rectangular ice patches
  const patchCount = 1 + Math.floor(rng() * 3);
  for (let p = 0; p < patchCount; p++) {
    const pw = 3 + Math.floor(rng() * 5);
    const ph = 3 + Math.floor(rng() * 5);
    const sx = 2 + Math.floor(rng() * (w - pw - 3));
    const sy = 2 + Math.floor(rng() * (h - ph - 3));
    for (let x = sx; x < sx + pw && x < w - 1; x++) {
      for (let y = sy; y < sy + ph && y < h - 1; y++) {
        const k = `${x},${y}`;
        if (!wallSet.has(k) && !occupied.has(k)) {
          elements.push({ type: ELEM.ICE, x, y });
          // Don't add to occupied — food can sit on ice
        }
      }
    }
  }
  return elements;
}

function placeSpeedPads(count, emptyTiles, rng, occupied) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng);
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    const k = `${t.x},${t.y}`;
    if (occupied.has(k)) continue;
    elements.push({ type: ELEM.SPEED_PAD, x: t.x, y: t.y });
    occupied.add(k);
    placed++;
  }
  return elements;
}

function placeSlowPads(count, emptyTiles, rng, occupied) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng);
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    const k = `${t.x},${t.y}`;
    if (occupied.has(k)) continue;
    elements.push({ type: ELEM.SLOW_PAD, x: t.x, y: t.y });
    occupied.add(k);
    placed++;
  }
  return elements;
}

function placePortalPair(emptyTiles, w, h, rng, occupied, wallSet, pairId, color) {
  const elements = [];
  const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  // Find two tiles far apart
  const candidates = shuffle([...emptyTiles], rng).filter(t => {
    const k = `${t.x},${t.y}`;
    return !occupied.has(k);
  });
  if (candidates.length < 2) return elements;

  // Pick two tiles with decent distance
  let best = [candidates[0], candidates[1]];
  let bestDist = 0;
  for (let i = 0; i < Math.min(candidates.length, 20); i++) {
    for (let j = i + 1; j < Math.min(candidates.length, 20); j++) {
      const d = Math.abs(candidates[i].x - candidates[j].x) + Math.abs(candidates[i].y - candidates[j].y);
      if (d > bestDist) {
        bestDist = d;
        best = [candidates[i], candidates[j]];
      }
    }
  }

  // Determine safe exit dirs (4+ runway from boundary and walls)
  for (const tile of best) {
    let exitDir = null;
    // Try all 4 directions, pick the one with most runway (minimum 4)
    let bestRunway = 0;
    for (const dir of dirs) {
      const dx = dir === 'LEFT' ? -1 : dir === 'RIGHT' ? 1 : 0;
      const dy = dir === 'UP' ? -1 : dir === 'DOWN' ? 1 : 0;
      let runway = 0;
      for (let step = 1; step <= 8; step++) {
        const nx = tile.x + dx * step;
        const ny = tile.y + dy * step;
        if (nx < 1 || ny < 1 || nx >= w - 1 || ny >= h - 1 || wallSet.has(`${nx},${ny}`) || occupied.has(`${nx},${ny}`)) break;
        runway++;
      }
      if (runway > bestRunway) {
        bestRunway = runway;
        exitDir = dir;
      }
    }
    if (!exitDir || bestRunway < 4) {
      // Portal position is too constrained — skip this portal pair
      continue;
    }
    elements.push({
      type: ELEM.PORTAL,
      x: tile.x,
      y: tile.y,
      data: { color, pairId, exitDir },
    });
    occupied.add(`${tile.x},${tile.y}`);
  }
  // If we didn't get a pair (one was skipped), remove any orphan
  if (elements.length === 1) { elements.length = 0; }
  return elements;
}

function placeKeyAndGate(emptyTiles, w, h, rng, occupied, wallSet, color) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng).filter(t => {
    const k = `${t.x},${t.y}`;
    if (occupied.has(k)) return false;
    // Gate must not be adjacent to boundary walls (x>1, y>1, etc)
    if (t.x <= 2 || t.y <= 2 || t.x >= w - 3 || t.y >= h - 3) return false;
    return true;
  });
  if (candidates.length < 2) return elements;

  const keyTile = candidates[0];
  const gateTile = candidates[Math.floor(candidates.length / 2)]; // Pick one far from key

  elements.push({ type: ELEM.KEY, x: keyTile.x, y: keyTile.y, data: { color } });
  occupied.add(`${keyTile.x},${keyTile.y}`);
  elements.push({ type: ELEM.GATE, x: gateTile.x, y: gateTile.y, data: { color } });
  occupied.add(`${gateTile.x},${gateTile.y}`);
  return elements;
}

function placeOneWayGates(count, emptyTiles, rng, occupied) {
  const elements = [];
  const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const candidates = shuffle([...emptyTiles], rng).filter(t => !occupied.has(`${t.x},${t.y}`));
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    elements.push({ type: ELEM.ONE_WAY, x: t.x, y: t.y, data: { dir: pick(dirs, rng) } });
    occupied.add(`${t.x},${t.y}`);
    placed++;
  }
  return elements;
}

function placeBreakable(count, emptyTiles, rng, occupied) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng).filter(t => !occupied.has(`${t.x},${t.y}`));
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    elements.push({ type: ELEM.BREAKABLE, x: t.x, y: t.y });
    occupied.add(`${t.x},${t.y}`);
    placed++;
  }
  return elements;
}

function placeMovingObs(count, w, h, rng, occupied, wallSet) {
  const elements = [];
  for (let i = 0; i < count; i++) {
    const horizontal = rng() > 0.5;
    const pathLen = 4 + Math.floor(rng() * 5);
    let startX, startY;
    let attempts = 0;
    let path = null;

    while (attempts < 30) {
      attempts++;
      startX = 2 + Math.floor(rng() * (w - 4));
      startY = 2 + Math.floor(rng() * (h - 4));
      path = [];
      let valid = true;
      for (let s = 0; s < pathLen; s++) {
        const px = horizontal ? startX + s : startX;
        const py = horizontal ? startY : startY + s;
        if (px < 1 || py < 1 || px >= w - 1 || py >= h - 1) { valid = false; break; }
        if (wallSet.has(`${px},${py}`)) { valid = false; break; }
        path.push({ x: px, y: py });
      }
      if (valid && path.length >= 3) break;
      path = null;
    }
    if (!path) continue;
    elements.push({
      type: ELEM.MOVING_OBS,
      x: path[0].x,
      y: path[0].y,
      data: { path, speed: 3 + Math.floor(rng() * 4) },
    });
  }
  return elements;
}

function placeTimedFood(count, emptyTiles, rng, occupied) {
  const elements = [];
  const candidates = shuffle([...emptyTiles], rng).filter(t => !occupied.has(`${t.x},${t.y}`));
  let placed = 0;
  for (const t of candidates) {
    if (placed >= count) break;
    const timer = 6 + Math.floor(rng() * 5);
    elements.push({ type: ELEM.TIMED_FOOD, x: t.x, y: t.y, data: { timeLeft: timer, maxTime: timer } });
    occupied.add(`${t.x},${t.y}`);
    placed++;
  }
  return elements;
}

function placeExit(emptyTiles, rng, occupied) {
  // Place exit in upper portion of board
  const candidates = shuffle([...emptyTiles], rng)
    .filter(t => !occupied.has(`${t.x},${t.y}`) && t.y < 6);
  if (candidates.length === 0) {
    // Fallback: any empty tile
    const fallback = shuffle([...emptyTiles], rng).filter(t => !occupied.has(`${t.x},${t.y}`));
    if (fallback.length === 0) return [];
    const t = fallback[0];
    occupied.add(`${t.x},${t.y}`);
    return [{ type: ELEM.EXIT, x: t.x, y: t.y }];
  }
  const t = candidates[0];
  occupied.add(`${t.x},${t.y}`);
  return [{ type: ELEM.EXIT, x: t.x, y: t.y }];
}

function placeHeart(emptyTiles, rng, occupied) {
  const candidates = shuffle([...emptyTiles], rng).filter(t => !occupied.has(`${t.x},${t.y}`));
  if (candidates.length === 0) return [];
  const t = candidates[0];
  occupied.add(`${t.x},${t.y}`);
  return [{ type: ELEM.HEART, x: t.x, y: t.y }];
}

// ---------------------------------------------------------------------------
// Spawn point selection
// ---------------------------------------------------------------------------

function findSpawn(w, h, wallSet, occupied, rng) {
  // Prefer bottom portion of the board
  for (let attempt = 0; attempt < 100; attempt++) {
    const x = 2 + Math.floor(rng() * (w - 4));
    const y = Math.floor(h * 0.6) + Math.floor(rng() * Math.floor(h * 0.3));
    if (y >= h - 1 || y < 1) continue;
    const k = `${x},${y}`;
    if (wallSet.has(k) || occupied.has(k)) continue;

    // Check 2 tiles ahead in each cardinal direction for at least one safe path
    const dirs = [
      { dir: 'RIGHT', dx: 1, dy: 0 },
      { dir: 'LEFT', dx: -1, dy: 0 },
      { dir: 'UP', dx: 0, dy: -1 },
      { dir: 'DOWN', dx: 0, dy: 1 },
    ];
    for (const d of dirs) {
      let safe = true;
      // Check body tiles behind (3 length snake)
      for (let b = 1; b <= 2; b++) {
        const bx = x - d.dx * b;
        const by = y - d.dy * b;
        if (bx < 1 || by < 1 || bx >= w - 1 || by >= h - 1) { safe = false; break; }
        if (wallSet.has(`${bx},${by}`) || occupied.has(`${bx},${by}`)) { safe = false; break; }
      }
      if (!safe) continue;
      // Check 2 tiles ahead (no walls or deadly elements)
      for (let a = 1; a <= 2; a++) {
        const ax = x + d.dx * a;
        const ay = y + d.dy * a;
        if (ax < 1 || ay < 1 || ax >= w - 1 || ay >= h - 1) { safe = false; break; }
        if (wallSet.has(`${ax},${ay}`) || occupied.has(`${ax},${ay}`)) { safe = false; break; }
      }
      if (safe) return { x, y, dir: d.dir };
    }
  }
  // Fallback: center of board going right
  return { x: Math.floor(w / 2), y: Math.floor(h * 0.75), dir: 'RIGHT' };
}

// ---------------------------------------------------------------------------
// World-specific level generation configs
// ---------------------------------------------------------------------------

const WORLD_NAMES = [
  'Green Meadow',       // 1
  'Ancient Temple',     // 2
  'Ice Cavern',         // 3
  'Shadow Forest',      // 4
  'Void Realm',         // 5
  'Crystal Depths',     // 6
  'Magma Caves',        // 7
  'Storm Peaks',        // 8
  'Twilight Garden',    // 9
  'Cosmic Temple',      // 10
];

// Level name pools per world
const NAME_POOLS = {
  1: ['Grassy Path', 'Meadow Run', 'Daisy Field', 'Clover Trail', 'Sunlit Glade',
      'Butterfly Lane', 'Rolling Hills', 'Green Expanse', 'Pastoral Route', 'Wildflower Way',
      'Hillside Walk', 'Gentle Slope', 'Picnic Spot', 'Orchard Path', 'Garden Stroll',
      'Open Range', 'Fresh Breeze', 'Spring Valley', 'Shady Grove', 'Morning Dew'],
  2: ['Hidden Chamber', 'Rune Hall', 'Pharaoh\'s Path', 'Column Run', 'Temple Core',
      'Sand Vault', 'Golden Passage', 'Scarab Maze', 'Torch Alley', 'Altar Room',
      'Stone Bridge', 'Ancient Path', 'Relic Room', 'Pillar Walk', 'Crypt Entry',
      'Dusty Corridor', 'Idol Chamber', 'Tomb Run', 'Sacred Hall', 'Obelisk Row'],
  3: ['Frost Path', 'Icicle Alley', 'Glacier Run', 'Snowdrift Maze', 'Frozen Lake',
      'Crystal Path', 'Avalanche Pass', 'Ice Bridge', 'Permafrost', 'Cold Front',
      'Sleet Slide', 'Hailstone Hall', 'Blizzard Alley', 'Tundra Trek', 'Polar Route',
      'Chill Factor', 'Winter Pass', 'Frostbite Run', 'Snow Spiral', 'Sub-Zero'],
  4: ['Dark Trail', 'Fungal Path', 'Misty Woods', 'Shadow Walk', 'Cursed Glade',
      'Thorn Maze', 'Owl\'s Watch', 'Hollow Log', 'Night March', 'Deadwood Path',
      'Foggy Dell', 'Wolf Run', 'Root Tangle', 'Witch Trail', 'Moonlit Chase',
      'Dusk Patrol', 'Spider Web', 'Bat Cave', 'Whisper Walk', 'Haunted Path'],
  5: ['Void Drift', 'Null Space', 'Rift Walk', 'Cosmic Slide', 'Star Trail',
      'Nebula Run', 'Gravity Well', 'Phase Shift', 'Warp Zone', 'Dark Matter',
      'Event Horizon', 'Antimatter', 'Singularity', 'Quantum Path', 'Astral Walk',
      'Void Storm', 'Dimension Rift', 'Zero Point', 'Flux Gate', 'Entropy'],
  6: ['Crystal Vein', 'Geode Chamber', 'Prism Hall', 'Sapphire Maze', 'Diamond Run',
      'Amethyst Path', 'Crystal Garden', 'Jewel Cave', 'Quartz Tunnel', 'Gem Vault',
      'Opal Path', 'Ruby Passage', 'Topaz Trail', 'Emerald Route', 'Crystal Spine',
      'Mineral Maze', 'Sparkle Path', 'Faceted Hall', 'Shard Run', 'Crystal Core',
      'Refraction', 'Luminous Path', 'Gleam Walk', 'Radiant Cave', 'Prismatic Run'],
  7: ['Lava Flow', 'Ember Walk', 'Magma Tube', 'Cinder Path', 'Caldera Run',
      'Sulfur Springs', 'Basalt Bridge', 'Obsidian Maze', 'Pyroclast', 'Inferno Path',
      'Fire Walk', 'Scorch Trail', 'Ash Field', 'Molten Core', 'Heat Sink',
      'Flame Passage', 'Igneous Run', 'Eruption', 'Forge Path', 'Crucible',
      'Smelter Run', 'Slag Maze', 'Furnace Walk', 'Hellfire Path', 'Volcano Heart'],
  8: ['Thunder Path', 'Lightning Run', 'Gale Force', 'Summit Rush', 'Cliff Edge',
      'Storm Front', 'Tempest Trail', 'Wind Shear', 'Cyclone Maze', 'Hail Ridge',
      'Peak Patrol', 'Crag Walk', 'Boulder Run', 'Altitude', 'Cloud Break',
      'Squall Line', 'Nimbus Path', 'Updraft', 'Downdraft', 'Eye of Storm',
      'Static Charge', 'Rolling Thunder', 'Flash Point', 'Storm Chaser', 'Apex'],
  9: ['Twilight Path', 'Dusk Garden', 'Moonflower', 'Stargazer', 'Night Bloom',
      'Shadow Bloom', 'Firefly Lane', 'Glowworm Path', 'Petal Maze', 'Vine Tangle',
      'Enchanted Walk', 'Fairy Ring', 'Luminous Hedge', 'Mystic Garden', 'Dream Path',
      'Aurora Trail', 'Moth Dance', 'Twilight Maze', 'Nightshade', 'Wisteria Walk',
      'Orchid Trail', 'Lily Pad Run', 'Blossom Path', 'Thorn Garden', 'Serenity'],
  10: ['Cosmic Gate', 'Stellar Path', 'Supernova', 'Galaxy Run', 'Pulsar Trail',
       'Comet Chase', 'Meteor Maze', 'Black Hole', 'White Dwarf', 'Red Giant',
       'Solar Flare', 'Asteroid Belt', 'Quasar Path', 'Cosmic Web', 'Star Forge',
       'Nebula Core', 'Interstellar', 'Cosmic Dust', 'Wormhole', 'Big Bang',
       'Celestial Path', 'Orbit Run', 'Cosmic Spiral', 'Final Frontier', 'Ascension'],
};

// Mechanic configs per world
function worldMechanics(worldId) {
  switch (worldId) {
    case 1: return { food: true, golden: true, exit: true };
    case 2: return { food: true, golden: true, exit: true, portals: true, keys: true, breakable: true, oneWay: true };
    case 3: return { food: true, golden: true, exit: true, ice: true, speedPad: true, slowPad: true };
    case 4: return { food: true, golden: true, exit: true, poison: true, movingObs: true, timedFood: true };
    case 5: return { food: true, golden: true, exit: true, warp: true, portals: true, keys: true, breakable: true, oneWay: true, ice: true, speedPad: true, slowPad: true, poison: true, movingObs: true, timedFood: true };
    case 6: return { food: true, golden: true, exit: true, ice: true, portals: true, keys: true, speedPad: true, slowPad: true };
    case 7: return { food: true, golden: true, exit: true, speedPad: true, slowPad: true, breakable: true, poison: true };
    case 8: return { food: true, golden: true, exit: true, movingObs: true, timedFood: true, oneWay: true, speedPad: true };
    case 9: return { food: true, golden: true, exit: true, portals: true, keys: true, ice: true, poison: true, oneWay: true, breakable: true };
    case 10: return { food: true, golden: true, exit: true, portals: true, keys: true, breakable: true, oneWay: true, ice: true, speedPad: true, slowPad: true, poison: true, movingObs: true, timedFood: true, warp: true };
    default: return { food: true };
  }
}

// ---------------------------------------------------------------------------
// Main generation function
// ---------------------------------------------------------------------------

function generateLevel(levelId, worldId, posInWorld) {
  const rng = seededRng(levelId * 7919 + worldId * 1013);
  const diff = difficultyForPosition(posInWorld);
  const mechanics = worldMechanics(worldId);

  // Board size
  const { w, h } = boardSize(diff, rng);

  // Pick wall template
  const templateFn = pickTemplate(rng, worldId, posInWorld);
  let wallDensity = 0.04 + diff * 0.08;
  let complexity = 1 + Math.floor(diff * 4);
  let rooms = 2 + Math.floor(diff * 4);

  let rawWalls;
  if (templateFn === openArena) rawWalls = templateFn(w, h, rng, wallDensity);
  else if (templateFn === corridorMaze) rawWalls = templateFn(w, h, rng, complexity);
  else if (templateFn === multiRoom) rawWalls = templateFn(w, h, rng, rooms);
  else rawWalls = templateFn(w, h, rng);

  // Deduplicate walls and keep in bounds
  const wallSet = new Set();
  const walls = [];
  for (const wall of rawWalls) {
    if (wall.x < 1 || wall.y < 1 || wall.x >= w - 1 || wall.y >= h - 1) continue;
    const k = `${wall.x},${wall.y}`;
    if (wallSet.has(k)) continue;
    wallSet.add(k);
    walls.push({ x: wall.x, y: wall.y });
  }

  // Track occupied positions
  const occupied = new Set();

  // Find spawn point
  const spawn = findSpawn(w, h, wallSet, occupied, rng);
  // Mark spawn and body as occupied
  const dirVec = spawn.dir === 'RIGHT' ? { x: -1, y: 0 } : spawn.dir === 'LEFT' ? { x: 1, y: 0 } : spawn.dir === 'UP' ? { x: 0, y: 1 } : { x: 0, y: -1 };
  for (let b = 0; b < 3; b++) {
    occupied.add(`${spawn.x + dirVec.x * b},${spawn.y + dirVec.y * b}`);
  }

  // Get reachable empty tiles from spawn (BFS)
  const reachable = reachableTiles(w, h, wallSet, spawn.x, spawn.y);
  const emptyTiles = [];
  for (const k of reachable) {
    if (occupied.has(k)) continue;
    emptyTiles.push(parseKey(k));
  }

  // Helper: reachable tiles not yet occupied (refreshed on each call)
  function reachableEmptyTiles() {
    const tiles = [];
    for (const k of reachable) {
      if (occupied.has(k)) continue;
      const t = parseKey(k);
      if (t.x < 2 || t.y < 2 || t.x >= w - 2 || t.y >= h - 2) continue;
      tiles.push(t);
    }
    return tiles;
  }

  // Elements array
  const elements = [];

  // Food count scales with difficulty and board size
  const baseFoodCount = 3 + Math.floor(diff * 5) + Math.floor((w * h) / 100);
  const foodCount = Math.max(3, Math.min(baseFoodCount, 12));
  elements.push(...placeFood(foodCount, emptyTiles, rng, occupied));

  // Golden food (occasional) — use reachable tiles
  if (mechanics.golden && rng() < 0.3 + diff * 0.2) {
    elements.push(...placeGoldenFood(1, reachableEmptyTiles(), rng, occupied));
  }

  // Goal type: simpler levels eat-all, harder use eat-all-and-exit
  const hasExit = diff > 0.25 && rng() > 0.4;
  const goal = hasExit ? { type: 'eat-all-and-exit' } : { type: 'eat-all' };
  if (hasExit) {
    elements.push(...placeExit(reachableEmptyTiles(), rng, occupied));
  }

  // World-specific mechanics
  const portalColors = ['blue', 'orange', 'purple', 'green'];
  let portalPairCount = 0;

  if (mechanics.portals && rng() < 0.4 + diff * 0.3) {
    const pairCount = 1 + (diff > 0.6 && rng() > 0.5 ? 1 : 0);
    for (let p = 0; p < pairCount; p++) {
      const color = portalColors[portalPairCount % portalColors.length];
      elements.push(...placePortalPair(reachableEmptyTiles(), w, h, rng, occupied, wallSet, `p${portalPairCount + 1}`, color));
      portalPairCount++;
    }
  }

  if (mechanics.keys && rng() < 0.3 + diff * 0.3) {
    const keyColors = ['red', 'blue', 'yellow'];
    const color = pick(keyColors, rng);
    elements.push(...placeKeyAndGate(reachableEmptyTiles(), w, h, rng, occupied, wallSet, color));
  }

  if (mechanics.breakable && rng() < 0.3 + diff * 0.3) {
    const count = 1 + Math.floor(diff * 3);
    elements.push(...placeBreakable(count, reachableEmptyTiles(), rng, occupied));
  }

  if (mechanics.oneWay && rng() < 0.3 + diff * 0.3) {
    const count = 1 + Math.floor(diff * 3);
    elements.push(...placeOneWayGates(count, reachableEmptyTiles(), rng, occupied));
  }

  if (mechanics.ice) {
    elements.push(...placeIce(w, h, rng, wallSet, occupied, 0.1 + diff * 0.1));
  }

  if (mechanics.speedPad && rng() < 0.4 + diff * 0.2) {
    elements.push(...placeSpeedPads(1 + Math.floor(diff * 2), safeEmptyTiles(w, h, wallSet, occupied), rng, occupied));
  }

  if (mechanics.slowPad && rng() < 0.4 + diff * 0.2) {
    elements.push(...placeSlowPads(1 + Math.floor(diff * 2), safeEmptyTiles(w, h, wallSet, occupied), rng, occupied));
  }

  if (mechanics.poison && rng() < 0.3 + diff * 0.3) {
    const count = 1 + Math.floor(diff * 3);
    elements.push(...placePoison(count, safeEmptyTiles(w, h, wallSet, occupied), rng, occupied));
  }

  if (mechanics.movingObs && rng() < 0.3 + diff * 0.3) {
    const count = 1 + Math.floor(diff * 2);
    elements.push(...placeMovingObs(count, w, h, rng, occupied, wallSet));
  }

  if (mechanics.timedFood && rng() < 0.3 + diff * 0.3) {
    const count = 1 + Math.floor(diff * 3);
    elements.push(...placeTimedFood(count, reachableEmptyTiles(), rng, occupied));
  }

  // Heart for hard levels
  if (diff > 0.7 && rng() > 0.6) {
    elements.push(...placeHeart(reachableEmptyTiles(), rng, occupied));
  }

  // Warp edges for worlds 5 and 10
  let warpEdges = false;
  if (mechanics.warp) {
    if (rng() > 0.5) {
      warpEdges = true;
    } else {
      // Partial warp
      warpEdges = {
        top: rng() > 0.5,
        bottom: rng() > 0.5,
        left: rng() > 0.5,
        right: rng() > 0.5,
      };
      // Ensure at least one edge warps
      if (!warpEdges.top && !warpEdges.bottom && !warpEdges.left && !warpEdges.right) {
        warpEdges.left = true;
        warpEdges.right = true;
      }
    }
  }

  // Star targets scale with difficulty and board size
  const baseTime = Math.floor(30 + diff * 60 + (w * h) / 20);
  const starTargets = {
    time: baseTime,
    fastTime: Math.floor(baseTime * 0.6),
  };

  // Level name
  const namePool = NAME_POOLS[worldId] || NAME_POOLS[1];
  const nameIndex = (posInWorld - 1) % namePool.length;
  const name = namePool[nameIndex];

  // New mechanic hints for first levels introducing something
  let newMechanic = null;

  // Description
  const worldName = WORLD_NAMES[worldId - 1];
  const descriptions = [
    `Navigate the ${worldName.toLowerCase()} and collect all the food.`,
    `A tricky path through ${worldName.toLowerCase()}. Stay focused!`,
    `Explore every corner of this ${worldName.toLowerCase()} level.`,
    `Watch your step in ${worldName.toLowerCase()}!`,
    `A challenging layout awaits in ${worldName.toLowerCase()}.`,
  ];
  const description = descriptions[Math.floor(rng() * descriptions.length)];

  return {
    id: levelId,
    name,
    world: worldId,
    worldName,
    width: w,
    height: h,
    snake: { x: spawn.x, y: spawn.y, dir: spawn.dir, length: 3 },
    goal,
    elements,
    walls,
    speed: 1,
    starTargets,
    warpEdges,
    description,
    newMechanic,
  };
}

// ---------------------------------------------------------------------------
// Public API — generate all missing levels
// ---------------------------------------------------------------------------

// Existing hand-crafted levels by new ID
const EXISTING_LEVEL_IDS = new Set([
  // World 1: 1-7
  1, 2, 3, 4, 5, 6, 7,
  // World 2: 26-32
  26, 27, 28, 29, 30, 31, 32,
  // World 3: 51-57
  51, 52, 53, 54, 55, 56, 57,
  // World 4: 76-82
  76, 77, 78, 79, 80, 81, 82,
  // World 5: 101-107
  101, 102, 103, 104, 105, 106, 107,
]);

// Hand-crafted fallbacks for levels that procedural generation can't reliably solve
const FALLBACK_LEVELS = {
  108: {
    id: 108, name: 'Phase Shift', world: 5, worldName: 'Void Realm',
    width: 15, height: 20, snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 5 }, { type: ELEM.FOOD, x: 11, y: 5 },
      { type: ELEM.FOOD, x: 3, y: 12 }, { type: ELEM.FOOD, x: 11, y: 12 },
      { type: ELEM.FOOD, x: 7, y: 8 }, { type: ELEM.GOLDEN_FOOD, x: 7, y: 3 },
    ],
    walls: [
      ...range(3, 5).map(x => ({ x, y: 8 })), ...range(9, 11).map(x => ({ x, y: 8 })),
      { x: 5, y: 10 }, { x: 5, y: 11 }, { x: 9, y: 10 }, { x: 9, y: 11 },
    ],
    speed: 1.2, starTargets: { time: 40, fastTime: 22 },
    warpEdges: { top: true, bottom: true, left: false, right: false },
    description: 'Warp edges bend space. Collect all apples across the void.',
  },
  225: {
    id: 225, name: 'Serenity', world: 9, worldName: 'Twilight Garden',
    width: 15, height: 20, snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 4 }, { type: ELEM.FOOD, x: 11, y: 4 },
      { type: ELEM.FOOD, x: 7, y: 10 }, { type: ELEM.FOOD, x: 3, y: 14 },
      { type: ELEM.FOOD, x: 11, y: 14 },
      { type: ELEM.SLOW_PAD, x: 7, y: 8 }, { type: ELEM.SLOW_PAD, x: 7, y: 12 },
    ],
    walls: [
      { x: 5, y: 6 }, { x: 9, y: 6 }, { x: 5, y: 14 }, { x: 9, y: 14 },
    ],
    speed: 1, starTargets: { time: 40, fastTime: 25 },
    warpEdges: false,
    description: 'A peaceful garden. Slow pads offer calm. Collect all apples.',
  },
  239: {
    id: 239, name: 'Cosmic Web', world: 10, worldName: 'Cosmic Temple',
    width: 20, height: 25, snake: { x: 10, y: 20, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 4, y: 6 }, { type: ELEM.FOOD, x: 15, y: 6 },
      { type: ELEM.FOOD, x: 4, y: 14 }, { type: ELEM.FOOD, x: 15, y: 14 },
      { type: ELEM.FOOD, x: 10, y: 10 }, { type: ELEM.FOOD, x: 10, y: 18 },
      { type: ELEM.GOLDEN_FOOD, x: 10, y: 3 },
      { type: ELEM.PORTAL, x: 3, y: 10, data: { color: 'blue', pairId: 'p1', exitDir: 'DOWN' } },
      { type: ELEM.PORTAL, x: 16, y: 10, data: { color: 'blue', pairId: 'p1', exitDir: 'DOWN' } },
      { type: ELEM.EXIT, x: 10, y: 2 },
    ],
    walls: [
      ...range(1, 8).map(x => ({ x, y: 8 })), ...range(12, 18).map(x => ({ x, y: 8 })),
      ...range(1, 8).map(x => ({ x, y: 16 })), ...range(12, 18).map(x => ({ x, y: 16 })),
      { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 13, y: 11 }, { x: 13, y: 12 },
    ],
    speed: 1.3, starTargets: { time: 90, fastTime: 55 },
    warpEdges: false,
    description: 'Navigate the cosmic web. Portals connect distant sectors.',
  },
};

export function generateAllLevels() {
  const levels = [];
  for (let worldId = 1; worldId <= 10; worldId++) {
    const worldStart = (worldId - 1) * 25 + 1;
    for (let pos = 1; pos <= 25; pos++) {
      const levelId = worldStart + pos - 1;
      if (EXISTING_LEVEL_IDS.has(levelId)) continue;
      // Use hand-crafted fallback if available
      if (FALLBACK_LEVELS[levelId]) { levels.push(FALLBACK_LEVELS[levelId]); continue; }
      // Retry with different seeds if generation produces invalid level
      let level = null;
      for (let seedOffset = 0; seedOffset < 50; seedOffset++) {
        level = generateLevel(levelId + seedOffset * 1000, worldId, pos);
        level.id = levelId;
        let valid = true;
        // Check spawn not on wall/element
        const headKey = `${level.snake.x},${level.snake.y}`;
        const elementPositions = new Set(level.elements.map(e => `${e.x},${e.y}`));
        const wallPositions = new Set(level.walls.map(w => `${w.x},${w.y}`));
        if (wallPositions.has(headKey) || elementPositions.has(headKey)) { valid = false; }
        // Check portals come in pairs
        if (valid) {
          const portalPairs = {};
          for (const e of level.elements) {
            if (e.type === ELEM.PORTAL && e.data?.pairId) {
              portalPairs[e.data.pairId] = (portalPairs[e.data.pairId] || 0) + 1;
            }
          }
          if (Object.values(portalPairs).some(c => c !== 2)) valid = false;
        }
        // Check portal runways (4+ tiles)
        if (valid) {
          const wSet = new Set(level.walls.map(w => `${w.x},${w.y}`));
          for (const e of level.elements) {
            if (e.type === ELEM.PORTAL && e.data?.exitDir) {
              const dx = e.data.exitDir === 'LEFT' ? -1 : e.data.exitDir === 'RIGHT' ? 1 : 0;
              const dy = e.data.exitDir === 'UP' ? -1 : e.data.exitDir === 'DOWN' ? 1 : 0;
              let runway = 0;
              for (let s = 1; s <= 4; s++) {
                const nx = e.x + dx * s, ny = e.y + dy * s;
                if (nx < 1 || ny < 1 || nx >= level.width - 1 || ny >= level.height - 1 || wSet.has(`${nx},${ny}`)) break;
                runway++;
              }
              if (runway < 4) { valid = false; break; }
            }
          }
        }
        // Check body segments safe
        if (valid) {
          const dv = { UP: [0,1], DOWN: [0,-1], LEFT: [1,0], RIGHT: [-1,0] }[level.snake.dir] || [-1,0];
          for (let b = 1; b < level.snake.length; b++) {
            const bk = `${level.snake.x + dv[0]*b},${level.snake.y + dv[1]*b}`;
            if (wallPositions.has(bk) || elementPositions.has(bk)) { valid = false; break; }
          }
        }
        if (valid) break;
      }
      levels.push(level);
    }
  }
  return levels;
}
