import { ELEM } from './config.js';

/** Create a blank tile */
function emptyTile() {
  return { type: ELEM.EMPTY, data: null };
}

/** Create a 2D grid (y outer, x inner) filled with EMPTY tiles */
export function createGrid(w, h) {
  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      row.push(emptyTile());
    }
    grid.push(row);
  }
  return grid;
}

/** Bounds-safe tile accessor — returns null if out of bounds */
export function getTile(grid, x, y) {
  if (!inBounds(grid, x, y)) return null;
  return grid[y][x];
}

/** Set tile type and optional data */
export function setTile(grid, x, y, type, data = null) {
  if (!inBounds(grid, x, y)) return;
  grid[y][x].type = type;
  grid[y][x].data = data;
}

/** Reset tile to EMPTY */
export function clearTile(grid, x, y) {
  if (!inBounds(grid, x, y)) return;
  grid[y][x].type = ELEM.EMPTY;
  grid[y][x].data = null;
}

/** Check whether (x, y) is within grid dimensions */
export function inBounds(grid, x, y) {
  if (grid.length === 0) return false;
  return x >= 0 && y >= 0 && y < grid.length && x < grid[0].length;
}

/** Find all tiles matching a given type — returns [{x, y, data}, ...] */
export function findTiles(grid, type) {
  const results = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x].type === type) {
        results.push({ x, y, data: grid[y][x].data });
      }
    }
  }
  return results;
}

/** Grid width (number of columns) */
export function gridWidth(grid) {
  return grid[0].length;
}

/** Grid height (number of rows) */
export function gridHeight(grid) {
  return grid.length;
}

/** Deep clone a grid for simulator / lookahead use */
export function cloneGrid(grid) {
  return grid.map(row =>
    row.map(tile => ({
      type: tile.type,
      data: tile.data ? { ...tile.data } : null,
    }))
  );
}
