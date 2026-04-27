// Sound theme definitions: each theme maps sound names to note sequences.
// Each note: { freq, duration, type (waveform), vol, delay }

const THEMES = {
  classic: {
    eatFood:       [{ freq: 440, duration: 0.06, type: 'square', vol: 0.12 }, { freq: 660, duration: 0.06, type: 'square', vol: 0.12, delay: 0.05 }],
    eatGolden:     [{ freq: 440, duration: 0.08, type: 'square', vol: 0.1 }, { freq: 554, duration: 0.08, type: 'square', vol: 0.1, delay: 0.06 }, { freq: 660, duration: 0.1, type: 'square', vol: 0.1, delay: 0.12 }],
    death:         [{ freq: 440, duration: 0.12, type: 'sawtooth', vol: 0.15 }, { freq: 330, duration: 0.12, type: 'sawtooth', vol: 0.15, delay: 0.1 }, { freq: 220, duration: 0.2, type: 'sawtooth', vol: 0.12, delay: 0.2 }],
    levelComplete: [{ freq: 523, duration: 0.1 }, { freq: 659, duration: 0.1, delay: 0.1 }, { freq: 784, duration: 0.1, delay: 0.2 }, { freq: 1047, duration: 0.25, delay: 0.3, vol: 0.15 }],
    gameOver:      [{ freq: 392, duration: 0.15, type: 'sawtooth', delay: 0 }, { freq: 330, duration: 0.15, type: 'sawtooth', delay: 0.15 }, { freq: 262, duration: 0.15, type: 'sawtooth', delay: 0.3 }, { freq: 196, duration: 0.4, type: 'sawtooth', delay: 0.45, vol: 0.15 }],
    keyCollect:    [{ freq: 880, duration: 0.08, type: 'triangle', vol: 0.12 }, { freq: 1320, duration: 0.1, type: 'triangle', vol: 0.1, delay: 0.05 }],
    portalEnter:   [{ freq: 200, duration: 0.05, type: 'sawtooth', vol: 0.08 }, { freq: 800, duration: 0.08, type: 'sawtooth', vol: 0.1, delay: 0.03 }],
    wallBreak:     [{ freq: 120, duration: 0.15, type: 'sawtooth', vol: 0.12 }, { freq: 90, duration: 0.1, type: 'square', vol: 0.08, delay: 0.05 }],
    poison:        [{ freq: 330, duration: 0.1, type: 'sawtooth', vol: 0.1 }, { freq: 165, duration: 0.2, type: 'sawtooth', vol: 0.12, delay: 0.08 }],
    buttonTap:     [{ freq: 660, duration: 0.03, type: 'square', vol: 0.06 }],
    starAwarded:   [{ freq: 1047, duration: 0.1, type: 'triangle', vol: 0.1 }],
    lifeGained:    [{ freq: 523, duration: 0.1, type: 'triangle', vol: 0.1 }, { freq: 659, duration: 0.1, type: 'triangle', vol: 0.1, delay: 0.08 }, { freq: 784, duration: 0.15, type: 'triangle', vol: 0.12, delay: 0.16 }],
    lifeLost:      [{ freq: 1200, duration: 0.05, type: 'square', vol: 0.1 }, { freq: 600, duration: 0.08, type: 'sawtooth', vol: 0.08, delay: 0.04 }, { freq: 300, duration: 0.12, type: 'sawtooth', vol: 0.06, delay: 0.1 }],
    countdown:     [{ freq: 330, duration: 0.1, type: 'square', vol: 0.1 }],
    countdownGo:   [{ freq: 660, duration: 0.15, type: 'square', vol: 0.12 }],
    timerWarning:  [{ freq: 880, duration: 0.04, type: 'square', vol: 0.08 }],
  },

  synth: {
    eatFood:       [{ freq: 520, duration: 0.08, type: 'sine', vol: 0.15 }, { freq: 780, duration: 0.1, type: 'sine', vol: 0.12, delay: 0.06 }],
    eatGolden:     [{ freq: 440, duration: 0.1, type: 'sine', vol: 0.12 }, { freq: 660, duration: 0.1, type: 'sine', vol: 0.12, delay: 0.08 }, { freq: 880, duration: 0.15, type: 'sine', vol: 0.14, delay: 0.16 }],
    death:         [{ freq: 350, duration: 0.15, type: 'triangle', vol: 0.14 }, { freq: 250, duration: 0.2, type: 'triangle', vol: 0.12, delay: 0.12 }, { freq: 150, duration: 0.3, type: 'sine', vol: 0.1, delay: 0.28 }],
    levelComplete: [{ freq: 523, duration: 0.12, type: 'sine' }, { freq: 659, duration: 0.12, type: 'sine', delay: 0.1 }, { freq: 784, duration: 0.12, type: 'sine', delay: 0.2 }, { freq: 1047, duration: 0.3, type: 'sine', delay: 0.3, vol: 0.16 }],
    gameOver:      [{ freq: 400, duration: 0.2, type: 'triangle' }, { freq: 300, duration: 0.2, type: 'triangle', delay: 0.18 }, { freq: 200, duration: 0.3, type: 'sine', delay: 0.36 }, { freq: 140, duration: 0.5, type: 'sine', delay: 0.55, vol: 0.12 }],
    keyCollect:    [{ freq: 1000, duration: 0.1, type: 'sine', vol: 0.14 }, { freq: 1500, duration: 0.12, type: 'sine', vol: 0.1, delay: 0.06 }],
    portalEnter:   [{ freq: 300, duration: 0.08, type: 'sine', vol: 0.1 }, { freq: 900, duration: 0.12, type: 'sine', vol: 0.08, delay: 0.04 }],
    wallBreak:     [{ freq: 150, duration: 0.12, type: 'triangle', vol: 0.14 }, { freq: 80, duration: 0.15, type: 'sine', vol: 0.1, delay: 0.06 }],
    poison:        [{ freq: 280, duration: 0.12, type: 'sine', vol: 0.12 }, { freq: 140, duration: 0.25, type: 'sine', vol: 0.1, delay: 0.1 }],
    buttonTap:     [{ freq: 800, duration: 0.04, type: 'sine', vol: 0.06 }],
    starAwarded:   [{ freq: 1200, duration: 0.12, type: 'sine', vol: 0.12 }],
    lifeGained:    [{ freq: 440, duration: 0.12, type: 'sine', vol: 0.12 }, { freq: 660, duration: 0.12, type: 'sine', vol: 0.12, delay: 0.1 }, { freq: 880, duration: 0.18, type: 'sine', vol: 0.14, delay: 0.2 }],
    lifeLost:      [{ freq: 900, duration: 0.08, type: 'triangle', vol: 0.1 }, { freq: 450, duration: 0.12, type: 'sine', vol: 0.08, delay: 0.06 }, { freq: 220, duration: 0.15, type: 'sine', vol: 0.06, delay: 0.14 }],
    countdown:     [{ freq: 400, duration: 0.12, type: 'sine', vol: 0.1 }],
    countdownGo:   [{ freq: 800, duration: 0.18, type: 'sine', vol: 0.14 }],
    timerWarning:  [{ freq: 1000, duration: 0.05, type: 'sine', vol: 0.08 }],
  },

  minimal: {
    eatFood:       [{ freq: 1200, duration: 0.03, type: 'sine', vol: 0.08 }],
    eatGolden:     [{ freq: 1200, duration: 0.03, type: 'sine', vol: 0.08 }, { freq: 1600, duration: 0.04, type: 'sine', vol: 0.06, delay: 0.04 }],
    death:         [{ freq: 200, duration: 0.08, type: 'sine', vol: 0.1 }, { freq: 120, duration: 0.12, type: 'sine', vol: 0.08, delay: 0.06 }],
    levelComplete: [{ freq: 800, duration: 0.06, type: 'sine', vol: 0.08 }, { freq: 1000, duration: 0.06, type: 'sine', vol: 0.08, delay: 0.06 }, { freq: 1200, duration: 0.1, type: 'sine', vol: 0.1, delay: 0.12 }],
    gameOver:      [{ freq: 300, duration: 0.1, type: 'sine', vol: 0.08 }, { freq: 200, duration: 0.15, type: 'sine', vol: 0.06, delay: 0.1 }],
    keyCollect:    [{ freq: 1400, duration: 0.04, type: 'sine', vol: 0.08 }],
    portalEnter:   [{ freq: 600, duration: 0.04, type: 'sine', vol: 0.06 }],
    wallBreak:     [{ freq: 100, duration: 0.06, type: 'sine', vol: 0.08 }],
    poison:        [{ freq: 200, duration: 0.06, type: 'sine', vol: 0.08 }],
    buttonTap:     [{ freq: 1000, duration: 0.02, type: 'sine', vol: 0.04 }],
    starAwarded:   [{ freq: 1500, duration: 0.05, type: 'sine', vol: 0.06 }],
    lifeGained:    [{ freq: 800, duration: 0.05, type: 'sine', vol: 0.08 }, { freq: 1000, duration: 0.06, type: 'sine', vol: 0.08, delay: 0.05 }],
    lifeLost:      [{ freq: 400, duration: 0.04, type: 'sine', vol: 0.06 }, { freq: 200, duration: 0.06, type: 'sine', vol: 0.05, delay: 0.04 }],
    countdown:     [{ freq: 600, duration: 0.04, type: 'sine', vol: 0.06 }],
    countdownGo:   [{ freq: 900, duration: 0.06, type: 'sine', vol: 0.08 }],
    timerWarning:  [{ freq: 1100, duration: 0.03, type: 'sine', vol: 0.05 }],
  },

  retro: {
    eatFood:       [{ freq: 500, duration: 0.04, type: 'square', vol: 0.14 }, { freq: 750, duration: 0.04, type: 'square', vol: 0.14, delay: 0.03 }, { freq: 1000, duration: 0.04, type: 'square', vol: 0.12, delay: 0.06 }],
    eatGolden:     [{ freq: 500, duration: 0.04, type: 'square', vol: 0.12 }, { freq: 750, duration: 0.04, type: 'square', vol: 0.12, delay: 0.03 }, { freq: 1000, duration: 0.04, type: 'square', vol: 0.12, delay: 0.06 }, { freq: 1500, duration: 0.06, type: 'square', vol: 0.14, delay: 0.09 }],
    death:         [{ freq: 500, duration: 0.06, type: 'square', vol: 0.16 }, { freq: 400, duration: 0.06, type: 'square', vol: 0.14, delay: 0.05 }, { freq: 300, duration: 0.06, type: 'square', vol: 0.12, delay: 0.1 }, { freq: 200, duration: 0.06, type: 'square', vol: 0.1, delay: 0.15 }, { freq: 100, duration: 0.1, type: 'square', vol: 0.08, delay: 0.2 }],
    levelComplete: [{ freq: 523, duration: 0.06, type: 'square' }, { freq: 659, duration: 0.06, type: 'square', delay: 0.06 }, { freq: 784, duration: 0.06, type: 'square', delay: 0.12 }, { freq: 1047, duration: 0.06, type: 'square', delay: 0.18 }, { freq: 1319, duration: 0.12, type: 'square', delay: 0.24, vol: 0.16 }],
    gameOver:      [{ freq: 440, duration: 0.08, type: 'square' }, { freq: 370, duration: 0.08, type: 'square', delay: 0.08 }, { freq: 311, duration: 0.08, type: 'square', delay: 0.16 }, { freq: 262, duration: 0.08, type: 'square', delay: 0.24 }, { freq: 196, duration: 0.2, type: 'square', delay: 0.32, vol: 0.14 }],
    keyCollect:    [{ freq: 1200, duration: 0.03, type: 'square', vol: 0.12 }, { freq: 1600, duration: 0.03, type: 'square', vol: 0.12, delay: 0.03 }, { freq: 2000, duration: 0.04, type: 'square', vol: 0.1, delay: 0.06 }],
    portalEnter:   [{ freq: 150, duration: 0.03, type: 'square', vol: 0.1 }, { freq: 400, duration: 0.03, type: 'square', vol: 0.1, delay: 0.02 }, { freq: 1000, duration: 0.04, type: 'square', vol: 0.08, delay: 0.04 }],
    wallBreak:     [{ freq: 80, duration: 0.08, type: 'square', vol: 0.14 }, { freq: 60, duration: 0.06, type: 'square', vol: 0.1, delay: 0.04 }, { freq: 40, duration: 0.06, type: 'square', vol: 0.08, delay: 0.08 }],
    poison:        [{ freq: 400, duration: 0.04, type: 'square', vol: 0.12 }, { freq: 200, duration: 0.04, type: 'square', vol: 0.1, delay: 0.04 }, { freq: 100, duration: 0.08, type: 'square', vol: 0.08, delay: 0.08 }],
    buttonTap:     [{ freq: 800, duration: 0.02, type: 'square', vol: 0.08 }],
    starAwarded:   [{ freq: 1500, duration: 0.04, type: 'square', vol: 0.1 }, { freq: 2000, duration: 0.04, type: 'square', vol: 0.08, delay: 0.03 }],
    lifeGained:    [{ freq: 600, duration: 0.05, type: 'square', vol: 0.1 }, { freq: 800, duration: 0.05, type: 'square', vol: 0.1, delay: 0.05 }, { freq: 1000, duration: 0.05, type: 'square', vol: 0.1, delay: 0.1 }, { freq: 1200, duration: 0.08, type: 'square', vol: 0.12, delay: 0.15 }],
    lifeLost:      [{ freq: 1000, duration: 0.03, type: 'square', vol: 0.12 }, { freq: 500, duration: 0.04, type: 'square', vol: 0.1, delay: 0.03 }, { freq: 250, duration: 0.06, type: 'square', vol: 0.08, delay: 0.07 }],
    countdown:     [{ freq: 440, duration: 0.06, type: 'square', vol: 0.12 }],
    countdownGo:   [{ freq: 880, duration: 0.08, type: 'square', vol: 0.14 }],
    timerWarning:  [{ freq: 1200, duration: 0.03, type: 'square', vol: 0.1 }],
  },
};

