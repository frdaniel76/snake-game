# Snake Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable, level-based snake game as a mobile-first HTML/JS app with pixel art visuals, 15 level mechanics, 35 levels across 5 worlds, and a lives system.

**Architecture:** Single-page HTML app using Canvas 2D for game rendering and DOM for UI screens. ES modules for code organisation — each concern in its own file. No build step, no frameworks. Game loop is requestAnimationFrame with a fixed-tick simulation. Levels are JSON data. A test simulator auto-plays levels headlessly to verify solvability.

**Tech Stack:** Vanilla HTML/CSS/JS (ES modules), Canvas 2D API, Web Audio API (8-bit sounds), localStorage for save data, Press Start 2P + Inter fonts (Google Fonts).

---

## File Structure

```
snake-game/
├── index.html              — Entry point, loads fonts + modules
├── css/
│   └── style.css           — All UI styling (menus, HUD, dark theme)
├── js/
│   ├── main.js             — App entry, screen router, initialisation
│   ├── config.js            — Constants (tile size, speeds, colours, timing)
│   ├── state.js             — Game state, save/load localStorage, lives
│   ├── input.js             — Touch/swipe/tap/d-pad input handling
│   ├── engine.js            — Game loop (fixed timestep), tick/render cycle
│   ├── grid.js              — Grid helpers, tile lookup, bounds checking
│   ├── snake.js             — Snake data structure, movement, growth, death
│   ├── elements.js          — All 15 level elements: logic + collision
│   ├── camera.js            — Camera follow for large boards
│   ├── renderer.js          — Canvas drawing: snake, elements, board, effects
│   ├── sprites.js           — Pixel art sprite data (16x16 arrays)
│   ├── animations.js        — Animation system: tweens, particles, flashes
│   ├── audio.js             — Web Audio: 8-bit sound generation + playback
│   ├── levels.js            — Level data: all 35 levels as JSON structures
│   ├── screens/
│   │   ├── splash.js        — Splash screen
│   │   ├── menu.js          — Main menu
│   │   ├── world-map.js     — World map screen
│   │   ├── level-select.js  — Level select grid
│   │   ├── level-intro.js   — Pre-level briefing overlay
│   │   ├── hud.js           — In-game HUD (lives, score, apple count)
│   │   ├── pause.js         — Pause menu overlay
│   │   ├── death.js         — Death screen
│   │   ├── game-over.js     — Game over (0 lives) screen
│   │   ├── level-complete.js— Level complete screen + stars
│   │   ├── world-complete.js— World complete celebration
│   │   └── settings.js      — Settings screen
│   └── simulator.js         — Headless level simulator (BFS pathfinding)
├── docs/
│   ├── level-design.md
│   ├── ux-design.md
│   └── superpowers/plans/
│       └── 2026-04-27-snake-game-implementation.md
└── test/
    └── simulator.html       — Visual simulator test harness
```

---

## Phase 1: Core Engine (Playable Snake)

