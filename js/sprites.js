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

// ---- PORTAL_BLUE: Blue swirl pattern ----
const BL = '#0088ff';
const bl = '#0055aa';
const bd = '#003366';
const PORTAL_BLUE = [
  [_, _, _, _, _, bd, bd, bd, bd, bd, bd, _, _, _, _, _],
  [_, _, _, bd, BL, BL, BL, BL, BL, BL, BL, bd, _, _, _, _],
  [_, _, bd, BL, BL, bl, bl, bl, BL, BL, BL, BL, bd, _, _, _],
  [_, bd, BL, bl, bl, bd, bd, bl, bl, BL, BL, BL, BL, bd, _, _],
  [_, BL, BL, bl, bd, bd, _, bd, bl, bl, BL, BL, BL, BL, _, _],
  [bd, BL, bl, bd, bd, _, _, _, bd, bl, BL, BL, BL, BL, bd, _],
  [bd, BL, bl, bd, _, _, _, _, _, bd, bl, BL, BL, BL, bd, _],
  [bd, BL, bl, bd, _, _, _, _, _, _, bd, bl, BL, BL, bd, _],
  [bd, BL, BL, bl, bd, _, _, _, _, _, bd, bl, BL, bd, bd, _],
  [bd, BL, BL, BL, bd, _, _, _, _, bd, bd, bl, BL, bd, _, _],
  [_, BL, BL, BL, bl, bd, _, _, bd, bd, bl, bl, BL, bd, _, _],
  [_, bd, BL, BL, BL, bl, bd, bd, bl, bl, BL, BL, bd, _, _, _],
  [_, _, bd, BL, BL, BL, bl, bl, BL, BL, BL, bd, _, _, _, _],
  [_, _, _, bd, BL, BL, BL, BL, BL, BL, bd, _, _, _, _, _],
  [_, _, _, _, bd, bd, bd, bd, bd, bd, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- PORTAL_ORANGE: Orange swirl pattern ----
const OG = '#ff8800';
const og = '#cc6600';
const od = '#884400';
const PORTAL_ORANGE = [
  [_, _, _, _, _, od, od, od, od, od, od, _, _, _, _, _],
  [_, _, _, od, OG, OG, OG, OG, OG, OG, OG, od, _, _, _, _],
  [_, _, od, OG, OG, og, og, og, OG, OG, OG, OG, od, _, _, _],
  [_, od, OG, og, og, od, od, og, og, OG, OG, OG, OG, od, _, _],
  [_, OG, OG, og, od, od, _, od, og, og, OG, OG, OG, OG, _, _],
  [od, OG, og, od, od, _, _, _, od, og, OG, OG, OG, OG, od, _],
  [od, OG, og, od, _, _, _, _, _, od, og, OG, OG, OG, od, _],
  [od, OG, og, od, _, _, _, _, _, _, od, og, OG, OG, od, _],
  [od, OG, OG, og, od, _, _, _, _, _, od, og, OG, od, od, _],
  [od, OG, OG, OG, od, _, _, _, _, od, od, og, OG, od, _, _],
  [_, OG, OG, OG, og, od, _, _, od, od, og, og, OG, od, _, _],
  [_, od, OG, OG, OG, og, od, od, og, og, OG, OG, od, _, _, _],
  [_, _, od, OG, OG, OG, og, og, OG, OG, OG, od, _, _, _, _],
  [_, _, _, od, OG, OG, OG, OG, OG, OG, od, _, _, _, _, _],
  [_, _, _, _, od, od, od, od, od, od, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- KEY_RED: Red key shape ----
const kr = '#ff3333';
const kd = '#cc2222';
const KEY_RED = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, kr, kr, kr, kr, kr, _, _, _, _, _, _],
  [_, _, _, _, kr, kr, kr, kr, kr, kr, kr, _, _, _, _, _],
  [_, _, _, kr, kr, _, _, _, _, _, kr, kr, _, _, _, _],
  [_, _, _, kr, _, _, _, _, _, _, _, kr, _, _, _, _],
  [_, _, _, kr, kr, _, _, _, _, _, kr, kr, _, _, _, _],
  [_, _, _, _, kr, kr, kr, kr, kr, kr, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, kr, kr, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, kr, kr, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kr, kr, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- KEY_BLUE: Blue key shape ----
const kb = '#0088ff';
const KEY_BLUE = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, kb, kb, kb, kb, kb, _, _, _, _, _, _],
  [_, _, _, _, kb, kb, kb, kb, kb, kb, kb, _, _, _, _, _],
  [_, _, _, kb, kb, _, _, _, _, _, kb, kb, _, _, _, _],
  [_, _, _, kb, _, _, _, _, _, _, _, kb, _, _, _, _],
  [_, _, _, kb, kb, _, _, _, _, _, kb, kb, _, _, _, _],
  [_, _, _, _, kb, kb, kb, kb, kb, kb, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, kb, kb, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, kb, kb, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, kb, kb, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ---- GATE_RED: Red lattice gate ----
const gr2 = '#ff3333';
const grd = '#991111';
const GATE_RED = [
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
  [gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd, gr2, grd],
  [grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _, grd, _],
];

// ---- GATE_BLUE: Blue lattice gate ----
const gb2 = '#0088ff';
const gbd = '#004488';
const GATE_BLUE = [
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
  [gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd, gb2, gbd],
  [gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _, gbd, _],
];

// ---- BREAKABLE: Cracked stone wall ----
const st = '#888899';
const sd = '#555568';
const sc = '#333344';
const sw = '#aaaabb';
const BREAKABLE = [
  [sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd],
  [st, st, st, sd, st, st, st, st, st, st, sd, st, st, st, st, st],
  [st, sw, st, sd, st, st, sw, st, sc, st, sd, st, st, sw, st, st],
  [st, st, sc, sd, st, st, st, st, sc, st, sd, st, st, st, st, st],
  [st, st, sc, sc, sc, st, st, st, sc, st, sd, st, st, st, st, st],
  [sd, sd, sd, sd, sd, sd, sc, sd, sd, sd, sd, sd, sd, sd, sd, sd],
  [st, st, st, st, st, sd, sc, st, st, st, st, st, st, sd, st, st],
  [st, st, st, sw, st, sd, sc, sc, sw, st, st, st, st, sd, st, st],
  [st, st, st, st, st, sd, st, sc, sc, st, st, st, st, sd, st, st],
  [st, st, st, st, st, sd, st, st, sc, sc, st, st, st, sd, st, st],
  [sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd],
  [st, st, sd, st, st, st, st, st, sd, st, st, sc, st, st, st, sd],
  [st, st, sd, st, sw, st, st, st, sd, st, sc, sc, sw, st, st, sd],
  [st, st, sd, st, st, st, st, st, sd, st, st, sc, st, st, st, sd],
  [st, st, sd, st, st, st, st, st, sd, st, st, st, st, st, st, sd],
  [sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd, sd],
];

// ---- ONE_WAY arrows: Arrow tiles indicating passable direction ----
const aw = '#44aa44'; // arrow green
const af = '#1a3a1a'; // arrow floor dark
const ONE_WAY_UP = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(af));
  // Draw up arrow
  for (let c = 7; c <= 8; c++) s[3][c] = aw;
  for (let c = 6; c <= 9; c++) s[4][c] = aw;
  for (let c = 5; c <= 10; c++) s[5][c] = aw;
  for (let c = 4; c <= 11; c++) s[6][c] = aw;
  for (let c = 7; c <= 8; c++) { s[7][c] = aw; s[8][c] = aw; s[9][c] = aw; s[10][c] = aw; s[11][c] = aw; s[12][c] = aw; }
  return s;
})();

const ONE_WAY_DOWN = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(af));
  for (let c = 7; c <= 8; c++) { s[3][c] = aw; s[4][c] = aw; s[5][c] = aw; s[6][c] = aw; s[7][c] = aw; s[8][c] = aw; }
  for (let c = 4; c <= 11; c++) s[9][c] = aw;
  for (let c = 5; c <= 10; c++) s[10][c] = aw;
  for (let c = 6; c <= 9; c++) s[11][c] = aw;
  for (let c = 7; c <= 8; c++) s[12][c] = aw;
  return s;
})();

