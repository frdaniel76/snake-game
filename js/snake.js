import { DIR, OPPOSITE } from './config.js';

/**
 * Create a new snake. Segments are built backward from (x, y) based on dir.
 * e.g. dir=RIGHT, length=3 → head at (x,y), then (x-1,y), (x-2,y)
 */
export function createSnake(x, y, dir, length) {
  const opposite = DIR[OPPOSITE[dir]];
  const segments = [];
  for (let i = 0; i < length; i++) {
    segments.push({ x: x + opposite.x * i, y: y + opposite.y * i });
  }
  return {
    segments,
    dir,
    nextDir: dir,
    growing: 0,
    alive: true,
    speedMod: null,
    onIce: false,
  };
}

/**
 * Queue a direction change (applied on next tick). Prevents 180-degree reversal.
 */
export function changeDirection(snake, newDir) {
  if (newDir === OPPOSITE[snake.dir]) return;
  snake.nextDir = newDir;
}

/**
 * Move the snake one tile in its current direction.
 * Returns { newHead: {x,y}, removedTail: {x,y}|null }
 */
export function moveSnake(snake) {
  // 1. Commit the queued direction
  snake.dir = snake.nextDir;

  // 2. Calculate new head position
  const head = snake.segments[0];
  const d = DIR[snake.dir];
  const newHead = { x: head.x + d.x, y: head.y + d.y };

  // 3. Unshift new head into segments
  snake.segments.unshift(newHead);

  // 4. Handle growth or tail removal
  let removedTail = null;
  if (snake.growing > 0) {
    snake.growing--;
  } else {
    removedTail = snake.segments.pop();
  }

  return { newHead, removedTail };
}

/**
 * Check if the head overlaps any other body segment.
 */
export function checkSelfCollision(snake) {
  const head = snake.segments[0];
  for (let i = 1; i < snake.segments.length; i++) {
    if (snake.segments[i].x === head.x && snake.segments[i].y === head.y) {
      return true;
    }
  }
  return false;
}

/**
 * Trigger growth by N segments.
 */
export function growSnake(snake, amount) {
  snake.growing += amount;
}

/**
 * Shrink the snake by removing N tail segments.
 * Returns true if snake would die (length < 1).
 */
export function shrinkSnake(snake, amount) {
  if (snake.segments.length - amount < 1) {
    snake.segments.length = 0;
    return true;
  }
  snake.segments.splice(snake.segments.length - amount, amount);
  return false;
}

/**
 * Kill the snake.
 */
export function killSnake(snake) {
  snake.alive = false;
}

/**
 * Get head position.
 */
export function getHead(snake) {
  return snake.segments[0];
}

/**
 * Get snake length.
 */
export function getLength(snake) {
  return snake.segments.length;
}
