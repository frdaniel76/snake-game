export function createInput(element) {
  let dirCallback = null;
  let mode = 'swipe'; // 'swipe' | 'tap' | 'dpad' | 'dpad+swipe'
  let currentSnakeDir = 'RIGHT'; // needed for tap-to-turn
  let active = false; // true only during gameplay — prevents touch interference on menus

  let SWIPE_THRESHOLD = 20; // minimum px — configurable via setSensitivity
  let dpadEl = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  // ---- Swipe / tap handling ----
  // Registered on document so touches are captured regardless of z-index stacking.
  // UI buttons (menus, d-pad) have their own handlers with stopPropagation.

  function isUIElement(target) {
    // Skip touches that land on interactive UI elements (buttons, toggles, links)
    if (!target || !target.closest) return false;
    if (target.closest('.dpad-container')) return true;
    if (target.closest('button')) return true;
    if (target.closest('.toggle-switch')) return true;
    if (target.closest('a')) return true;
    return false;
  }

  function onTouchStart(e) {
    if (!active || isUIElement(e.target)) return;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = Date.now();
    e.preventDefault();
  }

  function onTouchMove(e) {
    if (!active || isUIElement(e.target)) return;
    // Prevent scrolling and zooming while playing
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (!active || isUIElement(e.target)) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (mode === 'swipe' || mode === 'tap' || mode === 'dpad+swipe') {
      if (dist >= SWIPE_THRESHOLD) {
        // Swipe detected — map to absolute direction
        if (Math.abs(dx) > Math.abs(dy)) {
          emit(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          emit(dy > 0 ? 'DOWN' : 'UP');
        }
      } else if (mode === 'tap') {
        // Short tap — turn relative to snake direction
        const tapX = t.clientX;
        const midX = window.innerWidth / 2;
        const tapSide = tapX < midX ? 'left' : 'right';
        emit(relativeTurn(currentSnakeDir, tapSide));
      }
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

  // Map a touch position to a cardinal direction based on angle from D-pad center.
  // This means ANY touch in the D-pad region registers — no need to hit exact buttons.
  function dirFromAngle(tx, ty, rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    // Dead zone in the very center (< 10px from center) — ignore
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return null;
    // Use angle to pick cardinal direction (4 quadrants, 90° each)
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    }
    return dy > 0 ? 'DOWN' : 'UP';
  }

  function highlightDpadBtn(dir) {
    if (!dpadEl) return;
    // Brief visual feedback on the matching button
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

    // Smart zone: the entire container is a touch target.
    // Any touch is mapped to a direction by angle from center.
    dpadEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.touches[0];
      const rect = dpadEl.getBoundingClientRect();
      const dir = dirFromAngle(t.clientX, t.clientY, rect);
      if (dir) {
        emit(dir);
        highlightDpadBtn(dir);
      }
    }, { passive: false });

    // Support touchmove — if finger drags to a new direction, emit that too
    dpadEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.touches[0];
      const rect = dpadEl.getBoundingClientRect();
      const dir = dirFromAngle(t.clientX, t.clientY, rect);
      if (dir) {
        emit(dir);
        highlightDpadBtn(dir);
      }
    }, { passive: false });

    // Mouse fallback for desktop testing
    dpadEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = dpadEl.getBoundingClientRect();
      const dir = dirFromAngle(e.clientX, e.clientY, rect);
      if (dir) {
        emit(dir);
        highlightDpadBtn(dir);
      }
    });
  }

  function removeDpad() {
    if (dpadEl) { dpadEl.remove(); dpadEl = null; }
  }

  // ---- Attach listeners ----
  // Touch on document (not canvas) so touches are reliably captured on all mobile browsers.
  // UI elements are filtered out in the handlers above.

  document.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('keydown', onKeyDown);

  // ---- Public API ----

  return {
    /** Register a callback for direction changes. cb receives 'UP'|'DOWN'|'LEFT'|'RIGHT'. */
    onDirection(cb) {
      dirCallback = cb;
    },

    /** Enable/disable touch input processing (use during gameplay only). */
    setActive(isActive) {
      active = isActive;
    },

    /** Set input mode: 'swipe', 'tap', 'dpad', or 'dpad+swipe'. */
    setMode(m) {
      mode = m;
      if (m !== 'dpad' && m !== 'dpad+swipe') removeDpad();
    },

    /** Show the D-pad overlay (call when entering gameplay in dpad or dpad+swipe mode). */
    showDpad() {
      if (mode === 'dpad' || mode === 'dpad+swipe') createDpad();
    },

    /** Hide the D-pad overlay (call when leaving gameplay). */
    hideDpad() {
      removeDpad();
    },

    /** Set swipe sensitivity: 'low' (40px), 'medium' (20px), 'high' (10px). */
    setSensitivity(level) {
      switch (level) {
        case 'low':    SWIPE_THRESHOLD = 40; break;
        case 'high':   SWIPE_THRESHOLD = 10; break;
        default:       SWIPE_THRESHOLD = 20; break; // medium
      }
    },

    /** Update the current snake direction (needed for tap-to-turn calculations). */
    updateSnakeDir(dir) {
      currentSnakeDir = dir;
    },

    /** Remove all event listeners. */
    destroy() {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