### Task 1: Project scaffolding + HTML entry point

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/config.js`
- Create: `js/main.js`

- [ ] **Step 1: Write index.html with canvas, font imports, module loading**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
<title>Snake — Level Quest</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div id="app">
    <canvas id="game-canvas"></canvas>
    <div id="ui-layer"></div>
  </div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write css/style.css with base dark theme + layout**

Core styles: void black background, full-screen canvas, UI layer overlay, font defaults, button styles, safe-area padding. See ux-design.md Section 1 for colour palette.

- [ ] **Step 3: Write js/config.js with all game constants**

```js
export const TILE = 16;
export const SCALE = 3; // computed at runtime from screen size
export const BOARD_W = 15;
export const BOARD_H = 20;
export const BASE_TICK_MS = 180; // snake moves every 180ms at speed 1
export const SPEED_BOOST_MULT = 0.6;
export const SLOW_MULT = 1.4;
export const LIVES_START = 3;
export const LIVES_MAX = 5;
export const COLORS = {
  VOID: '#0f0e17', NAVY: '#1a1a2e', GREEN: '#00ff41',
  BLUE: '#00d4ff', GOLD: '#ffc800', RED: '#ff3333',
  WHITE: '#e8e8e8', GREY: '#555568', /* ... world colours */
};
// ... element type enum, direction enum, etc.
```

- [ ] **Step 4: Write js/main.js — app entry, canvas sizing, placeholder render**

Initialise canvas, compute SCALE from device, fill black, draw "Loading..." text. Verify it runs by opening index.html.

- [ ] **Step 5: Open in browser, verify black canvas renders**

- [ ] **Step 6: Commit**
```bash
git init && git add -A && git commit -m "feat: project scaffolding — HTML, CSS, config, canvas init"
```

---

### Task 2: Grid system + level data format

**Files:**
- Create: `js/grid.js`
- Create: `js/levels.js` (first 3 levels only)

- [ ] **Step 1: Write js/grid.js — grid creation, tile access, bounds**

```js
export function createGrid(w, h) { /* 2D array of tile objects */ }
export function getTile(grid, x, y) { /* bounds-safe accessor */ }
export function setTile(grid, x, y, type, data) { /* set tile content */ }
export function inBounds(grid, x, y) { /* boolean */ }
export function findTiles(grid, type) { /* returns [{x,y,data}] */ }
```

- [ ] **Step 2: Write js/levels.js — level data format + first 3 levels**

Each level is a plain object:
```js
{
  id: 1, name: "First Steps", world: 1,
  width: 15, height: 20,
  snake: { x: 7, y: 10, dir: 'right', length: 3 },
  goal: { type: 'eat-all' }, // or 'reach-exit', 'eat-all-and-exit'
  elements: [
    { type: 'food', x: 10, y: 10 },
    { type: 'food', x: 12, y: 8 },
    { type: 'food', x: 5, y: 14 },
  ],
  walls: [ /* array of {x,y} for interior walls */ ],
  starTargets: { time: 30, fastTime: 15 },
  speed: 1,
}
```

Define levels 1-3 (First Steps, Garden Walls, Find the Door).

- [ ] **Step 3: Write a loadLevel() function that builds a grid from level data**

```js
export function loadLevel(levelDef) {
  const grid = createGrid(levelDef.width, levelDef.height);
  // Place boundary walls
  // Place interior walls
  // Place elements (food, exit, etc.)
  return { grid, snake: {...levelDef.snake}, goal: levelDef.goal, ... };
}
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: grid system + level data format with 3 levels"
```

---

### Task 3: Snake data structure + movement

**Files:**
- Create: `js/snake.js`

- [ ] **Step 1: Write snake creation and segment tracking**

```js
export function createSnake(x, y, dir, length) {
  // Returns { segments: [{x,y}], dir, nextDir, growing: 0, alive: true, ... }
  // Head is segments[0]. Segments built backward from head based on dir.
}
```

- [ ] **Step 2: Write snake movement (tick-based)**

```js
export function moveSnake(snake) {
  // 1. Apply nextDir to dir (if valid — no 180 reversal)
  // 2. Compute new head position from dir
  // 3. Unshift new head into segments
  // 4. If not growing, pop tail. If growing, decrement growing counter.
  // Returns { newHead: {x,y}, removedTail: {x,y}|null }
}
```

- [ ] **Step 3: Write direction change + 180-reversal guard**

```js
export function changeDirection(snake, newDir) {
  // Only accept if newDir is not opposite of current dir
  // Queue it in snake.nextDir (applied on next tick)
}
```

- [ ] **Step 4: Write self-collision check**

```js
export function checkSelfCollision(snake) {
  // Head overlaps any body segment → true
}
```

- [ ] **Step 5: Write growth trigger**

```js
export function growSnake(snake, amount) {
  snake.growing += amount;
}
```

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: snake data structure, movement, direction, collision"
```

---

### Task 4: Game loop + engine

**Files:**
- Create: `js/engine.js`

- [ ] **Step 1: Write the fixed-timestep game loop**

```js
export function createEngine(onTick, onRender) {
  let tickInterval = 180; // ms per snake move
  let lastTick = 0;
  let running = false;
  let rafId = null;

  function loop(now) {
    if (!running) return;
    if (now - lastTick >= tickInterval) {
      onTick();
      lastTick = now;
    }
    onRender(now, lastTick, tickInterval); // pass for interpolation
    rafId = requestAnimationFrame(loop);
  }

  return {
    start() { running = true; lastTick = performance.now(); loop(lastTick); },
    stop() { running = false; if (rafId) cancelAnimationFrame(rafId); },
    setSpeed(mult) { tickInterval = 180 / mult; },
    get isRunning() { return running; },
  };
}
```

