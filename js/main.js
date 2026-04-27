import { COLORS, BOARD_W, BOARD_H, TILE, LIVES_START, LIVES_MAX } from './config.js';
import { loadLevel, LEVELS } from './levels.js';
import { createEngine } from './engine.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createCamera } from './camera.js';
import { gridWidth, gridHeight } from './grid.js';
import { getHead } from './snake.js';

// DOM elements
const canvas = document.getElementById('game-canvas');
const uiLayer = document.getElementById('ui-layer');

// Core systems
const renderer = createRenderer(canvas);
const engine = createEngine();
const input = createInput(canvas);
const audio = createAudio();
const camera = createCamera();
let cameraActive = false;

// World definitions
const WORLDS = [
  { id: 1, name: 'Green Meadow', color: COLORS.WORLD_1, levels: [1,2,3,4,5,6,7] },
  { id: 2, name: 'Ancient Temple', color: COLORS.WORLD_2, levels: [8,9,10,11,12,13,14] },
  { id: 3, name: 'Ice Cavern', color: COLORS.WORLD_3, levels: [15,16,17,18,19,20,21] },
  { id: 4, name: 'Shadow Forest', color: COLORS.WORLD_4, levels: [22,23,24,25,26,27,28] },
  { id: 5, name: 'Void Realm', color: COLORS.WORLD_5, levels: [29,30,31,32,33,34,35] },
];

// Game state (simple for now — full state.js comes later)
let lives = LIVES_START;
let currentLevelId = 1;
let currentScore = 0;
let levelStars = {}; // { levelId: starCount } — missing means not completed

// Settings
let settings = {
  controlScheme: 'swipe',
  soundEnabled: true,
  vibration: true,
  gridLines: true,
  screenShake: true,
};

// Persistence
function saveProgress() {
  try {
    localStorage.setItem('snake_quest_save', JSON.stringify({ levelStars, currentLevelId, lives, settings }));
  } catch (e) { /* ignore */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem('snake_quest_save');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.levelStars) levelStars = data.levelStars;
      if (data.currentLevelId) currentLevelId = data.currentLevelId;
      if (data.lives) lives = data.lives;
      if (data.settings) settings = { ...settings, ...data.settings };
    }
  } catch (e) { /* ignore */ }
  // Apply loaded settings
  input.setMode(settings.controlScheme);
  audio.setEnabled(settings.soundEnabled);
}

// --- Particle System ---
function createParticles(count, x, y, options) {
  return Array.from({ length: count }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * (options.spread || 4),
    vy: (Math.random() - 0.5) * (options.spread || 4) - (options.upward || 0),
    color: options.colors[Math.floor(Math.random() * options.colors.length)],
    size: options.size || 3,
    life: 1,
    decay: 0.015 + Math.random() * 0.01,
  }));
}

function updateAndDrawParticles(particles, ctx, scale) {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravity
    p.life -= p.decay;
    if (p.life <= 0) continue;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size * scale, p.size * scale);
  }
  ctx.globalAlpha = 1;
  return particles.some(p => p.life > 0);
}

// --- Animation State ---
let deathAnimation = null;
let celebrationAnim = null;

// --- Screen Management ---
// Screens: 'menu', 'world-map', 'level-select', 'level-intro', 'gameplay', 'death', 'complete', 'gameover'
let currentScreen = null;