const ONE_WAY_LEFT = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(af));
  for (let r = 7; r <= 8; r++) { s[r][3] = aw; s[r][12] = aw; }
  for (let r = 6; r <= 9; r++) s[r][4] = aw;
  for (let r = 5; r <= 10; r++) s[r][5] = aw;
  for (let r = 4; r <= 11; r++) s[r][6] = aw;
  for (let r = 7; r <= 8; r++) { s[r][7] = aw; s[r][8] = aw; s[r][9] = aw; s[r][10] = aw; s[r][11] = aw; }
  return s;
})();

const ONE_WAY_RIGHT = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(af));
  for (let r = 7; r <= 8; r++) { s[r][3] = aw; s[r][4] = aw; s[r][5] = aw; s[r][6] = aw; s[r][7] = aw; s[r][8] = aw; }
  for (let r = 4; r <= 11; r++) s[r][9] = aw;
  for (let r = 5; r <= 10; r++) s[r][10] = aw;
  for (let r = 6; r <= 9; r++) s[r][11] = aw;
  for (let r = 7; r <= 8; r++) s[r][12] = aw;
  return s;
})();

// ---- ICE: Cyan tile with shine ----
const ic = '#7fdbda';
const id = '#5fb8b7';
const iw = '#b0f0ef';
const ICE = [
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, iw, iw, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, iw, iw, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, id, id, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, id, id, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, iw, iw, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, iw, iw, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, id, id, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, id, id, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
  [ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic, ic],
];

