// 16x16 pixel art sprites as 2D arrays of hex colour strings (null = transparent)

const _ = null;
const G = '#00ff41';   // neon green
const g = '#00cc33';   // dim green
const W = '#e8e8e8';   // white
const B = '#000000';   // black
const R = '#ff3333';   // red
const r = '#cc2222';   // dark red
const L = '#00cc33';   // leaf green
const l = '#009922';   // dark leaf
const Y = '#ffc800';   // gold
const y = '#cc9f00';   // dark gold
const GR = '#555568';  // grey (wall)
const gd = '#333344';  // dark grey (mortar)
const gb = '#666678';  // bright grey

// ---- WALL: Grey brick pattern with mortar lines ----
const WALL = [
  [gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd],
  [GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR],
  [GR, gb, GR, gd, GR, GR, gb, GR, GR, GR, gd, GR, GR, gb, GR, GR],
  [GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR],
  [GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR],
  [gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd],
  [GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, GR, gd, GR, GR],
  [GR, GR, GR, gb, GR, gd, GR, GR, gb, GR, GR, GR, GR, gd, GR, GR],
  [GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, GR, gd, GR, GR],
  [GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, GR, gd, GR, GR],
  [gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd],
  [GR, GR, gd, GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, gd],
  [GR, GR, gd, GR, gb, GR, GR, GR, gd, GR, GR, gb, GR, GR, GR, gd],
  [GR, GR, gd, GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, gd],
  [GR, GR, gd, GR, GR, GR, GR, GR, gd, GR, GR, GR, GR, GR, GR, gd],
  [gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd],
];

// ---- FOOD: Red apple with green leaf and white highlight ----
const FOOD = [
  [_, _, _, _, _, _, _, _, _, L, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, L, L, l, _, _, _, _, _],
  [_, _, _, _, _, _, _, '#884422', L, _, _, _, _, _, _, _],
  [_, _, _, _, _, R, R, R, R, R, R, _, _, _, _, _],
  [_, _, _, R, R, R, R, R, R, R, R, R, R, _, _, _],
  [_, _, R, R, W, W, R, R, R, R, R, R, R, R, _, _],
  [_, _, R, R, W, R, R, R, R, R, R, R, R, R, _, _],
  [_, R, R, R, R, R, R, R, R, R, R, R, R, R, R, _],
  [_, R, R, R, R, R, R, R, R, R, R, R, R, R, R, _],
  [_, R, R, R, R, R, R, R, R, R, R, R, R, R, R, _],
  [_, R, R, R, R, R, R, R, R, R, R, R, R, R, R, _],
  [_, _, R, R, R, R, R, R, R, R, R, R, R, R, _, _],
  [_, _, R, R, R, R, R, R, R, R, R, R, R, R, _, _],
  [_, _, _, R, R, R, R, R, R, R, R, R, R, _, _, _],
  [_, _, _, _, R, R, R, R, R, R, R, R, _, _, _, _],
  [_, _, _, _, _, _, R, R, R, R, _, _, _, _, _, _],
];

// ---- GOLDEN_FOOD: Gold apple with sparkle ----
const GOLDEN_FOOD = [
  [_, _, W, _, _, _, _, _, _, L, _, _, _, _, _, _],
  [_, W, _, _, _, _, _, _, L, L, l, _, _, _, _, _],
  [_, _, _, _, _, _, _, '#884422', L, _, _, _, _, _, _, _],
  [_, _, _, _, _, Y, Y, Y, Y, Y, Y, _, _, _, _, _],
  [_, _, _, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _, _, _],
  [_, _, Y, Y, W, W, Y, Y, Y, Y, Y, Y, Y, Y, _, _],
  [_, _, Y, Y, W, Y, Y, Y, Y, Y, Y, Y, Y, Y, _, _],
  [_, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _],
  [_, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _],
  [_, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _],
  [_, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _],
  [_, _, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _, _],
  [_, _, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _, _],
  [_, _, _, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, _, _, _],
  [_, _, _, _, Y, Y, y, Y, Y, y, Y, Y, _, _, _, _],
  [_, _, _, _, _, _, Y, Y, Y, Y, _, _, _, _, _, _],
];