function showScreen(name, data) {
  uiLayer.innerHTML = '';
  uiLayer.style.pointerEvents = 'auto';
  currentScreen = name;

  switch (name) {
    case 'menu': renderMenuScreen(); break;
    case 'settings': renderSettingsScreen(); break;
    case 'world-map': renderWorldMapScreen(); break;
    case 'level-select': renderLevelSelectScreen(data); break;
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
      <button class="btn btn-secondary font-ui" id="btn-continue" style="font-size: 12px;">CONTINUE &mdash; Level ${currentLevelId}</button>
      <button class="btn btn-secondary font-ui" id="btn-settings" style="font-size: 12px; margin-top: 4px;">SETTINGS</button>
    </div>
  `;

  document.getElementById('btn-play').onclick = () => {
    audio.resume();
    audio.buttonTap();
    showScreen('world-map');
  };
  document.getElementById('btn-continue').onclick = () => {
    audio.resume();
    audio.buttonTap();
    showScreen('level-intro', { levelId: currentLevelId });
  };
  document.getElementById('btn-settings').onclick = () => {
    audio.buttonTap();
    showScreen('settings');
  };
}

// --- Settings Screen ---
function renderSettingsScreen() {
  engine.stop();
  renderer.clear();

  function toggleHtml(id, label, isOn) {
    return `
      <div class="settings-row">
        <span class="settings-row-label">${label}</span>
        <div id="${id}" class="toggle-switch ${isOn ? 'on' : ''}" data-setting="${id}">
          <div class="toggle-knob"></div>
        </div>
      </div>
    `;
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="overflow-y: auto; justify-content: flex-start;">
      <div style="display: flex; justify-content: space-between; width: 100%; padding: 12px 16px; align-items: center;">
        <button id="btn-settings-back" class="font-ui" style="background: none; border: none; color: ${COLORS.WHITE}; font-size: 14px; padding: 8px; cursor: pointer;">&larr; Back</button>
        <h2 class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 12px;">SETTINGS</h2>
        <div style="width: 48px;"></div>
      </div>

      <div class="settings-section">
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px;">CONTROLS</h3>
        <div class="settings-toggle-group" id="control-scheme-group">
          <button data-mode="swipe" class="${settings.controlScheme === 'swipe' ? 'active' : ''}">Swipe</button>
          <button data-mode="tap" class="${settings.controlScheme === 'tap' ? 'active' : ''}">Tap</button>
          <button data-mode="dpad" class="${settings.controlScheme === 'dpad' ? 'active' : ''}">D-pad</button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px;">AUDIO</h3>
        ${toggleHtml('toggle-sound', 'Sound Effects', settings.soundEnabled)}
      </div>

      <div class="settings-section">
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px;">DISPLAY</h3>
        ${toggleHtml('toggle-vibration', 'Vibration', settings.vibration)}
        ${toggleHtml('toggle-gridlines', 'Grid Lines', settings.gridLines)}
        ${toggleHtml('toggle-screenshake', 'Screen Shake', settings.screenShake)}
      </div>

      <div class="settings-section">
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px;">DATA</h3>
        <div id="reset-container">
          <button class="btn-reset-progress" id="btn-reset">RESET PROGRESS</button>
        </div>
      </div>

      <div style="height: 32px;"></div>
    </div>
  `;

  // Back button
  document.getElementById('btn-settings-back').onclick = () => {
    audio.buttonTap();
    showScreen('menu');
  };

  // Control scheme buttons
  document.querySelectorAll('#control-scheme-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.buttonTap();
      const mode = btn.dataset.mode;
      settings.controlScheme = mode;
      input.setMode(mode);
      document.querySelectorAll('#control-scheme-group button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveProgress();
    });
  });

  // Toggle switches
  function wireToggle(id, settingKey, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      audio.buttonTap();
      settings[settingKey] = !settings[settingKey];
      el.classList.toggle('on', settings[settingKey]);
      if (onChange) onChange(settings[settingKey]);
      saveProgress();
    });
  }

  wireToggle('toggle-sound', 'soundEnabled', (on) => audio.setEnabled(on));
  wireToggle('toggle-vibration', 'vibration');
  wireToggle('toggle-gridlines', 'gridLines');
  wireToggle('toggle-screenshake', 'screenShake');

  // Reset progress
  document.getElementById('btn-reset').onclick = () => {
    audio.buttonTap();
    const container = document.getElementById('reset-container');
    container.innerHTML = `
      <p class="font-ui" style="color: ${COLORS.RED}; font-size: 13px; margin-bottom: 10px; text-align: center;">Are you sure? This cannot be undone.</p>
      <div style="display: flex; gap: 8px;">
        <button class="btn-reset-cancel" id="btn-reset-cancel">CANCEL</button>
        <button class="btn-reset-confirm" id="btn-reset-confirm">CONFIRM</button>
      </div>
    `;
    document.getElementById('btn-reset-cancel').onclick = () => {
      audio.buttonTap();
      container.innerHTML = `<button class="btn-reset-progress" id="btn-reset">RESET PROGRESS</button>`;
      document.getElementById('btn-reset').onclick = arguments.callee; // re-wire (will re-render instead)
      // Simpler: just re-render the screen
      renderSettingsScreen();
    };
    document.getElementById('btn-reset-confirm').onclick = () => {
      audio.buttonTap();
      localStorage.removeItem('snake_quest_save');
      lives = LIVES_START;
      currentLevelId = 1;
      levelStars = {};
      settings = { controlScheme: 'swipe', soundEnabled: true, vibration: true, gridLines: true, screenShake: true };
      input.setMode('swipe');
      audio.setEnabled(true);
      showScreen('menu');
    };
  };
}