- [ ] **Step 2: Wire engine into main.js with a test tick that moves the snake**

Create a minimal game session: load level 1, create snake, on each tick move the snake, check wall/self collision. On collision → stop. No rendering yet — just console.log the head position each tick.

- [ ] **Step 3: Verify in browser console — snake positions print, stops on wall hit**

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: game engine with fixed-timestep loop"
```

---

### Task 5: Canvas renderer — board, snake, food

**Files:**
- Create: `js/renderer.js`
- Create: `js/sprites.js`

- [ ] **Step 1: Write js/sprites.js — pixel data for snake head, body, food, wall**

Each sprite is a 16x16 array of hex colour strings (or 0 for transparent). Start with simple but recognisable versions:
- Wall: grey bricks
- Food (apple): red circle with green leaf
- Snake head: green with white eyes
- Snake body: alternating green shades
- Snake tail: tapered green

- [ ] **Step 2: Write js/renderer.js — drawBoard, drawSnake, drawElement**

```js
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // crisp pixels

  return {
    clear() { /* fill with void black */ },
    drawGrid(grid, camera) { /* draw each tile: walls, floor, elements */ },
    drawSnake(snake, camera, interpFactor) {
      /* draw segments with smooth interpolation between ticks */
    },
    drawSprite(sprite, x, y, scale) { /* render 16x16 pixel array */ },
    resize(w, h, scale) { /* resize canvas, update internal scale */ },
  };
}
```

- [ ] **Step 3: Wire renderer into engine's onRender callback**

Each frame: clear → drawGrid → drawSnake. Compute interpolation factor for smooth movement between ticks.

- [ ] **Step 4: Open in browser — see the board, walls, food, and a moving snake**

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: canvas renderer with sprites — board, snake, food visible"
```

---

### Task 6: Input handling (swipe + tap + keyboard)

**Files:**
- Create: `js/input.js`

- [ ] **Step 1: Write swipe detection**

```js
export function createInput(element) {
  let onDirection = null;
  let touchStart = null;
  const SWIPE_MIN = 20; // px

  element.addEventListener('touchstart', e => { /* record start */ });
  element.addEventListener('touchend', e => { /* compute swipe vector, emit direction */ });

  return {
    onDirection(cb) { onDirection = cb; },
    setMode(mode) { /* 'swipe' | 'tap' | 'dpad' */ },
    destroy() { /* remove listeners */ },
  };
}
```

- [ ] **Step 2: Add tap-to-turn (left/right relative to snake direction)**

Tap left half → turn left relative to current direction. Tap right half → turn right.

- [ ] **Step 3: Add keyboard arrows (for desktop testing)**

Arrow keys / WASD → absolute direction change.

- [ ] **Step 4: Wire input into game session — direction changes apply to snake**

- [ ] **Step 5: Test in browser — swipe/tap/keyboard all control the snake**

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: input system — swipe, tap, keyboard controls"
```

---

### Task 7: Element collision + food eating + level completion

**Files:**
- Create: `js/elements.js`
- Modify: `js/engine.js` (wire in collision logic)

- [ ] **Step 1: Write js/elements.js — collision resolver**

```js
export function resolveCollision(grid, snake, head, state) {
  const tile = getTile(grid, head.x, head.y);
  if (!tile) return { result: 'wall-death' };
  switch (tile.type) {
    case 'wall': return { result: 'wall-death' };
    case 'food': return { result: 'eat', grow: 1, score: 10 };
    case 'golden-food': return { result: 'eat', grow: 3, score: 50 };
    case 'exit': return state.goalMet ? { result: 'exit-complete' } : { result: 'blocked' };
    // ... more elements added in later phases
    default: return { result: 'none' };
  }
}

