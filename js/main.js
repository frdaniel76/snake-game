import { COLORS, BOARD_W, BOARD_H, TILE, LIVES_START, LIVES_MAX, ELEM, OPPOSITE } from './config.js';
import { loadLevel, LEVELS } from './levels.js';
import { createEngine } from './engine.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createCamera } from './camera.js';
import { gridWidth, gridHeight, findTiles } from './grid.js';
import { getHead, getLength } from './snake.js';
import { setSkin, getSkin, SKINS } from './sprites.js';

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
  controlScheme: 'tap',
  soundEnabled: true,
  soundTheme: 'classic',
  snakeSkin: 'classic',
  vibration: true,
  gridLines: true,
  screenShake: true,
};

// Stats tracking
let stats = {
  totalDeaths: 0,
  totalFoodEaten: 0,
  totalPlayTime: 0,     // seconds
  longestSnake: 0,
  levelsCompleted: 0,    // computed from levelStars
  perfectLevels: 0,      // computed from levelStars
};

// Session play time tracker (wall-clock based)
let sessionPlayStart = null;

// Lives regeneration timer (5 min per life)
const LIFE_REGEN_MS = 5 * 60 * 1000; // 5 minutes
let lifeRegenTimestamp = null; // when lives first dropped below max (null = full)
let lifeTimerInterval = null;

function regenerateLives() {
  if (lives >= LIVES_MAX || !lifeRegenTimestamp) return;
  const elapsed = Date.now() - lifeRegenTimestamp;
  const gained = Math.floor(elapsed / LIFE_REGEN_MS);
  if (gained > 0) {
    lives = Math.min(LIVES_MAX, lives + gained);
    lifeRegenTimestamp = lives >= LIVES_MAX ? null : lifeRegenTimestamp + gained * LIFE_REGEN_MS;
    saveProgress();
  }
}

function startLifeTimer() {
  if (lifeTimerInterval) clearInterval(lifeTimerInterval);
  lifeTimerInterval = setInterval(() => {
    if (lives < LIVES_MAX) {
      regenerateLives();
      updateLifeTimerDisplay();
    }
  }, 1000);
}

function getNextLifeCountdown() {
  if (lives >= LIVES_MAX || !lifeRegenTimestamp) return null;
  const elapsed = Date.now() - lifeRegenTimestamp;
  const remaining = LIFE_REGEN_MS - (elapsed % LIFE_REGEN_MS);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateLifeTimerDisplay() {
  const timerEl = document.getElementById('life-timer');
  if (!timerEl) return;
  if (lives >= LIVES_MAX) {
    timerEl.textContent = 'FULL';
    timerEl.style.color = COLORS.GREEN;
  } else {
    const cd = getNextLifeCountdown();
    timerEl.textContent = cd ? `Next: ${cd}` : '';
    timerEl.style.color = COLORS.GREY;
  }
  // Also update heart display if visible
  const heartsEl = document.getElementById('menu-hearts');
  if (heartsEl) heartsEl.innerHTML = renderHearts(lives);
}

function onLifeLost() {
  lives--;
  if (lives < LIVES_MAX && !lifeRegenTimestamp) {
    lifeRegenTimestamp = Date.now();
  }
  saveProgress();
}

// Persistence
function saveProgress() {
  try {
    localStorage.setItem('snake_quest_save', JSON.stringify({ levelStars, currentLevelId, lives, lifeRegenTimestamp, settings, stats }));
  } catch (e) { /* ignore */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem('snake_quest_save');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.levelStars) levelStars = data.levelStars;
      if (data.currentLevelId) currentLevelId = data.currentLevelId;
      if (data.lives != null) lives = data.lives;
      if (data.lifeRegenTimestamp) lifeRegenTimestamp = data.lifeRegenTimestamp;
      if (data.settings) settings = { ...settings, ...data.settings };
      if (data.stats) stats = { ...stats, ...data.stats };
    }
  } catch (e) { /* ignore */ }
  // Regenerate any lives earned while app was closed
  regenerateLives();
  // Apply loaded settings
  // Migrate old settings to new modes
  if (settings.controlScheme === 'swipe' || settings.controlScheme === 'dpad+swipe') {
    settings.controlScheme = settings.controlScheme === 'swipe' ? 'tap' : 'dpad+tap';
  }
  input.setMode(settings.controlScheme);
  audio.setEnabled(settings.soundEnabled);
  audio.setTheme(settings.soundTheme || 'classic');
  setSkin(settings.snakeSkin || 'classic');
  renderer.rebuildSpriteCache();
}

// Compute derived stats from levelStars
function computeDerivedStats() {
  let completed = 0;
  let perfect = 0;
  for (const key of Object.keys(levelStars)) {
    if (levelStars[key] >= 1) completed++;
    if (levelStars[key] === 3) perfect++;
  }
  stats.levelsCompleted = completed;
  stats.perfectLevels = perfect;
}

// Helper to record elapsed play time for a session
function recordSessionPlayTime() {
  if (sessionPlayStart !== null) {
    stats.totalPlayTime += (Date.now() - sessionPlayStart) / 1000;
    sessionPlayStart = null;
  }
}

