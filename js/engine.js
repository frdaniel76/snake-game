import { COLORS, BASE_TICK_MS, ELEM, SCORE_FOOD, SCORE_GOLDEN, GROW_FOOD, GROW_GOLDEN } from './config.js';
import { getTile, clearTile, findTiles } from './grid.js';
import {
  createSnake,
  moveSnake,
  changeDirection,
  checkSelfCollision,
  growSnake,
  shrinkSnake,
  killSnake,
  getHead,
} from './snake.js';

export function createEngine() {
  let session = null;
  let tickMs = BASE_TICK_MS;
  let accumulator = 0;
  let lastTime = 0;
  let running = false;
  let paused = false;
  let rafId = null;

  // Callbacks — stored in local variables so the property setters work
  let _onRender = null;
  let _onDeath = null;
  let _onLevelComplete = null;
  let _onScoreChange = null;
  let _onFoodEaten = null;

  // ---- Core tick logic ----

  function tick() {
    if (!session || !session.snake.alive) return;

    const snake = session.snake;
    const grid = session.grid;

    // Store previous positions for interpolation
    session.prevSegments = snake.segments.map(s => ({ ...s }));

    // Move snake
    const { newHead, removedTail } = moveSnake(snake);

    // Check bounds (wall collision or warp)
    const tile = getTile(grid, newHead.x, newHead.y);
    if (!tile || tile.type === ELEM.WALL) {
      killSnake(snake);
      if (_onDeath) _onDeath('wall');
      return;
    }

    // Check self collision
    if (checkSelfCollision(snake)) {
      killSnake(snake);
      if (_onDeath) _onDeath('self');
      return;
    }

    // Resolve element collision
    resolveElement(tile, newHead, snake);

    // Check level goal
    checkGoal();
  }

  function resolveElement(tile, pos, snake) {
    switch (tile.type) {
      case ELEM.FOOD:
        growSnake(snake, GROW_FOOD);
        session.score += SCORE_FOOD;
        session.foodEaten++;
        clearTile(session.grid, pos.x, pos.y);
        if (_onFoodEaten) _onFoodEaten('food');
        if (_onScoreChange) _onScoreChange(session.score);
        break;

      case ELEM.GOLDEN_FOOD:
        growSnake(snake, GROW_GOLDEN);
        session.score += SCORE_GOLDEN;
        session.foodEaten++;
        clearTile(session.grid, pos.x, pos.y);
        if (_onFoodEaten) _onFoodEaten('golden');
        if (_onScoreChange) _onScoreChange(session.score);
        break;

      case ELEM.EXIT:
        if (session.goalMet) {
          // Level complete is handled by checkGoal
        }
        // If goal not met, exit is passable but doesn't complete
        break;

      // More element types added in later phases
    }
  }

  function checkGoal() {
    const goal = session.goal;
    const grid = session.grid;
    const head = getHead(session.snake);

    const foodRemaining =
      findTiles(grid, ELEM.FOOD).length +
      findTiles(grid, ELEM.GOLDEN_FOOD).length +
      findTiles(grid, ELEM.TIMED_FOOD).length;

    const allFoodEaten = foodRemaining === 0;

    if (goal.type === 'eat-all' && allFoodEaten) {
      session.goalMet = true;
      completeLevel();
    } else if (goal.type === 'reach-exit') {
      session.goalMet = true;
      const tile = getTile(grid, head.x, head.y);
      if (tile && tile.type === ELEM.EXIT) completeLevel();
    } else if (goal.type === 'eat-all-and-exit') {
      session.goalMet = allFoodEaten;
      if (allFoodEaten) {
        const tile = getTile(grid, head.x, head.y);
        if (tile && tile.type === ELEM.EXIT) completeLevel();
      }
    }
  }

  function completeLevel() {
    running = false;
    const elapsed = (performance.now() - session.startTime) / 1000;
    const stars = calcStars(elapsed, session.segmentsLost, session.starTargets);
    if (_onLevelComplete)
      _onLevelComplete({
        score: session.score,
        time: elapsed,
        stars,
        foodEaten: session.foodEaten,
        segmentsLost: session.segmentsLost,
      });
  }

  function calcStars(time, segLost, targets) {
    if (time <= targets.fastTime && segLost === 0) return 3;
    if (time <= targets.time && segLost <= 2) return 2;
    return 1;
  }

  // ---- RAF loop ----

  function loop(now) {
    if (!running) return;

    if (paused) {
      rafId = requestAnimationFrame(loop);
      return;
    }

    const dt = now - lastTime;
    lastTime = now;
    accumulator += dt;

    // Cap accumulator to prevent spiral of death
    if (accumulator > tickMs * 5) accumulator = tickMs * 5;

    while (accumulator >= tickMs) {
      tick();
      accumulator -= tickMs;
      if (!session?.snake?.alive || !running) break;
    }

    // Interpolation factor for smooth rendering (0..1 between ticks)
    const interp = accumulator / tickMs;
    if (_onRender) _onRender(session, interp);

    if (running) rafId = requestAnimationFrame(loop);
  }

  // ---- Public API ----

  const engine = {
    /**
     * Initialize a new level session from parsed level data.
     * levelData: { grid, snakeStart, goal, speed, starTargets, meta }
     */
    startLevel(levelData) {
      session = {
        grid: levelData.grid,
        snake: createSnake(
          levelData.snakeStart.x,
          levelData.snakeStart.y,
          levelData.snakeStart.dir,
          levelData.snakeStart.length,
        ),
        goal: levelData.goal,
        goalMet: false,
        speed: levelData.speed,
        starTargets: levelData.starTargets,
        meta: levelData.meta,
        score: 0,
        foodEaten: 0,
        segmentsLost: 0,
        startTime: 0,
        prevSegments: null,
        keysCollected: new Set(),
      };
      tickMs = BASE_TICK_MS / session.speed;
      accumulator = 0;
      return session;
    },

    /** Start the game loop. */
    start() {
      if (!session) return;
      session.startTime = performance.now();
      running = true;
      paused = false;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    },

    /** Stop the game loop entirely. */
    stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },

    /** Pause (loop keeps running but ticks are skipped). */
    pause() {
      paused = true;
    },

    /** Resume from pause. Resets timing to avoid accumulator spike. */
    resume() {
      paused = false;
      lastTime = performance.now();
      accumulator = 0;
    },

    // ---- Input ----

    changeDirection(dir) {
      if (session?.snake?.alive) changeDirection(session.snake, dir);
    },

    // ---- Speed modification (for speed/slow pads) ----

    setSpeedMod(mult) {
      tickMs = (BASE_TICK_MS / (session?.speed ?? 1)) * (1 / mult);
    },

    resetSpeed() {
      tickMs = BASE_TICK_MS / (session?.speed ?? 1);
    },

    // ---- Getters ----

    get session() {
      return session;
    },
    get isRunning() {
      return running;
    },
    get isPaused() {
      return paused;
    },
  };

  // Define callback setters as proper ES5 properties so
  // `engine.onRender = fn` works correctly.
  Object.defineProperty(engine, 'onRender', {
    set(fn) { _onRender = fn; },
    get() { return _onRender; },
  });
  Object.defineProperty(engine, 'onDeath', {
    set(fn) { _onDeath = fn; },
    get() { return _onDeath; },
  });
  Object.defineProperty(engine, 'onLevelComplete', {
    set(fn) { _onLevelComplete = fn; },
    get() { return _onLevelComplete; },
  });
  Object.defineProperty(engine, 'onScoreChange', {
    set(fn) { _onScoreChange = fn; },
    get() { return _onScoreChange; },
  });
  Object.defineProperty(engine, 'onFoodEaten', {
    set(fn) { _onFoodEaten = fn; },
    get() { return _onFoodEaten; },
  });

  return engine;
}
