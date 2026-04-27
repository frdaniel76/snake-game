export function createAudio() {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  // Resume context on user interaction (required by browsers)
  function resume() {
    if (ctx?.state === 'suspended') ctx.resume();
  }

  // Base function: play a note with given frequency, duration, waveform, and volume
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

  // Play a sequence of notes (for jingles)
  function playSequence(notes) {
    // notes: [{ freq, duration, type, vol, delay }]
    notes.forEach(n => playNote(n.freq, n.duration, n.type || 'square', n.vol || 0.12, n.delay || 0));
  }

  return {
    resume,

    // === Game sounds ===

    eatFood() {
      // Quick ascending "bip" — classic arcade eat sound
      playNote(440, 0.06, 'square', 0.12);
      playNote(660, 0.06, 'square', 0.12, 0.05);
    },

    eatGolden() {
      // Richer ascending chord
      playNote(440, 0.08, 'square', 0.1);
      playNote(554, 0.08, 'square', 0.1, 0.06);
      playNote(660, 0.1, 'square', 0.1, 0.12);
    },

    death() {
      // Descending "wah-wah"
      playNote(440, 0.12, 'sawtooth', 0.15);
      playNote(330, 0.12, 'sawtooth', 0.15, 0.1);
      playNote(220, 0.2, 'sawtooth', 0.12, 0.2);
    },

    levelComplete() {
      // Ascending fanfare arpeggio
      playSequence([
        { freq: 523, duration: 0.1, delay: 0 },
        { freq: 659, duration: 0.1, delay: 0.1 },
        { freq: 784, duration: 0.1, delay: 0.2 },
        { freq: 1047, duration: 0.25, delay: 0.3, vol: 0.15 },
      ]);
    },

    gameOver() {
      // Descending arpeggio, final low note
      playSequence([
        { freq: 392, duration: 0.15, type: 'sawtooth', delay: 0 },
        { freq: 330, duration: 0.15, type: 'sawtooth', delay: 0.15 },
        { freq: 262, duration: 0.15, type: 'sawtooth', delay: 0.3 },
        { freq: 196, duration: 0.4, type: 'sawtooth', delay: 0.45, vol: 0.15 },
      ]);
    },

    keyCollect() {
      // Metallic ding
      playNote(880, 0.08, 'triangle', 0.12);
      playNote(1320, 0.1, 'triangle', 0.1, 0.05);
    },

    portalEnter() {
      // Quick whoosh/zap
      playNote(200, 0.05, 'sawtooth', 0.08);
      playNote(800, 0.08, 'sawtooth', 0.1, 0.03);
    },

    wallBreak() {
      // Low crumble (noise-like via rapid detuned oscillators)
      playNote(120, 0.15, 'sawtooth', 0.12);
      playNote(90, 0.1, 'square', 0.08, 0.05);
    },

    poison() {
      // Low descending buzz
      playNote(330, 0.1, 'sawtooth', 0.1);
      playNote(165, 0.2, 'sawtooth', 0.12, 0.08);
    },

    buttonTap() {
      // Soft click
      playNote(660, 0.03, 'square', 0.06);
    },

    starAwarded() {
      // Bright ping
      playNote(1047, 0.1, 'triangle', 0.1);
    },

    lifeGained() {
      // Warm ascending chord
      playNote(523, 0.1, 'triangle', 0.1);
      playNote(659, 0.1, 'triangle', 0.1, 0.08);
      playNote(784, 0.15, 'triangle', 0.12, 0.16);
    },

    lifeLost() {
      // Glass break — high then low
      playNote(1200, 0.05, 'square', 0.1);
      playNote(600, 0.08, 'sawtooth', 0.08, 0.04);
      playNote(300, 0.12, 'sawtooth', 0.06, 0.1);
    },

    countdown() {
      // Deep beep for 3-2-1 countdown
      playNote(330, 0.1, 'square', 0.1);
    },

    countdownGo() {
      // Higher beep for "GO"
      playNote(660, 0.15, 'square', 0.12);
    },

    timerWarning() {
      // Rapid ticking beep
      playNote(880, 0.04, 'square', 0.08);
    },

    setEnabled(on) { enabled = on; },
    get isEnabled() { return enabled; },
  };
}
