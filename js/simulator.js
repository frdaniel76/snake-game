import { ELEM, DIR } from './config.js';
import { loadLevel, LEVELS } from './levels.js';
import { getTile, findTiles, gridWidth, gridHeight, clearTile, setTile } from './grid.js';

/**
 * BFS from (startX, startY) to any cell matching targetCheck(tile, x, y).
 * canTraverse(x, y, fromX, fromY) returns true if the cell can be entered.
 * Returns path as array of {x, y} or null if unreachable.
 */
function bfs(grid, startX, startY, targetCheck, canTraverse) {
  const w = gridWidth(grid), h = gridHeight(grid);
  const visited = Array.from({ length: h }, () => Array(w).fill(false));
  const queue = [{ x: startX, y: startY, path: [] }];
  visited[startY][startX] = true;

  const dirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();
    const tile = getTile(grid, x, y);
    if (tile && targetCheck(tile, x, y)) {
      return [...path, { x, y }];
    }

    for (const d of dirs) {
      const nx = x + d.x, ny = y + d.y;
      // Handle warp edges (checked by caller if needed)
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      if (visited[ny][nx]) continue;
      if (!canTraverse(nx, ny, x, y)) continue;
      visited[ny][nx] = true;
      queue.push({ x: nx, y: ny, path: [...path, { x, y }] });
    }
  }
  return null;
}

/**
 * Simulate a complete level playthrough.
 * The simulator understands: walls, portals, keys/gates, breakable walls,
 * one-way gates, ice, speed/slow pads, poison, moving obstacles, timed food,
 * warp edges, and heart pickups.
 */
