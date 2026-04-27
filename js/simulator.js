import { ELEM, DIR } from './config.js';
import { loadLevel, LEVELS } from './levels.js';
import { getTile, findTiles, gridWidth, gridHeight, clearTile, cloneGrid } from './grid.js';

// BFS from (startX, startY) to any cell matching targetCheck(tile).
// Returns path as array of {x, y} or null if unreachable.
// blocked(x, y) returns true if the cell is impassable.
function bfs(grid, startX, startY, targetCheck, blocked) {
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
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      if (visited[ny][nx]) continue;
      if (blocked(nx, ny)) continue;
      visited[ny][nx] = true;
      queue.push({ x: nx, y: ny, path: [...path, { x, y }] });
    }
  }
  return null; // unreachable
}

// Simulate a complete level playthrough
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
  let headX = levelData.snakeStart.x;
  let headY = levelData.snakeStart.y;
  let snakeLength = levelData.snakeStart.length;
  let totalSteps = 0;
  let foodEaten = 0;

  // Simplified: treat only walls as blocked (not snake body)
  function isBlocked(x, y) {
    const tile = getTile(grid, x, y);
    return !tile || tile.type === ELEM.WALL;
  }

  // Eat all food
  const foodTypes = [ELEM.FOOD, ELEM.GOLDEN_FOOD, ELEM.TIMED_FOOD];
  let remaining = findTiles(grid, ELEM.FOOD).length
    + findTiles(grid, ELEM.GOLDEN_FOOD).length;

  let iterations = 0;
  while (remaining > 0 && iterations < 500) {
    iterations++;
    // Find nearest food via BFS
    const path = bfs(grid, headX, headY,
      (tile) => foodTypes.includes(tile.type),
      isBlocked
    );

    if (!path || path.length === 0) {
      return { solvable: false, reason: `Can't reach remaining food from (${headX},${headY}). ${remaining} food left.`, steps: totalSteps, foodEaten };
    }

    // Move to food
    const target = path[path.length - 1];
    totalSteps += path.length - 1; // first element is current position
    headX = target.x;
    headY = target.y;

    // Eat the food
    const tile = getTile(grid, headX, headY);
    if (tile.type === ELEM.GOLDEN_FOOD) snakeLength += 3;
    else snakeLength += 1;
    clearTile(grid, headX, headY);
    foodEaten++;
    remaining--;
  }

  // If exit required, path to exit
  if (goal.type === 'reach-exit' || goal.type === 'eat-all-and-exit') {
    const exitPath = bfs(grid, headX, headY,
      (tile) => tile.type === ELEM.EXIT,
      isBlocked
    );
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
