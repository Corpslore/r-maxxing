// Every sound is synthesized here, so there are no sample files to license.
// Browsers only allow audio after a tap, which is when all of these fire.
//
// Variety without fatigue (see reports/App store launch features.md):
// - every sound has several versions, dealt like a shuffled deck, never the same twice in a row
// - small random changes to pitch, volume and timing on every play
// - quick taps climb a five-note scale; a pause resets it
// - one key for everything, and it rises as the brain gets smoother
// - everything runs through one master volume and a limiter, so stacked sounds don't clip

const KEY = 'rmaxxing.muted';
let muted = false;
let ctx = null;
let master = null;
let noiseBuf = null;
let tier = 0;

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

// 0 = wrinkled walnut ... 3 = smooth. The whole palette moves up with it.
export function setTier(n) {
  tier = Math.max(0, Math.min(3, n | 0));
}

function audio() {
  if (muted) return null;
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -12;
      limiter.knee.value = 10;
      limiter.ratio.value = 6;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.2;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(limiter);
      limiter.connect(ctx.destination);
    }
    // iPhone reports "interrupted" after a call or an app switch, not just "suspended". Both need a resume.
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx && ctx.state !== 'running' && !muted) ctx.resume().catch(() => {});
  });
}

// ---------- building blocks ----------

const jig = (x, amount) => x * (1 + (Math.random() * 2 - 1) * amount);

// Versions of each sound come round like a shuffled deck: all of them before any repeats.
const decks = {};
const lastPick = {};
function variant(name, n) {
  let deck = decks[name];
  if (!deck || !deck.length) {
    deck = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
    if (n > 1 && deck[0] === lastPick[name]) deck.push(deck.shift());
    decks[name] = deck;
  }
  lastPick[name] = deck.shift();
  return lastPick[name];
}

// Major pentatonic in G, raised two semitones per tier. Nothing in it can clash.
const PENT = [0, 2, 4, 7, 9];
function note(step, octave = 0) {
  const s = ((step % 5) + 5) % 5;
  const o = Math.floor(step / 5) + octave;
  return 392 * 2 ** ((PENT[s] + 12 * o + tier * 2) / 12);
}

function tone(ac, { type = 'sine', from, to = from, start = 0, length, volume = 0.3, filter = null, vibrato = 0 }) {
  const t = ac.currentTime + start + Math.random() * 0.006;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + length);
  if (vibrato) {
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = 7;
    depth.gain.value = vibrato;
    lfo.connect(depth);
    depth.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + length + 0.05);
  }
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(jig(volume, 0.12), t + 0.012);
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
  gain.connect(master);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

function noise(ac, { start = 0, length = 0.1, volume = 0.2, type = 'bandpass', freq = 1200, to = freq, q = 1 }) {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + start;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (to !== freq) f.frequency.exponentialRampToValueAtTime(to, t + length);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(jig(volume, 0.12), t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + length + 0.05);
}