// --- World Map Screen ---
function renderWorldMapScreen() {
  engine.stop();
  renderer.clear();

  function isWorldUnlocked(world) {
    if (world.id === 1) return true;
    const prevWorld = WORLDS.find(w => w.id === world.id - 1);
    if (!prevWorld) return false;
    const lastLevelId = prevWorld.levels[prevWorld.levels.length - 1];
    return (levelStars[lastLevelId] || 0) >= 1;
  }

  function getWorldStats(world) {
    let completed = 0;
    let stars = 0;
    for (const lid of world.levels) {
      if (levelStars[lid] !== undefined && levelStars[lid] >= 1) completed++;
      stars += (levelStars[lid] || 0);
    }
    return { completed, total: world.levels.length, stars, maxStars: world.levels.length * 3 };
  }

  let worldCardsHtml = '';
  for (const world of WORLDS) {
    const unlocked = isWorldUnlocked(world);
    const stats = getWorldStats(world);
    const pct = Math.round((stats.completed / stats.total) * 100);

    worldCardsHtml += `
      <div class="world-card" data-world-id="${world.id}" style="
        background: ${COLORS.NAVY}; border-radius: 14px; border: 2px solid ${world.color};
        padding: 16px; width: 90%; max-width: 340px; margin-bottom: 12px;
        cursor: ${unlocked ? 'pointer' : 'default'}; opacity: ${unlocked ? 1 : 0.4};
        position: relative;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="font-pixel" style="color: ${world.color}; font-size: 11px;">WORLD ${world.id}: ${world.name.toUpperCase()}</h3>
          <span class="font-ui" style="color: ${COLORS.GOLD}; font-size: 12px;">\u2B50 ${stats.stars}/${stats.maxStars}</span>
        </div>
        <div style="width: 100%; height: 6px; background: ${COLORS.VOID}; border-radius: 3px; margin: 10px 0 6px;">
          <div style="width: ${pct}%; height: 100%; background: ${world.color}; border-radius: 3px; transition: width 0.3s;"></div>
        </div>
        <p class="font-ui" style="color: ${COLORS.GREY}; font-size: 12px;">${stats.completed}/${stats.total} levels complete</p>
        ${!unlocked ? `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 28px;">\uD83D\uDD12</div>` : ''}
      </div>
    `;
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="overflow-y: auto; justify-content: flex-start; padding-top: 16px;">
      <button id="btn-back-worldmap" class="font-ui" style="align-self: flex-start; background: none; border: none; color: ${COLORS.WHITE}; font-size: 14px; padding: 8px 12px; cursor: pointer;">&larr; Back</button>
      <h2 class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 14px; margin: 12px 0;">WORLDS</h2>
      ${worldCardsHtml}
    </div>
  `;

  document.getElementById('btn-back-worldmap').onclick = () => {
    audio.buttonTap();
    showScreen('menu');
  };

  document.querySelectorAll('.world-card').forEach(card => {
    card.addEventListener('click', () => {
      const wid = parseInt(card.dataset.worldId);
      const world = WORLDS.find(w => w.id === wid);
      if (world && isWorldUnlocked(world)) {
        audio.buttonTap();
        showScreen('level-select', { worldId: wid });
      }
    });
  });
}

// --- Level Select Screen ---
function renderLevelSelectScreen(data) {
  engine.stop();
  renderer.clear();

  const worldId = data?.worldId ?? 1;
  const world = WORLDS.find(w => w.id === worldId);
  if (!world) { showScreen('world-map'); return; }

  function isLevelUnlocked(levelId) {
    if (levelId === 1) return true;
    // First level of a world: previous level by id must be completed
    const prevId = levelId - 1;
    return (levelStars[prevId] || 0) >= 1;
  }

  function isLevelCompleted(levelId) {
    return (levelStars[levelId] || 0) >= 1;
  }

  // Find "current" level (first uncompleted unlocked level in this world)
  let currentPlayLevel = null;
  for (const lid of world.levels) {
    if (!isLevelCompleted(lid) && isLevelUnlocked(lid)) {
      currentPlayLevel = lid;
      break;
    }
  }

  // Star count for this world
  let worldStars = 0;
  let worldMaxStars = world.levels.length * 3;
  for (const lid of world.levels) {
    worldStars += (levelStars[lid] || 0);
  }

  let nodesHtml = '';
  for (const lid of world.levels) {
    const unlocked = isLevelUnlocked(lid);
    const completed = isLevelCompleted(lid);
    const isCurrent = lid === currentPlayLevel;
    const stars = levelStars[lid] || 0;

    let borderColor = COLORS.GREY;
    if (completed) borderColor = COLORS.GREEN;
    else if (isCurrent) borderColor = world.color;
    else if (!unlocked) borderColor = COLORS.GREY;

    const levelNum = lid - world.levels[0] + 1;

    nodesHtml += `
      <div class="level-node ${isCurrent ? 'level-node-current' : ''}" data-level-id="${lid}" style="
        aspect-ratio: 1; border-radius: 14px; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 4px;
        background: ${COLORS.NAVY}; border: 2px solid ${borderColor};
        cursor: ${unlocked ? 'pointer' : 'default'};
        opacity: ${unlocked ? 1 : 0.35};
        position: relative;
      ">
        ${!unlocked ? `<span style="font-size: 20px;">\uD83D\uDD12</span>` : `
          <span class="font-pixel" style="font-size: 16px; color: ${COLORS.WHITE};">${levelNum}</span>
          <div style="display: flex; gap: 2px;">
            <span style="color: ${stars >= 1 ? COLORS.GOLD : COLORS.GREY}; font-size: 10px;">\u2605</span>
            <span style="color: ${stars >= 2 ? COLORS.GOLD : COLORS.GREY}; font-size: 10px;">\u2605</span>
            <span style="color: ${stars >= 3 ? COLORS.GOLD : COLORS.GREY}; font-size: 10px;">\u2605</span>
          </div>
        `}
      </div>
    `;
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="overflow-y: auto; justify-content: flex-start;">
      <div style="display: flex; justify-content: space-between; width: 100%; padding: 12px 16px; align-items: center;">
        <button id="btn-back-levelselect" class="font-ui" style="background: none; border: none; color: ${COLORS.WHITE}; font-size: 14px; padding: 8px; cursor: pointer;">&larr; Back</button>
        <h2 class="font-pixel" style="color: ${world.color}; font-size: 12px;">${world.name.toUpperCase()}</h2>
        <span class="font-ui" style="color: ${COLORS.GOLD}; font-size: 13px;">\u2B50 ${worldStars}/${worldMaxStars}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; width: 100%; max-width: 320px;">
        ${nodesHtml}
      </div>
    </div>
  `;

  document.getElementById('btn-back-levelselect').onclick = () => {
    audio.buttonTap();
    showScreen('world-map');
  };

  document.querySelectorAll('.level-node').forEach(node => {
    node.addEventListener('click', () => {
      const lid = parseInt(node.dataset.levelId);
      if (isLevelUnlocked(lid)) {
        audio.buttonTap();
        currentLevelId = lid;
        showScreen('level-intro', { levelId: lid });
      }
    });
  });
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
  renderer.drawBoard(levelData.grid, levelData.warpEdges);

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
    audio.resume();
    audio.buttonTap();
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

  // If camera is active, snap to the snake's starting position
  if (cameraActive) {
    const startX = levelData.snakeStart.x;
    const startY = levelData.snakeStart.y;
    camera.snapTo(startX, startY);
  }

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
    // Update camera to follow snake head
    if (cameraActive && sess.snake && sess.snake.alive) {
      const head = getHead(sess.snake);
      camera.follow(head.x, head.y, sess.snake.dir);
    }
    renderer.clear();
    renderer.drawBoard(sess.grid, sess.warpEdges);

    const ctx = renderer.ctx;
    const sc = renderer.scale;

    // Death animation
    if (deathAnimation && deathAnimation.active) {
      const elapsed = performance.now() - deathAnimation.startTime;
      const ts = TILE * sc;

      if (elapsed < 300) {
        // Flash phase: draw snake segments alternating red/white
        const flashIdx = Math.floor(elapsed / 100) % 2;
        const flashColor = flashIdx === 0 ? COLORS.RED : COLORS.WHITE;
        for (const seg of deathAnimation.segments) {
          const px = renderer.tileToPixel(seg.x, seg.y);
          ctx.fillStyle = flashColor;
          ctx.fillRect(px.x, px.y, ts, ts);
        }
      } else {
        // Scatter phase: create particles on first frame, then animate
        if (!deathAnimation.particles) {
          const particles = [];
          for (const seg of deathAnimation.segments) {
            const px = renderer.tileToPixel(seg.x, seg.y);
            const cx = deathAnimation.collisionPoint.x;
            const cy = deathAnimation.collisionPoint.y;
            const dx = px.x - cx;
            const dy = px.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            particles.push({
              x: px.x + ts / 2,
              y: px.y + ts / 2,
              vx: (dx / dist) * (2 + Math.random() * 3),
              vy: (dy / dist) * (2 + Math.random() * 3),
              color: COLORS.GREEN,
              size: 4,
              life: 1,
              decay: 0.018 + Math.random() * 0.012,
            });
          }
          deathAnimation.particles = particles;
        }
        updateAndDrawParticles(deathAnimation.particles, ctx, sc);
      }
    } else if (celebrationAnim && celebrationAnim.active) {
      // Draw snake normally during celebration
      renderer.drawSnake(sess.snake, interp, sess.prevSegments);
      // Overlay confetti
      updateAndDrawParticles(celebrationAnim.particles, ctx, sc);
    } else {
      renderer.drawSnake(sess.snake, interp, sess.prevSegments);
    }
  };

  engine.onScoreChange = (score) => {
    const el = document.getElementById('hud-score');
    if (el) el.textContent = score;
  };

  engine.onFoodEaten = (type) => {
    if (type === 'golden') {
      audio.eatGolden();
    } else {
      audio.eatFood();
    }
  };

  engine.onHeartCollected = () => {
    if (lives < LIVES_MAX) {
      lives++;
      audio.lifeGained();
    }
    // Update HUD hearts
    const heartsEl = document.getElementById('hud-hearts');
    if (heartsEl) heartsEl.innerHTML = renderHearts(lives);
  };

  engine.onDeath = (cause) => {
    audio.death();
    audio.lifeLost();
    lives--;

    // Capture snake segments for death animation
    const segs = session.snake.segments.map(s => ({ ...s }));
    const headSeg = segs[0];
    const headPixel = renderer.tileToPixel(headSeg.x, headSeg.y);
    deathAnimation = {
      active: true,
      startTime: performance.now(),
      segments: segs,
      collisionPoint: headPixel,
      particles: null,
      cause,
    };

    setTimeout(() => {
      deathAnimation = null;
      if (lives <= 0) {
        showScreen('gameover');
      } else {
        showScreen('death', { cause, levelId: currentLevelId });
      }
    }, 800);
  };

  engine.onLevelComplete = (stats) => {
    audio.levelComplete();

    // Spawn celebration confetti
    const canvasW = canvas.width / (window.devicePixelRatio || 1);
    const canvasH = canvas.height / (window.devicePixelRatio || 1);
    const cx = canvasW / 2;
    const cy = canvasH * 0.3;
    const confettiColors = [COLORS.GREEN, COLORS.GOLD, COLORS.BLUE, COLORS.RED, COLORS.PURPLE, COLORS.ORANGE, COLORS.ICE];
    const count = 40 + Math.floor(Math.random() * 21); // 40-60
    celebrationAnim = {
      active: true,
      startTime: performance.now(),
      particles: createParticles(count, cx, cy, { spread: 8, upward: 3, colors: confettiColors, size: 4 }),
    };

    setTimeout(() => {
      celebrationAnim = null;
      showScreen('complete', { ...stats, levelId: currentLevelId });
    }, 600);
  };

  // Pause button
  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      audio.buttonTap();
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
    audio.buttonTap();
    overlay.remove();
    engine.resume();
  };
  document.getElementById('btn-restart').onclick = () => {
    audio.buttonTap();
    engine.stop();
    showScreen('gameplay', { levelId: currentLevelId });
  };
  document.getElementById('btn-quit').onclick = () => {
    audio.buttonTap();
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

  document.getElementById('btn-retry').onclick = () => { audio.buttonTap(); showScreen('gameplay', { levelId: currentLevelId }); };
  document.getElementById('btn-quit-death').onclick = () => { audio.buttonTap(); showScreen('menu'); };
}

// --- Game Over Screen ---
function renderGameOverScreen() {
  engine.stop();
  audio.gameOver();

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
    audio.buttonTap();
    // Reset lives and continue from world start
    lives = LIVES_START;
    // Find first level of current world
    const currentLevel = LEVELS.find(l => l.id === currentLevelId);
    const worldStart = LEVELS.find(l => l.world === (currentLevel?.world ?? 1))?.id ?? 1;
    currentLevelId = worldStart;
    showScreen('menu');
  };
  document.getElementById('btn-menu-go').onclick = () => {
    audio.buttonTap();
    lives = LIVES_START;
    currentLevelId = 1;
    showScreen('menu');
  };
}

// --- Level Complete Screen ---
function renderCompleteScreen(data) {
  engine.stop();
  const stars = data?.stars ?? 1;

  // Record star progress
  const completedLevelId = data?.levelId ?? currentLevelId;
  levelStars[completedLevelId] = Math.max(levelStars[completedLevelId] || 0, stars);
  saveProgress();

  const starHtml = [1, 2, 3].map(i =>
    `<span class="font-pixel" style="font-size: 28px; color: ${i <= stars ? COLORS.GOLD : COLORS.GREY};">★</span>`
  ).join('');

  const nextLevelId = currentLevelId + 1;
  const nextExists = LEVELS.find(l => l.id === nextLevelId);

  // Award extra life for 3 stars
  if (stars === 3 && lives < LIVES_MAX) {
    lives++;
    audio.lifeGained();
  }

  // Play star sounds with staggered timing
  for (let i = 0; i < stars; i++) {
    setTimeout(() => audio.starAwarded(), 200 + i * 250);
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
      audio.buttonTap();
      currentLevelId = nextLevelId;
      showScreen('level-intro', { levelId: nextLevelId });
    };
  }
  document.getElementById('btn-retry-complete').onclick = () => { audio.buttonTap(); showScreen('gameplay', { levelId: currentLevelId }); };
  document.getElementById('btn-menu-complete').onclick = () => { audio.buttonTap(); showScreen('menu'); };
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
  const { viewTilesW, viewTilesH } = renderer.resize(w, h, gw, gh);

  // Update camera if active (board is larger than viewport)
  if (camera.needsCamera(gw, gh, viewTilesW, viewTilesH)) {
    camera.init(gw, gh, viewTilesW, viewTilesH);
    cameraActive = true;
    renderer.setCamera(camera);
    // Re-snap to snake head if mid-game (e.g. orientation change on mobile)
    if (engine.session?.snake) {
      const head = getHead(engine.session.snake);
      camera.snapTo(head.x, head.y);
    }
  } else {
    cameraActive = false;
    renderer.setCamera(null);
  }
}

// --- Init ---
function init() {
  loadProgress();
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