export function createAudio() {
  let ctx = null;
  let enabled = true;
  let theme = 'classic';

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function resume() {
    if (ctx?.state === 'suspended') ctx.resume();
  }

  function playNote(freq, duration, type = 'square', vol = 0.15, delay = 0) {
    if (!enabled) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration);
  }

  function playSound(name) {
    const notes = THEMES[theme]?.[name];
    if (!notes) return;
    notes.forEach(n => playNote(n.freq, n.duration, n.type || 'square', n.vol || 0.12, n.delay || 0));
  }

  return {
    resume,

    eatFood()       { playSound('eatFood'); },
    eatGolden()     { playSound('eatGolden'); },
    death()         { playSound('death'); },
    levelComplete() { playSound('levelComplete'); },
    gameOver()      { playSound('gameOver'); },
    keyCollect()    { playSound('keyCollect'); },
    portalEnter()   { playSound('portalEnter'); },
    wallBreak()     { playSound('wallBreak'); },
    poison()        { playSound('poison'); },
    buttonTap()     { playSound('buttonTap'); },
    starAwarded()   { playSound('starAwarded'); },
    lifeGained()    { playSound('lifeGained'); },
    lifeLost()      { playSound('lifeLost'); },
    countdown()     { playSound('countdown'); },
    countdownGo()   { playSound('countdownGo'); },
    timerWarning()  { playSound('timerWarning'); },

    setEnabled(on) { enabled = on; },
    get isEnabled() { return enabled; },

    setTheme(t) { if (THEMES[t]) theme = t; },
    get theme() { return theme; },

    /** Preview a sound — plays eatFood with the given theme temporarily. */
    preview(themeName) {
      const old = theme;
      theme = themeName;
      playSound('eatFood');
      setTimeout(() => playSound('levelComplete'), 300);
      theme = old;
    },
  };
}
