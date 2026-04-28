/**
 * Difficulty scorer — analyzes the BFS solution path to estimate
 * real-player difficulty based on:
 * 1. Turn density (direction changes per path length)
 * 2. Tightest reaction window (shortest straight run between turns)
 * 3. Chokepoints (corridor width = 1 along the path)
 * 4. Snake length vs corridor width (growing snake in tight spaces)
 * 5. Dangerous element count (poison, moving obs, timed food)
 * 6. Portal stress (distance from portal exit to first required turn)
 * 7. Board size pressure (larger = more navigation complexity)
 */

import { ELEM } from './config.js';
import { loadLevel, LEVELS } from './levels.js';
import { getTile, findTiles, gridWidth, gridHeight } from './grid.js';

// BFS from start to target — returns path as [{x,y}, ...]
function bfsPath(grid, sx, sy, targetCheck, canWalk) {
  const w = gridWidth(grid), h = gridHeight(grid);
  const visited = Array.from({ length: h }, () => Array(w).fill(false));
  const queue = [{ x: sx, y: sy, path: [{ x: sx, y: sy }] }];
  visited[sy][sx] = true;
  const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();
    if (targetCheck(x, y)) return path;
    for (const d of dirs) {
      const nx = x + d.x, ny = y + d.y;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (visited[ny][nx]) continue;
      if (!canWalk(nx, ny)) continue;
      visited[ny][nx] = true;
      queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
    }
  }
  return null;
}

// Measure corridor width at a point (perpendicular empty tiles)
function corridorWidth(grid, x, y, dx, dy) {
  // Perpendicular to movement direction
  const px = dy === 0 ? 0 : 1;
  const py = dx === 0 ? 0 : 1;
  // If moving horizontally, check vertical width. If vertical, check horizontal.
  const perpDx = dy !== 0 ? 1 : 0;
  const perpDy = dx !== 0 ? 1 : 0;

  let width = 1; // the tile itself
  // Check in positive perpendicular direction
  for (let i = 1; i <= 10; i++) {
    const t = getTile(grid, x + perpDx * i, y + perpDy * i);
    if (!t || t.type === ELEM.WALL || t.type === ELEM.GATE) break;
    width++;
  }
  // Check in negative perpendicular direction
  for (let i = 1; i <= 10; i++) {
    const t = getTile(grid, x - perpDx * i, y - perpDy * i);
    if (!t || t.type === ELEM.WALL || t.type === ELEM.GATE) break;
    width++;
  }
  return width;
}

// Analyze a path for difficulty metrics
function analyzePath(grid, path) {
  if (!path || path.length < 2) return { turns: 0, minRun: 0, chokepoints: 0, avgWidth: 10 };

  let turns = 0;
  let currentRunLength = 1;
  let minRunLength = Infinity;
  let chokepoints = 0;
  let totalWidth = 0;
  let minWidth = Infinity;
  let prevDx = path[1].x - path[0].x;
  let prevDy = path[1].y - path[0].y;

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;

    if (dx !== prevDx || dy !== prevDy) {
      turns++;
      if (currentRunLength < minRunLength) minRunLength = currentRunLength;
      currentRunLength = 1;
    } else {
      currentRunLength++;
    }

    // Corridor width at this point
    const cw = corridorWidth(grid, path[i].x, path[i].y, dx, dy);
    totalWidth += cw;
    if (cw < minWidth) minWidth = cw;
    if (cw <= 1) chokepoints++;

    prevDx = dx;
    prevDy = dy;
  }
  // Final run
  if (currentRunLength < minRunLength) minRunLength = currentRunLength;
  if (minRunLength === Infinity) minRunLength = path.length;

  return {
    turns,
    minRun: minRunLength,
    chokepoints,
    avgWidth: Math.round((totalWidth / (path.length - 1)) * 10) / 10,
    minWidth,
  };
}

/**
 * Score a single level's difficulty.
 * Returns { score, breakdown } where breakdown has individual metrics.
 */