// World unlock check (module scope so multiple screens can use it)
function isWorldUnlocked(world) {
  if (world.id === 1) return true;
  const prevWorld = WORLDS.find(w => w.id === world.id - 1);
  if (!prevWorld) return false;
  const lastLevelId = prevWorld.levels[prevWorld.levels.length - 1];
  return (levelStars[lastLevelId] || 0) >= 1;
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

// --- Countdown Overlay ---
function showCountdown(callback) {
  const nums = ['3', '2', '1', 'GO!'];
  let i = 0;
  const el = document.createElement('div');
  el.className = 'countdown-overlay';
  el.innerHTML = `<span class="font-pixel countdown-num">${nums[0]}</span>`;
  uiLayer.appendChild(el);

  const interval = setInterval(() => {
    i++;
    if (i >= nums.length) {
      clearInterval(interval);
      el.remove();
      callback();
      return;
    }
    el.querySelector('.countdown-num').textContent = nums[i];
    if (nums[i] === 'GO!') {
      el.querySelector('.countdown-num').style.color = COLORS.GREEN;
    }
    // Re-trigger animation
    const span = el.querySelector('.countdown-num');
    span.style.animation = 'none';
    span.offsetHeight; // reflow
    span.style.animation = '';
  }, 600);
}

// --- Screen Management ---
// Screens: 'menu', 'world-map', 'level-select', 'level-intro', 'gameplay', 'death', 'complete', 'gameover', 'stats', 'world-complete'
let currentScreen = null;

function showScreen(name, data) {
  uiLayer.innerHTML = '';
  currentScreen = name;

  switch (name) {
    case 'menu': renderMenuScreen(); break;
    case 'settings': renderSettingsScreen(); break;
    case 'stats': renderStatsScreen(); break;
    case 'world-map': renderWorldMapScreen(); break;
    case 'level-select': renderLevelSelectScreen(data); break;
    case 'level-intro': renderLevelIntroScreen(data); break;
    case 'gameplay': startGameplay(data?.levelId ?? currentLevelId); break;
    case 'death': renderDeathScreen(data); break;
    case 'complete': renderCompleteScreen(data); break;
    case 'world-complete': renderWorldCompleteScreen(data); break;
    case 'gameover': renderGameOverScreen(); break;
  }
}

// --- Menu Screen ---
function renderMenuScreen() {
  engine.stop();
  renderer.clear();

  // Regenerate lives before showing menu
  regenerateLives();
  startLifeTimer();

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; gap: 24px;">
      <h1 class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 28px; text-align: center;">SNAKE</h1>
      <p class="font-ui" style="color: ${COLORS.WHITE}; opacity: 0.6; font-size: 14px;">Level Quest</p>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div id="menu-hearts" style="display: flex; gap: 8px;">${renderHearts(lives)}</div>
        <span id="life-timer" class="font-ui" style="font-size: 11px; color: ${lives >= LIVES_MAX ? COLORS.GREEN : COLORS.GREY};">${lives >= LIVES_MAX ? 'FULL' : 'Next: ' + (getNextLifeCountdown() || '...')}</span>
      </div>
      <button class="btn btn-primary font-ui" id="btn-continue">CONTINUE &mdash; Level ${currentLevelId}</button>
      <button class="btn btn-secondary font-ui" id="btn-play" style="font-size: 12px;">CHOOSE LEVEL</button>
      <button class="btn btn-secondary font-ui" id="btn-settings" style="font-size: 12px; margin-top: 4px;">SETTINGS</button>
      <button class="btn btn-secondary font-ui" id="btn-stats" style="font-size: 12px; margin-top: 4px;">STATS</button>
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
  document.getElementById('btn-stats').onclick = () => {
    audio.buttonTap();
    showScreen('stats');
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
        <div class="settings-toggle-group settings-toggle-group-4" id="control-scheme-group">
          <button data-mode="tap" class="${settings.controlScheme === 'tap' ? 'active' : ''}">Tap</button>
          <button data-mode="dpad" class="${settings.controlScheme === 'dpad' ? 'active' : ''}">D-pad</button>
          <button data-mode="dual" class="${settings.controlScheme === 'dual' ? 'active' : ''}">Dual</button>
          <button data-mode="dpad+tap" class="${settings.controlScheme === 'dpad+tap' ? 'active' : ''}">Both</button>
        </div>
        <div class="font-ui" style="color: ${COLORS.GREY}; font-size: 10px; margin-top: 8px; line-height: 1.4;" id="control-desc">${
          settings.controlScheme === 'tap' ? 'Tap left/right half of screen to turn' :
          settings.controlScheme === 'dpad' ? '4-way directional pad' :
          settings.controlScheme === 'dual' ? 'Two zones: left = turn left, right = turn right' :
          'D-pad + tap anywhere to turn'
        }</div>
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px; margin-top: 14px;">TRY IT</h3>
        <div id="control-test-area" class="control-test-area">
          <div id="control-test-arrow" class="control-test-arrow">&#x25B6;</div>
          <div id="control-test-hint" class="font-ui" style="color: ${COLORS.GREY}; font-size: 11px; position: absolute; bottom: 8px; width: 100%; text-align: center;">${
            settings.controlScheme === 'dpad' || settings.controlScheme === 'dpad+tap' ? 'Tap the D-pad buttons' :
            settings.controlScheme === 'dual' ? 'Tap left or right zone' :
            'Tap left/right side'
          }</div>
          <div id="control-test-dpad" style="display: ${settings.controlScheme === 'dpad' || settings.controlScheme === 'dpad+tap' ? 'grid' : 'none'};" class="control-test-dpad">
            <button class="dpad-btn dpad-up" data-dir="UP">&#x25B2;</button>
            <button class="dpad-btn dpad-left" data-dir="LEFT">&#x25C4;</button>
            <button class="dpad-btn dpad-right" data-dir="RIGHT">&#x25BA;</button>
            <button class="dpad-btn dpad-down" data-dir="DOWN">&#x25BC;</button>
          </div>
          <div id="control-test-dual" style="display: ${settings.controlScheme === 'dual' ? 'flex' : 'none'};" class="control-test-dual">
            <div class="control-test-dual-zone" data-side="left">&#x21B6;</div>
            <div class="control-test-dual-zone" data-side="right">&#x21B7;</div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px;">AUDIO</h3>
        ${toggleHtml('toggle-sound', 'Sound Effects', settings.soundEnabled)}
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px; margin-top: 14px;">SOUND THEME</h3>
        <div class="settings-toggle-group settings-toggle-group-4" id="sound-theme-group">
          <button data-theme="classic" class="${settings.soundTheme === 'classic' ? 'active' : ''}">Classic</button>
          <button data-theme="synth" class="${settings.soundTheme === 'synth' ? 'active' : ''}">Synth</button>
          <button data-theme="minimal" class="${settings.soundTheme === 'minimal' ? 'active' : ''}">Minimal</button>
          <button data-theme="retro" class="${settings.soundTheme === 'retro' ? 'active' : ''}">Retro</button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px;">SNAKE SKIN</h3>
        <div class="settings-toggle-group settings-toggle-group-4" id="snake-skin-group">
          ${Object.entries(SKINS).map(([id, skin]) => `<button data-skin="${id}" class="${settings.snakeSkin === id ? 'active' : ''}" style="${settings.snakeSkin === id ? '' : `color: ${skin.primary};`}">${skin.name}</button>`).join('')}
        </div>
        <div id="skin-preview" style="display: flex; gap: 4px; justify-content: center; margin-top: 10px;">
          ${(() => { const s = SKINS[settings.snakeSkin] || SKINS.classic; return `<div style="width: 20px; height: 20px; border-radius: 6px; background: ${s.primary};"></div><div style="width: 20px; height: 20px; border-radius: 4px; background: ${s.secondary};"></div><div style="width: 20px; height: 20px; border-radius: 4px; background: ${s.primary};"></div><div style="width: 20px; height: 20px; border-radius: 4px; background: ${s.secondary};"></div><div style="width: 16px; height: 16px; border-radius: 3px; background: ${s.primary}; align-self: center;"></div>`; })()}
        </div>
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

  // --- Control test area ---
  const testArea = document.getElementById('control-test-area');
  const testArrow = document.getElementById('control-test-arrow');
  const testHint = document.getElementById('control-test-hint');
  const testDpad = document.getElementById('control-test-dpad');
  const testDual = document.getElementById('control-test-dual');
  const controlDesc = document.getElementById('control-desc');
  const arrowChars = { UP: '\u25B2', DOWN: '\u25BC', LEFT: '\u25C4', RIGHT: '\u25BA' };
  const arrowRotations = { UP: '-90deg', DOWN: '90deg', LEFT: '180deg', RIGHT: '0deg' };
  let testResetTimer = null;

  function showTestDirection(dir) {
    testArrow.textContent = arrowChars[dir] || '\u25BA';
    testArrow.style.transform = `translate(-50%, -50%) rotate(${arrowRotations[dir] || '0deg'})`;
    testArrow.classList.add('flash');
    // Flash the side of the test area for visual feedback
    testArea.classList.remove('flash-left', 'flash-right');
    if (dir === 'LEFT') testArea.classList.add('flash-left');
    else if (dir === 'RIGHT') testArea.classList.add('flash-right');
    clearTimeout(testResetTimer);
    testResetTimer = setTimeout(() => {
      testArrow.classList.remove('flash');
      testArea.classList.remove('flash-left', 'flash-right');
    }, 400);
  }

  const modeHints = { tap: 'Tap left/right side', dpad: 'Tap the D-pad buttons', dual: 'Tap left or right zone', 'dpad+tap': 'D-pad + tap to turn' };
  const modeDescs = { tap: 'Tap left/right half of screen to turn', dpad: '4-way directional pad', dual: 'Two zones: left = turn left, right = turn right', 'dpad+tap': 'D-pad + tap anywhere to turn' };

  function updateTestAreaForMode(mode) {
    testHint.textContent = modeHints[mode] || '';
    controlDesc.textContent = modeDescs[mode] || '';
    testDpad.style.display = (mode === 'dpad' || mode === 'dpad+tap') ? 'grid' : 'none';
    testDual.style.display = mode === 'dual' ? 'flex' : 'none';
  }

  // Tap handling on the test area (works for tap, dual, dpad+tap)
  function handleTestTap(x) {
    const scheme = settings.controlScheme;
    if (scheme === 'dpad') return;
    const rect = testArea.getBoundingClientRect();
    const side = x < rect.left + rect.width / 2 ? 'LEFT' : 'RIGHT';
    showTestDirection(side);
  }
  testArea.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    const t = e.touches[0];
    handleTestTap(t.clientX);
  }, { passive: true });
  testArea.addEventListener('click', (e) => {
    handleTestTap(e.clientX);
  });

  // D-pad buttons in test area
  testDpad.querySelectorAll('.dpad-btn').forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTestDirection(btn.dataset.dir);
    }, { passive: false });
    btn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      showTestDirection(btn.dataset.dir);
    });
  });

  // Dual-pad zones in test area
  testDual.querySelectorAll('.control-test-dual-zone').forEach(zone => {
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showTestDirection(zone.dataset.side === 'left' ? 'LEFT' : 'RIGHT');
    }, { passive: false });
    zone.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      showTestDirection(zone.dataset.side === 'left' ? 'LEFT' : 'RIGHT');
    });
  });

  // Control scheme buttons
  document.querySelectorAll('#control-scheme-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.buttonTap();
      const mode = btn.dataset.mode;
      settings.controlScheme = mode;
      input.setMode(mode);
      document.querySelectorAll('#control-scheme-group button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateTestAreaForMode(mode);
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

  // Sound theme buttons
  document.querySelectorAll('#sound-theme-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.theme;
      settings.soundTheme = t;
      audio.setTheme(t);
      document.querySelectorAll('#sound-theme-group button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveProgress();
      // Preview the selected theme
      audio.preview(t);
    });
  });

  // Snake skin buttons
  document.querySelectorAll('#snake-skin-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      const skinId = btn.dataset.skin;
      settings.snakeSkin = skinId;
      setSkin(skinId);
      renderer.rebuildSpriteCache();
      document.querySelectorAll('#snake-skin-group button').forEach(b => {
        b.classList.remove('active');
        const s = SKINS[b.dataset.skin];
        b.style.color = s ? s.primary : '';
      });
      btn.classList.add('active');
      btn.style.color = '';
      // Update preview
      const skin = SKINS[skinId] || SKINS.classic;
      const preview = document.getElementById('skin-preview');
      if (preview) {
        preview.innerHTML = `
          <div style="width: 20px; height: 20px; border-radius: 6px; background: ${skin.primary};"></div>
          <div style="width: 20px; height: 20px; border-radius: 4px; background: ${skin.secondary};"></div>
          <div style="width: 20px; height: 20px; border-radius: 4px; background: ${skin.primary};"></div>
          <div style="width: 20px; height: 20px; border-radius: 4px; background: ${skin.secondary};"></div>
          <div style="width: 16px; height: 16px; border-radius: 3px; background: ${skin.primary}; align-self: center;"></div>
        `;
      }
      saveProgress();
      audio.buttonTap();
    });
  });

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
      lifeRegenTimestamp = null;
      currentLevelId = 1;
      levelStars = {};
      settings = { controlScheme: 'tap', soundEnabled: true, soundTheme: 'classic', snakeSkin: 'classic', vibration: true, gridLines: true, screenShake: true };
      stats = { totalDeaths: 0, totalFoodEaten: 0, totalPlayTime: 0, longestSnake: 0, levelsCompleted: 0, perfectLevels: 0 };
      input.setMode('tap');
      audio.setEnabled(true);
      showScreen('menu');
    };
  };
}

