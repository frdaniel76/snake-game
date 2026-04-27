export function createCamera() {
  let x = 0, y = 0;       // camera position (top-left corner in tile coordinates)
  let viewW = 15, viewH = 20; // visible area in tiles
  let boardW = 15, boardH = 20;
  let targetX = 0, targetY = 0;
  const LERP = 0.12;      // smooth follow speed
  const LEAD = 2;          // tiles to lead ahead in movement direction

  return {
    init(bw, bh, vw, vh) {
      boardW = bw; boardH = bh;
      viewW = vw; viewH = vh;
      // Centre on board initially
      x = (bw - vw) / 2;
      y = (bh - vh) / 2;
      targetX = x; targetY = y;
    },

    follow(headX, headY, dirName) {
      // Target: centre on head with slight lead in movement direction
      const dir = { UP: {x:0,y:-1}, DOWN: {x:0,y:1}, LEFT: {x:-1,y:0}, RIGHT: {x:1,y:0} }[dirName] || {x:0,y:0};
      targetX = headX - viewW / 2 + dir.x * LEAD;
      targetY = headY - viewH / 2 + dir.y * LEAD;

      // Clamp to board bounds
      targetX = Math.max(0, Math.min(boardW - viewW, targetX));
      targetY = Math.max(0, Math.min(boardH - viewH, targetY));

      // Lerp
      x += (targetX - x) * LERP;
      y += (targetY - y) * LERP;

      // Clamp again after lerp
      x = Math.max(0, Math.min(boardW - viewW, x));
      y = Math.max(0, Math.min(boardH - viewH, y));
    },

    // Snap to position (no lerp - for level start)
    snapTo(headX, headY) {
      x = headX - viewW / 2;
      y = headY - viewH / 2;
      x = Math.max(0, Math.min(boardW - viewW, x));
      y = Math.max(0, Math.min(boardH - viewH, y));
      targetX = x; targetY = y;
    },

    get x() { return x; },
    get y() { return y; },
    get viewW() { return viewW; },
    get viewH() { return viewH; },

    // Is the camera needed? (board bigger than view)
    needsCamera(bw, bh, vw, vh) {
      return bw > vw || bh > vh;
    },
  };
}