export function scoreLevel(levelId) {
  let data;
  try { data = loadLevel(levelId); } catch { return null; }

  const grid = data.grid;
  const w = gridWidth(grid), h = gridHeight(grid);
  const boardArea = w * h;

  // Walkable check
  const walkable = (x, y) => {
    const t = getTile(grid, x, y);
    return t && t.type !== ELEM.WALL && t.type !== ELEM.GATE && t.type !== ELEM.MOVING_OBS;
  };

  // Find all food positions
  const foodTypes = [ELEM.FOOD, ELEM.GOLDEN_FOOD, ELEM.TIMED_FOOD];
  const allFood = [];
  for (const ft of foodTypes) allFood.push(...findTiles(grid, ft));

  // Simulate greedy AI: BFS to nearest food, eat, repeat
  let headX = data.snakeStart.x;
  let headY = data.snakeStart.y;
  let snakeLength = data.snakeStart.length;
  const foodRemaining = new Set(allFood.map(f => `${f.x},${f.y}`));
  const fullPath = [{ x: headX, y: headY }];

  let totalTurns = 0;
  let minReactionWindow = Infinity; // shortest straight run (in ticks = ~180ms each)
  let totalChokepoints = 0;
  let minCorridorWidth = Infinity;
  let totalPathWidth = 0;
  let pathSteps = 0;
  let longestSnake = snakeLength;

  while (foodRemaining.size > 0) {
    // BFS to nearest remaining food
    const path = bfsPath(grid, headX, headY,
      (x, y) => foodRemaining.has(`${x},${y}`),
      walkable
    );

    if (!path || path.length < 2) break; // unreachable food

    const analysis = analyzePath(grid, path);
    totalTurns += analysis.turns;
    if (analysis.minRun < minReactionWindow) minReactionWindow = analysis.minRun;
    totalChokepoints += analysis.chokepoints;
    if (analysis.minWidth < minCorridorWidth) minCorridorWidth = analysis.minWidth;
    totalPathWidth += analysis.avgWidth * (path.length - 1);
    pathSteps += path.length - 1;

    // "Eat" the food
    const dest = path[path.length - 1];
    const destTile = getTile(grid, dest.x, dest.y);
    if (destTile?.type === ELEM.GOLDEN_FOOD) snakeLength += 3;
    else snakeLength += 1;
    if (snakeLength > longestSnake) longestSnake = snakeLength;
    foodRemaining.delete(`${dest.x},${dest.y}`);
    headX = dest.x;
    headY = dest.y;

    fullPath.push(...path.slice(1));
  }

  // If there's an exit, path to it
  const exitTiles = findTiles(grid, ELEM.EXIT);
  if (exitTiles.length > 0 && (data.goal.type === 'reach-exit' || data.goal.type === 'eat-all-and-exit')) {
    const exitPath = bfsPath(grid, headX, headY,
      (x, y) => exitTiles.some(e => e.x === x && e.y === y),
      walkable
    );
    if (exitPath && exitPath.length > 1) {
      const analysis = analyzePath(grid, exitPath);
      totalTurns += analysis.turns;
      if (analysis.minRun < minReactionWindow) minReactionWindow = analysis.minRun;
      totalChokepoints += analysis.chokepoints;
      pathSteps += exitPath.length - 1;
    }
  }

  if (minReactionWindow === Infinity) minReactionWindow = 10;
  const avgPathWidth = pathSteps > 0 ? totalPathWidth / pathSteps : 5;

  // Dangerous elements count
  const poison = findTiles(grid, ELEM.POISON).length;
  const movingObs = findTiles(grid, ELEM.MOVING_OBS).length;
  const timedFood = findTiles(grid, ELEM.TIMED_FOOD).length;
  const ice = findTiles(grid, ELEM.ICE).length;
  const speedPads = findTiles(grid, ELEM.SPEED_PAD).length;
  const portals = findTiles(grid, ELEM.PORTAL).length;

  // Portal stress: check runway distance at each portal exit
  let portalStress = 0;
  const portalTiles = findTiles(grid, ELEM.PORTAL);
  for (const p of portalTiles) {
    if (!p.data?.exitDir) continue;
    const dv = { UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } }[p.data.exitDir];
    let straightRun = 0;
    for (let i = 1; i <= 20; i++) {
      const t = getTile(grid, p.x + dv.x * i, p.y + dv.y * i);
      if (!t || t.type === ELEM.WALL || t.type === ELEM.GATE) break;
      straightRun++;
    }
    if (straightRun < 6) portalStress += (6 - straightRun); // stress increases as runway shrinks
  }

  // Composite score — calibrated against user feedback:
  // User-tested easy levels (1-7): expect 5-15
  // User said level 14 is "very hard": expect 35+
  const turnDensity = pathSteps > 0 ? (totalTurns / pathSteps) : 0;
  const reactionPressure = Math.max(0, 4 - minReactionWindow); // 0 if minRun >= 4, up to 3 if minRun = 1
  // Only count chokepoints near turns (within 2 steps) — straight corridors aren't hard
  const dangerousChokepoints = Math.min(totalChokepoints, totalTurns * 3);
  const snakeLengthPressure = longestSnake / Math.max(2, avgPathWidth);
  const dangerScore = poison * 3 + movingObs * 4 + timedFood * 2.5 + speedPads * 1;
  const iceScore = Math.min(ice * 0.1, 5); // cap ice contribution

  const score =
    totalTurns * 0.8 +           // raw turn count (most direct player-action metric)
    reactionPressure * 3 +       // tightest reaction window
    dangerousChokepoints * 0.3 + // narrow spots near turns only
    snakeLengthPressure * 1 +    // snake length vs available space
    dangerScore +                // dangerous elements
    iceScore +                   // ice control loss
    portalStress * 1.5 +         // portal exit tightness
    (boardArea > 400 ? 1 : 0) +  // large board
    (boardArea > 700 ? 2 : 0) +  // very large board
    pathSteps * 0.02;            // total path length (minor)

  return {
    score: Math.round(score * 10) / 10,
    breakdown: {
      turnDensity: Math.round(turnDensity * 100) / 100,
      totalTurns,
      minReactionWindow,
      reactionPressure: Math.round(reactionPressure * 10) / 10,
      chokepoints: totalChokepoints,
      minCorridorWidth,
      avgCorridorWidth: Math.round(avgPathWidth * 10) / 10,
      longestSnake,
      snakeLengthPressure: Math.round(snakeLengthPressure * 10) / 10,
      dangerScore,
      portalStress,
      pathSteps,
      boardArea,
    },
  };
}