// ---- SNAKE_HEAD facing UP: eyes at top ----
const SNAKE_HEAD_UP = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _],
  [_, G, G, G, W, W, G, G, G, G, W, W, G, G, G, _],
  [_, G, G, G, W, W, G, G, G, G, W, W, G, G, G, _],
  [_, G, G, G, B, W, G, G, G, G, B, W, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- SNAKE_HEAD facing DOWN: eyes at bottom ----
const SNAKE_HEAD_DOWN = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, W, W, G, G, G, G, W, W, G, G, G, _],
  [_, G, G, G, W, W, G, G, G, G, W, W, G, G, G, _],
  [_, _, G, G, W, B, G, G, G, G, W, B, G, G, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- SNAKE_HEAD facing LEFT: eyes on left side ----
const SNAKE_HEAD_LEFT = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, W, W, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, W, W, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, W, B, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, W, W, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, W, W, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, W, B, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- SNAKE_HEAD facing RIGHT: eyes on right side ----
const SNAKE_HEAD_RIGHT = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, W, W, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, W, W, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, B, W, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, G, G, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, W, W, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, W, W, G, _],
  [_, G, G, G, G, G, G, G, G, G, G, G, B, W, G, _],
  [_, _, G, G, G, G, G, G, G, G, G, G, G, G, _, _],
  [_, _, _, G, G, G, G, G, G, G, G, G, G, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- SNAKE_BODY: 12x12 centered neon green square ----
const SNAKE_BODY = (() => {
  const s = [];
  for (let y = 0; y < 16; y++) {
    const row = [];
    for (let x = 0; x < 16; x++) {
      if (x >= 2 && x <= 13 && y >= 2 && y <= 13) {
        row.push(G);
      } else {
        row.push(_);
      }
    }
    s.push(row);
  }
  return s;
})();

// ---- SNAKE_BODY_ALT: 12x12 centered darker green square ----
const SNAKE_BODY_ALT = (() => {
  const s = [];
  for (let y = 0; y < 16; y++) {
    const row = [];
    for (let x = 0; x < 16; x++) {
      if (x >= 2 && x <= 13 && y >= 2 && y <= 13) {
        row.push(g);
      } else {
        row.push(_);
      }
    }
    s.push(row);
  }
  return s;
})();

// ---- SNAKE_TAIL: Directional tapering shapes ----
// TAIL_UP: wide at bottom (connection), narrow at top (tip)
const SNAKE_TAIL_UP = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(_));
  // Row by row, tapering from wide (bottom) to narrow (top)
  // Bottom rows (connection side): 10px wide centered (cols 3-12)
  for (let r = 13; r >= 12; r--) for (let c = 3; c <= 12; c++) s[r][c] = G;
  for (let r = 11; r >= 10; r--) for (let c = 3; c <= 12; c++) s[r][c] = G;
  // Middle rows: 8px wide
  for (let r = 9; r >= 8; r--) for (let c = 4; c <= 11; c++) s[r][c] = G;
  // Narrowing
  for (let r = 7; r >= 6; r--) for (let c = 5; c <= 10; c++) s[r][c] = G;
  // Narrow
  for (let r = 5; r >= 4; r--) for (let c = 6; c <= 9; c++) s[r][c] = G;
  // Tip
  for (let c = 7; c <= 8; c++) s[3][c] = G;
  return s;
})();