// ---- SPEED_PAD: Orange tile with >> chevrons ----
const OP = '#ff8800'; // orange primary
const op2 = '#cc6600'; // orange dark
const of2 = '#332200'; // orange floor
const SPEED_PAD = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(of2));
  // Fill background with subtle orange
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) s[y][x] = of2;
  // Draw >> chevrons
  // First >
  s[3][3] = OP; s[4][4] = OP; s[5][5] = OP; s[6][6] = OP; s[7][7] = OP;
  s[8][7] = OP; s[9][6] = OP; s[10][5] = OP; s[11][4] = OP; s[12][3] = OP;
  s[3][4] = op2; s[4][5] = op2; s[5][6] = op2; s[6][7] = op2;
  s[9][7] = op2; s[10][6] = op2; s[11][5] = op2; s[12][4] = op2;
  // Second >
  s[3][8] = OP; s[4][9] = OP; s[5][10] = OP; s[6][11] = OP; s[7][12] = OP;
  s[8][12] = OP; s[9][11] = OP; s[10][10] = OP; s[11][9] = OP; s[12][8] = OP;
  s[3][9] = op2; s[4][10] = op2; s[5][11] = op2; s[6][12] = op2;
  s[9][12] = op2; s[10][11] = op2; s[11][10] = op2; s[12][9] = op2;
  return s;
})();

// ---- SLOW_PAD: Blue tile with << chevrons ----
const SP = '#0088ff'; // blue primary
const sp2 = '#0055aa'; // blue dark
const sf2 = '#001133'; // blue floor
const SLOW_PAD = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(sf2));
  // Draw << chevrons
  // First <
  s[3][12] = SP; s[4][11] = SP; s[5][10] = SP; s[6][9] = SP; s[7][8] = SP;
  s[8][8] = SP; s[9][9] = SP; s[10][10] = SP; s[11][11] = SP; s[12][12] = SP;
  s[3][11] = sp2; s[4][10] = sp2; s[5][9] = sp2; s[6][8] = sp2;
  s[9][8] = sp2; s[10][9] = sp2; s[11][10] = sp2; s[12][11] = sp2;
  // Second <
  s[3][7] = SP; s[4][6] = SP; s[5][5] = SP; s[6][4] = SP; s[7][3] = SP;
  s[8][3] = SP; s[9][4] = SP; s[10][5] = SP; s[11][6] = SP; s[12][7] = SP;
  s[3][6] = sp2; s[4][5] = sp2; s[5][4] = sp2; s[6][3] = sp2;
  s[9][3] = sp2; s[10][4] = sp2; s[11][5] = sp2; s[12][6] = sp2;
  return s;
})();