export function checkGoalMet(grid, goal) {
  // 'eat-all': no food/golden-food/timed-food tiles remain
  // 'reach-exit': always true (just need to reach exit)
  // 'eat-all-and-exit': no food remains
}
```

- [ ] **Step 2: Wire collision into the engine tick**

After moveSnake: check new head against grid → eat food (remove tile, grow snake, update score) → check goal → check wall/self death.

- [ ] **Step 3: Add level completion detection**

When goal is met and (if exit required) snake reaches exit → trigger level complete.

- [ ] **Step 4: Test — play level 1, eat all 3 apples, level completes**

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: element collision, food eating, level completion"
```

---

### Task 8: State management + lives system

**Files:**
- Create: `js/state.js`

- [ ] **Step 1: Write state manager — lives, progress, save/load**

```js
const SAVE_KEY = 'snake_quest_v1';

export function createState() {
  return {
    lives: 3,
    currentWorld: 1,
    currentLevel: 1,
    levelStars: {},    // { '1': 3, '2': 2, ... }
    totalScore: 0,
    settings: { controlMode: 'swipe', music: true, sfx: true, vibration: true, gridLines: false, screenShake: true },
  };
}
export function saveState(state) { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
export function loadState() { /* parse from localStorage, merge with defaults */ }
export function loseLife(state) { state.lives = Math.max(0, state.lives - 1); saveState(state); }
export function gainLife(state) { state.lives = Math.min(5, state.lives + 1); saveState(state); }
export function isGameOver(state) { return state.lives <= 0; }
export function recordLevelComplete(state, levelId, stars, score) { /* update stars if better, add score, save */ }
export function getWorldProgress(state, worldNum) { /* return { completed, total, stars, totalStars } */ }
export function isLevelUnlocked(state, levelId) { /* level 1 always unlocked, others need previous completed */ }
```

- [ ] **Step 2: Wire lives into death handling — lose life on death, game over at 0**

- [ ] **Step 3: Wire level completion — record stars, unlock next level**

- [ ] **Step 4: Test — die 3 times, verify game over triggers**

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: state management, lives system, save/load"
```

---

## Phase 2: UI Screens

### Task 9: Screen router + splash + main menu

**Files:**
- Modify: `js/main.js`
- Create: `js/screens/splash.js`
- Create: `js/screens/menu.js`

- [ ] **Step 1: Build screen router in main.js**

```js
const screens = { splash, menu, worldMap, levelSelect, gameplay, ... };
let currentScreen = null;
export function showScreen(name, data) {
  if (currentScreen?.hide) currentScreen.hide();
  currentScreen = screens[name];
  currentScreen.show(data);
}
```

- [ ] **Step 2: Build splash screen — logo, starfield, "tap to start"**

DOM-based (in #ui-layer). Press Start 2P title, blinking prompt, 2s auto-advance or tap.

- [ ] **Step 3: Build main menu — PLAY, SETTINGS, STATS buttons + lives display**

DOM-based. Pixel snake mascot (CSS/SVG), stacked buttons, heart icons for lives.

- [ ] **Step 4: Test — app loads, splash plays, tap goes to menu**

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: screen router, splash screen, main menu"
```

---

### Task 10: World map + level select

**Files:**
- Create: `js/screens/world-map.js`
- Create: `js/screens/level-select.js`

- [ ] **Step 1: Build world map — 5 world cards, progress bars, lock state**

Vertical scroll of world cards. Each shows name, theme colour, progress, star count. Locked worlds are greyed with lock icon.

- [ ] **Step 2: Build level select — grid of level nodes, star display, lock state**

3-column grid. Completed = green border + stars. Current = pulse glow. Locked = grey + lock.

- [ ] **Step 3: Wire navigation — menu → world map → level select → back**

- [ ] **Step 4: Test — navigate through menu → worlds → levels**

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: world map + level select screens"
```

---

### Task 11: Level intro + HUD + pause

**Files:**
- Create: `js/screens/level-intro.js`
- Create: `js/screens/hud.js`
- Create: `js/screens/pause.js`

- [ ] **Step 1: Build level intro overlay — level name, goal, new mechanic badge, START button**

- [ ] **Step 2: Build in-game HUD — lives, score, apple counter, pause button**

Canvas-rendered or DOM overlay. Minimal, semi-transparent.

- [ ] **Step 3: Build pause menu — resume (with 3-2-1 countdown), restart, quit**

- [ ] **Step 4: Wire the full flow — select level → intro → gameplay → pause → resume**

- [ ] **Step 5: Test full flow for level 1**

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: level intro, HUD, pause menu"
```

