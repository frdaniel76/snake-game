export function createInput(element) {
  let dirCallback = null;
  let mode = 'tap'; // 'tap' | 'dpad' | 'dual' | 'dpad+tap'
  let currentSnakeDir = 'RIGHT'; // needed for tap-to-turn and dual-pad
  let active = false; // true only during gameplay

  let dpadEl = null;
  let dualPadEl = null;

  // ---- UI element filter ----

  function isUIElement(target) {
    if (!target || !target.closest) return false;
    if (target.closest('.dpad-container')) return true;
    if (target.closest('.dual-pad')) return true;
    if (target.closest('button')) return true;
    if (target.closest('.toggle-switch')) return true;
    if (target.closest('a')) return true;
    return false;
  }

  // ---- Tap handling (document-level) ----
  // Tap mode: tap left/right half of screen to turn relative to snake direction.
  // Also active in dpad+tap combo mode.

  function onTouchStart(e) {
    if (!active || isUIElement(e.target)) return;
    e.preventDefault();
  }

  function onTouchMove(e) {
    if (!active || isUIElement(e.target)) return;
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (!active || isUIElement(e.target)) return;
    if (mode === 'tap' || mode === 'dpad+tap') {
      const t = e.changedTouches[0];
      const midX = window.innerWidth / 2;
      const tapSide = t.clientX < midX ? 'left' : 'right';
      emit(relativeTurn(currentSnakeDir, tapSide));
    }
    e.preventDefault();
  }

  // ---- Keyboard handling (desktop testing) ----

  function onKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': emit('UP');    break;
      case 'ArrowDown':  case 's': case 'S': emit('DOWN');  break;
      case 'ArrowLeft':  case 'a': case 'A': emit('LEFT');  break;
      case 'ArrowRight': case 'd': case 'D': emit('RIGHT'); break;
    }
  }

  // ---- Relative turn logic ----

  function relativeTurn(snakeDir, side) {
    const turns = {
      UP:    { left: 'LEFT',  right: 'RIGHT' },
      DOWN:  { left: 'RIGHT', right: 'LEFT' },
      LEFT:  { left: 'DOWN',  right: 'UP' },
      RIGHT: { left: 'UP',    right: 'DOWN' },
    };
    return turns[snakeDir]?.[side] ?? snakeDir;
  }

  function emit(dir) {
    if (dirCallback) dirCallback(dir);
  }

  // ---- D-pad overlay ----

  function dirFromAngle(tx, ty, rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return null;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    }
    return dy > 0 ? 'DOWN' : 'UP';
  }

  function highlightDpadBtn(dir) {
    if (!dpadEl) return;
    const btn = dpadEl.querySelector(`.dpad-${dir.toLowerCase()}`);
    if (btn) {
      btn.classList.add('active-feedback');
      setTimeout(() => btn.classList.remove('active-feedback'), 150);
    }
  }

  function createDpad() {
    if (dpadEl) dpadEl.remove();
    dpadEl = document.createElement('div');
    dpadEl.className = 'dpad-container';
    dpadEl.innerHTML = `
      <button class="dpad-btn dpad-up" data-dir="UP">▲</button>
      <button class="dpad-btn dpad-left" data-dir="LEFT">◄</button>
      <button class="dpad-btn dpad-right" data-dir="RIGHT">►</button>
      <button class="dpad-btn dpad-down" data-dir="DOWN">▼</button>
    `;
    document.body.appendChild(dpadEl);

    dpadEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.touches[0];
      const rect = dpadEl.getBoundingClientRect();
      const dir = dirFromAngle(t.clientX, t.clientY, rect);
      if (dir) { emit(dir); highlightDpadBtn(dir); }
    }, { passive: false });

    dpadEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.touches[0];
      const rect = dpadEl.getBoundingClientRect();
      const dir = dirFromAngle(t.clientX, t.clientY, rect);
      if (dir) { emit(dir); highlightDpadBtn(dir); }
    }, { passive: false });

    dpadEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = dpadEl.getBoundingClientRect();
      const dir = dirFromAngle(e.clientX, e.clientY, rect);
      if (dir) { emit(dir); highlightDpadBtn(dir); }
    });
  }

  function removeDpad() {
    if (dpadEl) { dpadEl.remove(); dpadEl = null; }
  }

  // ---- Dual-pad overlay ----
  // Two large transparent zones: left = turn left (anticlockwise), right = turn right (clockwise)

  function createDualPad() {
    if (dualPadEl) dualPadEl.remove();
    dualPadEl = document.createElement('div');
    dualPadEl.className = 'dual-pad';
    dualPadEl.innerHTML = `
      <div class="dual-pad-zone dual-pad-left" data-side="left">
        <span class="dual-pad-icon">↶</span>
      </div>
      <div class="dual-pad-zone dual-pad-right" data-side="right">
        <span class="dual-pad-icon">↷</span>
      </div>
    `;
    document.body.appendChild(dualPadEl);

    function handleDualTouch(e) {
      e.preventDefault();
      e.stopPropagation();
      const zone = e.target.closest('.dual-pad-zone');
      if (!zone) return;
      const side = zone.dataset.side;
      const dir = relativeTurn(currentSnakeDir, side);
      emit(dir);
      // Visual feedback
      zone.classList.add('active-feedback');
      setTimeout(() => zone.classList.remove('active-feedback'), 150);
    }

    dualPadEl.addEventListener('touchstart', handleDualTouch, { passive: false });
    dualPadEl.addEventListener('mousedown', handleDualTouch);
  }

  function removeDualPad() {
    if (dualPadEl) { dualPadEl.remove(); dualPadEl = null; }
  }

  // ---- Attach listeners ----

  document.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('keydown', onKeyDown);

  // ---- Public API ----

  return {
    onDirection(cb) { dirCallback = cb; },

    setActive(isActive) { active = isActive; },

    /** Set input mode: 'tap', 'dpad', 'dual', or 'dpad+tap'. */
    setMode(m) {
      mode = m;
      if (m !== 'dpad' && m !== 'dpad+tap') removeDpad();
      if (m !== 'dual') removeDualPad();
    },

    /** Show overlays for the current mode (call when entering gameplay). */
    showDpad() {
      if (mode === 'dpad' || mode === 'dpad+tap') createDpad();
      if (mode === 'dual') createDualPad();
    },

    /** Hide all overlays (call when leaving gameplay). */
    hideDpad() {
      removeDpad();
      removeDualPad();
    },

    updateSnakeDir(dir) { currentSnakeDir = dir; },

    destroy() {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
