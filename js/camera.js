export function createCamera() {
  let x = 0, y = 0;       // camera position (top-left corner in tile coords)
  let viewW = 15, viewH = 20;
  let boardW = 15, boardH = 20;
  let targetX = 0, targetY = 0;
  let lastTime = 0;

  // Smoothing: lower = smoother/slower. 0.001 = tight follow (~90% caught up in 0.3s)
  const SMOOTHING = 0.0008;
  // Dead zone: camera doesn't move if head is within this many tiles of screen center
  const DEAD_ZONE = 2;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  return {
    init(bw, bh, vw, vh) {
      boardW = bw; boardH = bh;
      viewW = vw; viewH = vh;
      x = (bw - vw) / 2;
      y = (bh - vh) / 2;
      targetX = x; targetY = y;
      lastTime = performance.now();
    },

    follow(headX, headY) {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1); // cap at 100ms to prevent jumps
      lastTime = now;

      // Desired camera center = head position
      const desiredX = headX - viewW / 2;
      const desiredY = headY - viewH / 2;

      // Dead zone: only update target if head moved beyond dead zone from current center
      const camCenterX = x + viewW / 2;
      const camCenterY = y + viewH / 2;
      const dx = headX - camCenterX;
      const dy = headY - camCenterY;

      if (Math.abs(dx) > DEAD_ZONE) {
        targetX = desiredX;
      }
      if (Math.abs(dy) > DEAD_ZONE) {
        targetY = desiredY;
      }

      // Clamp target to board bounds
      targetX = clamp(targetX, 0, boardW - viewW);
      targetY = clamp(targetY, 0, boardH - viewH);

      // Frame-rate independent exponential smoothing
      const factor = 1 - Math.pow(SMOOTHING, dt);
      x += (targetX - x) * factor;
      y += (targetY - y) * factor;

      // Clamp after smoothing
      x = clamp(x, 0, boardW - viewW);
      y = clamp(y, 0, boardH - viewH);

      // Pixel-snap to prevent sub-pixel shimmer
      // (done at a fractional tile level — renderer converts to pixels)
      x = Math.round(x * 16) / 16;
      y = Math.round(y * 16) / 16;
    },

    snapTo(headX, headY) {
      x = headX - viewW / 2;
      y = headY - viewH / 2;
      x = clamp(x, 0, boardW - viewW);
      y = clamp(y, 0, boardH - viewH);
      targetX = x; targetY = y;
      lastTime = performance.now();
    },

    get x() { return x; },
    get y() { return y; },
    get viewW() { return viewW; },
    get viewH() { return viewH; },

    needsCamera(bw, bh, vw, vh) {
      return bw > vw || bh > vh;
    },
  };
}