/**
 * Score all levels. Returns array sorted by level ID.
 */
export function scoreAllLevels() {
  return LEVELS.map(level => {
    const result = scoreLevel(level.id);
    return {
      id: level.id,
      name: level.name,
      world: level.world,
      worldPos: ((level.id - 1) % 25) + 1,
      ...(result || { score: 0, breakdown: {} }),
    };
  }).sort((a, b) => a.id - b.id);
}

/**
 * Get recommended max difficulty per world position.
 * Calibrated so tutorial levels are easy, boss levels can be hard.
 */
export function maxDifficultyForPosition(pos) {
  // Calibrated: user-tested L1-7 score 5-20, L14 ("very hard") ~30
  if (pos <= 3) return 12;     // tutorial: very easy
  if (pos <= 7) return 20;     // early: easy-medium (hand-crafted originals live here)
  if (pos <= 12) return 28;    // mid: medium
  if (pos <= 18) return 35;    // mid-hard
  if (pos <= 20) return 42;    // hard
  if (pos === 21) return 15;   // breather
  if (pos <= 24) return 42;    // boss ramp
  return 55;                   // final boss
}

/**
 * Flag levels that exceed their position's difficulty cap.
 */
export function flagOverDifficulty() {
  const scores = scoreAllLevels();
  return scores.filter(s => s.score > maxDifficultyForPosition(s.worldPos)).map(s => ({
    ...s,
    maxAllowed: maxDifficultyForPosition(s.worldPos),
    overBy: Math.round((s.score - maxDifficultyForPosition(s.worldPos)) * 10) / 10,
  }));
}