// TAIL_DOWN: wide at top (connection), narrow at bottom (tip)
const SNAKE_TAIL_DOWN = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(_));
  for (let r = 2; r <= 3; r++) for (let c = 3; c <= 12; c++) s[r][c] = G;
  for (let r = 4; r <= 5; r++) for (let c = 3; c <= 12; c++) s[r][c] = G;
  for (let r = 6; r <= 7; r++) for (let c = 4; c <= 11; c++) s[r][c] = G;
  for (let r = 8; r <= 9; r++) for (let c = 5; c <= 10; c++) s[r][c] = G;
  for (let r = 10; r <= 11; r++) for (let c = 6; c <= 9; c++) s[r][c] = G;
  for (let c = 7; c <= 8; c++) s[12][c] = G;
  return s;
})();

// TAIL_LEFT: wide at right (connection), narrow at left (tip)
const SNAKE_TAIL_LEFT = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(_));
  for (let c = 12; c >= 11; c--) for (let r = 3; r <= 12; r++) s[r][c] = G;
  for (let c = 10; c >= 9; c--) for (let r = 3; r <= 12; r++) s[r][c] = G;
  for (let c = 8; c >= 7; c--) for (let r = 4; r <= 11; r++) s[r][c] = G;
  for (let c = 6; c >= 5; c--) for (let r = 5; r <= 10; r++) s[r][c] = G;
  for (let c = 4; c >= 3; c--) for (let r = 6; r <= 9; r++) s[r][c] = G;
  for (let r = 7; r <= 8; r++) s[r][2] = G;
  return s;
})();

// TAIL_RIGHT: wide at left (connection), narrow at right (tip)
const SNAKE_TAIL_RIGHT = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(_));
  for (let c = 3; c <= 4; c++) for (let r = 3; r <= 12; r++) s[r][c] = G;
  for (let c = 5; c <= 6; c++) for (let r = 3; r <= 12; r++) s[r][c] = G;
  for (let c = 7; c <= 8; c++) for (let r = 4; r <= 11; r++) s[r][c] = G;
  for (let c = 9; c <= 10; c++) for (let r = 5; r <= 10; r++) s[r][c] = G;
  for (let c = 11; c <= 12; c++) for (let r = 6; r <= 9; r++) s[r][c] = G;
  for (let r = 7; r <= 8; r++) s[r][13] = G;
  return s;
})();

// ---- EXIT_INACTIVE: Grey archway outline ----
const EXIT_INACTIVE = [
  [_, _, _, _, GR, GR, GR, GR, GR, GR, GR, GR, _, _, _, _],
  [_, _, _, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, _, _, _],
  [_, _, GR, GR, gd, gd, gd, gd, gd, gd, gd, gd, GR, GR, _, _],
  [_, _, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _, _],
  [_, GR, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, gd, GR, _],
  [_, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, _],
  [_, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, _],
];

// ---- EXIT_ACTIVE: Green glowing archway ----
const ga = '#114411'; // dark green fill for active exit interior
const EXIT_ACTIVE = [
  [_, _, _, _, G,  G,  G,  G,  G,  G,  G,  G,  _, _, _, _],
  [_, _, _, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  _, _, _],
  [_, _, G,  G,  ga, ga, ga, ga, ga, ga, ga, ga, G,  G,  _, _],
  [_, _, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _, _],
  [_, G,  G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  G,  _],
  [_, G,  ga, ga, ga, g,  g,  ga, ga, g,  g,  ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, ga, G,  _],
  [_, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  _],
  [_, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  _],
];

export const SPRITES = {
  WALL,
  FOOD,
  GOLDEN_FOOD,
  SNAKE_HEAD_UP,
  SNAKE_HEAD_DOWN,
  SNAKE_HEAD_LEFT,
  SNAKE_HEAD_RIGHT,
  SNAKE_BODY,
  SNAKE_BODY_ALT,
  SNAKE_TAIL_UP,
  SNAKE_TAIL_DOWN,
  SNAKE_TAIL_LEFT,
  SNAKE_TAIL_RIGHT,
  EXIT_INACTIVE,
  EXIT_ACTIVE,
};
