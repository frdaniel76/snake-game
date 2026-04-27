import { COLORS, BOARD_W, BOARD_H, TILE, LIVES_START } from './config.js';
import { loadLevel, LEVELS } from './levels.js';
import { createEngine } from './engine.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';

// DOM elements
const canvas = document.getElementById('game-canvas');
const uiLayer = document.getElementById('ui-layer');

// Core systems
const renderer = createRenderer(canvas);
const engine = createEngine();
const input = createInput(canvas);

// Game state (simple for now — full state.js comes later)
let lives = LIVES_START;
let currentLevelId = 1;
let currentScore = 0;

// --- Screen Management ---
// For now, use simple DOM screens rendered into uiLayer
// Screens: 'menu', 'gameplay', 'death', 'complete', 'gameover'
let currentScreen = null;

function showScreen(name, data) {
  uiLayer.innerHTML = '';
  uiLayer.style.pointerEvents = 'auto';
  currentScreen = name;

  switch (name) {
    case 'menu': renderMenuScreen(); break;
    case 'level-intro': renderLevelIntroScreen(data); break;
    case 'gameplay': startGameplay(data?.levelId ?? currentLevelId); break;
    case 'death': renderDeathScreen(data); break;
    case 'complete': renderCompleteScreen(data); break;
    case 'gameover': renderGameOverScreen(); break;
  }
}

// --- Menu Screen ---
function renderMenuScreen() {
  engine.stop();
  renderer.clear();

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; gap: 24px;">
      <h1 class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 28px; text-align: center;">SNAKE</h1>
      <p class="font-ui" style="color: ${COLORS.WHITE}; opacity: 0.6; font-size: 14px;">Level Quest</p>
      <div style="display: flex; gap: 8px; align-items: center; justify-content: center;">
        ${renderHearts(lives)}
      </div>
      <button class="btn btn-primary font-ui" id="btn-play">PLAY</button>
      <p class="font-pixel" style="color: ${COLORS.GREY}; font-size: 8px; text-align: center;">Level ${currentLevelId}</p>
    </div>
  `;

  document.getElementById('btn-play').onclick = () => {
    showScreen('level-intro', { levelId: currentLevelId });
  };
}

// --- Level Intro Screen ---
function renderLevelIntroScreen(data) {
  const levelId = data?.levelId ?? currentLevelId;
  const levelDef = LEVELS.find(l => l.id === levelId);
  if (!levelDef) { showScreen('menu'); return; }

  // Load and render the board as a preview behind the overlay
  const levelData = loadLevel(levelId);
  resizeCanvas(levelData.grid);
  renderer.clear();
  renderer.drawBoard(levelData.grid);

  const goalText = {
    'eat-all': 'Eat all apples',
    'reach-exit': 'Reach the exit door',
    'eat-all-and-exit': 'Eat all apples, then reach the exit',
  }[levelDef.goal.type] || 'Complete the level';

  let mechanicHtml = '';
  if (levelDef.newMechanic) {
    mechanicHtml = `
      <div style="background: ${COLORS.GOLD}22; border: 1px solid ${COLORS.GOLD}; border-radius: 8px; padding: 10px 14px; margin-top: 12px;">
        <span class="font-pixel" style="color: ${COLORS.GOLD}; font-size: 9px;">NEW: ${levelDef.newMechanic.name}</span>
        <p class="font-ui" style="color: ${COLORS.WHITE}; font-size: 12px; margin-top: 4px;">${levelDef.newMechanic.description}</p>
      </div>
    `;
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; background: rgba(15,14,23,0.85);">
      <div style="background: ${COLORS.NAVY}; border-radius: 16px; padding: 24px; max-width: 320px; width: 90%;">
        <p class="font-pixel" style="color: ${COLORS.GREY}; font-size: 8px; text-align: center; margin-bottom: 8px;">WORLD ${levelDef.world} — LEVEL ${levelDef.id}</p>
        <h2 class="font-pixel" style="color: ${COLORS.WHITE}; font-size: 14px; text-align: center; margin-bottom: 16px;">${levelDef.name}</h2>
        <p class="font-ui" style="color: ${COLORS.BLUE}; font-size: 14px; text-align: center;">🎯 ${goalText}</p>
        ${mechanicHtml}
        <div style="display: flex; gap: 8px; align-items: center; justify-content: center; margin-top: 16px;">
          ${renderHearts(lives)}
        </div>
        <button class="btn btn-primary font-ui" id="btn-start" style="width: 100%; margin-top: 20px;">START</button>
      </div>
    </div>
  `;

  document.getElementById('btn-start').onclick = () => {
    showScreen('gameplay', { levelId });
  };
}