// A bell: one sine modulating another. Cheap, and it rings.
function bell(ac, { freq, start = 0, length = 0.9, volume = 0.18 }) {
  const t = ac.currentTime + start;
  const car = ac.createOscillator();
  const mod = ac.createOscillator();
  const modGain = ac.createGain();
  const g = ac.createGain();
  car.frequency.value = freq;
  mod.frequency.value = freq * 3.5;
  modGain.gain.setValueAtTime(freq * 2.2, t);
  modGain.gain.exponentialRampToValueAtTime(1, t + length);
  mod.connect(modGain);
  modGain.connect(car.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(jig(volume, 0.1), t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + length);
  car.connect(g);
  g.connect(master);
  car.start(t);
  mod.start(t);
  car.stop(t + length + 0.05);
  mod.stop(t + length + 0.05);
}

// ---------- taps ----------

// Taps in quick succession climb the scale, like stacking blocks. A pause starts over.
let popStep = 0;
let lastPop = 0;
export function pop() {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  popStep = now - lastPop < 0.9 ? Math.min(popStep + 1, 9) : 0;
  lastPop = now;
  const f = note(popStep);
  switch (variant('pop', 4)) {
    case 0: tone(ac, { type: 'triangle', from: f * 1.5, to: f * 0.6, length: 0.07, volume: 0.16 }); break;
    case 1: tone(ac, { from: f, to: f * 1.6, length: 0.06, volume: 0.18 }); noise(ac, { length: 0.02, volume: 0.05, freq: 3000 }); break;
    case 2: tone(ac, { type: 'square', from: f, to: f * 0.9, length: 0.05, volume: 0.07, filter: 1800 }); break;
    default: tone(ac, { from: f * 2, length: 0.04, volume: 0.14 }); noise(ac, { length: 0.025, volume: 0.08, freq: 2200, q: 4 }); break;
  }
}

export function tick(pitch = 1) {
  const ac = audio();
  if (ac) noise(ac, { length: 0.03, volume: 0.14, freq: 3200 * pitch, q: 6 });
}

// ---------- the big moments ----------

export function boom() {
  const ac = audio();
  if (!ac) return;
  switch (variant('boom', 3)) {
    case 0:
      tone(ac, { from: jig(150, 0.05), to: 34, length: 0.75, volume: 0.75 });
      tone(ac, { type: 'square', from: 90, to: 40, length: 0.16, volume: 0.22, filter: 500 });
      break;
    case 1:
      tone(ac, { from: jig(120, 0.05), to: 30, length: 0.9, volume: 0.75 });
      noise(ac, { length: 0.35, volume: 0.35, type: 'lowpass', freq: 900, to: 120 });
      break;
    default:
      tone(ac, { from: 140, to: 50, length: 0.22, volume: 0.6 });
      tone(ac, { from: 150, to: 32, start: 0.18, length: 0.7, volume: 0.75 });
      break;
  }
}

// The air horn, in several moods. Pitched to the current key.
export function horn() {
  const ac = audio();
  if (!ac) return;
  const k = 2 ** ((tier * 2) / 12) * jig(1, 0.02);
  const blast = (start, length, freqs, lift = 1.02) => freqs.forEach((f) => {
    tone(ac, { type: 'sawtooth', from: f * k, to: f * k * lift, start, length, volume: 0.1, filter: 2600 });
  });
  const chord = [392, 466, 494];
  switch (variant('horn', 4)) {
    case 0: [[0, 0.16], [0.2, 0.16], [0.4, 0.62]].forEach(([s, l]) => blast(s, l, chord)); break;
    case 1: [[0, 0.12], [0.15, 0.12], [0.3, 0.12], [0.48, 0.7]].forEach(([s, l], i) => blast(s, l, chord.map((f) => f * (i === 3 ? 1.26 : 1)))); break;
    case 2: [[0, 0.22], [0.28, 0.22]].forEach(([s, l]) => { blast(s, l, [392, 494]); }); blast(0.6, 0.55, [440, 554]); break;
    default: blast(0, 0.9, chord, 1.12); break;
  }
}

// Sad, never cruel. Bailing costs nothing; it just sounds funny.
export function womp() {
  const ac = audio();
  if (!ac) return;
  switch (variant('womp', 3)) {
    case 0:
      tone(ac, { type: 'sawtooth', from: 233, to: 220, length: 0.28, volume: 0.13, filter: 1200 });
      tone(ac, { type: 'sawtooth', from: 220, to: 207, start: 0.3, length: 0.28, volume: 0.13, filter: 1200 });
      tone(ac, { type: 'sawtooth', from: 207, to: 138, start: 0.6, length: 0.75, volume: 0.13, filter: 1200, vibrato: 6 });
      break;
    case 1:
      tone(ac, { from: 1300, to: 260, length: 0.8, volume: 0.2, vibrato: 18 });
      break;
    default:
      tone(ac, { from: 200, to: 60, length: 0.25, volume: 0.5 });
      noise(ac, { length: 0.08, volume: 0.2, freq: 700 });
      tone(ac, { type: 'triangle', from: 880, to: 840, start: 0.3, length: 0.4, volume: 0.08, vibrato: 30 });
      break;
  }
}

export function groove() {
  const ac = audio();
  if (!ac) return;
  const lines = [
    [98, 98, 123, 110, 98, 147, 123, 98],
    [110, 0, 110, 131, 147, 131, 110, 98],
    [98, 147, 98, 165, 98, 147, 131, 123],
  ];
  lines[variant('groove', 3)].forEach((f, i) => {
    if (f) tone(ac, { type: 'square', from: f, start: i * 0.2, length: 0.15, volume: 0.13, filter: 900 });
  });
  noise(ac, { start: 0.4, length: 0.06, volume: 0.06, freq: 6000, type: 'highpass' });
  noise(ac, { start: 1.2, length: 0.06, volume: 0.06, freq: 6000, type: 'highpass' });
}

// ---------- new cues ----------

// Before the clock starts: every action needs a windup.
export function windup() {
  const ac = audio();
  if (!ac) return;
  const f = note(0, -1);
  if (variant('windup', 2) === 0) {
    tone(ac, { from: f, to: f * 4, length: 0.38, volume: 0.14, type: 'triangle' });
    noise(ac, { length: 0.38, volume: 0.1, freq: 400, to: 4000, q: 2 });
  } else {
    [0, 1, 2, 3].forEach((i) => tone(ac, { type: 'square', from: note(i), start: i * 0.07, length: 0.06, volume: 0.06, filter: 2400 }));
  }
  tone(ac, { from: note(4, 1), start: 0.36, length: 0.09, volume: 0.12 });
}

// Something new for the Vault.
export function chime() {
  const ac = audio();
  if (!ac) return;
  const s = variant('chime', 3);
  bell(ac, { freq: note(2 + s, 1) });
  bell(ac, { freq: note(4 + s, 1), start: 0.12 });
}

// A law, a pack or a piece of drip just opened.
export function unlock() {
  const ac = audio();
  if (!ac) return;
  [0, 1, 2, 3, 4, 5].forEach((i) => tone(ac, { type: 'triangle', from: note(i), start: i * 0.06, length: 0.16, volume: 0.13 }));
  bell(ac, { freq: note(5, 1), start: 0.36, length: 1.2 });
}

// Gold receipt: the biggest sound in the app, and the rarest.
export function legendary() {
  const ac = audio();
  if (!ac) return;
  const k = note(0) / 392;
  [[392, 0], [494, 0.12], [587, 0.24], [784, 0.36]].forEach(([f, s]) => {
    tone(ac, { type: 'sawtooth', from: f * k, start: s, length: s === 0.36 ? 1.1 : 0.2, volume: 0.09, filter: 3200, vibrato: s === 0.36 ? 5 : 0 });
  });
  [0, 2, 4, 1, 3].forEach((n, i) => bell(ac, { freq: note(n, 2), start: 0.5 + i * 0.09, length: 1, volume: 0.1 }));
  noise(ac, { start: 0.36, length: 1.2, volume: 0.07, freq: 8000, type: 'highpass' });
}

// The "but what iiif" before the punchline lands.
export function whine() {
  const ac = audio();
  if (!ac) return;
  const f = jig(330, 0.06);
  if (variant('whine', 2) === 0) tone(ac, { type: 'sawtooth', from: f, to: f * 1.5, length: 0.32, volume: 0.07, filter: 1500, vibrato: 12 });
  else tone(ac, { type: 'square', from: f * 1.4, to: f * 0.9, length: 0.3, volume: 0.05, filter: 1300, vibrato: 20 });
}

// Poking the brain.
export function squish() {
  const ac = audio();
  if (!ac) return;
  switch (variant('squish', 4)) {
    case 0: tone(ac, { from: 260, to: 720, length: 0.22, volume: 0.2, vibrato: 25 }); break;
    case 1: noise(ac, { length: 0.18, volume: 0.25, type: 'lowpass', freq: 1800, to: 200 }); tone(ac, { from: 180, to: 90, length: 0.15, volume: 0.25 }); break;
    case 2: tone(ac, { type: 'square', from: 330, length: 0.12, volume: 0.07, filter: 1400 }); tone(ac, { type: 'square', from: 262, start: 0.13, length: 0.16, volume: 0.07, filter: 1400 }); break;
    default: [0, 1, 2].forEach((i) => tone(ac, { from: note(i + 2), to: note(i + 3), start: i * 0.07, length: 0.06, volume: 0.13 })); break;
  }
}

// Putting on a hat.
export function swish() {
  const ac = audio();
  if (ac) noise(ac, { length: 0.22, volume: 0.18, freq: 500, to: 3500, q: 1.5 });
}

// A short tune that belongs to one receipt: same receipt, same tune.
export function jingle(seed = 'x') {
  const ac = audio();
  if (!ac) return;
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h % 1000) / 1000;
  };
  let step = Math.floor(rand() * 3);
  [0, 0.13, 0.26, 0.42].forEach((start, i) => {
    step += i === 3 ? 5 - (step % 5) : 1 + Math.floor(rand() * 2);
    tone(ac, { type: 'triangle', from: note(step), start, length: i === 3 ? 0.4 : 0.12, volume: 0.12 });
  });
  bell(ac, { freq: note(step, 1), start: 0.42, length: 0.8, volume: 0.08 });
}
