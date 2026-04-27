import { ELEM } from './config.js';
import { createGrid, setTile } from './grid.js';

// ---------------------------------------------------------------------------
// World 1 — Green Meadow
// ---------------------------------------------------------------------------

export const LEVELS = [
  // -----------------------------------------------------------------------
  // Level 1 — First Steps
  // -----------------------------------------------------------------------
  {
    id: 1,
    name: 'First Steps',
    world: 1,
    worldName: 'Green Meadow',
    width: 15,
    height: 20,
    snake: { x: 7, y: 15, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 10, y: 15 },
      { type: ELEM.FOOD, x: 10, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 6 },
    ],
    walls: [],
    speed: 1,
    starTargets: { time: 30, fastTime: 15 },
    warpEdges: false,
    description: 'Wide open field. Eat 3 apples.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 2 — Garden Walls
  // -----------------------------------------------------------------------
  {
    id: 2,
    name: 'Garden Walls',
    world: 1,
    worldName: 'Green Meadow',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 5 },
      { type: ELEM.FOOD, x: 11, y: 5 },
      { type: ELEM.FOOD, x: 3, y: 14 },
      { type: ELEM.FOOD, x: 11, y: 14 },
      { type: ELEM.FOOD, x: 7, y: 10 },
    ],
    walls: [
      // Horizontal wall y=8, x 5..9
      { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 },
      // Horizontal wall y=12, x 5..9
      { x: 5, y: 12 }, { x: 6, y: 12 }, { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 9, y: 12 },
    ],
    speed: 1,
    starTargets: { time: 45, fastTime: 25 },
    warpEdges: false,
    description: 'Navigate around the garden walls to collect all apples.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 3 — Find the Door
  // -----------------------------------------------------------------------
  {
    id: 3,
    name: 'Find the Door',
    world: 1,
    worldName: 'Green Meadow',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 4, y: 10 },
      { type: ELEM.FOOD, x: 10, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 5 },
      { type: ELEM.EXIT, x: 7, y: 2 },
    ],
    walls: [],
    speed: 1,
    starTargets: { time: 35, fastTime: 18 },
    warpEdges: false,
    description: 'Eat all the food, then reach the exit door at the top.',
    newMechanic: {
      name: 'Exit Door',
      description: 'Eat all food to activate the door, then enter it to complete the level',
    },
  },

  // -----------------------------------------------------------------------
  // Level 4 — Growing Pains
  // -----------------------------------------------------------------------
  {
    id: 4,
    name: 'Growing Pains',
    world: 1,
    worldName: 'Green Meadow',
    width: 15,
    height: 20,
    snake: { x: 2, y: 18, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 2, y: 14 },
      { type: ELEM.FOOD, x: 2, y: 10 },
      { type: ELEM.FOOD, x: 2, y: 6 },
      { type: ELEM.FOOD, x: 7, y: 4 },
      { type: ELEM.FOOD, x: 12, y: 4 },
      { type: ELEM.FOOD, x: 12, y: 8 },
      { type: ELEM.FOOD, x: 12, y: 12 },
      { type: ELEM.FOOD, x: 12, y: 16 },
    ],
    walls: [
      // Vertical wall x=5, y 3..17
      ...range(3, 17).map(y => ({ x: 5, y })),
      // Vertical wall x=9, y 3..17
      ...range(3, 17).map(y => ({ x: 9, y })),
    ],
    speed: 1,
    starTargets: { time: 60, fastTime: 35 },
    warpEdges: false,
    description: 'Follow the U-shaped path to collect all apples.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 5 — Golden Prize
  // -----------------------------------------------------------------------
  {
    id: 5,
    name: 'Golden Prize',
    world: 1,
    worldName: 'Green Meadow',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 12 },
      { type: ELEM.FOOD, x: 11, y: 12 },
      { type: ELEM.FOOD, x: 3, y: 6 },
      { type: ELEM.FOOD, x: 11, y: 6 },
      { type: ELEM.GOLDEN_FOOD, x: 7, y: 3 },
      { type: ELEM.EXIT, x: 7, y: 18 },
    ],
    walls: [
      // Alcove around golden apple at (7,3) — walls on left, right, and top
      { x: 6, y: 2 }, { x: 8, y: 2 },
      { x: 6, y: 3 }, { x: 8, y: 3 },
      { x: 6, y: 4 }, { x: 8, y: 4 },
    ],
    speed: 1,
    starTargets: { time: 50, fastTime: 30 },
    warpEdges: false,
    description: 'Collect all apples including the golden one, then find the exit.',
    newMechanic: {
      name: 'Golden Apple',
      description: 'Worth 3 segments and bonus score — but makes you longer!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 6 — The Maze Begins
  // -----------------------------------------------------------------------
  {
    id: 6,
    name: 'The Maze Begins',
    world: 1,
    worldName: 'Green Meadow',
    width: 15,
    height: 20,
    snake: { x: 1, y: 18, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 2, y: 3 },
      { type: ELEM.FOOD, x: 7, y: 3 },
      { type: ELEM.FOOD, x: 12, y: 3 },
      { type: ELEM.FOOD, x: 2, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 17 },
      { type: ELEM.FOOD, x: 12, y: 10 },
    ],
    walls: [
      // Vertical wall x=4, y 1..14 with gap at y=10 for passage
      ...range(1, 9).map(y => ({ x: 4, y })),
      ...range(11, 14).map(y => ({ x: 4, y })),
      // Vertical wall x=10, y 6..18 with gap at y=10 for passage
      ...range(6, 9).map(y => ({ x: 10, y })),
      ...range(11, 18).map(y => ({ x: 10, y })),
      // Horizontal wall y=6, x 1..8 with gap at x=2 for passage
      ...range(3, 8).map(x => ({ x, y: 6 })),
      // Horizontal wall y=14, x 6..13 with gap at x=10 (already walled above, gap at x=8)
      ...range(6, 7).map(x => ({ x, y: 14 })),
      ...range(9, 9).map(x => ({ x, y: 14 })),
      ...range(11, 13).map(x => ({ x, y: 14 })),
    ],
    speed: 1,
    starTargets: { time: 60, fastTime: 35 },
    warpEdges: false,
    description: 'Your first maze! Find all the apples hidden in the corridors.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 7 — No Rush
  // -----------------------------------------------------------------------
  {
    id: 7,
    name: 'No Rush',
    world: 1,
    worldName: 'Green Meadow',
    width: 15,
    height: 20,
    snake: { x: 7, y: 17, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 4 },
      { type: ELEM.FOOD, x: 11, y: 4 },
      { type: ELEM.FOOD, x: 7, y: 6 },
      { type: ELEM.FOOD, x: 2, y: 10 },
      { type: ELEM.FOOD, x: 12, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 10 },
      { type: ELEM.FOOD, x: 4, y: 14 },
      { type: ELEM.FOOD, x: 10, y: 14 },
      { type: ELEM.FOOD, x: 7, y: 16 },
      { type: ELEM.FOOD, x: 7, y: 2 },
      { type: ELEM.EXIT, x: 1, y: 1 },
    ],
    walls: [
      // 2x2 block at (4,8)
      { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 9 }, { x: 5, y: 9 },
      // 2x2 block at (10,8)
      { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 9 }, { x: 11, y: 9 },
      // 2x2 block at (7,12)
      { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 7, y: 13 }, { x: 8, y: 13 },
    ],
    speed: 1,
    starTargets: { time: 90, fastTime: 55 },
    warpEdges: false,
    description: 'Lots of apples to eat. Take your time and plan your route.',
    newMechanic: null,
  },
];