---

### Task 12: Death screen + game over + level complete

**Files:**
- Create: `js/screens/death.js`
- Create: `js/screens/game-over.js`
- Create: `js/screens/level-complete.js`

- [ ] **Step 1: Build death screen — cause of death, life lost, retry/quit**

- [ ] **Step 2: Build game over screen — GAME OVER text, continue from world start / main menu**

- [ ] **Step 3: Build level complete — stars animation, stats, next level / retry / menu**

Star calculation: 1 star = completed, 2 stars = under target time + ≤2 segments lost, 3 stars = under fast time + 0 segments lost.

- [ ] **Step 4: Wire everything — death → death screen → retry or game over. Complete → stars → next.**

- [ ] **Step 5: Test — play level 1, complete it, see stars. Die, see death screen. Die 3x, see game over.**

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: death, game over, level complete screens"
```

---

### Task 13: Settings screen

**Files:**
- Create: `js/screens/settings.js`

- [ ] **Step 1: Build settings — control scheme toggle, audio toggles, grid lines, screen shake, reset progress**

Read/write from state.settings. Control scheme changes apply immediately.

- [ ] **Step 2: Commit**
```bash
git add -A && git commit -m "feat: settings screen"
```

---

## Phase 3: Level Elements (mechanics 3-15)

### Task 14: Exit Door (element 4)

**Files:**
- Modify: `js/elements.js` (add exit logic)
- Modify: `js/sprites.js` (add exit sprite)
- Modify: `js/renderer.js` (draw exit with active/inactive states)
- Modify: `js/levels.js` (level 3 already has exit)

- [ ] **Step 1: Add exit door sprite (inactive grey + active glowing green)**
- [ ] **Step 2: Add exit collision logic — blocked if goal not met, completes level if met**
- [ ] **Step 3: Add exit glow animation when goal is met (pulse effect)**
- [ ] **Step 4: Test with level 3 — eat apples, door activates, enter to complete**
- [ ] **Step 5: Commit**

---

### Task 15: Golden Apple (element 3)

- [ ] **Step 1: Add golden apple sprite (gold with sparkle)**
- [ ] **Step 2: Add collision — grow +3, score +50, counts toward eat-all goal**
- [ ] **Step 3: Add level 5 to levels.js**
- [ ] **Step 4: Test level 5**
- [ ] **Step 5: Commit**

---

### Task 16: Portal Pair (element 5)

- [ ] **Step 1: Add portal sprites (coloured swirls, 4-frame rotation animation)**
- [ ] **Step 2: Add portal logic — head enters → teleport to paired portal, same direction. Body follows through over ticks.**
- [ ] **Step 3: Add levels 7-8 to levels.js**
- [ ] **Step 4: Test — enter portal, exit other side, body streams through**
- [ ] **Step 5: Commit**

---

### Task 17: Key & Gate (element 6)

- [ ] **Step 1: Add key + gate sprites (colour-coded)**
- [ ] **Step 2: Add key collect logic — no growth, dissolve matching gates**
- [ ] **Step 3: Add gate collision — blocked until key collected**
- [ ] **Step 4: Add levels 9-10 to levels.js**
- [ ] **Step 5: Test — collect key, gates dissolve, reach exit**
- [ ] **Step 6: Commit**

---

### Task 18: Breakable Wall (element 7)

- [ ] **Step 1: Add breakable wall sprite (cracked stone)**
- [ ] **Step 2: Add collision — wall destroyed, snake loses 1 segment. Game over if length 1.**
- [ ] **Step 3: Add crumble particle animation**
- [ ] **Step 4: Add level 11 to levels.js**
- [ ] **Step 5: Test**
- [ ] **Step 6: Commit**

---

### Task 19: One-Way Gate (element 8)

- [ ] **Step 1: Add one-way gate sprite (directional arrow)**
- [ ] **Step 2: Add collision — passable from allowed direction, wall from others**
- [ ] **Step 3: Add level 13 to levels.js**
- [ ] **Step 4: Test**
- [ ] **Step 5: Commit**

---

### Task 20: Ice Patch (element 9)

- [ ] **Step 1: Add ice sprite (cyan with shine lines)**
- [ ] **Step 2: Add ice logic — disable direction changes while head is on ice, continue sliding**
- [ ] **Step 3: Add ice visual effects (shimmer, particle trail)**
- [ ] **Step 4: Add levels 15-16 to levels.js**
- [ ] **Step 5: Test — enter ice, slide until hitting non-ice/wall**
- [ ] **Step 6: Commit**

---

### Task 21: Speed Pad + Slow Pad (elements 10-11)

- [ ] **Step 1: Add speed/slow pad sprites (orange/blue chevrons)**
- [ ] **Step 2: Add speed modifier logic — change engine tick rate for 3 seconds**
- [ ] **Step 3: Add visual effects (afterimage trail for speed, blue tint for slow)**
- [ ] **Step 4: Add levels 17-18 to levels.js**
- [ ] **Step 5: Test**
- [ ] **Step 6: Commit**

---

### Task 22: Poison Apple (element 12)

- [ ] **Step 1: Add poison apple sprite (purple with skull)**
- [ ] **Step 2: Add collision — shrink by 2, game over if length < 1**
- [ ] **Step 3: Add level 20 to levels.js**
- [ ] **Step 4: Test**
- [ ] **Step 5: Commit**

---

### Task 23: Moving Obstacle (element 13)

- [ ] **Step 1: Add moving obstacle sprite (dark stone + red glow)**
- [ ] **Step 2: Add patrol logic — move along defined path, back and forth, each tick**
- [ ] **Step 3: Add dotted path rendering**
- [ ] **Step 4: Add collision — death on contact (head or body)**
- [ ] **Step 5: Add levels 22-23 to levels.js**
- [ ] **Step 6: Test**
- [ ] **Step 7: Commit**

---

### Task 24: Timed Food (element 14)

- [ ] **Step 1: Add timed food sprite (apple + countdown ring)**
- [ ] **Step 2: Add timer logic — countdown per tick, disappear on expire, auto-fail if required**
- [ ] **Step 3: Add countdown ring animation (depleting circle)**
- [ ] **Step 4: Add level 25 to levels.js**
- [ ] **Step 5: Test**
- [ ] **Step 6: Commit**

---

### Task 25: Warp Edges (element 15)

- [ ] **Step 1: Add warp edge rendering (purple glow on edges)**
- [ ] **Step 2: Add warp logic — snake exits one side, appears on opposite**
- [ ] **Step 3: Modify wall collision to skip warp edges**
- [ ] **Step 4: Add levels 28-29 to levels.js**
- [ ] **Step 5: Test**
- [ ] **Step 6: Commit**

---

### Task 26: Heart Pickup + remaining levels

- [ ] **Step 1: Add heart pickup sprite and logic (+1 life)**
- [ ] **Step 2: Add ALL remaining levels (levels 4, 6, 12, 14, 19, 21, 24, 26, 27, 30-35)**
- [ ] **Step 3: Test each new level loads and has correct elements**
- [ ] **Step 4: Commit**

---

## Phase 4: Camera System

### Task 27: Camera follow for large boards

**Files:**
- Create: `js/camera.js`
- Modify: `js/renderer.js` (apply camera offset)

- [ ] **Step 1: Write camera — follow snake head, smooth lerp, edge clamping**

```js
export function createCamera(viewW, viewH) {
  let x = 0, y = 0;
  return {
    follow(targetX, targetY, boardW, boardH, dirHint) {
      // Lerp toward target with slight lead in movement direction
      // Clamp so camera doesn't show outside board bounds
    },
    get offset() { return { x, y }; },
  };
}
```

- [ ] **Step 2: Apply camera offset to all rendering (grid, snake, elements)**
- [ ] **Step 3: Test with level 12 (first large board) — camera follows snake smoothly**
- [ ] **Step 4: Commit**

---

## Phase 5: Animations + Audio

### Task 28: Core animations

**Files:**
- Create: `js/animations.js`
- Modify: `js/renderer.js` (integrate animations)

- [ ] **Step 1: Build animation system — tween manager, particle emitter**
- [ ] **Step 2: Add snake eat animation (head scale chomp + green pulse)**
- [ ] **Step 3: Add snake death animation (flash + pixel particle scatter)**
- [ ] **Step 4: Add food bob animation (idle up/down)**
- [ ] **Step 5: Add portal rotation animation**
- [ ] **Step 6: Add confetti / star-fill animations for level complete**
- [ ] **Step 7: Commit**

---

### Task 29: Audio system

**Files:**
- Create: `js/audio.js`

- [ ] **Step 1: Build 8-bit sound generator using Web Audio API oscillators**

```js
export function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  function play(frequency, duration, type = 'square') { /* oscillator → gain → destination */ }
  return {
    eatFood() { /* ascending bip */ },
    eatGold() { /* richer chord */ },
    death() { /* descending wah */ },
    levelComplete() { /* ascending fanfare */ },
    gameOver() { /* descending arpeggio */ },
    keyCollect() { /* metallic ding */ },
    portalEnter() { /* whoosh */ },
    wallBreak() { /* crumble */ },
    buttonTap() { /* soft click */ },
    starAwarded() { /* bright ping */ },
    lifeGained() { /* warm chord */ },
    lifeLost() { /* glass break */ },
    setEnabled(on) { /* mute/unmute */ },
  };
}
```

- [ ] **Step 2: Wire sounds into game events**
- [ ] **Step 3: Test — sounds play on eat, death, complete**
- [ ] **Step 4: Commit**

---

## Phase 6: Simulator + Testing

### Task 30: Level simulator (BFS pathfinding)

**Files:**
- Create: `js/simulator.js`
- Create: `test/simulator.html`

- [ ] **Step 1: Write BFS-based simulator that plays a level headlessly**

```js
export function simulateLevel(levelDef) {
  // Load the level into a grid
  // BFS from snake start, exploring all reachable positions
  // For each food item, find shortest path from current position
  // Greedily eat nearest food, grow, repeat
  // For exit levels, find path to exit after all food eaten
  // Returns: { solvable: bool, pathLength, foodReached, exitReached, reason }
}
```

- [ ] **Step 2: Write visual test harness (test/simulator.html)**

Page with a "Run All Levels" button. Runs simulator on every level, displays results table: level name, solvable (green/red), path length, reason if failed.

- [ ] **Step 3: Run simulator on all 35 levels, fix any that fail**

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: level simulator — BFS pathfinding + test harness"
```

