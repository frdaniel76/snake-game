export function createInput(element) {
  let dirCallback = null;
  let mode = 'swipe'; // 'swipe' | 'tap' | 'dpad'
  let currentSnakeDir = 'RIGHT'; // needed for tap-to-turn

  const SWIPE_THRESHOLD = 20; // minimum px
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  // ---- Swipe / tap handling ----

  function onTouchStart(e) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = Date.now();
    e.preventDefault();
  }

  function onTouchMove(e) {
    // Prevent scrolling and zooming while playing
    e.preventDefault();
  }

  function onTouchEnd(e) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (mode === 'swipe' || mode === 'tap') {
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

  // ---- Attach listeners ----

  element.addEventListener('touchstart', onTouchStart, { passive: false });
  element.addEventListener('touchmove', onTouchMove, { passive: false });
  element.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('keydown', onKeyDown);

  // ---- Public API ----

  return {
    /** Register a callback for direction changes. cb receives 'UP'|'DOWN'|'LEFT'|'RIGHT'. */
    onDirection(cb) {
      dirCallback = cb;
    },

    /** Set input mode: 'swipe', 'tap', or 'dpad'. */
    setMode(m) {
      mode = m;
    },

    /** Update the current snake direction (needed for tap-to-turn calculations). */
    updateSnakeDir(dir) {
      currentSnakeDir = dir;
    },

    /** Remove all event listeners. */
    destroy() {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