// --- Stats Screen ---
function renderStatsScreen() {
  engine.stop();
  renderer.clear();
  computeDerivedStats();

  const totalLevels = LEVELS.length;
  const totalPossibleStars = totalLevels * 3;
  let totalStars = 0;
  for (const key of Object.keys(levelStars)) {
    totalStars += (levelStars[key] || 0);
  }
  const starPct = Math.round((totalStars / totalPossibleStars) * 100);

  // Format play time
  function formatTime(seconds) {
    const s = Math.floor(seconds);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const rm = m % 60;
    if (h > 0) return `${h}h ${rm}m`;
    return `${m}m ${s % 60}s`;
  }

  // Per-world breakdown
  let worldBreakdownHtml = '';
  for (const world of WORLDS) {
    let wStars = 0;
    let wCompleted = 0;
    const wMax = world.levels.length;
    for (const lid of world.levels) {
      wStars += (levelStars[lid] || 0);
      if ((levelStars[lid] || 0) >= 1) wCompleted++;
    }
    const wPct = Math.round((wCompleted / wMax) * 100);
    worldBreakdownHtml += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(85,85,104,0.2);">
        <span class="font-ui" style="color: ${world.color}; font-size: 12px; font-weight: 600;">${world.name}</span>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span class="font-ui" style="color: ${COLORS.GOLD}; font-size: 11px;">\u2B50 ${wStars}/${wMax * 3}</span>
          <span class="font-ui" style="color: ${COLORS.GREY}; font-size: 11px;">${wPct}%</span>
        </div>
      </div>
    `;
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="overflow-y: auto; justify-content: flex-start;">
      <div style="display: flex; justify-content: space-between; width: 100%; padding: 12px 16px; align-items: center;">
        <button id="btn-stats-back" class="font-ui" style="background: none; border: none; color: ${COLORS.WHITE}; font-size: 14px; padding: 8px; cursor: pointer;">&larr; Back</button>
        <h2 class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 12px;">STATS</h2>
        <div style="width: 48px;"></div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; width: 100%; max-width: 340px;">
        <div class="stat-card">
          <span class="font-pixel stat-card-value">${stats.totalDeaths}</span>
          <span class="font-ui stat-card-label">Deaths</span>
        </div>
        <div class="stat-card">
          <span class="font-pixel stat-card-value">${stats.totalFoodEaten}</span>
          <span class="font-ui stat-card-label">Eaten</span>
        </div>
        <div class="stat-card">
          <span class="font-pixel stat-card-value">${stats.levelsCompleted}/${totalLevels}</span>
          <span class="font-ui stat-card-label">Complete</span>
        </div>
        <div class="stat-card">
          <span class="font-pixel stat-card-value">${stats.perfectLevels}/${totalLevels}</span>
          <span class="font-ui stat-card-label">Perfect</span>
        </div>
        <div class="stat-card">
          <span class="font-pixel stat-card-value">${formatTime(stats.totalPlayTime)}</span>
          <span class="font-ui stat-card-label">Playtime</span>
        </div>
        <div class="stat-card">
          <span class="font-pixel stat-card-value">${stats.longestSnake}</span>
          <span class="font-ui stat-card-label">Longest</span>
        </div>
      </div>

      <div style="padding: 16px; width: 100%; max-width: 340px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="font-ui" style="color: ${COLORS.WHITE}; font-size: 13px;">Total stars</span>
          <span class="font-ui" style="color: ${COLORS.GOLD}; font-size: 13px;">${totalStars}/${totalPossibleStars}</span>
        </div>
        <div style="width: 100%; height: 10px; background: ${COLORS.VOID}; border-radius: 5px; overflow: hidden;">
          <div style="width: ${starPct}%; height: 100%; background: ${COLORS.GREEN}; border-radius: 5px; transition: width 0.3s;"></div>
        </div>
      </div>

      <div style="padding: 0 16px; width: 100%; max-width: 340px;">
        <h3 class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px; margin-bottom: 8px;">PER WORLD</h3>
        ${worldBreakdownHtml}
      </div>

      <div style="height: 32px;"></div>
    </div>
  `;

  document.getElementById('btn-stats-back').onclick = () => {
    audio.buttonTap();
    showScreen('menu');
  };
}

// --- World Map Screen ---
function renderWorldMapScreen() {
  engine.stop();
  renderer.clear();

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
    // Visual hint icons for new mechanics
    const mechIcons = {
      'Wall': '🧱', 'Food': '🍎', 'Golden Apple': '🌟', 'Exit Door': '🚪',
      'Portal': '🌀', 'Key & Gate': '🔑', 'Breakable Wall': '💥',
      'One-Way Gate': '➡️', 'Ice Patch': '🧊', 'Speed Pad': '⚡',
      'Slow Pad': '🐌', 'Poison Apple': '☠️', 'Moving Obstacle': '👾',
      'Timed Food': '⏱️', 'Warp Edges': '🔄', 'Heart': '❤️',
    };
    const icon = mechIcons[levelDef.newMechanic.name] || '✨';
    mechanicHtml = `
      <div style="background: ${COLORS.GOLD}22; border: 2px solid ${COLORS.GOLD}; border-radius: 10px; padding: 14px 16px; margin-top: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 20px;">${icon}</span>
          <span class="font-pixel" style="color: ${COLORS.GOLD}; font-size: 10px;">NEW: ${levelDef.newMechanic.name.toUpperCase()}</span>
        </div>
        <p class="font-ui" style="color: ${COLORS.WHITE}; font-size: 13px; line-height: 1.4;">${levelDef.newMechanic.description}</p>
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
  // Load level
  const levelData = loadLevel(levelId);
  currentLevelId = levelId;
  resizeCanvas(levelData.grid);

  // Count initial food for HUD
  const initialFoodCount =
    findTiles(levelData.grid, ELEM.FOOD).length +
    findTiles(levelData.grid, ELEM.GOLDEN_FOOD).length +
    findTiles(levelData.grid, ELEM.TIMED_FOOD).length;
  let foodRemaining = initialFoodCount;

  // Detect if level has food-based goal
  const showFoodCounter = levelData.goal.type === 'eat-all' || levelData.goal.type === 'eat-all-and-exit';

  // Detect keys in level for HUD inventory
  const levelKeys = findTiles(levelData.grid, ELEM.KEY);
  const allKeyColors = levelKeys.map(k => k.data?.color).filter(Boolean);

  // Build HUD bottom row with food counter and key inventory
  let hudBottomHtml = '';
  if (showFoodCounter) {
    hudBottomHtml += `<span id="hud-food-count" class="font-pixel" style="color: ${COLORS.WHITE}; font-size: 10px; opacity: 0.8;">\uD83C\uDF4E ${foodRemaining}/${initialFoodCount}</span>`;
  }
  if (allKeyColors.length > 0) {
    const keyDotsHtml = allKeyColors.map(color =>
      `<span class="hud-key-dot" data-key-color="${color}" style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 2px solid ${color}; background: transparent;"></span>`
    ).join('');
    hudBottomHtml += `<span id="hud-keys" style="display: flex; gap: 4px; align-items: center; margin-left: 12px;">${keyDotsHtml}</span>`;
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="pointer-events: none; justify-content: flex-start; padding: 8px 16px;">
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; pointer-events: auto;">
        <button id="btn-pause" class="font-pixel" style="background: none; border: none; color: ${COLORS.WHITE}; font-size: 16px; padding: 8px; cursor: pointer;">\u23F8</button>
        <div id="hud-score" class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 11px;">0</div>
        <div id="hud-hearts" style="display: flex; gap: 4px;">${renderHearts(lives)}</div>
      </div>
      <div id="hud-goal" class="font-ui" style="color: ${COLORS.WHITE}; opacity: 0.5; font-size: 11px; text-align: center; width: 100%; margin-top: 4px; transition: opacity 1s;"></div>
      ${hudBottomHtml ? `<div style="display: flex; align-items: center; width: 100%; margin-top: 6px; pointer-events: none;">${hudBottomHtml}</div>` : ''}
    </div>
  `;

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
  const goalTexts = { 'eat-all': 'Eat all apples', 'reach-exit': 'Reach the exit', 'eat-all-and-exit': 'Eat all apples \u2192 reach exit' };
  if (goalEl) {
    goalEl.textContent = goalTexts[levelData.goal.type] || '';
    setTimeout(() => { if (goalEl) goalEl.style.opacity = '0'; }, 3000);
  }

  // Initialize input queue on the session
  session.inputQueue = [];

  // Activate touch input for gameplay — sync snake direction for relative turns
  input.setActive(true);
  input.updateSnakeDir(levelData.snakeStart.dir.toUpperCase());

  // Show control overlays (D-pad, dual pad) for modes that need them
  if (settings.controlScheme !== 'tap') {
    input.showDpad();
  }

  // Wire input — push to queue instead of direct changeDirection
  input.onDirection(dir => {
    if (!engine.session) return;
    const queue = engine.session.inputQueue;
    if (!queue) return;
    // Validate against reverse: check the last queued direction (or current snake dir if queue empty)
    const lastDir = queue.length > 0 ? queue[queue.length - 1] : engine.session.snake.dir;
    if (dir === OPPOSITE[lastDir]) return; // reject 180-degree turn
    if (queue.length < 2) {
      queue.push(dir);
    }
    input.updateSnakeDir(dir);
  });

  // Wire engine callbacks
  engine.onRender = (sess, interp) => {
    // Update camera to follow snake head
    if (cameraActive && sess.snake && sess.snake.alive) {
      const head = getHead(sess.snake);
      camera.follow(head.x, head.y);
    }
    renderer.clear();
    renderer.drawBoard(sess.grid, sess.warpEdges);

    const ctx = renderer.ctx;
    const sc = renderer.scale;

    // Update key inventory HUD (poll keysCollected from session)
    if (allKeyColors.length > 0) {
      const dots = document.querySelectorAll('.hud-key-dot');
      dots.forEach(dot => {
        const color = dot.dataset.keyColor;
        if (sess.keysCollected.has(color)) {
          dot.style.background = color;
        }
      });
    }

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
      renderer.drawSnake(sess.snake, interp, sess.prevSegments, sess);
      // Overlay confetti
      updateAndDrawParticles(celebrationAnim.particles, ctx, sc);
    } else {
      renderer.drawSnake(sess.snake, interp, sess.prevSegments, sess);
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

    // Stats: track food eaten and longest snake
    stats.totalFoodEaten++;
    const snakeLen = getLength(session.snake);
    if (snakeLen > stats.longestSnake) {
      stats.longestSnake = snakeLen;
    }

    // Update food counter HUD
    if (showFoodCounter) {
      foodRemaining = findTiles(session.grid, ELEM.FOOD).length +
        findTiles(session.grid, ELEM.GOLDEN_FOOD).length +
        findTiles(session.grid, ELEM.TIMED_FOOD).length;
      const fcEl = document.getElementById('hud-food-count');
      if (fcEl) fcEl.textContent = `\uD83C\uDF4E ${foodRemaining}/${initialFoodCount}`;
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

  engine.onKeyCollect = (color) => {
    audio.keyCollect();
  };

  engine.onDeath = (cause) => {
    audio.death();
    audio.lifeLost();
    onLifeLost();
    input.setActive(false);
    input.hideDpad();

    // Stats: track death and play time
    stats.totalDeaths++;
    recordSessionPlayTime();
    saveProgress();

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

  engine.onLevelComplete = (completionStats) => {
    audio.levelComplete();
    input.setActive(false);
    input.hideDpad();

    // Stats: track play time
    recordSessionPlayTime();
    saveProgress();

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
      showScreen('complete', { ...completionStats, levelId: currentLevelId });
    }, 600);
  };

  // Pause button
  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.onclick = () => {
      audio.buttonTap();
      engine.pause();
      input.setActive(false);
      input.hideDpad();
      recordSessionPlayTime();
      saveProgress();
      showPauseOverlay();
    };
  }

  // Render the board so it's visible behind the countdown overlay
  renderer.clear();
  renderer.drawBoard(levelData.grid, levelData.warpEdges);

  // Show countdown then start engine
  showCountdown(() => {
    sessionPlayStart = Date.now();
    engine.start();
  });
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
    showCountdown(() => {
      sessionPlayStart = Date.now();
      engine.resume();
      input.setActive(true);
      if (settings.controlScheme !== 'tap') input.showDpad();
    });
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
    // Don't reset lives — timer handles regeneration
    showScreen('menu');
  };
  document.getElementById('btn-menu-go').onclick = () => {
    audio.buttonTap();
    showScreen('menu');
  };
}

// --- Level Complete Screen ---
function renderCompleteScreen(data) {
  engine.stop();
  const stars = data?.stars ?? 1;

  const completedLevelId = data?.levelId ?? currentLevelId;

  // Check for world completion BEFORE recording stars (so we can detect first unlock)
  const completedLevel = LEVELS.find(l => l.id === completedLevelId);
  const currentWorld = completedLevel ? WORLDS.find(w => w.id === completedLevel.world) : null;
  let showWorldComplete = false;
  let nextWorld = null;

  if (currentWorld) {
    const lastLevelOfWorld = currentWorld.levels[currentWorld.levels.length - 1];
    if (completedLevelId === lastLevelOfWorld) {
      // Check if next world was locked before we record the stars
      nextWorld = WORLDS.find(w => w.id === currentWorld.id + 1);
      if (nextWorld && !isWorldUnlocked(nextWorld)) {
        showWorldComplete = true;
      }
      // Also trigger if it's the last world and all levels complete (first time only)
      if (!nextWorld) {
        const wasAlreadyCompleted = (levelStars[completedLevelId] || 0) >= 1;
        const allComplete = currentWorld.levels.every(lid => (levelStars[lid] || 0) >= 1 || lid === completedLevelId);
        if (allComplete && !wasAlreadyCompleted) showWorldComplete = true;
      }
    }
  }

  // Record star progress and advance currentLevelId
  levelStars[completedLevelId] = Math.max(levelStars[completedLevelId] || 0, stars);
  const nextLevelId = completedLevelId + 1;
  const nextExists = LEVELS.find(l => l.id === nextLevelId);
  if (nextExists) currentLevelId = nextLevelId;
  saveProgress();

  // If world complete, redirect to world-complete screen
  if (showWorldComplete) {
    showScreen('world-complete', {
      ...data,
      stars,
      completedWorld: currentWorld,
      nextWorld: nextWorld,
    });
    return;
  }

  const starHtml = [1, 2, 3].map(i =>
    `<span class="font-pixel" style="font-size: 28px; color: ${i <= stars ? COLORS.GOLD : COLORS.GREY};">\u2605</span>`
  ).join('');

  // Play star sounds with staggered timing
  for (let i = 0; i < stars; i++) {
    setTimeout(() => audio.starAwarded(), 200 + i * 250);
  }

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; background: rgba(15,14,23,0.85);">
      <div style="background: ${COLORS.NAVY}; border-radius: 16px; padding: 24px; max-width: 320px; width: 90%; text-align: center;">
        <p class="font-pixel" style="color: ${COLORS.GREY}; font-size: 9px; margin-bottom: 6px;">LEVEL ${completedLevelId}${completedLevel ? ' — ' + completedLevel.name : ''}</p>
        <p class="font-pixel" style="color: ${COLORS.GREEN}; font-size: 16px; margin-bottom: 16px;">COMPLETE!</p>
        <div style="margin-bottom: 16px;">${starHtml}</div>
        <div class="font-ui" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 13px;">
          <div style="color: ${COLORS.GREY};">Time</div><div style="color: ${COLORS.WHITE};">${Math.round(data?.time ?? 0)}s</div>
          <div style="color: ${COLORS.GREY};">Score</div><div style="color: ${COLORS.GREEN};">${data?.score ?? 0}</div>
          <div style="color: ${COLORS.GREY};">Segments lost</div><div style="color: ${(data?.segmentsLost ?? 0) === 0 ? COLORS.GREEN : COLORS.RED};">${data?.segmentsLost ?? 0}</div>
        </div>
        ${stars === 3 ? `<p class="font-pixel" style="color: ${COLORS.GOLD}; font-size: 9px; margin-bottom: 12px;">PERFECT! \u2B50</p>` : ''}
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
          ${nextExists ? `<button class="btn btn-primary font-ui" id="btn-next">NEXT LEVEL \u2192</button>` : ''}
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

// --- World Complete Screen ---
function renderWorldCompleteScreen(data) {
  engine.stop();

  const completedWorld = data?.completedWorld;
  const nextWorld = data?.nextWorld;
  const stars = data?.stars ?? 1;

  if (!completedWorld) { showScreen('menu'); return; }

  // Award +1 life for world completion
  if (lives < LIVES_MAX) {
    lives++;
    audio.lifeGained();
  }
  saveProgress();

  // Calculate world stats
  let worldStars = 0;
  const worldMaxStars = completedWorld.levels.length * 3;
  const worldLevelCount = completedWorld.levels.length;
  let worldCompleted = 0;
  for (const lid of completedWorld.levels) {
    worldStars += (levelStars[lid] || 0);
    if ((levelStars[lid] || 0) >= 1) worldCompleted++;
  }

  const nextWorldFirstLevel = nextWorld ? nextWorld.levels[0] : null;

  uiLayer.innerHTML = `
    <div class="screen active" style="justify-content: center; background: linear-gradient(135deg, ${completedWorld.color}33, ${COLORS.VOID});">
      <div style="text-align: center; max-width: 320px; width: 90%;">
        <p style="font-size: 28px; margin-bottom: 8px;">\uD83C\uDF89</p>
        <h1 class="font-pixel" style="color: ${completedWorld.color}; font-size: 14px; margin-bottom: 4px;">WORLD ${completedWorld.id} COMPLETE!</h1>
        <p class="font-ui" style="color: ${COLORS.WHITE}; font-size: 16px; margin-bottom: 20px; opacity: 0.8;">"${completedWorld.name}"</p>

        <div style="background: ${COLORS.NAVY}; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <div class="font-ui" style="display: flex; justify-content: space-around; margin-bottom: 8px;">
            <div style="text-align: center;">
              <div style="color: ${COLORS.GOLD}; font-size: 16px; font-weight: 700;">\u2B50 ${worldStars}/${worldMaxStars}</div>
              <div style="color: ${COLORS.GREY}; font-size: 11px;">Stars</div>
            </div>
            <div style="text-align: center;">
              <div style="color: ${COLORS.GREEN}; font-size: 16px; font-weight: 700;">${worldCompleted}/${worldLevelCount}</div>
              <div style="color: ${COLORS.GREY}; font-size: 11px;">Levels</div>
            </div>
          </div>
        </div>

        <div style="background: ${COLORS.NAVY}; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
          <p class="font-pixel" style="color: ${COLORS.RED}; font-size: 10px;">+1 LIFE \u2764\uFE0F</p>
        </div>

        ${nextWorld ? `
          <div style="background: ${nextWorld.color}22; border: 1px solid ${nextWorld.color}; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
            <p class="font-pixel" style="color: ${nextWorld.color}; font-size: 10px; margin-bottom: 4px;">WORLD ${nextWorld.id} UNLOCKED!</p>
            <p class="font-ui" style="color: ${COLORS.WHITE}; font-size: 13px; opacity: 0.8;">${nextWorld.name}</p>
          </div>
          <button class="btn btn-primary font-ui" id="btn-wc-continue" style="width: 100%; margin-bottom: 10px;">CONTINUE TO WORLD ${nextWorld.id}</button>
        ` : `
          <div style="background: ${COLORS.GOLD}22; border: 1px solid ${COLORS.GOLD}; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
            <p class="font-pixel" style="color: ${COLORS.GOLD}; font-size: 10px;">ALL WORLDS COMPLETE!</p>
          </div>
        `}
        <button class="btn btn-secondary font-ui" id="btn-wc-menu" style="width: 100%; font-size: 12px;">MAIN MENU</button>
      </div>
    </div>
  `;

  if (nextWorld && nextWorldFirstLevel) {
    document.getElementById('btn-wc-continue').onclick = () => {
      audio.buttonTap();
      currentLevelId = nextWorldFirstLevel;
      showScreen('level-intro', { levelId: nextWorldFirstLevel });
    };
  }
  document.getElementById('btn-wc-menu').onclick = () => {
    audio.buttonTap();
    showScreen('menu');
  };
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

// --- Debug error overlay (shows JS errors on screen for mobile debugging) ---
function showErrorOverlay(msg) {
  let overlay = document.getElementById('error-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(255,0,0,0.9);color:#fff;font:12px monospace;padding:8px;max-height:30vh;overflow-y:auto;pointer-events:auto;';
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }
  const line = document.createElement('div');
  line.textContent = msg;
  overlay.appendChild(line);
}
window.addEventListener('error', (e) => {
  showErrorOverlay(`ERR: ${e.message} @ ${e.filename?.split('/').pop()}:${e.lineno}`);
});
window.addEventListener('unhandledrejection', (e) => {
  showErrorOverlay(`PROMISE: ${e.reason}`);
});

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