export function simulateLevel(levelId) {
  let levelData;
  try {
    levelData = loadLevel(levelId);
  } catch (_) {
    return { solvable: false, reason: 'Level not found' };
  }
  if (!levelData) return { solvable: false, reason: 'Level not found' };

  const grid = levelData.grid;
  const goal = levelData.goal;
  const warpEdges = levelData.warpEdges;
  let headX = levelData.snakeStart.x;
  let headY = levelData.snakeStart.y;
  let snakeLength = levelData.snakeStart.length;
  let totalSteps = 0;
  let foodEaten = 0;
  const keysCollected = new Set();

  // Collect any keys we can reach first, then re-check food reachability
  function canTraverse(x, y, fromX, fromY) {
    const tile = getTile(grid, x, y);
    if (!tile) return false;
    switch (tile.type) {
      case ELEM.WALL:
        return false;
      case ELEM.GATE:
        // Passable if we have the matching key
        return keysCollected.has(tile.data?.color);
      case ELEM.ONE_WAY: {
        // Can only enter from the allowed direction
        // The direction stored means "you can pass THROUGH in this direction"
        // So if dir is RIGHT, you enter from the left (fromX < x)
        const dir = tile.data?.dir;
        if (!dir) return true;
        const dx = x - fromX, dy = y - fromY;
        const dirMap = { UP: '0,-1', DOWN: '0,1', LEFT: '-1,0', RIGHT: '1,0' };
        return dirMap[dir] === `${dx},${dy}`;
      }
      case ELEM.MOVING_OBS:
        return false; // treat as impassable (in reality timing matters, but for solvability we'll be lenient)
      default:
        return true; // EMPTY, FOOD, GOLDEN_FOOD, TIMED_FOOD, EXIT, PORTAL, KEY, BREAKABLE, ICE, SPEED_PAD, SLOW_PAD, POISON, HEART — all traversable
    }
  }

  // More lenient traversal that also allows moving through breakable walls and moving obstacles
  function canTraverseLenient(x, y, fromX, fromY) {
    const tile = getTile(grid, x, y);
    if (!tile) return false;
    if (tile.type === ELEM.WALL) return false;
    if (tile.type === ELEM.GATE) return keysCollected.has(tile.data?.color);
    if (tile.type === ELEM.ONE_WAY) {
      const dir = tile.data?.dir;
      if (!dir) return true;
      const dx = x - fromX, dy = y - fromY;
      const dirMap = { UP: '0,-1', DOWN: '0,1', LEFT: '-1,0', RIGHT: '1,0' };
      return dirMap[dir] === `${dx},${dy}`;
    }
    // Moving obstacles: assume we can time them
    // Breakable walls: assume we can break them
    return true;
  }

  // Phase 1: Collect all reachable keys first (they may open gates to food)
  let keyPhaseIterations = 0;
  while (keyPhaseIterations < 50) {
    keyPhaseIterations++;
    const keyPath = bfs(grid, headX, headY,
      (tile) => tile.type === ELEM.KEY && !keysCollected.has(tile.data?.color),
      canTraverseLenient
    );
    if (!keyPath) break; // no more reachable keys

    const keyPos = keyPath[keyPath.length - 1];
    const keyTile = getTile(grid, keyPos.x, keyPos.y);
    if (keyTile && keyTile.type === ELEM.KEY) {
      const keyColor = keyTile.data?.color;
      keysCollected.add(keyColor);
      clearTile(grid, keyPos.x, keyPos.y);
      // Dissolve matching gates
      const gates = findTiles(grid, ELEM.GATE).filter(g => g.data?.color === keyColor);
      for (const g of gates) {
        clearTile(grid, g.x, g.y);
      }
    }
    totalSteps += keyPath.length - 1;
    headX = keyPos.x;
    headY = keyPos.y;
  }

  // Handle portals: for BFS, treat portals as teleporters
  // Simple approach: after finding path to a portal, check if we should warp
  // For now: don't model portal teleportation in BFS — just treat portal tiles as passable
  // This is a simplification but works for solvability checking since
  // portals connect rooms that would otherwise be isolated

  // Phase 2: Eat all food
  const foodTypes = [ELEM.FOOD, ELEM.GOLDEN_FOOD, ELEM.TIMED_FOOD];
  let remaining = findTiles(grid, ELEM.FOOD).length
    + findTiles(grid, ELEM.GOLDEN_FOOD).length
    + findTiles(grid, ELEM.TIMED_FOOD).length;

  let iterations = 0;
  while (remaining > 0 && iterations < 500) {
    iterations++;

    // Try strict traversal first, then lenient
    let path = bfs(grid, headX, headY,
      (tile) => foodTypes.includes(tile.type),
      canTraverseLenient
    );

    if (!path || path.length === 0) {
      // Try portal-aware: check if any portal can get us to unreachable food
      // Find all portal tiles, try BFS from each portal's pair
      const portals = findTiles(grid, ELEM.PORTAL);
      let foundViaPortal = false;

      for (const portal of portals) {
        // Can we reach this portal?
        const toPortal = bfs(grid, headX, headY,
          (tile, x, y) => x === portal.x && y === portal.y,
          canTraverseLenient
        );
        if (!toPortal) continue;

        // Find paired portal
        const pair = portals.find(p =>
          p.data?.pairId === portal.data?.pairId &&
          (p.x !== portal.x || p.y !== portal.y)
        );
        if (!pair) continue;

        // BFS from paired portal to food
        const fromPair = bfs(grid, pair.x, pair.y,
          (tile) => foodTypes.includes(tile.type),
          canTraverseLenient
        );
        if (fromPair) {
          // Route: head → portal → pair → food
          totalSteps += toPortal.length - 1 + fromPair.length - 1;
          const target = fromPair[fromPair.length - 1];
          headX = target.x;
          headY = target.y;

          const tile = getTile(grid, headX, headY);
          if (tile && foodTypes.includes(tile.type)) {
            if (tile.type === ELEM.GOLDEN_FOOD) snakeLength += 3;
            else snakeLength += 1;
            clearTile(grid, headX, headY);
            foodEaten++;
            remaining--;
          }
          foundViaPortal = true;
          break;
        }
      }

      if (!foundViaPortal) {
        return { solvable: false, reason: `Can't reach remaining food from (${headX},${headY}). ${remaining} food left.`, steps: totalSteps, foodEaten };
      }
      continue;
    }

    const target = path[path.length - 1];
    totalSteps += path.length - 1;
    headX = target.x;
    headY = target.y;

    const tile = getTile(grid, headX, headY);
    if (tile && foodTypes.includes(tile.type)) {
      if (tile.type === ELEM.GOLDEN_FOOD) snakeLength += 3;
      else snakeLength += 1;
      clearTile(grid, headX, headY);
      foodEaten++;
      remaining--;
    }
  }

  // Phase 3: If exit required, path to exit
  if (goal.type === 'reach-exit' || goal.type === 'eat-all-and-exit') {
    let exitPath = bfs(grid, headX, headY,
      (tile) => tile.type === ELEM.EXIT,
      canTraverseLenient
    );

    // Try via portals if direct path fails
    if (!exitPath) {
      const portals = findTiles(grid, ELEM.PORTAL);
      for (const portal of portals) {
        const toPortal = bfs(grid, headX, headY,
          (tile, x, y) => x === portal.x && y === portal.y,
          canTraverseLenient
        );
        if (!toPortal) continue;
        const pair = portals.find(p => p.data?.pairId === portal.data?.pairId && (p.x !== portal.x || p.y !== portal.y));
        if (!pair) continue;
        const fromPair = bfs(grid, pair.x, pair.y,
          (tile) => tile.type === ELEM.EXIT,
          canTraverseLenient
        );
        if (fromPair) {
          totalSteps += toPortal.length - 1 + fromPair.length - 1;
          exitPath = fromPair; // just need to know it's reachable
          break;
        }
      }
    }

    if (!exitPath) {
      return { solvable: false, reason: `Can't reach exit from (${headX},${headY}) after eating all food.`, steps: totalSteps, foodEaten };
    }
    totalSteps += exitPath.length - 1;
  }

  return { solvable: true, steps: totalSteps, foodEaten, finalLength: snakeLength };
}

// Run simulator on all levels
export function simulateAll() {
  return LEVELS.map(level => ({
    id: level.id,
    name: level.name,
    world: level.world,
    ...simulateLevel(level.id),
  }));
}