// ---- POISON: Purple apple with skull drip ----
const P = '#9933ff'; // purple
const pd = '#6622cc'; // dark purple
const pk = '#dddddd'; // skull white
const POISON = [
  [_, _, _, _, _, _, _, _, _, l, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, l, l, l, _, _, _, _, _],
  [_, _, _, _, _, _, _, '#884422', l, _, _, _, _, _, _, _],
  [_, _, _, _, _, P, P, P, P, P, P, _, _, _, _, _],
  [_, _, _, P, P, P, P, P, P, P, P, P, P, _, _, _],
  [_, _, P, P, pk, pk, P, P, P, P, P, P, P, P, _, _],
  [_, _, P, P, pk, P, P, P, P, P, P, P, P, P, _, _],
  [_, P, P, P, P, P, pk, pk, pk, pk, P, P, P, P, P, _],
  [_, P, P, P, P, P, pk, B, pk, B, P, P, P, P, P, _],
  [_, P, P, P, P, P, pk, pk, pk, pk, P, P, P, P, P, _],
  [_, P, P, P, P, P, P, pk, pk, P, P, P, P, P, P, _],
  [_, _, P, P, P, P, pk, P, P, pk, P, P, P, P, _, _],
  [_, _, P, P, P, P, P, P, P, P, P, P, P, P, _, _],
  [_, _, _, P, P, P, P, P, P, P, P, P, P, _, _, _],
  [_, _, _, _, P, pd, P, P, P, pd, P, P, _, _, _, _],
  [_, _, _, _, _, pd, _, P, _, pd, _, _, _, _, _, _],
];

// ---- MOVING_OBS: Dark stone with red eye ----
const ms = '#444455'; // dark stone
const md = '#333344'; // darker stone
const me = '#ff0000'; // red eye
const mh = '#555566'; // highlight
const MOVING_OBS = [
  [md, md, md, md, md, md, md, md, md, md, md, md, md, md, md, md],
  [md, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, md],
  [md, ms, mh, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, mh, ms, md],
  [md, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, md],
  [md, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, md],
  [md, ms, ms, ms, ms, md, md, md, md, md, md, ms, ms, ms, ms, md],
  [md, ms, ms, ms, md, md, me, me, me, me, md, md, ms, ms, ms, md],
  [md, ms, ms, ms, md, me, me, W, W, me, me, md, ms, ms, ms, md],
  [md, ms, ms, ms, md, me, me, W, W, me, me, md, ms, ms, ms, md],
  [md, ms, ms, ms, md, md, me, me, me, me, md, md, ms, ms, ms, md],
  [md, ms, ms, ms, ms, md, md, md, md, md, md, ms, ms, ms, ms, md],
  [md, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, md],
  [md, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, md],
  [md, ms, mh, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, mh, ms, md],
  [md, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, ms, md],
  [md, md, md, md, md, md, md, md, md, md, md, md, md, md, md, md],
];

// ---- MOVING_PATH: Subtle dotted tile for patrol path ----
const mp = '#222233'; // path dark
const md2 = '#2a2a3a'; // dot
const MOVING_PATH = (() => {
  const s = Array.from({ length: 16 }, () => Array(16).fill(mp));
  // Add subtle dots in a grid pattern
  for (let y = 2; y < 16; y += 4) {
    for (let x = 2; x < 16; x += 4) {
      s[y][x] = md2;
      if (x + 1 < 16) s[y][x + 1] = md2;
      if (y + 1 < 16) s[y + 1][x] = md2;
      if (x + 1 < 16 && y + 1 < 16) s[y + 1][x + 1] = md2;
    }
  }
  return s;
})();

