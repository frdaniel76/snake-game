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

  // =======================================================================
  // World 2 — Ancient Temple (Levels 8-14)
  // =======================================================================

  // -----------------------------------------------------------------------
  // Level 8 — Portal 101
  // -----------------------------------------------------------------------
  {
    id: 8,
    name: 'Portal 101',
    world: 2,
    worldName: 'Ancient Temple',
    width: 15,
    height: 20,
    snake: { x: 3, y: 15, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      // Left side apples
      { type: ELEM.FOOD, x: 3, y: 5 },
      { type: ELEM.FOOD, x: 3, y: 10 },
      // Right side apples
      { type: ELEM.FOOD, x: 11, y: 5 },
      // Portal pair — blue
      { type: ELEM.PORTAL, x: 6, y: 10, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 8, y: 10, data: { color: 'blue', pairId: 'p1' } },
    ],
    walls: [
      // Vertical divider wall x=7, y 1..18
      ...range(1, 18).map(y => ({ x: 7, y })),
    ],
    speed: 1,
    starTargets: { time: 40, fastTime: 20 },
    warpEdges: false,
    description: 'A wall splits the temple. Use the portals to cross between sides.',
    newMechanic: {
      name: 'Portal',
      description: 'Enter one portal and exit the other — your body follows through!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 9 — Lock and Key
  // -----------------------------------------------------------------------
  {
    id: 9,
    name: 'Lock and Key',
    world: 2,
    worldName: 'Ancient Temple',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 4, y: 10 },
      { type: ELEM.FOOD, x: 10, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 6 },
      { type: ELEM.KEY, x: 3, y: 14, data: { color: 'red' } },
      { type: ELEM.GATE, x: 7, y: 3, data: { color: 'red' } },
      { type: ELEM.EXIT, x: 7, y: 2 },
    ],
    walls: [
      // Horizontal wall blocking exit area, gap at x=7 (blocked by gate)
      ...range(1, 6).map(x => ({ x, y: 3 })),
      ...range(8, 13).map(x => ({ x, y: 3 })),
    ],
    speed: 1,
    starTargets: { time: 45, fastTime: 25 },
    warpEdges: false,
    description: 'Find the red key to open the red gate and reach the exit.',
    newMechanic: {
      name: 'Key & Gate',
      description: 'Collect a key to dissolve all gates of the same colour!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 10 — Portal Run
  // -----------------------------------------------------------------------
  {
    id: 10,
    name: 'Portal Run',
    world: 2,
    worldName: 'Ancient Temple',
    width: 15,
    height: 20,
    snake: { x: 3, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      // Room 1 (left) apples
      { type: ELEM.FOOD, x: 2, y: 4 },
      { type: ELEM.FOOD, x: 2, y: 14 },
      // Room 2 (right) apples
      { type: ELEM.FOOD, x: 12, y: 4 },
      { type: ELEM.FOOD, x: 12, y: 14 },
      // Room 3 (bottom-centre) apples
      { type: ELEM.FOOD, x: 7, y: 17 },
      { type: ELEM.FOOD, x: 7, y: 15 },
      // Blue portal pair — connects room 1 to room 2
      { type: ELEM.PORTAL, x: 4, y: 9, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 10, y: 9, data: { color: 'blue', pairId: 'p1' } },
      // Orange portal pair — connects room 2 to room 3
      { type: ELEM.PORTAL, x: 12, y: 17, data: { color: 'orange', pairId: 'p2' } },
      { type: ELEM.PORTAL, x: 7, y: 12, data: { color: 'orange', pairId: 'p2' } },
    ],
    walls: [
      // Vertical wall x=5, y 1..18 (divides left room from centre)
      ...range(1, 18).map(y => ({ x: 5, y })),
      // Vertical wall x=9, y 1..18 (divides centre from right room)
      ...range(1, 18).map(y => ({ x: 9, y })),
      // Horizontal wall y=11, x 6..8 (separates upper centre from room 3)
      { x: 6, y: 11 }, { x: 7, y: 11 }, { x: 8, y: 11 },
    ],
    speed: 1,
    starTargets: { time: 60, fastTime: 35 },
    warpEdges: false,
    description: 'Three sealed rooms connected only by portals. Collect all apples.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 11 — Crack the Wall
  // -----------------------------------------------------------------------
  {
    id: 11,
    name: 'Crack the Wall',
    world: 2,
    worldName: 'Ancient Temple',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // Apples before the breakable section — grow to afford breaking
      { type: ELEM.FOOD, x: 4, y: 14 },
      { type: ELEM.FOOD, x: 10, y: 14 },
      { type: ELEM.FOOD, x: 7, y: 12 },
      { type: ELEM.FOOD, x: 4, y: 10 },
      { type: ELEM.FOOD, x: 10, y: 10 },
      // Breakable walls blocking path to exit
      { type: ELEM.BREAKABLE, x: 7, y: 6 },
      { type: ELEM.BREAKABLE, x: 7, y: 5 },
      { type: ELEM.BREAKABLE, x: 7, y: 4 },
      // Exit behind breakable walls
      { type: ELEM.EXIT, x: 7, y: 2 },
    ],
    walls: [
      // Horizontal wall y=7, gap only at x=7 (blocked by breakable)
      ...range(1, 6).map(x => ({ x, y: 7 })),
      ...range(8, 13).map(x => ({ x, y: 7 })),
      // Side walls from y=1..6 to seal off exit area
      ...range(1, 6).map(y => ({ x: 4, y })),
      ...range(1, 6).map(y => ({ x: 10, y })),
    ],
    speed: 1,
    starTargets: { time: 50, fastTime: 30 },
    warpEdges: false,
    description: 'Cracked walls block the exit. Eat apples to grow, then break through!',
    newMechanic: {
      name: 'Breakable Wall',
      description: 'Break through cracked walls — but each one costs 1 segment!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 12 — Temple Chambers
  // -----------------------------------------------------------------------
  {
    id: 12,
    name: 'Temple Chambers',
    world: 2,
    worldName: 'Ancient Temple',
    width: 20,
    height: 25,
    snake: { x: 3, y: 22, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // Apples spread across rooms
      { type: ELEM.FOOD, x: 3, y: 18 },
      { type: ELEM.FOOD, x: 10, y: 18 },
      { type: ELEM.FOOD, x: 16, y: 18 },
      { type: ELEM.FOOD, x: 3, y: 6 },
      { type: ELEM.FOOD, x: 10, y: 6 },
      { type: ELEM.FOOD, x: 16, y: 6 },
      { type: ELEM.FOOD, x: 10, y: 12 },
      { type: ELEM.FOOD, x: 16, y: 12 },
      // Portal pair — connects bottom-left to top-right
      { type: ELEM.PORTAL, x: 3, y: 12, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 16, y: 3, data: { color: 'blue', pairId: 'p1' } },
      // Blue key in top-left room
      { type: ELEM.KEY, x: 3, y: 3, data: { color: 'blue' } },
      // Blue gate blocking exit
      { type: ELEM.GATE, x: 10, y: 3, data: { color: 'blue' } },
      // Exit behind gate
      { type: ELEM.EXIT, x: 10, y: 2 },
    ],
    walls: [
      // Horizontal wall y=15, with passage at x=10
      ...range(1, 9).map(x => ({ x, y: 15 })),
      ...range(11, 18).map(x => ({ x, y: 15 })),
      // Horizontal wall y=9, with passage at x=5 and x=14
      ...range(1, 4).map(x => ({ x, y: 9 })),
      ...range(6, 13).map(x => ({ x, y: 9 })),
      ...range(15, 18).map(x => ({ x, y: 9 })),
      // Vertical wall x=7, y 10..14 (gap at y=12 for passage)
      ...range(10, 11).map(y => ({ x: 7, y })),
      ...range(13, 14).map(y => ({ x: 7, y })),
      // Vertical wall x=13, y 10..14 (gap at y=12 for passage)
      ...range(10, 11).map(y => ({ x: 13, y })),
      ...range(13, 14).map(y => ({ x: 13, y })),
    ],
    speed: 1,
    starTargets: { time: 90, fastTime: 55 },
    warpEdges: false,
    description: 'A sprawling temple. Use portals and the key to reach the exit.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 13 — One Way Only
  // -----------------------------------------------------------------------
  {
    id: 13,
    name: 'One Way Only',
    world: 2,
    worldName: 'Ancient Temple',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 12, y: 14 },
      { type: ELEM.FOOD, x: 12, y: 5 },
      { type: ELEM.FOOD, x: 2, y: 5 },
      { type: ELEM.FOOD, x: 2, y: 14 },
      { type: ELEM.FOOD, x: 7, y: 10 },
      // One-way gates creating clockwise flow
      { type: ELEM.ONE_WAY, x: 10, y: 16, data: { dir: 'RIGHT' } },
      { type: ELEM.ONE_WAY, x: 12, y: 8, data: { dir: 'UP' } },
      { type: ELEM.ONE_WAY, x: 4, y: 3, data: { dir: 'LEFT' } },
      { type: ELEM.ONE_WAY, x: 2, y: 11, data: { dir: 'DOWN' } },
    ],
    walls: [
      // Inner ring walls creating a clockwise corridor
      // Top horizontal wall y=3, x 5..10
      ...range(5, 10).map(x => ({ x, y: 3 })),
      // Bottom horizontal wall y=16, x 4..9
      ...range(4, 9).map(x => ({ x, y: 16 })),
      // Left vertical wall x=4, y 4..10
      ...range(4, 10).map(y => ({ x: 4, y })),
      // Right vertical wall x=10, y 9..15
      ...range(9, 15).map(y => ({ x: 10, y })),
    ],
    speed: 1,
    starTargets: { time: 50, fastTime: 30 },
    warpEdges: false,
    description: 'One-way gates force a clockwise route. Plan your path carefully!',
    newMechanic: {
      name: 'One-Way Gate',
      description: 'Can only be passed in the arrow\'s direction — no turning back!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 14 — Temple Gauntlet
  // -----------------------------------------------------------------------
  {
    id: 14,
    name: 'Temple Gauntlet',
    world: 2,
    worldName: 'Ancient Temple',
    width: 20,
    height: 25,
    snake: { x: 3, y: 22, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // Apples
      { type: ELEM.FOOD, x: 3, y: 18 },
      { type: ELEM.FOOD, x: 16, y: 18 },
      { type: ELEM.FOOD, x: 3, y: 10 },
      { type: ELEM.FOOD, x: 16, y: 10 },
      { type: ELEM.FOOD, x: 10, y: 14 },
      { type: ELEM.FOOD, x: 10, y: 7 },
      { type: ELEM.FOOD, x: 5, y: 4 },
      { type: ELEM.FOOD, x: 14, y: 4 },
      // Golden apple in risky alcove
      { type: ELEM.GOLDEN_FOOD, x: 16, y: 2 },
      // Red key behind one-way gate
      { type: ELEM.KEY, x: 3, y: 4, data: { color: 'red' } },
      // Red gate blocking exit
      { type: ELEM.GATE, x: 10, y: 2, data: { color: 'red' } },
      // One-way gates
      { type: ELEM.ONE_WAY, x: 5, y: 7, data: { dir: 'UP' } },
      { type: ELEM.ONE_WAY, x: 14, y: 14, data: { dir: 'DOWN' } },
      // Breakable wall shortcuts
      { type: ELEM.BREAKABLE, x: 10, y: 10 },
      { type: ELEM.BREAKABLE, x: 10, y: 18 },
      // Portal pair
      { type: ELEM.PORTAL, x: 3, y: 14, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 16, y: 6, data: { color: 'blue', pairId: 'p1' } },
      // Exit
      { type: ELEM.EXIT, x: 10, y: 1 },
    ],
    walls: [
      // Horizontal divider y=12, passage at x=10 (breakable above)
      ...range(1, 9).map(x => ({ x, y: 12 })),
      ...range(11, 18).map(x => ({ x, y: 12 })),
      // Horizontal divider y=6, passages at x=5 (one-way) and x=14 (open)
      ...range(1, 4).map(x => ({ x, y: 6 })),
      ...range(6, 13).map(x => ({ x, y: 6 })),
      ...range(15, 18).map(x => ({ x, y: 6 })),
      // Vertical wall x=8, y 13..23 (gap at y=18 for passage)
      ...range(13, 17).map(y => ({ x: 8, y })),
      ...range(19, 23).map(y => ({ x: 8, y })),
      // Vertical wall x=12, y 13..23 (gap at y=18 for passage)
      ...range(13, 17).map(y => ({ x: 12, y })),
      ...range(19, 23).map(y => ({ x: 12, y })),
      // Alcove walls around golden apple at (16,2)
      { x: 15, y: 1 }, { x: 15, y: 3 }, { x: 17, y: 1 }, { x: 17, y: 3 },
    ],
    speed: 1,
    starTargets: { time: 120, fastTime: 75 },
    warpEdges: false,
    description: 'The ultimate temple challenge. Keys, portals, breakable walls — survive them all!',
    newMechanic: null,
  },

  // =======================================================================
  // World 3 — Ice Cavern (Levels 15-21)
  // =======================================================================

  // -----------------------------------------------------------------------
  // Level 15 — Slippery Slope
  // -----------------------------------------------------------------------
  {
    id: 15,
    name: 'Slippery Slope',
    world: 3,
    worldName: 'Ice Cavern',
    width: 15,
    height: 20,
    snake: { x: 2, y: 16, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      // Apples on far side of ice
      { type: ELEM.FOOD, x: 12, y: 5 },
      { type: ELEM.FOOD, x: 12, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 3 },
      // Large ice patch in centre
      ...range(4, 10).flatMap(x =>
        range(6, 14).map(y => ({ type: ELEM.ICE, x, y }))
      ),
    ],
    walls: [
      // Walls to catch slides safely
      { x: 3, y: 5 }, { x: 3, y: 6 },
      { x: 11, y: 14 }, { x: 11, y: 15 },
    ],
    speed: 1,
    starTargets: { time: 50, fastTime: 30 },
    warpEdges: false,
    description: 'Ice makes you slide! Enter the ice patch at the right angle.',
    newMechanic: {
      name: 'Ice Patch',
      description: 'You slide on ice and cannot turn until you reach normal ground!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 16 — Ice Corridors
  // -----------------------------------------------------------------------
  {
    id: 16,
    name: 'Ice Corridors',
    world: 3,
    worldName: 'Ice Cavern',
    width: 15,
    height: 20,
    snake: { x: 2, y: 17, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 7, y: 15 },
      { type: ELEM.FOOD, x: 12, y: 11 },
      { type: ELEM.FOOD, x: 2, y: 7 },
      { type: ELEM.FOOD, x: 7, y: 3 },
      { type: ELEM.FOOD, x: 12, y: 7 },
      { type: ELEM.FOOD, x: 2, y: 11 },
      // Ice patches in corridors
      ...range(3, 11).map(x => ({ type: ELEM.ICE, x, y: 13 })),
      ...range(3, 11).map(x => ({ type: ELEM.ICE, x, y: 9 })),
      ...range(3, 11).map(x => ({ type: ELEM.ICE, x, y: 5 })),
      // One-way gates forcing route
      { type: ELEM.ONE_WAY, x: 12, y: 13, data: { dir: 'RIGHT' } },
      { type: ELEM.ONE_WAY, x: 2, y: 9, data: { dir: 'LEFT' } },
    ],
    walls: [
      // Horizontal walls creating corridors
      ...range(1, 13).map(x => ({ x, y: 11 })),
      ...range(1, 13).map(x => ({ x, y: 7 })),
      // Gaps — clear x=2 and x=12 in the horizontal walls for vertical passages
      // Remove walls at passage points
    ].filter(w => !((w.x === 2 || w.x === 12) && (w.y === 11 || w.y === 7))),
    speed: 1,
    starTargets: { time: 60, fastTime: 35 },
    warpEdges: false,
    description: 'Icy corridors and one-way gates. Plan your direction before sliding!',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 17 — Speed Boost
  // -----------------------------------------------------------------------
  {
    id: 17,
    name: 'Speed Boost',
    world: 3,
    worldName: 'Ice Cavern',
    width: 15,
    height: 20,
    snake: { x: 7, y: 17, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 2, y: 14 },
      { type: ELEM.FOOD, x: 12, y: 14 },
      { type: ELEM.FOOD, x: 2, y: 8 },
      { type: ELEM.FOOD, x: 12, y: 8 },
      { type: ELEM.FOOD, x: 7, y: 4 },
      // Speed pads in corridors
      { type: ELEM.SPEED_PAD, x: 7, y: 14 },
      { type: ELEM.SPEED_PAD, x: 7, y: 10 },
      { type: ELEM.SPEED_PAD, x: 7, y: 6 },
      // Exit at the top
      { type: ELEM.EXIT, x: 7, y: 2 },
    ],
    walls: [
      // Vertical walls creating long corridors
      ...range(3, 18).map(y => ({ x: 5, y })),
      ...range(3, 18).map(y => ({ x: 9, y })),
      // Horizontal gaps at y=12, y=8 for crossing
      // Remove walls at passage heights
    ].filter(w => !(w.y === 12 || w.y === 8)),
    speed: 1,
    starTargets: { time: 45, fastTime: 25 },
    warpEdges: false,
    description: 'Speed pads make you zoom! Enjoy the rush through the corridors.',
    newMechanic: {
      name: 'Speed Pad',
      description: 'Temporarily boosts your speed — exciting but watch out for walls!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 18 — Take It Slow
  // -----------------------------------------------------------------------
  {
    id: 18,
    name: 'Take It Slow',
    world: 3,
    worldName: 'Ice Cavern',
    width: 15,
    height: 20,
    snake: { x: 2, y: 17, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 4, y: 15 },
      { type: ELEM.FOOD, x: 10, y: 13 },
      { type: ELEM.FOOD, x: 4, y: 9 },
      { type: ELEM.FOOD, x: 10, y: 7 },
      { type: ELEM.FOOD, x: 4, y: 3 },
      { type: ELEM.FOOD, x: 10, y: 3 },
      // Slow pads before tight turns
      { type: ELEM.SLOW_PAD, x: 4, y: 13 },
      { type: ELEM.SLOW_PAD, x: 10, y: 9 },
      { type: ELEM.SLOW_PAD, x: 4, y: 5 },
    ],
    walls: [
      // Tight zigzag maze (gap at x=5 in y=11 for passage)
      ...range(1, 4).map(x => ({ x, y: 11 })),
      ...range(6, 8).map(x => ({ x, y: 11 })),
      ...range(6, 13).map(x => ({ x, y: 5 })),
      ...range(6, 13).map(x => ({ x, y: 15 })),
      // Vertical barriers
      ...range(12, 14).map(y => ({ x: 8, y })),
      ...range(6, 8).map(y => ({ x: 6, y })),
      ...range(16, 18).map(y => ({ x: 6, y })),
    ],
    speed: 1,
    starTargets: { time: 55, fastTime: 32 },
    warpEdges: false,
    description: 'Tight turns ahead! Slow pads give you time to navigate safely.',
    newMechanic: {
      name: 'Slow Pad',
      description: 'Temporarily slows you down — helpful before tricky sections!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 19 — Ice and Fire
  // -----------------------------------------------------------------------
  {
    id: 19,
    name: 'Ice and Fire',
    world: 3,
    worldName: 'Ice Cavern',
    width: 20,
    height: 20,
    snake: { x: 10, y: 17, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      // Apples in each zone
      { type: ELEM.FOOD, x: 3, y: 4 },
      { type: ELEM.FOOD, x: 3, y: 8 },
      { type: ELEM.FOOD, x: 10, y: 4 },
      { type: ELEM.FOOD, x: 10, y: 8 },
      { type: ELEM.FOOD, x: 16, y: 4 },
      { type: ELEM.FOOD, x: 16, y: 8 },
      { type: ELEM.FOOD, x: 10, y: 14 },
      { type: ELEM.FOOD, x: 5, y: 14 },
      // Ice zone (left)
      ...range(1, 6).flatMap(x =>
        range(2, 9).map(y => ({ type: ELEM.ICE, x, y }))
      ),
      // Speed zone (right)
      { type: ELEM.SPEED_PAD, x: 14, y: 5 },
      { type: ELEM.SPEED_PAD, x: 16, y: 7 },
      // Slow zone (bottom)
      { type: ELEM.SLOW_PAD, x: 5, y: 15 },
      { type: ELEM.SLOW_PAD, x: 10, y: 15 },
    ],
    walls: [
      // Vertical divider x=7, y 1..10
      ...range(1, 10).map(y => ({ x: 7, y })),
      // Vertical divider x=13, y 1..10
      ...range(1, 10).map(y => ({ x: 13, y })),
      // Horizontal divider y=11, x 1..18 with gaps at x=5, x=10, x=15
      ...range(1, 4).map(x => ({ x, y: 11 })),
      ...range(6, 9).map(x => ({ x, y: 11 })),
      ...range(11, 14).map(x => ({ x, y: 11 })),
      ...range(16, 18).map(x => ({ x, y: 11 })),
    ],
    speed: 1,
    starTargets: { time: 70, fastTime: 40 },
    warpEdges: false,
    description: 'Three zones: ice, speed, and slow. Master each to collect all apples.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 20 — Frozen Temple
  // -----------------------------------------------------------------------
  {
    id: 20,
    name: 'Frozen Temple',
    world: 3,
    worldName: 'Ice Cavern',
    width: 20,
    height: 25,
    snake: { x: 3, y: 22, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // Apples
      { type: ELEM.FOOD, x: 3, y: 18 },
      { type: ELEM.FOOD, x: 16, y: 18 },
      { type: ELEM.FOOD, x: 10, y: 14 },
      { type: ELEM.FOOD, x: 3, y: 10 },
      { type: ELEM.FOOD, x: 16, y: 10 },
      { type: ELEM.FOOD, x: 10, y: 6 },
      { type: ELEM.FOOD, x: 5, y: 4 },
      // Ice guarding the key
      ...range(14, 18).flatMap(x =>
        range(3, 7).map(y => ({ type: ELEM.ICE, x, y }))
      ),
      // Blue key on ice
      { type: ELEM.KEY, x: 16, y: 5, data: { color: 'blue' } },
      // Blue gate blocking exit
      { type: ELEM.GATE, x: 10, y: 2, data: { color: 'blue' } },
      // Portal pair
      { type: ELEM.PORTAL, x: 3, y: 14, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 16, y: 14, data: { color: 'blue', pairId: 'p1' } },
      // Breakable walls — alternative route
      { type: ELEM.BREAKABLE, x: 10, y: 10 },
      { type: ELEM.BREAKABLE, x: 10, y: 16 },
      // Exit
      { type: ELEM.EXIT, x: 10, y: 1 },
    ],
    walls: [
      // Horizontal wall y=16, gap at x=10 (breakable)
      ...range(1, 9).map(x => ({ x, y: 16 })),
      ...range(11, 18).map(x => ({ x, y: 16 })),
      // Horizontal wall y=8, gap at x=10
      ...range(1, 9).map(x => ({ x, y: 8 })),
      ...range(11, 18).map(x => ({ x, y: 8 })),
      // Vertical wall x=7, y 9..15 (gap at y=12 for passage)
      ...range(9, 11).map(y => ({ x: 7, y })),
      ...range(13, 15).map(y => ({ x: 7, y })),
      // Vertical wall x=13, y 9..15 (gap at y=12 for passage)
      ...range(9, 11).map(y => ({ x: 13, y })),
      ...range(13, 15).map(y => ({ x: 13, y })),
    ],
    speed: 1,
    starTargets: { time: 100, fastTime: 60 },
    warpEdges: false,
    description: 'Ice guards the key. Use portals and breakable walls to navigate this frozen temple.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 21 — Crystal Breather
  // -----------------------------------------------------------------------
  {
    id: 21,
    name: 'Crystal Breather',
    world: 3,
    worldName: 'Ice Cavern',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 12 },
      { type: ELEM.FOOD, x: 11, y: 12 },
      { type: ELEM.FOOD, x: 3, y: 6 },
      { type: ELEM.FOOD, x: 11, y: 6 },
      { type: ELEM.GOLDEN_FOOD, x: 7, y: 3 },
      // Slow pads before corners
      { type: ELEM.SLOW_PAD, x: 7, y: 9 },
      { type: ELEM.SLOW_PAD, x: 7, y: 14 },
    ],
    walls: [
      // A few gentle obstacles
      { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 },
      { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 },
    ],
    speed: 1,
    starTargets: { time: 50, fastTime: 28 },
    warpEdges: false,
    description: 'Relax and enjoy. A calm level to catch your breath.',
    newMechanic: null,
  },

  // =======================================================================
  // World 4 — Shadow Forest (Levels 22-28)
  // =======================================================================

  // -----------------------------------------------------------------------
  // Level 22 — The Patrol
  // -----------------------------------------------------------------------
  {
    id: 22,
    name: 'The Patrol',
    world: 4,
    worldName: 'Shadow Forest',
    width: 15,
    height: 20,
    snake: { x: 3, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 5 },
      { type: ELEM.FOOD, x: 11, y: 5 },
      { type: ELEM.FOOD, x: 3, y: 12 },
      { type: ELEM.FOOD, x: 11, y: 12 },
      // Single moving obstacle patrolling horizontally across the middle
      { type: ELEM.MOVING_OBS, x: 2, y: 9, data: {
        path: [
          { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 },
          { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 8, y: 9 }, { x: 9, y: 9 },
          { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 },
        ],
        speed: 4,
      }},
    ],
    walls: [],
    speed: 1,
    starTargets: { time: 45, fastTime: 25 },
    warpEdges: false,
    description: 'A patrol guards the middle. Time your crossing carefully!',
    newMechanic: {
      name: 'Moving Obstacle',
      description: 'Patrols a fixed path — touching it means instant death!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 23 — Shadow Maze
  // -----------------------------------------------------------------------
  {
    id: 23,
    name: 'Shadow Maze',
    world: 4,
    worldName: 'Shadow Forest',
    width: 15,
    height: 20,
    snake: { x: 2, y: 17, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 2, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 6 },
      { type: ELEM.FOOD, x: 12, y: 10 },
      { type: ELEM.FOOD, x: 7, y: 14 },
      { type: ELEM.FOOD, x: 4, y: 3 },
      { type: ELEM.FOOD, x: 10, y: 3 },
      // Moving obstacle 1 — horizontal patrol in upper corridor
      { type: ELEM.MOVING_OBS, x: 2, y: 6, data: {
        path: [
          { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        ],
        speed: 4,
      }},
      // Moving obstacle 2 — horizontal patrol in lower corridor
      { type: ELEM.MOVING_OBS, x: 9, y: 14, data: {
        path: [
          { x: 9, y: 14 }, { x: 10, y: 14 }, { x: 11, y: 14 }, { x: 12, y: 14 },
        ],
        speed: 5,
      }},
      // Exit
      { type: ELEM.EXIT, x: 7, y: 1 },
    ],
    walls: [
      // Maze walls
      ...range(1, 5).map(x => ({ x, y: 8 })),
      ...range(9, 13).map(x => ({ x, y: 8 })),
      ...range(1, 5).map(x => ({ x, y: 12 })),
      ...range(9, 13).map(x => ({ x, y: 12 })),
      // Vertical walls (gap at y=10 for passage)
      { x: 5, y: 9 }, { x: 5, y: 11 },
      { x: 9, y: 9 }, { x: 9, y: 11 },
      // Upper barrier with gap
      ...range(1, 6).map(x => ({ x, y: 4 })),
      ...range(8, 13).map(x => ({ x, y: 4 })),
    ],
    speed: 1,
    starTargets: { time: 60, fastTime: 35 },
    warpEdges: false,
    description: 'Two patrols guard the maze corridors. Time your movements!',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 24 — Forest Gauntlet
  // -----------------------------------------------------------------------
  {
    id: 24,
    name: 'Forest Gauntlet',
    world: 4,
    worldName: 'Shadow Forest',
    width: 20,
    height: 20,
    snake: { x: 2, y: 17, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 5, y: 15 },
      { type: ELEM.FOOD, x: 10, y: 12 },
      { type: ELEM.FOOD, x: 15, y: 9 },
      { type: ELEM.FOOD, x: 10, y: 6 },
      { type: ELEM.FOOD, x: 5, y: 3 },
      { type: ELEM.FOOD, x: 15, y: 3 },
      { type: ELEM.FOOD, x: 17, y: 15 },
      // Moving obstacles
      { type: ELEM.MOVING_OBS, x: 8, y: 12, data: {
        path: [
          { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 },
          { x: 12, y: 12 },
        ],
        speed: 3,
      }},
      { type: ELEM.MOVING_OBS, x: 8, y: 6, data: {
        path: [
          { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 },
          { x: 12, y: 6 },
        ],
        speed: 4,
      }},
      // One-way gates forcing forward route
      { type: ELEM.ONE_WAY, x: 7, y: 15, data: { dir: 'RIGHT' } },
      { type: ELEM.ONE_WAY, x: 13, y: 9, data: { dir: 'LEFT' } },
      { type: ELEM.ONE_WAY, x: 7, y: 3, data: { dir: 'RIGHT' } },
      // Speed pads for excitement
      { type: ELEM.SPEED_PAD, x: 10, y: 15 },
      { type: ELEM.SPEED_PAD, x: 10, y: 3 },
    ],
    walls: [
      // Horizontal walls creating gauntlet sections
      ...range(1, 6).map(x => ({ x, y: 9 })),
      ...range(14, 18).map(x => ({ x, y: 9 })),
      ...range(1, 18).map(x => ({ x, y: 18 })).filter(w => w.x !== 2 && w.x !== 3),
      // Vertical barriers (gaps for passage)
      ...range(10, 14).map(y => ({ x: 6, y })),
      ...range(16, 17).map(y => ({ x: 6, y })),
      ...range(1, 4).map(y => ({ x: 14, y })),
      ...range(6, 8).map(y => ({ x: 14, y })),
    ],
    speed: 1,
    starTargets: { time: 80, fastTime: 45 },
    warpEdges: false,
    description: 'No turning back! One-way gates and patrols make this a true gauntlet.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 25 — Race the Clock
  // -----------------------------------------------------------------------
  {
    id: 25,
    name: 'Race the Clock',
    world: 4,
    worldName: 'Shadow Forest',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      // Regular apples (easy pickups)
      { type: ELEM.FOOD, x: 3, y: 16 },
      { type: ELEM.FOOD, x: 11, y: 16 },
      // Timed food — generous 8-second timers
      { type: ELEM.TIMED_FOOD, x: 7, y: 10, data: { timeLeft: 8, maxTime: 8 } },
      { type: ELEM.TIMED_FOOD, x: 3, y: 5, data: { timeLeft: 8, maxTime: 8 } },
      { type: ELEM.TIMED_FOOD, x: 11, y: 5, data: { timeLeft: 8, maxTime: 8 } },
    ],
    walls: [],
    speed: 1,
    starTargets: { time: 40, fastTime: 22 },
    warpEdges: false,
    description: 'Timed apples vanish if you wait too long! Grab them quickly.',
    newMechanic: {
      name: 'Timed Food',
      description: 'Has a countdown timer — disappears if not eaten in time!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 26 — Ticking Forest
  // -----------------------------------------------------------------------
  {
    id: 26,
    name: 'Ticking Forest',
    world: 4,
    worldName: 'Shadow Forest',
    width: 20,
    height: 25,
    snake: { x: 3, y: 22, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      // Regular apples
      { type: ELEM.FOOD, x: 3, y: 18 },
      { type: ELEM.FOOD, x: 16, y: 18 },
      { type: ELEM.FOOD, x: 3, y: 10 },
      { type: ELEM.FOOD, x: 16, y: 10 },
      { type: ELEM.FOOD, x: 10, y: 5 },
      // Timed food behind patrol routes
      { type: ELEM.TIMED_FOOD, x: 10, y: 14, data: { timeLeft: 8, maxTime: 8 } },
      { type: ELEM.TIMED_FOOD, x: 10, y: 10, data: { timeLeft: 8, maxTime: 8 } },
      { type: ELEM.TIMED_FOOD, x: 10, y: 18, data: { timeLeft: 8, maxTime: 8 } },
      // Moving obstacles patrolling key corridors
      { type: ELEM.MOVING_OBS, x: 6, y: 14, data: {
        path: [
          { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 }, { x: 9, y: 14 },
          { x: 10, y: 14 }, { x: 11, y: 14 }, { x: 12, y: 14 }, { x: 13, y: 14 },
        ],
        speed: 4,
      }},
      { type: ELEM.MOVING_OBS, x: 6, y: 8, data: {
        path: [
          { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 },
          { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
        ],
        speed: 5,
      }},
      // Slow pads for help
      { type: ELEM.SLOW_PAD, x: 5, y: 14 },
      { type: ELEM.SLOW_PAD, x: 5, y: 8 },
    ],
    walls: [
      // Horizontal dividers
      ...range(1, 4).map(x => ({ x, y: 16 })),
      ...range(15, 18).map(x => ({ x, y: 16 })),
      ...range(1, 4).map(x => ({ x, y: 12 })),
      ...range(15, 18).map(x => ({ x, y: 12 })),
      ...range(1, 4).map(x => ({ x, y: 6 })),
      ...range(15, 18).map(x => ({ x, y: 6 })),
      // Vertical barriers (gaps at y=20 for passage)
      ...range(17, 19).map(y => ({ x: 5, y })),
      ...range(21, 23).map(y => ({ x: 5, y })),
      ...range(17, 19).map(y => ({ x: 14, y })),
      ...range(21, 23).map(y => ({ x: 14, y })),
    ],
    speed: 1,
    starTargets: { time: 90, fastTime: 55 },
    warpEdges: false,
    description: 'Timed food behind moving patrols. Slow pads help — use them wisely!',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 27 — Poison Garden
  // -----------------------------------------------------------------------
  {
    id: 27,
    name: 'Poison Garden',
    world: 4,
    worldName: 'Shadow Forest',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 14 },
      { type: ELEM.FOOD, x: 11, y: 14 },
      { type: ELEM.FOOD, x: 3, y: 8 },
      { type: ELEM.FOOD, x: 11, y: 8 },
      { type: ELEM.FOOD, x: 7, y: 5 },
      { type: ELEM.FOOD, x: 5, y: 11 },
      // Golden apple near poison — risky!
      { type: ELEM.GOLDEN_FOOD, x: 9, y: 11 },
      // Poison apples — must avoid
      { type: ELEM.POISON, x: 8, y: 11 },
      { type: ELEM.POISON, x: 7, y: 14 },
      // Exit
      { type: ELEM.EXIT, x: 7, y: 2 },
    ],
    walls: [
      // Light walls creating a garden layout
      { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 },
      { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 },
      { x: 5, y: 16 }, { x: 6, y: 16 }, { x: 8, y: 16 }, { x: 9, y: 16 },
    ],
    speed: 1,
    starTargets: { time: 55, fastTime: 32 },
    warpEdges: false,
    description: 'Poison apples lurk near the good ones. Be careful what you eat!',
    newMechanic: {
      name: 'Poison Apple',
      description: 'Shrinks your snake by 2 segments! Avoid at all costs.',
    },
  },

  // -----------------------------------------------------------------------
  // Level 28 — Shadow Realm
  // -----------------------------------------------------------------------
  {
    id: 28,
    name: 'Shadow Realm',
    world: 4,
    worldName: 'Shadow Forest',
    width: 25,
    height: 30,
    snake: { x: 3, y: 27, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // Apples
      { type: ELEM.FOOD, x: 5, y: 24 },
      { type: ELEM.FOOD, x: 19, y: 24 },
      { type: ELEM.FOOD, x: 5, y: 16 },
      { type: ELEM.FOOD, x: 19, y: 16 },
      { type: ELEM.FOOD, x: 12, y: 12 },
      { type: ELEM.FOOD, x: 5, y: 8 },
      { type: ELEM.FOOD, x: 19, y: 8 },
      { type: ELEM.FOOD, x: 12, y: 4 },
      // Timed food — creates urgency
      { type: ELEM.TIMED_FOOD, x: 12, y: 20, data: { timeLeft: 8, maxTime: 8 } },
      { type: ELEM.TIMED_FOOD, x: 12, y: 8, data: { timeLeft: 8, maxTime: 8 } },
      // Poison apples — punish carelessness
      { type: ELEM.POISON, x: 11, y: 12 },
      { type: ELEM.POISON, x: 13, y: 12 },
      // Moving obstacles
      { type: ELEM.MOVING_OBS, x: 8, y: 20, data: {
        path: [
          { x: 8, y: 20 }, { x: 9, y: 20 }, { x: 10, y: 20 },
          { x: 11, y: 20 }, { x: 12, y: 20 }, { x: 13, y: 20 },
          { x: 14, y: 20 }, { x: 15, y: 20 }, { x: 16, y: 20 },
        ],
        speed: 4,
      }},
      { type: ELEM.MOVING_OBS, x: 8, y: 12, data: {
        path: [
          { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 },
        ],
        speed: 5,
      }},
      { type: ELEM.MOVING_OBS, x: 14, y: 12, data: {
        path: [
          { x: 14, y: 12 }, { x: 15, y: 12 }, { x: 16, y: 12 },
        ],
        speed: 5,
      }},
      // Portal pair — connects bottom to key room
      { type: ELEM.PORTAL, x: 22, y: 24, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 22, y: 4, data: { color: 'blue', pairId: 'p1' } },
      // Red key in distant room
      { type: ELEM.KEY, x: 22, y: 8, data: { color: 'red' } },
      // Red gate blocking exit
      { type: ELEM.GATE, x: 12, y: 2, data: { color: 'red' } },
      // Exit
      { type: ELEM.EXIT, x: 12, y: 1 },
    ],
    walls: [
      // Horizontal dividers
      ...range(1, 6).map(x => ({ x, y: 22 })),
      ...range(18, 23).map(x => ({ x, y: 22 })),
      ...range(1, 6).map(x => ({ x, y: 14 })),
      ...range(18, 21).map(x => ({ x, y: 14 })),
      ...range(23, 23).map(x => ({ x, y: 14 })),
      ...range(1, 6).map(x => ({ x, y: 6 })),
      ...range(18, 21).map(x => ({ x, y: 6 })),
      ...range(23, 23).map(x => ({ x, y: 6 })),
      // Vertical walls separating rooms (gaps at y=10 and y=18 for passage)
      ...range(15, 17).map(y => ({ x: 7, y })),
      ...range(19, 21).map(y => ({ x: 7, y })),
      ...range(15, 17).map(y => ({ x: 17, y })),
      ...range(19, 21).map(y => ({ x: 17, y })),
      ...range(7, 9).map(y => ({ x: 7, y })),
      ...range(11, 13).map(y => ({ x: 7, y })),
      ...range(7, 9).map(y => ({ x: 17, y })),
      ...range(11, 13).map(y => ({ x: 17, y })),
      // Right room walls (gap at y=10 for passage to/from key room)
      ...range(7, 9).map(y => ({ x: 20, y })),
      ...range(11, 21).map(y => ({ x: 20, y })),
    ],
    speed: 1,
    starTargets: { time: 150, fastTime: 90 },
    warpEdges: false,
    description: 'The ultimate shadow challenge. Patrols, poison, portals, and a ticking clock!',
    newMechanic: null,
  },

  // =======================================================================
  // World 5 — Void Realm (Levels 29-35)
  // =======================================================================

  // -----------------------------------------------------------------------
  // Level 29 — Edge Walker
  // -----------------------------------------------------------------------
  {
    id: 29,
    name: 'Edge Walker',
    world: 5,
    worldName: 'Void Realm',
    width: 15,
    height: 20,
    snake: { x: 7, y: 10, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 1, y: 1 },
      { type: ELEM.FOOD, x: 13, y: 1 },
      { type: ELEM.FOOD, x: 1, y: 18 },
      { type: ELEM.FOOD, x: 13, y: 18 },
    ],
    walls: [],
    speed: 1,
    starTargets: { time: 35, fastTime: 18 },
    warpEdges: true,
    description: 'All edges wrap around! Walk off one side, appear on the other.',
    newMechanic: {
      name: 'Warp Edges',
      description: 'The board wraps — exit one edge and appear on the opposite side!',
    },
  },

  // -----------------------------------------------------------------------
  // Level 30 — Warp Maze
  // -----------------------------------------------------------------------
  {
    id: 30,
    name: 'Warp Maze',
    world: 5,
    worldName: 'Void Realm',
    width: 15,
    height: 20,
    snake: { x: 7, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      { type: ELEM.FOOD, x: 2, y: 14 },
      { type: ELEM.FOOD, x: 12, y: 14 },
      { type: ELEM.FOOD, x: 2, y: 8 },
      { type: ELEM.FOOD, x: 12, y: 8 },
      { type: ELEM.FOOD, x: 7, y: 4 },
      { type: ELEM.FOOD, x: 7, y: 11 },
      // Exit
      { type: ELEM.EXIT, x: 7, y: 2 },
    ],
    walls: [
      // Interior maze walls — some paths require wrapping left/right
      ...range(3, 11).map(x => ({ x, y: 6 })),
      ...range(3, 11).map(x => ({ x, y: 12 })),
      // Vertical barriers that force wrapping (gaps at y=9 for passage)
      ...range(7, 8).map(y => ({ x: 4, y })),
      ...range(10, 11).map(y => ({ x: 4, y })),
      ...range(7, 8).map(y => ({ x: 10, y })),
      ...range(10, 11).map(y => ({ x: 10, y })),
      ...range(13, 17).map(y => ({ x: 5, y })),
      ...range(13, 17).map(y => ({ x: 9, y })),
    ],
    speed: 1,
    starTargets: { time: 55, fastTime: 30 },
    warpEdges: { top: false, bottom: false, left: true, right: true },
    description: 'Left and right edges wrap! Use the warp to bypass maze walls.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 31 — Void Portals
  // -----------------------------------------------------------------------
  {
    id: 31,
    name: 'Void Portals',
    world: 5,
    worldName: 'Void Realm',
    width: 20,
    height: 20,
    snake: { x: 10, y: 16, dir: 'UP', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 3, y: 3 },
      { type: ELEM.FOOD, x: 16, y: 3 },
      { type: ELEM.FOOD, x: 3, y: 16 },
      { type: ELEM.FOOD, x: 16, y: 16 },
      { type: ELEM.FOOD, x: 10, y: 3 },
      { type: ELEM.FOOD, x: 10, y: 10 },
      { type: ELEM.FOOD, x: 3, y: 10 },
      // Portal pairs
      { type: ELEM.PORTAL, x: 5, y: 10, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 14, y: 10, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 10, y: 5, data: { color: 'orange', pairId: 'p2' } },
      { type: ELEM.PORTAL, x: 10, y: 14, data: { color: 'orange', pairId: 'p2' } },
      // Ice patches
      ...range(7, 13).flatMap(x =>
        range(7, 13).map(y => ({ type: ELEM.ICE, x, y }))
      ),
    ],
    walls: [
      // Cross-shaped walls in centre (around ice)
      ...range(7, 13).map(x => ({ x, y: 6 })),
      ...range(7, 13).map(x => ({ x, y: 14 })),
      ...range(7, 13).map(y => ({ x: 6, y })),
      ...range(7, 13).map(y => ({ x: 14, y })),
      // Gaps for portal access — remove walls at portal positions
    ].filter(w =>
      !(w.x === 5 && w.y === 10) && !(w.x === 14 && w.y === 10) &&
      !(w.x === 10 && w.y === 5) && !(w.x === 10 && w.y === 14) &&
      !(w.x === 6 && w.y === 10) && !(w.x === 14 && w.y === 10) &&
      !(w.x === 10 && w.y === 6) && !(w.x === 10 && w.y === 14)
    ),
    speed: 1,
    starTargets: { time: 70, fastTime: 40 },
    warpEdges: true,
    description: 'Warp edges, portals, and ice — a mind-bending spatial puzzle!',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 32 — The Vault
  // -----------------------------------------------------------------------
  {
    id: 32,
    name: 'The Vault',
    world: 5,
    worldName: 'Void Realm',
    width: 20,
    height: 25,
    snake: { x: 10, y: 22, dir: 'UP', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // Apples
      { type: ELEM.FOOD, x: 3, y: 20 },
      { type: ELEM.FOOD, x: 16, y: 20 },
      { type: ELEM.FOOD, x: 3, y: 12 },
      { type: ELEM.FOOD, x: 16, y: 12 },
      { type: ELEM.FOOD, x: 10, y: 8 },
      { type: ELEM.FOOD, x: 10, y: 16 },
      // Red key — unlocks path to blue key
      { type: ELEM.KEY, x: 3, y: 4, data: { color: 'red' } },
      { type: ELEM.GATE, x: 16, y: 6, data: { color: 'red' } },
      // Blue key behind red gate
      { type: ELEM.KEY, x: 16, y: 4, data: { color: 'blue' } },
      { type: ELEM.GATE, x: 10, y: 2, data: { color: 'blue' } },
      // Breakable walls — shortcuts
      { type: ELEM.BREAKABLE, x: 10, y: 12 },
      { type: ELEM.BREAKABLE, x: 10, y: 20 },
      { type: ELEM.BREAKABLE, x: 5, y: 8 },
      // One-way gates forcing commitment
      { type: ELEM.ONE_WAY, x: 7, y: 16, data: { dir: 'LEFT' } },
      { type: ELEM.ONE_WAY, x: 13, y: 16, data: { dir: 'RIGHT' } },
      { type: ELEM.ONE_WAY, x: 7, y: 8, data: { dir: 'UP' } },
      { type: ELEM.ONE_WAY, x: 13, y: 8, data: { dir: 'UP' } },
      // Exit
      { type: ELEM.EXIT, x: 10, y: 1 },
    ],
    walls: [
      // Horizontal dividers (gaps at x=5 and x=15 for side column access)
      ...range(1, 4).map(x => ({ x, y: 18 })),
      ...range(6, 9).map(x => ({ x, y: 18 })),
      ...range(11, 14).map(x => ({ x, y: 18 })),
      ...range(16, 18).map(x => ({ x, y: 18 })),
      ...range(1, 4).map(x => ({ x, y: 10 })),
      ...range(6, 9).map(x => ({ x, y: 10 })),
      ...range(11, 14).map(x => ({ x, y: 10 })),
      ...range(16, 18).map(x => ({ x, y: 10 })),
      ...range(1, 9).map(x => ({ x, y: 6 })),
      ...range(11, 15).map(x => ({ x, y: 6 })),
      ...range(17, 18).map(x => ({ x, y: 6 })),
      // Vertical barriers (gaps at y=16 for one-way gate passage)
      ...range(11, 15).map(y => ({ x: 6, y })),
      { x: 6, y: 17 },
      ...range(11, 15).map(y => ({ x: 14, y })),
      { x: 14, y: 17 },
    ],
    speed: 1,
    starTargets: { time: 110, fastTime: 65 },
    warpEdges: { top: true, bottom: true, left: false, right: false },
    description: 'A locked vault. Red key opens the path to blue key. Top and bottom edges warp!',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 33 — Gauntlet of Elements
  // -----------------------------------------------------------------------
  {
    id: 33,
    name: 'Gauntlet of Elements',
    world: 5,
    worldName: 'Void Realm',
    width: 25,
    height: 30,
    snake: { x: 3, y: 27, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // Zone 1 (bottom) — Ice zone apples
      { type: ELEM.FOOD, x: 12, y: 26 },
      { type: ELEM.FOOD, x: 20, y: 26 },
      // Zone 2 — Speed zone apples
      { type: ELEM.FOOD, x: 5, y: 20 },
      { type: ELEM.FOOD, x: 19, y: 20 },
      // Zone 3 — Obstacle zone apples
      { type: ELEM.FOOD, x: 12, y: 14 },
      { type: ELEM.FOOD, x: 5, y: 14 },
      // Zone 4 — Poison zone apples
      { type: ELEM.FOOD, x: 19, y: 8 },
      { type: ELEM.FOOD, x: 5, y: 8 },
      // Golden apple at hardest point
      { type: ELEM.GOLDEN_FOOD, x: 12, y: 4 },
      // Ice patches (zone 1)
      ...range(8, 16).flatMap(x =>
        range(24, 28).map(y => ({ type: ELEM.ICE, x, y }))
      ),
      // Speed pads (zone 2)
      { type: ELEM.SPEED_PAD, x: 8, y: 20 },
      { type: ELEM.SPEED_PAD, x: 16, y: 20 },
      // Slow pads (zone 2)
      { type: ELEM.SLOW_PAD, x: 12, y: 20 },
      // Moving obstacles (zone 3)
      { type: ELEM.MOVING_OBS, x: 8, y: 14, data: {
        path: [
          { x: 8, y: 14 }, { x: 9, y: 14 }, { x: 10, y: 14 },
          { x: 11, y: 14 }, { x: 12, y: 14 }, { x: 13, y: 14 },
          { x: 14, y: 14 }, { x: 15, y: 14 }, { x: 16, y: 14 },
        ],
        speed: 4,
      }},
      { type: ELEM.MOVING_OBS, x: 8, y: 12, data: {
        path: [
          { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 },
          { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 },
          { x: 14, y: 12 }, { x: 15, y: 12 }, { x: 16, y: 12 },
        ],
        speed: 5,
      }},
      // Poison apples (zone 4)
      { type: ELEM.POISON, x: 11, y: 8 },
      { type: ELEM.POISON, x: 13, y: 8 },
      // Portal — connects end back to revisit area
      { type: ELEM.PORTAL, x: 22, y: 4, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 3, y: 20, data: { color: 'blue', pairId: 'p1' } },
      // Exit
      { type: ELEM.EXIT, x: 12, y: 1 },
    ],
    walls: [
      // Zone dividers
      ...range(1, 23).map(x => ({ x, y: 22 })).filter(w => w.x !== 3 && w.x !== 20),
      ...range(1, 23).map(x => ({ x, y: 16 })).filter(w => w.x !== 5 && w.x !== 19),
      ...range(1, 23).map(x => ({ x, y: 10 })).filter(w => w.x !== 5 && w.x !== 19),
      ...range(1, 23).map(x => ({ x, y: 6 })).filter(w => w.x !== 12),
      // Side corridors
      ...range(23, 28).map(y => ({ x: 7, y })),
      ...range(23, 28).map(y => ({ x: 17, y })),
      ...range(17, 21).map(y => ({ x: 7, y })),
      ...range(17, 21).map(y => ({ x: 17, y })),
    ],
    speed: 1,
    starTargets: { time: 150, fastTime: 90 },
    warpEdges: false,
    description: 'A gauntlet of zones: ice, speed, obstacles, and poison. Survive them all!',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 34 — Cosmic Breather
  // -----------------------------------------------------------------------
  {
    id: 34,
    name: 'Cosmic Breather',
    world: 5,
    worldName: 'Void Realm',
    width: 15,
    height: 20,
    snake: { x: 7, y: 10, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all' },
    elements: [
      { type: ELEM.FOOD, x: 2, y: 3 },
      { type: ELEM.FOOD, x: 12, y: 3 },
      { type: ELEM.FOOD, x: 2, y: 16 },
      { type: ELEM.FOOD, x: 12, y: 16 },
      { type: ELEM.FOOD, x: 7, y: 10 },
      { type: ELEM.GOLDEN_FOOD, x: 7, y: 3 },
      // Slow pads for comfort
      { type: ELEM.SLOW_PAD, x: 5, y: 7 },
      { type: ELEM.SLOW_PAD, x: 9, y: 7 },
      { type: ELEM.SLOW_PAD, x: 7, y: 14 },
    ],
    walls: [
      // Light decorative walls
      { x: 5, y: 5 }, { x: 9, y: 5 },
      { x: 5, y: 15 }, { x: 9, y: 15 },
    ],
    speed: 1,
    starTargets: { time: 40, fastTime: 22 },
    warpEdges: true,
    description: 'A calm cosmic arena. Warp edges and slow pads. Enjoy the view.',
    newMechanic: null,
  },

  // -----------------------------------------------------------------------
  // Level 35 — The Final Feast
  // -----------------------------------------------------------------------
  {
    id: 35,
    name: 'The Final Feast',
    world: 5,
    worldName: 'Void Realm',
    width: 30,
    height: 40,
    snake: { x: 5, y: 37, dir: 'RIGHT', length: 3 },
    goal: { type: 'eat-all-and-exit' },
    elements: [
      // ---- Zone 1 (bottom, y 33-38): Green Meadow tribute — open area ----
      { type: ELEM.FOOD, x: 8, y: 36 },
      { type: ELEM.FOOD, x: 21, y: 36 },
      { type: ELEM.FOOD, x: 14, y: 34 },

      // ---- Zone 2 (y 25-32): Ancient Temple tribute — portals, keys ----
      { type: ELEM.FOOD, x: 5, y: 30 },
      { type: ELEM.FOOD, x: 24, y: 30 },
      { type: ELEM.FOOD, x: 14, y: 27 },
      // Red key and gate
      { type: ELEM.KEY, x: 5, y: 27, data: { color: 'red' } },
      { type: ELEM.GATE, x: 14, y: 24, data: { color: 'red' } },
      // Portal pair (blue) — connects zone 2 to zone 4
      { type: ELEM.PORTAL, x: 26, y: 30, data: { color: 'blue', pairId: 'p1' } },
      { type: ELEM.PORTAL, x: 26, y: 14, data: { color: 'blue', pairId: 'p1' } },
      // Breakable walls
      { type: ELEM.BREAKABLE, x: 14, y: 30 },
      { type: ELEM.BREAKABLE, x: 10, y: 27 },
      // One-way gates
      { type: ELEM.ONE_WAY, x: 8, y: 27, data: { dir: 'RIGHT' } },
      { type: ELEM.ONE_WAY, x: 20, y: 27, data: { dir: 'LEFT' } },

      // ---- Zone 3 (y 17-24): Ice Cavern tribute — ice, speed, slow ----
      { type: ELEM.FOOD, x: 5, y: 22 },
      { type: ELEM.FOOD, x: 24, y: 22 },
      { type: ELEM.FOOD, x: 14, y: 19 },
      // Ice patches
      ...range(8, 21).flatMap(x =>
        range(19, 22).map(y => ({ type: ELEM.ICE, x, y }))
      ),
      // Speed and slow pads
      { type: ELEM.SPEED_PAD, x: 7, y: 22 },
      { type: ELEM.SLOW_PAD, x: 22, y: 22 },
      // One-way gates
      { type: ELEM.ONE_WAY, x: 5, y: 19, data: { dir: 'UP' } },
      { type: ELEM.ONE_WAY, x: 24, y: 19, data: { dir: 'UP' } },
      // Breakable walls
      { type: ELEM.BREAKABLE, x: 14, y: 17, },
      { type: ELEM.BREAKABLE, x: 15, y: 17, },

      // ---- Zone 4 (y 9-16): Shadow Forest tribute — moving obs, poison, timed ----
      { type: ELEM.FOOD, x: 5, y: 14 },
      { type: ELEM.FOOD, x: 24, y: 14 },
      { type: ELEM.FOOD, x: 14, y: 11 },
      // Moving obstacles
      { type: ELEM.MOVING_OBS, x: 8, y: 14, data: {
        path: [
          { x: 8, y: 14 }, { x: 9, y: 14 }, { x: 10, y: 14 },
          { x: 11, y: 14 }, { x: 12, y: 14 }, { x: 13, y: 14 },
        ],
        speed: 4,
      }},
      { type: ELEM.MOVING_OBS, x: 16, y: 14, data: {
        path: [
          { x: 16, y: 14 }, { x: 17, y: 14 }, { x: 18, y: 14 },
          { x: 19, y: 14 }, { x: 20, y: 14 }, { x: 21, y: 14 },
        ],
        speed: 4,
      }},
      { type: ELEM.MOVING_OBS, x: 10, y: 11, data: {
        path: [
          { x: 10, y: 11 }, { x: 11, y: 11 }, { x: 12, y: 11 },
          { x: 13, y: 11 }, { x: 14, y: 11 }, { x: 15, y: 11 },
          { x: 16, y: 11 }, { x: 17, y: 11 }, { x: 18, y: 11 },
          { x: 19, y: 11 },
        ],
        speed: 5,
      }},
      // Poison apples
      { type: ELEM.POISON, x: 13, y: 14 },
      { type: ELEM.POISON, x: 15, y: 11 },
      { type: ELEM.POISON, x: 6, y: 11 },
      // Timed food — urgency in final stretch
      { type: ELEM.TIMED_FOOD, x: 10, y: 14, data: { timeLeft: 8, maxTime: 8 } },
      { type: ELEM.TIMED_FOOD, x: 19, y: 11, data: { timeLeft: 8, maxTime: 8 } },
      { type: ELEM.TIMED_FOOD, x: 14, y: 6, data: { timeLeft: 8, maxTime: 8 } },
      // Slow pad before tricky section
      { type: ELEM.SLOW_PAD, x: 7, y: 14 },

      // ---- Zone 5 (y 1-8): Void Realm finale — warp + exit ----
      // Yellow key and gate
      { type: ELEM.KEY, x: 24, y: 6, data: { color: 'yellow' } },
      { type: ELEM.GATE, x: 14, y: 2, data: { color: 'yellow' } },
      // Portal pair (orange) — connects zone 4 to zone 5
      { type: ELEM.PORTAL, x: 3, y: 14, data: { color: 'orange', pairId: 'p2' } },
      { type: ELEM.PORTAL, x: 3, y: 6, data: { color: 'orange', pairId: 'p2' } },
      // Golden apple
      { type: ELEM.GOLDEN_FOOD, x: 14, y: 4 },
      // One-way gates
      { type: ELEM.ONE_WAY, x: 8, y: 6, data: { dir: 'RIGHT' } },
      { type: ELEM.ONE_WAY, x: 20, y: 6, data: { dir: 'LEFT' } },
      // Speed pad
      { type: ELEM.SPEED_PAD, x: 14, y: 8 },
      // Exit
      { type: ELEM.EXIT, x: 14, y: 1 },
    ],
    walls: [
      // Zone dividers (horizontal) with gaps
      // y=32: divides zone 1 and 2
      ...range(1, 28).map(x => ({ x, y: 32 })).filter(w => w.x !== 5 && w.x !== 14 && w.x !== 24),
      // y=24: divides zone 2 and 3 (gap at x=14 blocked by red gate)
      ...range(1, 13).map(x => ({ x, y: 24 })),
      ...range(15, 28).map(x => ({ x, y: 24 })),
      // y=16: divides zone 3 and 4 (gaps at x=5, x=24, and x=14-15 breakable)
      ...range(1, 4).map(x => ({ x, y: 16 })),
      ...range(6, 13).map(x => ({ x, y: 16 })),
      ...range(16, 23).map(x => ({ x, y: 16 })),
      ...range(25, 28).map(x => ({ x, y: 16 })),
      // y=8: divides zone 4 and 5
      ...range(1, 28).map(x => ({ x, y: 8 })).filter(w => w.x !== 3 && w.x !== 14),
      // Interior walls within zones
      // Zone 2 vertical barriers
      ...range(25, 31).map(y => ({ x: 10, y })),
      ...range(25, 31).map(y => ({ x: 18, y })),
      // Zone 3 side walls
      ...range(17, 23).map(y => ({ x: 7, y })).filter(w => w.y !== 19 && w.y !== 22),
      ...range(17, 23).map(y => ({ x: 22, y })).filter(w => w.y !== 19 && w.y !== 22),
      // Zone 4 internal structure
      ...range(9, 15).map(y => ({ x: 7, y })).filter(w => w.y !== 14),
      ...range(9, 15).map(y => ({ x: 22, y })).filter(w => w.y !== 14),
      // Zone 5 walls
      ...range(1, 7).map(y => ({ x: 7, y })).filter(w => w.y !== 6),
      ...range(1, 7).map(y => ({ x: 22, y })).filter(w => w.y !== 6),
    ],
    speed: 1,
    starTargets: { time: 240, fastTime: 150 },
    warpEdges: { top: false, bottom: false, left: true, right: true },
    description: 'The ultimate challenge! Every mechanic, five zones, one epic feast. Good luck!',
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
    warpEdges: def.warpEdges || false,
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