// --- Gameplay ---
function startGameplay(levelId) {
  uiLayer.innerHTML = `
    <div class="screen active" style="pointer-events: none; justify-content: flex-start; padding: 8px 16px;">
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; pointer-events: auto;">
        <button id="btn-pause" class="font-pixel" style="background: none; border: none; color: ${COLORS.WHITE}; font-size: 16px; padding: 8px; cursor: pointer;">⏸</button>
        <div id="hud-score" class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 11px;">0</div>
        <div id="hud-hearts" style="display: flex; gap: 4px;">${renderHearts(lives)}</div>
      </div>
      <div id="hud-goal" class="font-ui" style="color: ${COLORS.WHITE}; opacity: 0.5; font-size: 11px; text-align: center; width: 100%; margin-top: 4px; transition: opacity 1s;"></div>
    </div>
  `;

  // Load level
  const levelData = loadLevel(levelId);
  currentLevelId = levelId;
  resizeCanvas(levelData.grid);

  // Setup engine
  const session = engine.startLevel(levelData);

  // Show goal briefly
  const goalEl = document.getElementById('hud-goal');
  const goalTexts = { 'eat-all': 'Eat all apples', 'reach-exit': 'Reach the exit', 'eat-all-and-exit': 'Eat all apples → reach exit' };
  if (goalEl) {
    goalEl.textContent = goalTexts[levelData.goal.type] || '';
    setTimeout(() => { if (goalEl) goalEl.style.opacity = '0'; }, 3000);
  }

  // Wire input
  input.onDirection(dir => {
    engine.changeDirection(dir);
    input.updateSnakeDir(dir);
  });

  // Wire engine callbacks
  engine.onRender = (sess, interp) => {
    renderer.clear();
    renderer.drawBoard(sess.grid);
    renderer.drawSnake(sess.snake, interp, sess.prevSegments);
  };

  engine.onScoreChange = (score) => {
    const el = document.getElementById('hud-score');
    if (el) el.textContent = score;
  };

  engine.onDeath = (cause) => {
    lives--;
    setTimeout(() => {
      if (lives <= 0) {
        showScreen('gameover');
      } else {
        showScreen('death', { cause, levelId: currentLevelId });
      }
    }, 600); // brief delay for death to register visually
  };

  engine.onLevelComplete = (stats) => {
    setTimeout(() => {
      showScreen('complete', { ...stats, levelId: currentLevelId });
    }, 400);
  };

  // Pause button
  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      engine.pause();
      showPauseOverlay();
    };
  }

  // Start!
  engine.start();
}

function showPauseOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'pause-overlay';
  overlay.className = 'screen active';
  overlay.style.cssText = 'justify-content: center; background: rgba(15,14,23,0.8); z-index: 20;';
  overlay.innerHTML = `
    <div style="background: ${COLORS.NAVY}; border-radius: 16px; padding: 24px; max-width: 280px; width: 85%; display: flex; flex-direction: column; gap: 12px;">
      <h2 class="font-pixel" style="color: ${COLORS.WHITE}; font-size: 16px; text-align: center;">PAUSED</h2>
      <button class="btn btn-primary font-ui" id="btn-resume">RESUME</button>
      <button class="btn btn-secondary font-ui" id="btn-restart">RESTART</button>
      <button class="btn btn-danger font-ui" id="btn-quit">QUIT</button>
    </div>
  `;
  uiLayer.appendChild(overlay);

  document.getElementById('btn-resume').onclick = () => {
    overlay.remove();
    engine.resume();
  };
  document.getElementById('btn-restart').onclick = () => {
    engine.stop();
    showScreen('gameplay', { levelId: currentLevelId });
  };
  document.getElementById('btn-quit').onclick = () => {
    engine.stop();
    showScreen('menu');
  };
}

// --- Death Screen ---
function renderDeathScreen(data) {
  engine.stop();
  const causes = { wall: 'Hit a wall!', self: 'Ate yourself!', poison: 'Poison!', obstacle: 'Caught by obstacle!' };

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; background: rgba(15,14,23,0.85);">
      <div style="background: ${COLORS.NAVY}; border-radius: 16px; padding: 24px; max-width: 300px; width: 85%; text-align: center;">
        <p class="font-pixel" style="color: ${COLORS.RED}; font-size: 14px; margin-bottom: 12px;">${causes[data?.cause] || 'You died!'}</p>
        <div style="display: flex; gap: 4px; justify-content: center; margin-bottom: 8px;">${renderHearts(lives)}</div>
        <p class="font-ui" style="color: ${COLORS.GREY}; font-size: 13px;">${lives} ${lives === 1 ? 'life' : 'lives'} remaining</p>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
          <button class="btn btn-primary font-ui" id="btn-retry">RETRY</button>
          <button class="btn btn-secondary font-ui" id="btn-quit-death">QUIT</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-retry').onclick = () => showScreen('gameplay', { levelId: currentLevelId });
  document.getElementById('btn-quit-death').onclick = () => showScreen('menu');
}