// ---- TIMED_FOOD: Red apple with ring around it ----
const tf = '#ff4444'; // timed food red
const tr2 = '#ffaa00'; // ring gold
const TIMED_FOOD = [
  [_, _, _, _, _, _, _, _, _, L, _, _, _, _, _, _],
  [_, _, _, tr2, tr2, tr2, tr2, tr2, L, L, l, tr2, tr2, _, _, _],
  [_, _, tr2, _, _, _, _, '#884422', L, _, _, _, _, tr2, _, _],
  [_, tr2, _, _, _, tf, tf, tf, tf, tf, tf, _, _, _, tr2, _],
  [_, tr2, _, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, _, tr2, _],
  [_, tr2, tf, tf, W, W, tf, tf, tf, tf, tf, tf, tf, tf, tr2, _],
  [_, tr2, tf, tf, W, tf, tf, tf, tf, tf, tf, tf, tf, tf, tr2, _],
  [_, _, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, _, _],
  [_, _, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, _, _],
  [_, tr2, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tr2, _],
  [_, tr2, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, tr2, _],
  [_, tr2, _, tf, tf, tf, tf, tf, tf, tf, tf, tf, tf, _, tr2, _],
  [_, tr2, _, _, tf, tf, tf, tf, tf, tf, tf, tf, _, _, tr2, _],
  [_, _, tr2, _, _, tf, tf, tf, tf, tf, tf, _, _, tr2, _, _],
  [_, _, _, tr2, tr2, tr2, tr2, tr2, tr2, tr2, tr2, tr2, tr2, _, _, _],
  [_, _, _, _, _, _, tf, tf, tf, tf, _, _, _, _, _, _],
];

// ---- WARP_EDGE: Purple glowing edge tile ----
const we = '#9933ff'; // warp purple
const wd = '#6622cc'; // dark purple
const wg = '#bb66ff'; // glow
const WARP_EDGE = [
  [wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd],
  [wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd],
  [wd, we, wg, we, we, wg, we, we, wg, we, we, wg, we, we, wg, wd],
  [wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd],
  [wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd],
  [wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd],
  [wd, we, wg, we, we, wg, we, we, wg, we, we, wg, we, we, wg, wd],
  [wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd],
  [wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd],
  [wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd],
  [wd, we, wg, we, we, wg, we, we, wg, we, we, wg, we, we, wg, wd],
  [wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd],
  [wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd],
  [wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd, we, we, wd],
  [wd, we, wg, we, we, wg, we, we, wg, we, we, wg, we, we, wg, wd],
  [wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd, wd],
];

// ---- HEART: Red pixel heart ----
const hr = '#ff3333'; // heart red
const hd = '#cc1111'; // dark red
const hp = '#ff6666'; // highlight pink
const HEART = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, hr, hr, hr, _, _, _, _, _, hr, hr, hr, _, _, _],
  [_, hr, hr, hp, hr, hr, _, _, _, hr, hr, hp, hr, hr, _, _],
  [hr, hr, hp, hp, hr, hr, hr, _, hr, hr, hp, hp, hr, hr, hr, _],
  [hr, hr, hp, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, _],
  [hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, _],
  [_, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, _, _],
  [_, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, _, _],
  [_, _, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, hr, _, _, _],
  [_, _, _, hr, hr, hr, hr, hr, hr, hr, hr, hr, _, _, _, _],
  [_, _, _, _, hr, hr, hr, hr, hr, hr, hr, _, _, _, _, _],
  [_, _, _, _, _, hr, hr, hr, hr, hr, _, _, _, _, _, _],
  [_, _, _, _, _, _, hr, hr, hr, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, hd, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
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
  PORTAL_BLUE,
  PORTAL_ORANGE,
  KEY_RED,
  KEY_BLUE,
  GATE_RED,
  GATE_BLUE,
  BREAKABLE,
  ONE_WAY_UP,
  ONE_WAY_DOWN,
  ONE_WAY_LEFT,
  ONE_WAY_RIGHT,
  ICE,
  SPEED_PAD,
  SLOW_PAD,
  POISON,
  MOVING_OBS,
  MOVING_PATH,
  TIMED_FOOD,
  WARP_EDGE,
  HEART,
};