// ---------------------------------------------------------------------------
// Helper — inclusive integer range
// ---------------------------------------------------------------------------

function range(from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) arr.push(i);
  return arr;
}

// ---------------------------------------------------------------------------
// loadLevel — builds a ready-to-play grid from a level definition
// ---------------------------------------------------------------------------

export function loadLevel(levelId) {
  const def = LEVELS.find(l => l.id === levelId);
  if (!def) throw new Error(`Level ${levelId} not found`);

  const { width, height } = def;
  const grid = createGrid(width, height);

  // --- Boundary walls (respecting warpEdges) ---
  const warp = def.warpEdges || {};

  // Top edge (y=0)
  if (!warp.top) {
    for (let x = 0; x < width; x++) setTile(grid, x, 0, ELEM.WALL);
  }
  // Bottom edge (y=height-1)
  if (!warp.bottom) {
    for (let x = 0; x < width; x++) setTile(grid, x, height - 1, ELEM.WALL);
  }
  // Left edge (x=0)
  if (!warp.left) {
    for (let y = 0; y < height; y++) setTile(grid, 0, y, ELEM.WALL);
  }
  // Right edge (x=width-1)
  if (!warp.right) {
    for (let x = width - 1, y = 0; y < height; y++) setTile(grid, x, y, ELEM.WALL);
  }

  // --- Interior walls ---
  for (const w of def.walls) {
    setTile(grid, w.x, w.y, ELEM.WALL);
  }

  // --- Elements (food, exits, portals, etc.) ---
  for (const el of def.elements) {
    setTile(grid, el.x, el.y, el.type, el.data || null);
  }

  return {
    grid,
    snakeStart: {
      x: def.snake.x,
      y: def.snake.y,
      dir: def.snake.dir,
      length: def.snake.length,
    },
    goal: def.goal,
    speed: def.speed,
    starTargets: def.starTargets,
    meta: {
      id: def.id,
      name: def.name,
      world: def.world,
      worldName: def.worldName,
      description: def.description,
      newMechanic: def.newMechanic,
    },
  };
}
