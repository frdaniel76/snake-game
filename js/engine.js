import { COLORS, BASE_TICK_MS, ELEM, SCORE_FOOD, SCORE_GOLDEN, GROW_FOOD, GROW_GOLDEN, BREAK_WALL_COST, SPEED_BOOST_MULT, SLOW_MULT, SPEED_EFFECT_DURATION, SHRINK_POISON } from './config.js';
import { getTile, setTile, clearTile, findTiles, gridWidth, gridHeight } from './grid.js';
import {
  createSnake,
  moveSnake,
  changeDirection,
  checkSelfCollision,
  growSnake,
  shrinkSnake,
  killSnake,
  getHead,
  getLength,
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
  let _onHeartCollected = null;
  let _onKeyCollect = null;

  // ---- Helper: check if a tile is deadly for the snake ----

  function isDeadly(tile, snakeDir, sess) {
    if (!tile) return true; // out of bounds
    if (tile.type === ELEM.WALL) return true;
    if (tile.type === ELEM.GATE) return true; // gates that still exist haven't been unlocked
    if (tile.type === ELEM.ONE_WAY && tile.data && snakeDir !== tile.data.dir) return true;
    if (tile.type === ELEM.MOVING_OBS) return true;
    return false;
  }

  // ---- Core tick logic ----

  function tick() {
    if (!session || !session.snake.alive) return;

    // Check speed modifier expiry
    if (session.speedMod && performance.now() >= session.speedMod.until) {
      session.speedMod = null;
      tickMs = BASE_TICK_MS / (session.speed || 1);
    }

    const snake = session.snake;
    const grid = session.grid;

    // Process input queue
    if (session.inputQueue && session.inputQueue.length > 0) {
      const nextDir = session.inputQueue.shift();
      changeDirection(snake, nextDir);
    }

    // Ice: if on ice, ignore queued direction change (keep sliding)
    if (session.onIce) {
      snake.nextDir = snake.dir;
    }

    // Store previous positions for interpolation
    session.prevSegments = snake.segments.map(s => ({ ...s }));

    // Move snake
    const { newHead, removedTail } = moveSnake(snake);

    // Reset portal cooldown if head moved off a portal tile
    if (session.portalCooldown) {
      const prevHeadTile = getTile(grid, session.prevSegments[0].x, session.prevSegments[0].y);
      if (!prevHeadTile || prevHeadTile.type !== ELEM.PORTAL) {
        session.portalCooldown = false;
      }
    }

    // Warp edges: wrap coordinates before bounds/deadly check
    const warp = session.warpEdges;
    if (warp) {
      const gw = gridWidth(grid);
      const gh = gridHeight(grid);
      if (warp.left && newHead.x < 1) {
        newHead.x = gw - 2;
      } else if (warp.right && newHead.x >= gw - 1) {
        newHead.x = 1;
      }
      if (warp.top && newHead.y < 1) {
        newHead.y = gh - 2;
      } else if (warp.bottom && newHead.y >= gh - 1) {
        newHead.y = 1;
      }
    }

    // Check bounds and deadly tiles
    const tile = getTile(grid, newHead.x, newHead.y);
    if (isDeadly(tile, snake.dir, session)) {
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

    // Update ice state based on new head position
    if (tile.type === ELEM.ICE) {
      session.onIce = true;
    } else {
      session.onIce = false;
    }

    // Resolve element collision
    resolveElement(tile, newHead, snake);

    // Update moving obstacles
    updateMovingObstacles(session);

    // Update timed food
    updateTimedFood(session);

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
        // Exit is passable; completion is handled by checkGoal
        break;

      case ELEM.PORTAL:
        if (!session.portalCooldown && tile.data) {
          const portals = findTiles(session.grid, ELEM.PORTAL);
          const dest = portals.find(
            p => p.data && p.data.pairId === tile.data.pairId && (p.x !== pos.x || p.y !== pos.y)
          );
          if (dest) {
            // Teleport snake head to the paired portal
            snake.segments[0].x = dest.x;
            snake.segments[0].y = dest.y;
            session.portalCooldown = true;
            // Apply fixed exit direction if defined on the destination portal
            const destTile = getTile(session.grid, dest.x, dest.y);
            if (destTile?.data?.exitDir) {
              const dirMap = { UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } };
              const d = dirMap[destTile.data.exitDir];
              if (d) {
                snake.dir = destTile.data.exitDir;
                snake.nextDir = destTile.data.exitDir;
              }
            }
          }
        }
        break;

      case ELEM.KEY:
        if (tile.data) {
          const keyColor = tile.data.color; // capture before clearTile nullifies tile.data
          session.keysCollected.add(keyColor);
          clearTile(session.grid, pos.x, pos.y);
          // Clear all gates of the matching color
          const gates = findTiles(session.grid, ELEM.GATE);
          for (const gate of gates) {
            if (gate.data && gate.data.color === keyColor) {
              clearTile(session.grid, gate.x, gate.y);
            }
          }
          if (_onKeyCollect) _onKeyCollect(keyColor);
        }
        break;

      case ELEM.BREAKABLE:
        clearTile(session.grid, pos.x, pos.y);
        if (snake.segments.length <= 1) {
          killSnake(snake);
          if (_onDeath) _onDeath('breakable');
        } else {
          shrinkSnake(snake, BREAK_WALL_COST);
          session.segmentsLost += BREAK_WALL_COST;
        }
        break;

      case ELEM.ONE_WAY:
        // Direction already validated in isDeadly; just pass through
        break;

      case ELEM.ICE:
        // Ice state already set in tick before resolveElement
        break;

      case ELEM.SPEED_PAD:
        session.speedMod = { type: 'fast', until: performance.now() + SPEED_EFFECT_DURATION };
        tickMs = (BASE_TICK_MS / (session.speed || 1)) * SPEED_BOOST_MULT;
        // Pad stays on the board — don't clear
        break;

      case ELEM.SLOW_PAD:
        session.speedMod = { type: 'slow', until: performance.now() + SPEED_EFFECT_DURATION };
        tickMs = (BASE_TICK_MS / (session.speed || 1)) * SLOW_MULT;
        // Pad stays on the board — don't clear
        break;

      case ELEM.POISON:
        if (getLength(snake) <= SHRINK_POISON) {
          killSnake(snake);
          if (_onDeath) _onDeath('poison');
        } else {
          shrinkSnake(snake, SHRINK_POISON);
          session.segmentsLost += SHRINK_POISON;
        }
        clearTile(session.grid, pos.x, pos.y);
        // Poison does NOT count as food — re-check goal handled by checkGoal
        break;

      case ELEM.TIMED_FOOD:
        growSnake(snake, GROW_FOOD);
        session.score += SCORE_FOOD;
        session.foodEaten++;
        clearTile(session.grid, pos.x, pos.y);
        if (_onFoodEaten) _onFoodEaten('timed');
        if (_onScoreChange) _onScoreChange(session.score);
        break;

      case ELEM.HEART:
        clearTile(session.grid, pos.x, pos.y);
        if (_onHeartCollected) _onHeartCollected();
        break;
    }
  }

  function updateMovingObstacles(sess) {
    if (!sess.movingObstacles || sess.movingObstacles.length === 0) return;
    sess.movingObsCounter++;

    for (const obs of sess.movingObstacles) {
      if (sess.movingObsCounter % (obs.speed || 3) !== 0) continue;
      const path = obs.path;
      if (!path || path.length < 2) continue;

      // Clear old position
      clearTile(sess.grid, path[obs.currentIdx].x, path[obs.currentIdx].y);

      // Move to next path position
      if (obs.forward) {
        obs.currentIdx++;
        if (obs.currentIdx >= path.length - 1) obs.forward = false;
      } else {
        obs.currentIdx--;
        if (obs.currentIdx <= 0) obs.forward = true;
      }

      const newPos = path[obs.currentIdx];
      setTile(sess.grid, newPos.x, newPos.y, ELEM.MOVING_OBS, { path: path, speed: obs.speed, currentIdx: obs.currentIdx, forward: obs.forward });

      // Check if obstacle moved onto any snake segment
      const snake = sess.snake;
      for (let i = 0; i < snake.segments.length; i++) {
        if (snake.segments[i].x === newPos.x && snake.segments[i].y === newPos.y) {
          killSnake(snake);
          if (_onDeath) _onDeath('moving_obstacle');
          return;
        }
      }
    }
  }

  function updateTimedFood(sess) {
    const timedTiles = findTiles(sess.grid, ELEM.TIMED_FOOD);
    if (timedTiles.length === 0) return;

    const decrement = BASE_TICK_MS / 1000;

    for (const t of timedTiles) {
      if (!t.data) continue;
      // t.data is a reference to the grid tile's data object
      t.data.timeLeft -= decrement;
      if (t.data.timeLeft <= 0) {
        clearTile(sess.grid, t.x, t.y);
      }
    }
  }

  function markExitsActive(grid) {
    const exits = findTiles(grid, ELEM.EXIT);
    for (const exit of exits) {
      setTile(grid, exit.x, exit.y, ELEM.EXIT, { active: true });
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
    const prevGoalMet = session.goalMet;

    if (goal.type === 'eat-all' && allFoodEaten) {
      session.goalMet = true;
      completeLevel();
    } else if (goal.type === 'reach-exit') {
      session.goalMet = true;
      if (!prevGoalMet) markExitsActive(grid);
      const tile = getTile(grid, head.x, head.y);
      if (tile && tile.type === ELEM.EXIT) completeLevel();
    } else if (goal.type === 'eat-all-and-exit') {
      session.goalMet = allFoodEaten;
      if (allFoodEaten && !prevGoalMet) markExitsActive(grid);
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
      try {
        tick();
      } catch (err) {
        console.error('Engine tick error:', err);
        // Surface to any global error handler (debug overlay)
        if (typeof window !== 'undefined') window.dispatchEvent(new ErrorEvent('error', { message: 'TICK: ' + err.message, filename: 'engine.js', error: err }));
      }
      accumulator -= tickMs;
      if (!session?.snake?.alive || !running) break;
    }

    // Interpolation factor for smooth rendering (0..1 between ticks)
    const interp = accumulator / tickMs;
    try {
      if (_onRender) _onRender(session, interp);
    } catch (err) {
      console.error('Engine render error:', err);
      if (typeof window !== 'undefined') window.dispatchEvent(new ErrorEvent('error', { message: 'RENDER: ' + err.message, filename: 'engine.js', error: err }));
    }

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
        portalCooldown: false,
        onIce: false,
        movingObstacles: [],
        movingObsCounter: 0,
        timedFoodLastUpdate: performance.now(),
        speedMod: null,
        warpEdges: levelData.warpEdges || false,
      };

      // Initialize moving obstacles from grid data
      const movingTiles = findTiles(session.grid, ELEM.MOVING_OBS);
      for (const mt of movingTiles) {
        if (mt.data && mt.data.path) {
          session.movingObstacles.push({
            path: mt.data.path,
            speed: mt.data.speed || 3,
            currentIdx: mt.data.currentIdx || 0,
            forward: mt.data.forward !== undefined ? mt.data.forward : true,
          });
        }
      }

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
  Object.defineProperty(engine, 'onHeartCollected', {
    set(fn) { _onHeartCollected = fn; },
    get() { return _onHeartCollected; },
  });
  Object.defineProperty(engine, 'onKeyCollect', {
    set(fn) { _onKeyCollect = fn; },
    get() { return _onKeyCollect; },
  });

  return engine;
}