---

### Task 31: Visual playtesting + iteration

- [ ] **Step 1: Play through levels 1-7 manually, note issues**
- [ ] **Step 2: Fix level layout issues (unsafe spawns, impossible paths, too hard/easy)**
- [ ] **Step 3: Play through levels 8-14, fix issues**
- [ ] **Step 4: Play through levels 15-21, fix issues**
- [ ] **Step 5: Play through levels 22-28, fix issues**
- [ ] **Step 6: Play through levels 29-35, fix issues**
- [ ] **Step 7: Run simulator again to confirm all levels still solvable**
- [ ] **Step 8: Commit**
```bash
git add -A && git commit -m "fix: level layout tuning from playtesting"
```

---

## Phase 7: Polish

### Task 32: World complete screen + star totals

- [ ] **Step 1: Build world complete screen (celebration, +1 life, unlock next world)**
- [ ] **Step 2: Add total star counting across all screens**
- [ ] **Step 3: Commit**

### Task 33: Screen transitions + UI animations

- [ ] **Step 1: Add fade transitions between screens**
- [ ] **Step 2: Add button press animations (scale down/up)**
- [ ] **Step 3: Add number counter roll-up animation**
- [ ] **Step 4: Add heart loss/gain animations in HUD**
- [ ] **Step 5: Commit**

### Task 34: Stats screen

- [ ] **Step 1: Build stats screen — total levels, stars, deaths, play time, longest snake**
- [ ] **Step 2: Track stats in state (increment on events)**
- [ ] **Step 3: Commit**

### Task 35: Final integration pass

- [ ] **Step 1: Full playthrough from splash to level 35**
- [ ] **Step 2: Fix any remaining bugs, layout issues, timing problems**
- [ ] **Step 3: Run simulator to confirm all levels solvable**
- [ ] **Step 4: Final commit**
```bash
git add -A && git commit -m "chore: final polish and integration pass"
```
