// Tile and rendering
export const TILE = 16;
export const BOARD_W = 15;
export const BOARD_H = 20;
export const BASE_TICK_MS = 180;

// Speed modifiers
export const SPEED_BOOST_MULT = 0.6;
export const SLOW_MULT = 1.4;
export const SPEED_EFFECT_DURATION = 3000;

// Lives
export const LIVES_START = 3;
export const LIVES_MAX = 5;

// Scoring
export const SCORE_FOOD = 10;
export const SCORE_GOLDEN = 50;

// Growth
export const GROW_FOOD = 1;
export const GROW_GOLDEN = 3;
export const SHRINK_POISON = 2;
export const BREAK_WALL_COST = 1;

// Colours
export const COLORS = {
  VOID: '#0f0e17',
  NAVY: '#1a1a2e',
  GREEN: '#00ff41',
  GREEN_DIM: '#00cc33',
  GREEN_BRIGHT: '#33ff66',
  BLUE: '#00d4ff',
  GOLD: '#ffc800',
  RED: '#ff3333',
  WHITE: '#e8e8e8',
  GREY: '#555568',
  GREY_LIGHT: '#888899',
  PURPLE: '#9933ff',
  ICE: '#7fdbda',
  ORANGE: '#ff8800',
  COSMIC: '#9d4edd',
  // World theme colours
  WORLD_1: '#2d5a27',
  WORLD_2: '#c4a35a',
  WORLD_3: '#7fdbda',
  WORLD_4: '#6b3fa0',
  WORLD_5: '#9d4edd',
  WORLD_6: '#2196f3',
  WORLD_7: '#ff5722',
  WORLD_8: '#607d8b',
  WORLD_9: '#e91e63',
  WORLD_10: '#ffd700',
};

// Directions
export const DIR = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

// Element types
export const ELEM = {
  EMPTY: 0,
  WALL: 1,
  FOOD: 2,
  GOLDEN_FOOD: 3,
  EXIT: 4,
  PORTAL: 5,
  KEY: 6,
  GATE: 7,
  BREAKABLE: 8,
  ONE_WAY: 9,
  ICE: 10,
  SPEED_PAD: 11,
  SLOW_PAD: 12,
  POISON: 13,
  MOVING_OBS: 14,
  TIMED_FOOD: 15,
  WARP_EDGE: 16,
  HEART: 17,
};
