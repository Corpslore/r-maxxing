// Every sound is synthesized here, so there are no sample files to license.
// Browsers only allow audio after a tap, which is when all of these fire.

const KEY = 'rmaxxing.muted';
let muted = false;
let ctx = null;

try {
  muted = localStorage.getItem(KEY) === '1';
} catch { /* Storage blocked: sound stays on. */ }

export const isMuted = () => muted;

export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem(KEY, muted ? '1' : '0');
  } catch { /* Lasts for this session only. */ }
  return muted;
}

function audio() {
  if (muted) return null;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(ac, { type = 'sine', from, to = from, start = 0, length, volume = 0.3, filter = null }) {
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + length);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  let last = osc;
  if (filter) {
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = filter;
    osc.connect(lp);
    last = lp;
  }
  last.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

export function pop() {
  const ac = audio();
  if (ac) tone(ac, { type: 'triangle', from: 520, to: 180, length: 0.07, volume: 0.16 });
}

// The big low hit.
export function boom() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { from: 150, to: 34, length: 0.75, volume: 0.75 });
  tone(ac, { type: 'square', from: 90, to: 40, length: 0.16, volume: 0.22, filter: 500 });
}

// Three blasts of a stadium air horn.
export function horn() {
  const ac = audio();
  if (!ac) return;
  [[0, 0.16], [0.2, 0.16], [0.4, 0.62]].forEach(([start, length]) => {
    [392, 466, 494].forEach((from) => {
      tone(ac, { type: 'sawtooth', from, to: from * 1.02, start, length, volume: 0.1, filter: 2600 });
    });
  });
}

export function womp() {
  const ac = audio();
  if (!ac) return;
  tone(ac, { type: 'sawtooth', from: 233, to: 220, length: 0.28, volume: 0.13, filter: 1200 });
  tone(ac, { type: 'sawtooth', from: 220, to: 207, start: 0.3, length: 0.28, volume: 0.13, filter: 1200 });
  tone(ac, { type: 'sawtooth', from: 207, to: 138, start: 0.6, length: 0.75, volume: 0.13, filter: 1200 });
}

// A smooth little groove for the moonwalk.
export function groove() {
  const ac = audio();
  if (!ac) return;
  [98, 98, 123, 110, 98, 147, 123, 98].forEach((from, i) => {
    tone(ac, { type: 'square', from, start: i * 0.2, length: 0.15, volume: 0.13, filter: 900 });
  });
}