// --- Game Over Screen ---
function renderGameOverScreen() {
  engine.stop();

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; background: ${COLORS.VOID};">
      <h1 class="font-pixel" style="color: ${COLORS.RED}; font-size: 22px; text-align: center; margin-bottom: 24px;">GAME OVER</h1>
      <p class="font-ui" style="color: ${COLORS.GREY}; font-size: 14px; text-align: center; margin-bottom: 32px;">You reached Level ${currentLevelId}</p>
      <div style="display: flex; flex-direction: column; gap: 12px; width: 80%; max-width: 280px;">
        <button class="btn btn-primary font-ui" id="btn-continue">CONTINUE</button>
        <button class="btn btn-secondary font-ui" id="btn-menu-go">MAIN MENU</button>
      </div>
    </div>
  `;

  document.getElementById('btn-continue').onclick = () => {
    // Reset lives and continue from world start
    lives = LIVES_START;
    // Find first level of current world
    const currentLevel = LEVELS.find(l => l.id === currentLevelId);
    const worldStart = LEVELS.find(l => l.world === (currentLevel?.world ?? 1))?.id ?? 1;
    currentLevelId = worldStart;
    showScreen('menu');
  };
  document.getElementById('btn-menu-go').onclick = () => {
    lives = LIVES_START;
    currentLevelId = 1;
    showScreen('menu');
  };
}

// --- Level Complete Screen ---
function renderCompleteScreen(data) {
  engine.stop();
  const stars = data?.stars ?? 1;
  const starHtml = [1, 2, 3].map(i =>
    `<span class="font-pixel" style="font-size: 28px; color: ${i <= stars ? COLORS.GOLD : COLORS.GREY};">★</span>`
  ).join('');

  const nextLevelId = currentLevelId + 1;
  const nextExists = LEVELS.find(l => l.id === nextLevelId);

  // Award extra life for 3 stars
  if (stars === 3 && lives < 5) {
    lives++;
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; background: rgba(15,14,23,0.85);">
      <div style="background: ${COLORS.NAVY}; border-radius: 16px; padding: 24px; max-width: 320px; width: 90%; text-align: center;">
        <p class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 16px; margin-bottom: 16px;">LEVEL COMPLETE!</p>
        <div style="margin-bottom: 16px;">${starHtml}</div>
        <div class="font-ui" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 13px;">
          <div style="color: ${COLORS.GREY};">Time</div><div style="color: ${COLORS.WHITE};">${Math.round(data?.time ?? 0)}s</div>
          <div style="color: ${COLORS.GREY};">Score</div><div style="color: ${COLORS.GREEN};">${data?.score ?? 0}</div>
          <div style="color: ${COLORS.GREY};">Segments lost</div><div style="color: ${(data?.segmentsLost ?? 0) === 0 ? COLORS.GREEN : COLORS.RED};">${data?.segmentsLost ?? 0}</div>
        </div>
        ${stars === 3 ? `<p class="font-pixel" style="color: ${COLORS.GOLD}; font-size: 9px; margin-bottom: 12px;">+1 LIFE ❤️</p>` : ''}
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
          ${nextExists ? `<button class="btn btn-primary font-ui" id="btn-next">NEXT LEVEL →</button>` : ''}
          <button class="btn btn-secondary font-ui" id="btn-retry-complete">RETRY</button>
          <button class="btn btn-secondary font-ui" id="btn-menu-complete" style="font-size: 12px; padding: 10px;">MENU</button>
        </div>
      </div>
    </div>
  `;

  if (nextExists) {
    document.getElementById('btn-next').onclick = () => {
      currentLevelId = nextLevelId;
      showScreen('level-intro', { levelId: nextLevelId });
    };
  }
  document.getElementById('btn-retry-complete').onclick = () => showScreen('gameplay', { levelId: currentLevelId });
  document.getElementById('btn-menu-complete').onclick = () => showScreen('menu');
}

// --- Helpers ---
function renderHearts(count) {
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += `<span style="font-size: 16px; opacity: ${i < count ? 1 : 0.2};">${i < count ? '❤️' : '🖤'}</span>`;
  }
  return html;
}

function resizeCanvas(grid) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const gw = grid[0]?.length ?? BOARD_W;
  const gh = grid.length ?? BOARD_H;
  renderer.resize(w, h, gw, gh);
}

// --- Init ---
function init() {
  window.addEventListener('resize', () => {
    if (engine.session?.grid) {
      resizeCanvas(engine.session.grid);
    }
  });
  showScreen('menu');
}

// Wait for fonts then init
if (document.fonts?.ready) {
  document.fonts.ready.then(init);
} else {
  window.addEventListener('load', init);
}
