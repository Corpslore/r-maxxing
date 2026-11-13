import * as C from './core.js';
import { SCENES } from './intro.js';
import {
  BAIL_LINES, BRAND, CHECK_QS, CLOSER, CLOSERS, CONTEXT_LINES, DEFAULT_THINK_MOVE, DONE_LINES, DOOR, DREAD, HOME_CTA, HOME_CTA_QUIET, LATE_NIGHT, FOLLOW_UP, BOLD_DRAFTS, HARD_DARES, PRO_OBJECTIONS, INTRO, INTRO_CARDS,
  KOANS, LESSONS, DRAFTS, MOONWALK_LABEL, MOVES, DAILY_MOVES, MOVE_CHIPS, MOVE_SUGGESTIONS, OBJECTIONS, ONE_WAY_COPY, PLAYBOOKS, QUIZ, CRISIS_CHECK_COPY,
  MOMENT_ODDS, RARE_LINES, THING_PLACEHOLDERS, THINK_TIMES, TYPES, UNLOCK_DAYS, VERDICTS,
  DARES, DRIP_AT, NUDGE_LINES, POKE_LINES, PUBLIC_URL, THEMES, TIMER_LINES, WARDROBE_INFO,
  PRODUCTS, PRO_WARDROBE_INFO, RECEIPT_SKINS, TIP_THANKS, TRIAL, THINK_TIMER_LINES,
} from './content.js';
import { buy as buyProduct, isMockStore, loadProducts, owned as ownedProducts, restore as restorePurchases, storeAvailable } from './store.js';
import { brainSVG, moodFor, setWorn, updateBrain } from './brain.js';
import { canNudge, clearNudges, haptic, isNative, requestReview, scheduleNudges, shareImage, statusBar, updateWidget } from './native.js';
import {
  fontsReady, renderLifetimeCard, renderObjectionCard, renderQuizCard, renderReceiptCard, toBlob,
} from './cards.js';
import * as sfx from './sfx.js';

// ---------- state ----------

const KEY = 'rmaxxing.v1';
const DEFAULTS = {
  w: null, startW: null, typeName: null, quizSeconds: null, wis: C.START_WIS,
  streak: 0, lastDay: null, lastSeen: null, installLater: null,
  wear: null, closetOrder: null, nudge: null, pro: false, skin: 'classic', who: 'brother', quiet: false, quietAsked: false,
  receipts: [], read: [], dailyDone: {}, active: null, trials: [],
};

// seen: shuffle-bag rounds per pool. found: what the Vault has collected for good.
const blank = () => ({ ...DEFAULTS, receipts: [], read: [], dailyDone: {}, seen: {}, found: { koans: [], rares: [], heard: [] }, closet: [], reviewAt: [], trials: [] });

// Fills gaps in older saves and backup codes, so new features never meet a missing field.
function hydrate(saved) {
  const b = blank();
  const s = saved && typeof saved === 'object' ? saved : {};
  return {
    ...b,
    ...s,
    receipts: Array.isArray(s.receipts) ? s.receipts : [],
    read: Array.isArray(s.read) ? s.read : [],
    dailyDone: s.dailyDone && typeof s.dailyDone === 'object' ? s.dailyDone : {},
    seen: s.seen && typeof s.seen === 'object' ? s.seen : {},
    found: { ...b.found, ...(s.found && typeof s.found === 'object' ? s.found : {}) },
    closet: Array.isArray(s.closet) ? s.closet : [],
    reviewAt: Array.isArray(s.reviewAt) ? s.reviewAt : [],
    trials: Array.isArray(s.trials) ? s.trials : [],
  };
}

// Each person gets their own wardrobe order, so friends don't all get the same hat first.
function ensureCloset() {
  const ids = WARDROBE_INFO.map((p) => p.id);
  if (!Array.isArray(S.closetOrder) || S.closetOrder.length !== ids.length || ids.some((id) => !S.closetOrder.includes(id))) {
    S.closetOrder = C.shuffled(ids);
  }
  if (S.wear && !ownsPiece(S.wear)) S.wear = null;
  setWorn(S.wear);
}

// Earned pieces live in the closet; Pro pieces come with Pro.
function ownsPiece(id) {
  return S.closet.includes(id) || (S.pro && PRO_WARDROBE_INFO.some((p) => p.id === id));
}

// The receipt skin in use: Pro skins fall back to classic without Pro.
function skinOf() {
  return RECEIPT_SKINS.find((k) => k.id === S.skin && (!k.pro || S.pro)) || RECEIPT_SKINS[0];
}

let S = load();
ensureCloset();
let view = { name: 'home' };
let timerId = null;
let quizRun = null;
let checkRun = null;
let installPrompt = null;
let introTimers = [];
const vsScore = C.parseVs(location.hash);
// `?intro=2` opens the opener on card 2 and holds it there, for screen recordings and screenshots.
const introParam = new URLSearchParams(location.search).get('intro');

function load() {
  try {
    return hydrate(JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch {
    return blank();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch { /* Private mode or full storage: the session still works. */ }
  syncWidget();
}

// The Home Screen widget (iPhone app only): the brain, the streak, and two weeks of koans ahead
// so it can turn the koan over at midnight without the app being opened. Batched, so a burst of
// saves sends one update.
let widgetTimer = null;
function syncWidget() {
  if (!isNative()) return;
  clearTimeout(widgetTimer);
  widgetTimer = setTimeout(() => {
    const w = S.w ?? 60;
    const now = new Date();
    const koans = [];
    for (let i = 0; i < 14; i++) {
      const key = C.dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
      koans.push({ d: key, t: todayKoan(key), n: C.dayNumber(key) });
    }
    updateWidget({ w, mood: moodFor(w), streak: S.streak || 0, koans });
  }, 800);
}

const root = document.getElementById('app');
// Inside an embedded viewer (an artifact preview, an iframe) the address isn't one worth sharing,
// and downloads, the share sheet and service workers are usually blocked.
const framed = (() => { try { return window.self !== window.top; } catch { return true; } })();
// Inside the iPhone app the page's own address is capacitor://localhost, so share the website instead.
const shareUrl = () => (framed ? '' : isNative() ? PUBLIC_URL : location.origin + location.pathname);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dailyMove = (key) => DAILY_MOVES[C.dailyIndex(key, DAILY_MOVES.length)];
const todayKoan = (key = C.dateKey()) => KOANS[C.dailyIndex(key, KOANS.length)];

// Next line from a pool, never repeating until the whole pool has been used.
function fresh(pool, items) {
  const r = C.drawFresh(items, S.seen[pool]);
  S.seen[pool] = r.seen;
  save();
  return r;
}

// Adds to a Vault collection. Returns true the first time something is found.
function collect(kind, text) {
  const k = C.lineKey(text);
  if (S.found[kind].includes(k)) return false;
  S.found[kind].push(k);
  save();
  return true;
}
const hasFound = (kind, text) => S.found[kind].includes(C.lineKey(text));

const days = () => C.daysActive(S.receipts);
const lessonOpen = (id, d = days()) => (UNLOCK_DAYS.lessons[id] || 0) <= d;
const packOpen = (id, d = days()) => (UNLOCK_DAYS.packs[id] || 0) <= d;
const dayWord = (n) => `${n} more day${n === 1 ? '' : 's'}`;
function unlockName(kind, id) {
  if (kind === 'lessons') {
    const i = LESSONS.findIndex((l) => l.id === id);
    return `LAW ${i + 1}: ${LESSONS[i].rule.replace(/\|/g, ' ')}`;
  }
  return `${PLAYBOOKS.find((p) => p.id === id).name} MISSIONS`;
}
// The closest locked law or pack, whichever opens first.
function nextOpening(d = days()) {
  const a = C.nextUnlock(UNLOCK_DAYS.lessons, d);
  const b = C.nextUnlock(UNLOCK_DAYS.packs, d);
  if (!a && !b) return null;
  if (!b || (a && a.inDays <= b.inDays)) return { kind: 'lessons', ...a };
  return { kind: 'packs', ...b };
}
// Brain court: the hearing owed today, and the next one coming.
const tomorrowKey = () => C.dateKey(new Date(Date.now() + 86400000));
const trialToday = () => C.trialDue(S.receipts, S.trials, C.dateKey());
const lastTrialAt = () => Math.max(0, ...S.trials.map((t) => t.at || 0));
// soon: one is due tomorrow already. act: one will be, if they do one thing today.
function trialAhead() {
  if (trialToday()) return null;
  const t = tomorrowKey();
  const soon = C.trialDue(S.receipts, S.trials, t);
  if (soon) return { day: soon, how: 'soon' };
  const today = C.dateKey();
  if (S.receipts.some((r) => C.dateKey(new Date(r.at)) === today)) return null;
  const ifAct = C.trialDue([...S.receipts, { at: Date.now() }], S.trials, t);
  return ifAct ? { day: ifAct, how: 'act' } : null;
}
// {key} fill-ins for copy. Unknown keys (like the {b} address tokens) are left for render().
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => (k in o ? String(o[k]) : m));
const installed =() => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
const buzz = (ms = 12) => haptic(typeof ms !== 'number' ? 'success' : ms >= 45 ? 'heavy' : ms >= 25 ? 'medium' : 'light');
// Quiet mode (in About, or the late-night prompt) and the phone's reduced-motion setting both mean no shaking.
const calm = () => !!S.quiet || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const homeCta = () => (S.quiet ? HOME_CTA_QUIET : HOME_CTA);
// A text box as tall as what's in it, so nothing typed is hidden.
const grow = (el) => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 4}px`;
};
// Every BUT WHAT IF, plus the group chat pack with Pro.
const objPool = () => (S.pro ? [...OBJECTIONS, ...PRO_OBJECTIONS] : OBJECTIONS);
// Pro things show up locked only where they can be bought (the app, or the test store).
const sellsPro = () => S.pro || storeAvailable();

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = C.addr(msg, S.who);
  el.classList.add('on');
  toast.shownAt = Date.now();
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('on'), 2800);
}

// ---------- big type ----------

// Headlines are stacks of lines, each scaled to fill the column, like a wheat-paste poster.
function big(text, { max = 130, center = false, slam = false, cls = '', tag = 'h1' } = {}) {
  const lines = text.split('|').map((l, i) => `<span style="--i:${i}">${esc(l)}</span>`).join(' ');
  return `<${tag} class="fit ${center ? 'fit-center' : ''} ${slam ? 'slam' : ''} ${cls}" data-max="${max}">${lines}</${tag}>`;
}

function fitAll() {
  root.querySelectorAll('.fit').forEach((box) => {
    const width = box.clientWidth;
    if (!width) return;
    const max = Number(box.dataset.max || 130);
    box.querySelectorAll(':scope > span').forEach((line) => {
      line.style.fontSize = '100px';
      line.style.fontSize = `${Math.min(max, Math.floor((100 * width) / Math.max(line.offsetWidth, 1)))}px`;
    });
  });
}

const wordmark = (cls = '') => {
  const parts = BRAND.name.split('-').map(esc).join('<i class="cbar"></i>');
  return `<span class="wordmark ${cls}" aria-label="${esc(BRAND.name)}">${parts}</span>`;
};

const stickerSVG = (text) => `<svg class="sticker" viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="50"/>
  <defs><path id="sticker-path" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0"/></defs>
  <text><textPath href="#sticker-path">${esc(text)}</textPath></text>
</svg>`;

// ---------- effects ----------

function shake() {
  if (calm()) return;
  root.classList.remove('shake');
  void root.offsetWidth;
  root.classList.add('shake');
}

// Particle shapes for celebrations. The brain is the mascot; the rest keep it from being the same rain every time.
const PARTICLES = {
  star: (c) => `<svg viewBox="0 0 24 24"><path d="M12 1l3.2 7 7.6.8-5.7 5.1 1.6 7.5L12 17.6 5.3 21.4l1.6-7.5L1.2 8.8 8.8 8z" fill="${c}"/></svg>`,
  confetti: (c) => `<svg viewBox="0 0 10 16"><rect width="10" height="16" rx="2" fill="${c}"/></svg>`,
  bolt: (c) => `<svg viewBox="0 0 24 24"><path d="M14 1L3 14h7l-2 9 11-13h-7z" fill="${c}" stroke="#0B0B0B" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  juice: () => '<svg viewBox="0 0 20 28"><path d="M13 0v6" stroke="#0B0B0B" stroke-width="2"/><rect x="2" y="5" width="16" height="22" rx="2" fill="#FF9F1C" stroke="#0B0B0B" stroke-width="1.5"/><circle cx="10" cy="16" r="5" fill="#FFE500"/></svg>',
  dot: (c) => `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="${c}"/></svg>`,
};
const PARTY = ['#FFE500', '#FF3D8B', '#3BD1FF', '#7CFF4F', '#FF7A00', '#FFFFFF'];
// Dealt like a deck, so every finish looks different from the last few.
const CELEBRATIONS = [
  { shape: 'brain', motion: 'fall' }, { shape: 'star', motion: 'burst' }, { shape: 'confetti', motion: 'fall' },
  { shape: 'bolt', motion: 'fountain' }, { shape: 'juice', motion: 'fall' }, { shape: 'mixed', motion: 'burst' },
  { shape: 'confetti', motion: 'fountain' }, { shape: 'star', motion: 'fall' }, { shape: 'dot', motion: 'burst' },
];
const FLASHES = ['sun', 'pink', 'blue', 'lime', 'white'];

function celebrate({ shape = 'brain', motion = 'fall', count = 22 } = {}) {
  // Quiet mode: no brain rain at all.
  if (S.quiet) return;
  // Reduced motion: the same confetti, scattered and still, for a moment. No movement.
  const still = calm();
  if (still) count = Math.min(count, 18);
  const layer = document.createElement('div');
  layer.className = still ? 'rain m-still' : `rain m-${motion}`;
  layer.setAttribute('aria-hidden', 'true');
  const brain = brainSVG(10);
  const kinds = Object.keys(PARTICLES);
  let html = '';
  for (let i = 0; i < count; i++) {
    const kind = shape === 'mixed' ? (i % 4 === 0 ? 'brain' : kinds[i % kinds.length]) : shape;
    const color = PARTY[Math.floor(Math.random() * PARTY.length)];
    const svg = kind === 'brain' ? brain : PARTICLES[kind](color);
    const size = kind === 'brain' ? 34 + Math.random() * 46 : kind === 'confetti' || kind === 'dot' ? 10 + Math.random() * 14 : 22 + Math.random() * 26;
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 45;
    const style = still ? [`left:${(Math.random() * 92).toFixed(1)}%`, `top:${(8 + Math.random() * 80).toFixed(1)}%`, `width:${size.toFixed(0)}px`].join(';') : [
      `left:${motion === 'fall' ? (Math.random() * 100).toFixed(1) : 50}%`,
      `width:${size.toFixed(0)}px`,
      `--spin:${(Math.random() * 720 - 360).toFixed(0)}deg`,
      `--dx:${(Math.cos(angle) * dist).toFixed(1)}vw`,
      `--dy:${(Math.sin(angle) * dist).toFixed(1)}vh`,
      `--x0:${(Math.random() * 70 - 35).toFixed(1)}vw`,
      `animation-delay:${(Math.random() * (motion === 'burst' ? 0.12 : 0.5)).toFixed(2)}s`,
      `animation-duration:${(1 + Math.random() * 0.8).toFixed(2)}s`,
    ].join(';');
    html += `<span style="${style}">${svg}</span>`;
  }
  layer.innerHTML = html;
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), still ? 900 : 2900);
}
const brainRain = (count = 22) => celebrate({ shape: 'brain', motion: 'fall', count });

// ---------- rendering ----------

function go(name, params = {}) {
  // An old toast doesn't follow you to the next screen; one raised for this move (just now) stays.
  if (Date.now() - (toast.shownAt || 0) > 400) document.getElementById('toast')?.classList.remove('on');
  view = { name, ...params };
  render();
  window.scrollTo(0, 0);
}

function render() {
  clearInterval(timerId);
  timerId = null;
  introTimers.forEach(clearTimeout);
  introTimers = [];
  const fn = VIEWS[view.name] || VIEWS.home;
  sfx.setQuiet(!!S.quiet);
  sfx.setTier(S.w == null || S.w >= 65 ? 0 : S.w >= 40 ? 1 : S.w >= 15 ? 2 : 3);
  const { tone = '', html } = fn();
  document.documentElement.dataset.tone = tone;
  // The tab screens start with the yellow ticker; the bright tones need dark status-bar text too.
  statusBar(['home', 'method', 'receipts', 'vault'].includes(view.name) || ['sun', 'pink', 'lime', 'orange'].includes(tone));
  // {b} tokens in the copy become what the person picked to be called, once per screen.
  root.innerHTML = C.addr(html, S.who, 1);
  fitAll();
  root.querySelectorAll('#thing, #draft, #move').forEach(grow);
  const kindChip = root.querySelector('.draft-kinds .chip.on');
  if (kindChip) {
    const row = kindChip.parentElement;
    row.scrollLeft += kindChip.getBoundingClientRect().left - row.getBoundingClientRect().left - 18;
  }
  fn.after?.();
  root.querySelector('h1')?.setAttribute('tabindex', '-1');
  // Browsers only honor `autofocus` on first load, not on injected markup.
  const target = root.querySelector('[autofocus]') || root.querySelector('h1');
  target?.focus({ preventScroll: true });
}

function tabs(active, inner) {
  const tab = (id, label) => `<button class="tab" data-a="tab" data-to="${id}" ${active === id ? 'aria-current="page"' : ''}>${label}</button>`;
  // One koan a day, the same for everyone. Seeing it is how the Vault collects it.
  const today = C.dateKey();
  const koan = todayKoan(today);
  collect('koans', koan);
  const unit = `KOAN #${C.dayNumber(today)} ★ ${esc(koan)} ★ `;
  const ticker = unit.repeat(4);
  return `<div class="ticker" aria-hidden="true"><div>${ticker}${ticker}</div></div>
    <main class="screen">${inner}</main>
    <nav class="tabs" aria-label="Main">${tab('home', 'TODAY')}${tab('method', 'METHOD')}${tab('receipts', 'RECEIPTS')}${tab('vault', 'VAULT')}</nav>`;
}

function step({ title, max, sub = '', body = '', foot = '', after = '', progress = 0, center = false, back = true, top = null, inlineFoot = false, eyebrow = '', slam = false, pin = false }) {
  const barHtml = top ?? `<div class="bar"><i style="width:${progress}%"></i></div>`;
  // On typing steps the button sits right under the field, so a phone keyboard can't cover it.
  let bodyHtml = body;
  let footHtml = foot;
  if (inlineFoot) {
    bodyHtml = `${body}<div class="inline-foot">${foot}</div>${after}`;
    footHtml = '';
  }
  return `<section class="step ${pin ? 'pin-foot' : ''}">
    <header class="step-top">
      ${back ? '<button class="icon" data-a="back" aria-label="Back">←</button>' : '<span class="icon"></span>'}
      ${barHtml}
      <button class="icon" data-a="exit" aria-label="Close">×</button>
    </header>
    <div class="step-body ${center ? 'center' : ''}">
      ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
      ${big(title, { max, slam })}
      ${sub ? `<p class="sub">${sub}</p>` : ''}
      ${bodyHtml}
    </div>
    ${footHtml ? `<footer class="step-foot">${footHtml}</footer>` : ''}
  </section>`;
}

const statBars = (wrinkled, wis) => {
  const bar = (label, value) => `<div class="stat-bar"><b>${label} ${value}</b><span><i style="width:${Math.min(value / 20, 1) * 100}%"></i></span></div>`;
  return `<div class="stat-bars">${bar('INT', C.intOf(wrinkled))}${bar('WIS', wis)}</div>`;
};

const VIEWS = {};

// ---------- home ----------

VIEWS.home = () => {
  const today = C.dateKey();
  const n = C.dayNumber(today);
  const done = S.dailyDone[today];
  const w = S.w ?? 60;
  return {
    html: tabs('home', `
      <header class="top">
        ${wordmark()}
        <span class="top-actions">
          <button class="mini ${sfx.isMuted() ? 'is-off' : ''}" data-a="mute" aria-label="Sound">♪</button>
          <button class="mini" data-a="about" aria-label="About">?</button>
        </span>
      </header>
      ${courtCard() || followUpCard()}
      <section class="hero">
        <button class="hero-brain" data-a="poke" aria-label="Poke the brain">${brainSVG(w, 'wobble')}${stickerSVG('NOT A THOUGHT ★ HEAD EMPTY ★ ')}<span class="bubble" aria-live="polite"></span></button>
        <h1 class="score">${w}% <small>WRINKLED${S.streak > 1 ? ` · ${S.streak}-DAY STREAK` : ''}</small></h1>
        ${statBars(w, S.wis)}
        ${S.receipts.length < 3 ? '<p class="lower-better">LOWER IS BETTER. 0% IS THE DREAM.</p>' : credLine()}
      </section>
      ${lateNightCard()}
      <button class="btn mega" data-a="start">${homeCta()}</button>
      <button class="daily ${done ? 'done' : ''}" data-a="daily" ${done ? 'disabled' : ''}>
        <span class="eyebrow">Today’s mission #${n}</span>
        <strong>${esc(dailyMove(today))}</strong>
        <span class="tag">${done ? 'DONE' : 'DO IT'}</span>
      </button>
      <div class="home-links ${S.receipts.length ? 'three' : ''}">
        <button class="mini-link" data-a="objection">BUT WHAT IF…</button>
        <button class="mini-link" data-a="spin">SPIN A DARE</button>
        ${S.receipts.length ? '<button class="mini-link" data-a="check">HEAD STUCK?</button>' : ''}
      </div>
      ${S.receipts.length ? teaser() : ''}
      ${installCard()}
    `),
  };
};

// After 10 PM, once: ask before it gets loud. Either answer stops the question.
function lateNightCard() {
  const h = new Date().getHours();
  if (S.quiet || S.quietAsked || (h < 22 && h >= 5)) return '';
  return `<div class="late-card">
    <strong>${LATE_NIGHT.title}</strong>
    <p>${LATE_NIGHT.sub}</p>
    <div class="pair">
      <button class="btn" data-a="quiet" data-v="1">${LATE_NIGHT.yes}</button>
      <button class="btn ghost" data-a="quiet" data-v="0">${LATE_NIGHT.no}</button>
    </div>
  </div>`;
}

// "WHAT DO WE CALL YOU?": after the scan, and in About.
function callMe(label = true) {
  const who = S.who || 'brother';
  const chips = C.ADDRESSES.map((a) => `<button class="chip ${who === a.id ? 'on' : ''}" data-a="who" data-v="${a.id}" aria-pressed="${who === a.id}">${a.label}</button>`).join('');
  return `<div class="callme">${label ? '<p class="eyebrow">WHAT DO WE CALL YOU?</p>' : ''}<div class="chips">${chips}</div></div>`;
}

// Day 2: what happened with the thing from yesterday. One card, newest first.
function followUpCard() {
  const today = C.dateKey();
  const r = C.followUpDue(S.receipts, today);
  if (!r) return '';
  const ago = C.agoWord(r.at, today);
  if (r.fu.type === 'reply') {
    const q = r.to ? `DID ${r.to.toUpperCase()} ANSWER?` : 'DID THEY ANSWER?';
    return `<div class="fu-card">
      <p class="eyebrow">${ago} ${FOLLOW_UP.reply.eyebrow}</p>
      <strong>${esc(q)}</strong>
      <button class="fu-thing peek" data-a="fu-peek" aria-label="Show what it was">${esc(r.thing)}</button>
      <div class="fu-choices">${FOLLOW_UP.reply.choices.map(([v, label]) => `<button class="chip" data-a="fu-answer" data-id="${r.id}" data-v="${v}">${label}</button>`).join('')}</div>
    </div>`;
  }
  if (r.fu.type === 'plan') {
    return `<div class="fu-card">
      <p class="eyebrow">${ago} ${FOLLOW_UP.plan.eyebrow}</p>
      <strong>${FOLLOW_UP.plan.title}</strong>
      <button class="fu-thing peek" data-a="fu-peek" aria-label="Show what it was">${esc(r.thing)}</button>
      <div class="fu-choices">${FOLLOW_UP.plan.choices.map(([v, label]) => `<button class="chip" data-a="fu-answer" data-id="${r.id}" data-v="${v}">${label}</button>`).join('')}</div>
    </div>`;
  }
  return `<div class="fu-card">
    <p class="eyebrow">${ago} ${FOLLOW_UP.retry.eyebrow}</p>
    <strong>${FOLLOW_UP.retry.title}</strong>
    <button class="fu-thing peek" data-a="fu-peek" aria-label="Show what it was">${esc(r.thing)}</button>
    <div class="pair">
      <button class="btn" data-a="fu-retry" data-id="${r.id}">${FOLLOW_UP.retry.go}</button>
      <button class="btn ghost" data-a="fu-answer" data-id="${r.id}" data-v="did">${FOLLOW_UP.retry.did}</button>
    </div>
    <button class="link" data-a="fu-answer" data-id="${r.id}" data-v="skip">${FOLLOW_UP.retry.skip}</button>
  </div>`;
}

// The answer, big, and shareable without the name in it.
const verdictQ = (r, named) => (r.fu?.result === 'did' ? 'Remember the thing I chickened out of?'
  : r.fu?.type === 'plan' ? 'Did the big one get a date?'
    : `Did ${named && r.to ? r.to : 'they'} answer?`);
const verdictLine = (r) => {
  const list = FOLLOW_UP.answers[r.fu.result] || FOLLOW_UP.answers.fine;
  return list[(r.fu.line || 0) % list.length];
};
VIEWS.verdict = () => {
  const r = S.receipts.find((x) => x.id === view.id);
  if (!r?.fu) return VIEWS.home();
  const res = r.fu.result;
  const ans = verdictLine(r);
  // The prediction from yesterday, called out when the brain was wrong.
  const lied = res === 'fine' && r.dread != null && r.dread >= 1;
  const sub = lied ? `You said ${DREAD[r.dread]}. It was fine. Your brain lied again.` : ans.sub;
  return {
    tone: { fine: 'lime', weird: 'pink', read: 'blue', did: 'orange', date: 'blue', asked: 'lime' }[res] || 'lime',
    html: step({
      title: ans.a,
      max: 170,
      center: true,
      back: false,
      top: '<div style="flex:1"></div>',
      sub: esc(sub),
      body: '<p class="pill">+1 WIS</p>',
      slam: true,
      foot: `<button class="btn mega" data-a="share-verdict">SHARE THIS</button>
        <button class="btn ghost" data-a="tab" data-to="home">MOVE ON</button>`,
    }).replace('<h1 class="fit', `<p class="whine">“${esc(verdictQ(r, true))}”</p><h1 class="fit`),
  };
};
VIEWS.verdict.after = () => {
  if (!view.fresh) return;
  view.fresh = false;
  sfx.boom();
  shake();
  buzz(40);
  celebrate({ shape: 'star', motion: 'burst', count: 18 });
};

// ---------- brain court ----------
// Day 3 (then 7, 14, 30): the brain goes on trial with the person's receipts as evidence.
// view: { day, stage: 'witness' | 'exhibits' | 'verdict', entry }

function courtCard() {
  const lvl = trialToday();
  if (!lvl) return '';
  const t = TRIAL.levels[lvl];
  return `<button class="court-card" data-a="trial" aria-label="${t.card} ${TRIAL.open}">
    <span class="eyebrow">${t.eyebrow}</span>
    <strong>${t.card}</strong>
    <span class="court-sub">${TRIAL.cardSub}</span>
    <span class="court-go">${TRIAL.open} →</span>
  </button>`;
}

// Between hearings, home keeps the brain's number in view, and when it's back in court.
function credLine() {
  if (!S.trials.length) return '';
  const cred = C.trialCase(S.receipts).cred;
  const last = Math.max(...S.trials.map((t) => t.day || 0));
  const next = C.TRIAL_DAYS.find((d) => d > last);
  const bits = [cred != null ? `${cred}% CREDIBLE` : '', trialToday() ? 'IN COURT TODAY' : next ? `NEXT HEARING DAY ${next}` : ''].filter(Boolean);
  return bits.length ? `<p class="lower-better">BRAIN: ${bits.join(' · ')}</p>` : '';
}

// Yesterday's message, if they haven't said yet whether it got an answer: the last witness.
function trialWitness() {
  const r = C.followUpDue(S.receipts, C.dateKey());
  return r && r.fu.type === 'reply' ? r : null;
}

const peek = (r) => (r ? `<button class="fu-thing peek" data-a="fu-peek" aria-label="Show what it was">${esc(r.thing)}</button>` : '');

function exhibitHTML(e, i) {
  const r = S.receipts.find((x) => x.id === e.id);
  const row = (k, v) => `<p class="ex-row"><span>${k}</span><b>${esc(String(v).toUpperCase())}</b></p>`;
  let rows;
  if (e.type === 'stall') rows = row('Thought about it', C.fmtDuration(e.thoughtMin)) + row('Took', C.fmtDid(e.doneSec));
  else if (e.type === 'bail' || e.type === 'overturned') rows = `<p class="ex-note">${TRIAL[e.type]}</p>`;
  else rows = row('Your brain said', DREAD[e.said]) + row(e.answered ? 'They answered' : 'It was', e.answered ? (e.was ? 'Weird' : 'Fine') : DREAD[e.was]);
  return `<li class="exhibit ex-${e.type}">
    <p class="ex-head"><b>EXHIBIT ${'ABCDEFGH'[i]}</b> · ${receiptDate(e.at)}</p>
    ${peek(r)}
    ${rows}
    <span class="stamp">${TRIAL.stamps[e.type]}</span>
  </li>`;
}

VIEWS.trial = () => {
  const t = TRIAL.levels[view.day];
  if (!t) return VIEWS.home();
  const top = '<div style="flex:1"></div>';
  if (view.stage === 'witness') {
    const r = trialWitness();
    if (r) {
      return {
        html: step({
          eyebrow: TRIAL.witness.eyebrow,
          title: r.to ? `DID ${r.to.toUpperCase()}|ANSWER?` : 'DID THEY|ANSWER?',
          max: 120,
          back: false,
          top,
          body: `${peek(r)}<div class="fu-choices">${FOLLOW_UP.reply.choices.map(([v, label]) => `<button class="chip" data-a="trial-witness" data-id="${r.id}" data-v="${v}">${label}</button>`).join('')}</div>`,
        }),
      };
    }
  }
  if (view.stage === 'verdict' && view.entry) return trialVerdictView(t, view.entry);
  const c = C.trialCase(S.receipts, lastTrialAt());
  return {
    html: step({
      eyebrow: t.eyebrow,
      title: t.title,
      max: 84,
      sub: t.sub,
      back: false,
      top,
      pin: true,
      body: c.exhibits.length ? `<ol class="exhibits">${c.exhibits.map(exhibitHTML).join('')}</ol>` : '',
      foot: `<button class="btn mega" data-a="trial-verdict">${TRIAL.toVerdict}</button>`,
    }),
  };
};

// The ruling's words: the first hearing gets the plain ones, later hearings their own.
const rulingFor = (e) => (e.day > C.TRIAL_DAYS[0] && TRIAL.again[e.verdict]) || TRIAL.verdicts[e.verdict] || TRIAL.verdicts.continued;

function trialVerdictView(t, e) {
  const v = rulingFor(e);
  const sub = fill(v.sub, {
    lies: e.lies,
    calls: e.calls,
    total: e.lies + e.calls,
    think: C.fmtDuration(e.thoughtMin || 0),
    did: C.fmtDid(e.doneSec || 0),
  });
  const cred = e.cred == null ? '' : `<div class="cred"><span>${TRIAL.cred}</span><b>${e.cred}%</b>${e.prev != null && e.prev !== e.cred ? `<em>WAS ${e.prev}%</em>` : ''}</div>`;
  const sentence = TRIAL.sentence[e.verdict] || (e.day > C.TRIAL_DAYS[0] ? TRIAL.sentence.again : TRIAL.sentence.base);
  return {
    tone: v.tone,
    html: step({
      eyebrow: `${t.name} · THE VERDICT`,
      title: v.title,
      max: 170,
      center: true,
      back: false,
      top: '<div style="flex:1"></div>',
      slam: true,
      sub: esc(sub),
      body: `${cred}<div class="sentence"><p class="eyebrow">${TRIAL.sentence.eyebrow}</p><p>${sentence}</p></div><p class="pill">+1 WIS</p>`,
      foot: `<button class="btn mega" data-a="trial-sentence">${TRIAL.sentence.go}</button>
        <button class="btn ghost" data-a="share-trial">SHARE THE VERDICT</button>
        <button class="link" data-a="tab" data-to="home">${TRIAL.sentence.later}</button>`,
    }),
  };
}

VIEWS.trial.after = () => {
  if (view.stage !== 'verdict' || !view.fresh) return;
  view.fresh = false;
  // The gavel.
  sfx.boom();
  shake();
  buzz(40);
  if (view.entry?.verdict !== 'continued') celebrate({ shape: 'star', motion: 'burst', count: 18 });
};

// A reason to come back tomorrow: brain court when it's next, otherwise what opens next, and when.
function teaser() {
  const ahead = trialAhead();
  if (ahead) {
    const t = TRIAL.levels[ahead.day];
    const title = fill(ahead.how === 'soon' ? TRIAL.soonTitle : TRIAL.actTitle, { name: t.name });
    return `<button class="teaser court" data-a="tab" data-to="receipts"><b>${title}</b><span>${ahead.how === 'soon' ? t.soon : TRIAL.act}</span></button>`;
  }
  const d = days();
  const next = nextOpening(d);
  const label = next
    ? `<b>NEXT UNLOCK</b><span>Do one thing ${next.inDays === 1 ? (S.lastDay === C.dateKey() ? 'tomorrow' : 'today') : `on ${next.inDays} more days`} and ${next.kind === 'lessons' ? 'a new law' : 'a mission pack'} opens.</span>`
    : `<b>THE VAULT</b><span>${S.found.koans.length} of ${KOANS.length} koans collected. One a day.</span>`;
  return `<button class="teaser" data-a="tab" data-to="vault">${label}</button>`;
}

// Safari can clear a site's saved data after a week away; Home Screen apps keep theirs.
function installCard() {
  if (framed || isNative() || installed() || !S.receipts.length) return '';
  if (S.installLater && Date.now() < S.installLater) return '';
  const help = view.installHelp
    ? '<p>On iPhone: tap the Share button, then <b>Add to Home Screen</b>. On Android: open the browser menu, then <b>Install app</b> or <b>Add to Home screen</b>.</p>'
    : '<p>Phones can clear a website’s saved stuff after a week away. On your Home Screen, your brain and streak stay put.</p>';
  return `<div class="install-card">
    <strong>KEEP YOUR BRAIN</strong>
    ${help}
    <div class="pair">
      <button class="btn" data-a="install-go">${view.installHelp ? 'GOT IT' : 'ADD TO HOME SCREEN'}</button>
      <button class="btn ghost" data-a="install-later">LATER</button>
    </div>
  </div>`;
}

// ---------- the opener ----------

const LAST_CARD = INTRO_CARDS.length - 1;

VIEWS.intro = () => {
  const i = Math.min(Math.max(view.i ?? 0, 0), LAST_CARD);
  const card = INTRO_CARDS[i];
  const last = i === LAST_CARD;
  const bars = INTRO_CARDS.map((c, n) => {
    const state = n < i || (n === i && last) ? 'done' : n === i ? 'now' : '';
    return `<i class="${state}" style="--dur:${c.ms || 0}ms"></i>`;
  }).join('');
  const head = big(card.head, { max: card.id === 'raccoon' ? 84 : 100, slam: true });
  const then = card.then ? big(card.then, { max: 100, slam: true, cls: 'stage2', tag: 'p' }) : '';
  const foot = card.foot ? `<p class="intro-foot">${esc(card.foot)}</p>` : '';
  const scene = SCENES[card.id]?.() || '';
  const finale = last ? `<p class="sub">${esc(INTRO.sub)}</p>
      ${vsScore != null ? `<p class="vs">Your friend scored ${vsScore}% wrinkled. Beat them.</p>` : ''}
      <div class="intro-cta">
        <button class="btn mega" data-a="quiz-start">${INTRO.cta}</button>
        <div class="intro-links">
          <button class="link" data-a="replay-intro">${esc(INTRO.replay)}</button>
          <button class="link" data-a="quiz-skip">${esc(INTRO.skip)}</button>
        </div>
      </div>` : '';
  // The raccoon card reads better with the picture under the words; the rest lead with the picture.
  const bodyOrder = card.id === 'raccoon' ? `${head}${scene}` : `${scene}${head}${then}${foot}`;
  return {
    tone: card.tone,
    html: `<section class="intro intro-${card.id}">
      <div class="stories ${view.hold ? 'hold' : ''}" aria-hidden="true">${bars}</div>
      <div class="intro-top">${wordmark()}${last ? '' : '<button class="intro-skip" data-a="intro-skip">SKIP</button>'}</div>
      <div class="intro-body">${bodyOrder}${finale}</div>
      ${last ? '' : '<button class="tap-zone" data-a="intro-tap" aria-label="Next"></button>'}
    </section>`,
  };
};
VIEWS.intro.after = () => {
  // Nothing plays to an empty room: if the page isn't on screen, wait for the visibility handler below.
  if (document.visibilityState === 'hidden') return;
  const i = Math.min(Math.max(view.i ?? 0, 0), LAST_CARD);
  const card = INTRO_CARDS[i];
  const at = (ms, fn) => introTimers.push(setTimeout(fn, ms));
  if (card.id === 'vs') at(1200, () => { sfx.boom(); shake(); buzz(40); });
  if (card.then) at(1300, () => { sfx.boom(); shake(); });
  if (card.id === 'raccoon') sfx.horn();
  if (card.id === 'free') {
    sfx.horn();
    brainRain(16);
  }
  if (card.ms && !view.hold) at(card.ms, () => go('intro', { i: i + 1 }));
};

VIEWS.quiz = () => {
  const i = quizRun.i;
  const q = QUIZ[i];
  return {
    tone: 'sun',
    html: step({
      title: q.q,
      max: 90,
      back: false,
      top: '<div class="q-fuse"><i></i></div>',
      body: `<p class="sub">${i + 1} of ${QUIZ.length}. Thinking counts against you.</p><div class="choices">${q.a
        .map((a, n) => `<button class="choice" data-a="quiz-answer" data-v="${n}">${esc(a)}</button>`)
        .join('')}</div>`,
    }),
  };
};

VIEWS.quizResult = () => {
  const t = TYPES[C.typeIndexFor(S.w)];
  const secs = S.quizSeconds;
  let vs = '';
  if (vsScore != null) {
    const line = S.w < vsScore ? `Your friend: ${vsScore}%. You win. You’re smoother.`
      : S.w > vsScore ? `Your friend: ${vsScore}%. They’re smoother than you. Embarrassing.` : `Your friend: ${vsScore}%. It’s a tie.`;
    vs = `<p class="vs">${line}</p>`;
  }
  return {
    tone: 'sun',
    html: `<section class="step">
      <div class="step-body center">
        ${big(`${S.w}%|WRINKLED`, { max: 120, center: true, slam: true })}
        <div class="result-brain">${brainSVG(S.w, 'wobble')}</div>
        <p class="pill">${esc(t.name)}</p>
        ${statBars(S.w, S.wis)}
        <p class="sub center-text">${esc(t.roast)} You took ${secs} second${secs === 1 ? '' : 's'}. One question was about tacos.</p>
        ${vs}
        ${callMe()}
        <button class="btn ghost share-scan" data-a="share-quiz">SHARE MY SCAN</button>
      </div>
      <footer class="step-foot pinned">
        <button class="btn mega" data-a="start">${homeCta()}</button>
      </footer>
    </section>`,
  };
};
VIEWS.quizResult.after = () => {
  if (view.fresh) {
    view.fresh = false;
    sfx.boom();
    shake();
    buzz(40);
  }
};

// ---------- but what if ----------

// Every objection plays once before any repeats. Hearing one files it in the Vault.
function nextObjection(back) {
  const pool = objPool();
  const r = fresh('objection', pool);
  collect('heard', pool[r.index].q);
  go('objection', { i: r.index, back: back || 'home' });
}

function objectionAt(i) {
  const pool = objPool();
  const o = pool[i % pool.length];
  const answer = o.time ? `IT’S ${C.clockNow()}.|THAT’S|A TIME.` : C.addr(o.a, S.who) || o.none || o.a;
  return { q: o.q, answer };
}

VIEWS.objection = () => {
  const o = objectionAt(view.i);
  return {
    tone: 'pink',
    html: step({
      title: o.answer,
      max: 170,
      center: true,
      eyebrow: '',
      sub: '',
      top: '<div style="flex:1"></div>',
      body: '',
      slam: true,
      foot: `<button class="btn mega" data-a="objection-next">BUT WHAT IF…</button>
        <button class="btn ghost" data-a="share-objection">SHARE THIS</button>`,
    }).replace('<h1 class="fit', `<p class="whine">“${esc(o.q)}”</p><h1 class="fit`),
  };
};
VIEWS.objection.after = () => {
  sfx.whine();
  clearTimeout(VIEWS.objection.t);
  VIEWS.objection.t = setTimeout(() => {
    if (view.name !== 'objection') return;
    sfx.boom();
    shake();
  }, 260);
};

// ---------- the loop ----------

function newLoop(fields = {}) {
  return { step: 'thing', trail: [], thing: '', move: '', answers: {}, doorI: 0, thoughtMin: null, dread: null, reality: null, outcome: null, verdict: null, kind: null, source: 'free', dur: 600, startedAt: null, doneSec: null, createdAt: Date.now(), theme: fresh('theme', THEMES).item, ...fields };
}

function loopTo(next, { push = true } = {}) {
  const L = S.active;
  if (push) L.trail.push(L.step);
  L.step = next;
  save();
  go('loop');
}

// The fast lane is thing → fast → timer. The door check (thing → howlong → door → verdict → fast)
// runs only when asked for, or when the wording looks like a one-way door.
const PROGRESS = { thing: 10, howlong: 22, door: 34, verdict: 46, fast: 58, draft: 70, timer: 85, outcome: 92, reality: 96, after: 98 };

function currentDraft(L) {
  if (L.draftEdited && L.draft != null) return L.draft;
  const kind = DRAFTS.find((d) => d.id === L.draftKind) || DRAFTS[0];
  // "Text it like a text": the lowercase version, for kinds that have one.
  // BOLD (Pro): written like you're not scared.
  const bold = L.draftBold && S.pro && BOLD_DRAFTS[kind.id];
  const list = bold || (L.draftCasual && kind.casual ? kind.casual : kind.variants);
  const hints = C.draftHints(L.thing);
  return C.fillDraft(list[(L.draftVariant || 0) % list.length], L.draftName ?? hints.name, hints);
}

function syncDraftLinks() {
  const L = S.active;
  if (!L) return;
  const text = currentDraft(L);
  const kind = DRAFTS.find((d) => d.id === L.draftKind) || DRAFTS[0];
  document.getElementById('draft-sms')?.setAttribute('href', C.smsHref(text));
  document.getElementById('draft-mail')?.setAttribute('href', C.mailHref(kind.subject, text));
}

const STEPS = {
  thing: (L) => ({
    html: step({
      title: L.title || 'WHAT ARE WE|OVERTHINKING?',
      progress: PROGRESS.thing,
      body: `<textarea id="thing" class="field" rows="2" maxlength="140" placeholder="${esc(L.placeholder || (L.placeholder = fresh('placeholder', THING_PLACEHOLDERS).item))}" aria-label="What you’re overthinking" autofocus>${esc(L.thing)}</textarea>`,
      foot: `<button class="btn" id="next" data-a="thing-next" ${L.thing.trim() ? '' : 'disabled'}>NEXT</button>
        ${L.full ? '' : '<button class="link" data-a="to-door">Not sure you should? Check the door first</button>'}`,
      inlineFoot: true,
    }),
  }),

  howlong: () => ({
    html: step({
      title: 'HOW LONG|HAVE WE BEEN|ON THIS?',
      max: 90,
      progress: PROGRESS.howlong,
      body: `<div class="choices">${THINK_TIMES.map((t) => `<button class="choice" data-a="howlong" data-m="${t.minutes}">${t.label}</button>`).join('')}</div>`,
    }),
  }),

  // Asked after the timer in the fast lane, when it costs nothing: you've already done the thing.
  after: () => ({
    html: step({
      title: 'HOW LONG HAD|YOU BEEN|DODGING IT?',
      max: 90,
      sub: 'For the receipt.',
      progress: PROGRESS.after,
      back: false,
      body: `<div class="choices two">${[{ label: 'I WASN’T', minutes: 0 }, ...THINK_TIMES, { label: 'NO IDEA', minutes: -1 }].map((t) => `<button class="choice" data-a="after-howlong" data-m="${t.minutes}">${t.label}</button>`).join('')}</div>`,
    }),
  }),

  door: (L) => {
    const q = DOOR[L.doorI];
    return {
      html: step({
        title: q.q,
        sub: q.sub || '',
        progress: PROGRESS.door + L.doorI * 3,
        center: true,
        foot: `<div class="pair"><button class="btn ghost" data-a="door" data-v="0">${q.no}</button><button class="btn" data-a="door" data-v="1">${q.yes}</button></div>`,
      }),
    };
  },

  verdict: (L) => {
    const v = VERDICTS[L.verdict];
    const tone = { send: 'sun', shrink: 'pink', think: 'blue' }[L.verdict];
    const sub = L.kind ? ONE_WAY_COPY[L.kind].why : v.sub;
    const wrong = L.forced ? '<button class="link" data-a="not-oneway">That’s not what this is</button>' : '';
    const moon = L.verdict === 'think' ? `<button class="btn ghost" data-a="moonwalk">${MOONWALK_LABEL}</button>` : '';
    return {
      tone,
      html: step({
        title: v.title,
        max: L.verdict === 'send' ? 230 : 130,
        slam: true,
        sub,
        progress: PROGRESS.verdict,
        center: true,
        foot: `<button class="btn mega" data-a="verdict-next">${v.cta}</button>${moon}${wrong}`,
      }),
    };
  },

  // One screen: the first tiny step (already filled in), an optional prediction, then GO.
  fast: (L) => {
    const think = L.verdict === 'think';
    const offerDraft = L.draftKind && !think;
    // Five suggestions per round, drawn from a bigger pool, so the screen isn't the same every time.
    if (!L.chips) L.chips = C.shuffled(MOVE_CHIPS).slice(0, 5);
    const chips = think || offerDraft ? '' : `<div class="chips">${L.chips.map((c) => `<button class="chip" data-a="chip" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
    const draftCard = offerDraft
      ? `<button class="draft-card" data-a="to-draft"><span class="eyebrow">Looks like a message</span><strong>WRITE IT FOR ME</strong><span class="tag">WRITE</span></button>`
      : think ? '' : '<button class="link words-link" data-a="to-draft">Need words? Pick a message →</button>';
    const dread = `<div class="dread-row" role="group" aria-label="How bad is it gonna go?">
        <p class="eyebrow">Call it: how bad will it go? We check when you’re done.</p>
        <div class="dread-pills">${DREAD.map((d, i) => `<button class="pill-btn" data-a="dread-pick" data-v="${i}" aria-pressed="${L.dread === i}">${d.toUpperCase()}</button>`).join('')}</div>
      </div>`;
    return {
      tone: L.theme || '',
      html: step({
        title: think ? 'THE FIRST|10 MINUTES:' : 'FIRST|TINY STEP:',
        max: 96,
        sub: L.source === 'free' || L.source === 'retry' ? esc(L.thing) : '',
        progress: PROGRESS.fast,
        pin: true,
        body: `<textarea id="move" class="field" rows="2" maxlength="140" aria-label="Your first step">${esc(L.move)}</textarea>${draftCard}${dread}${chips}`,
        foot: `<button class="btn mega" id="next" data-a="fast-go" ${L.move.trim() ? '' : 'disabled'}>GO</button>`,
      }),
    };
  },

  draft: (L) => {
    const kind = DRAFTS.find((d) => d.id === L.draftKind) || DRAFTS[0];
    const text = currentDraft(L);
    const kinds = DRAFTS.map((d) => `<button class="chip ${d.id === kind.id ? 'on' : ''}" data-a="draft-kind" data-v="${d.id}" aria-pressed="${d.id === kind.id}">${d.label}</button>`).join('');
    return {
      html: step({
        title: 'DRAFT IT|UGLY.',
        max: 76,
        sub: 'Plain, short, sendable. Change anything.',
        progress: PROGRESS.draft,
        body: `<div class="chips draft-kinds">${kinds}</div>
          <input id="draft-name" class="name-field" type="text" maxlength="40" placeholder="Their name (optional)" value="${esc(L.draftName ?? C.draftHints(L.thing).name)}" autocomplete="off" aria-label="Their name">
          <textarea id="draft" class="draft-box" rows="4" maxlength="600" aria-label="Your message">${esc(text)}</textarea>
          <div class="draft-tools">
            <button class="link" data-a="draft-another">↻ Another one</button>
            ${kind.casual ? `<button class="link ${L.draftCasual ? 'on' : ''}" data-a="draft-casual" aria-pressed="${!!L.draftCasual}">${L.draftCasual ? 'Type it properly' : 'Text it like a text'}</button>` : ''}
            <button class="link" data-a="draft-calm">Calm it down</button>
            <button class="link" data-a="draft-clear">Write my own</button>
            ${sellsPro() ? `<button class="link bold-link ${L.draftBold && S.pro ? 'on' : ''}" data-a="draft-bold" aria-pressed="${!!(L.draftBold && S.pro)}">${L.draftBold && S.pro ? 'Back to normal' : `Say it bold${S.pro ? '' : ' · PRO'}`}</button>` : ''}
          </div>
          <p class="draft-note" id="blank-note" ${C.hasBlanks(text) ? '' : 'hidden'}>Fill in the [brackets] before you send it.</p>
          ${kind.note ? `<p class="draft-note">${esc(kind.note)}</p>` : ''}`,
        foot: `<button class="btn mega" data-a="draft-go">COPY IT. START THE CLOCK.</button>
          <div class="pair">
            <a class="btn ghost" id="draft-sms" data-a="draft-open" href="${esc(C.smsHref(text))}">OPEN TEXTS</a>
            <a class="btn ghost" id="draft-mail" data-a="draft-open" href="${esc(C.mailHref(kind.subject, text))}">OPEN EMAIL</a>
          </div>`,
      }),
    };
  },

  timer: (L) => {
    const running = !!L.startedAt;
    return {
      tone: L.theme || 'sun',
      html: step({
        title: L.verdict === 'think' ? (running ? 'ON PURPOSE.' : 'TEN MINUTES.|ON PURPOSE.') : running ? 'NOT A THOUGHT.' : 'NOTHING TO DECIDE.',
        progress: PROGRESS.timer,
        back: !running,
        center: true,
        body: `<div class="timer-brain ${running ? 'bob' : ''}">${brainSVG(S.w ?? 60, 'tiny')}</div>
          <div class="clock" id="clock" role="timer">${C.fmtClock(running ? remaining(L) : L.dur)}</div>
          ${running ? `<p class="hype in" id="hype">${esc(L.hype || '')}</p>` : ''}
          <p class="plan">${esc(L.move || L.thing)}</p>
          ${L.draft && !C.hasBlanks(L.draft) ? `<div class="draft-mini"><p>${esc(L.draft)}</p><button class="link" data-a="draft-copy">Copy it again</button></div>` : ''}
          ${running ? '' : '<button class="link" data-a="objection">But what if…</button>'}
          <p class="sub center-text" id="clock-note"></p>`,
        foot: running
          ? `<button class="btn mega" data-a="timer-done">DONE</button><div class="timer-links"><button class="link" data-a="timer-done" data-v="some">Kinda did it</button><button class="link" data-a="timer-bail">I chickened out</button></div>`
          : `<button class="btn mega" data-a="timer-go">GO</button>${L.dur === 600 ? '<button class="link" data-a="timer-short">Too much? Make it 2 minutes</button>' : ''}`,
      }),
    };
  },

  outcome: () => ({
    html: step({
      title: 'SO?',
      max: 200,
      progress: PROGRESS.outcome,
      back: false,
      body: `<div class="choices">
        <button class="choice" data-a="outcome" data-v="did">DID IT</button>
        <button class="choice" data-a="outcome" data-v="some">KINDA</button>
        <button class="choice" data-a="outcome" data-v="bailed">CHICKENED OUT</button>
      </div>`,
    }),
  }),

  reality: (L) => ({
    html: step({
      title: L.draftKind ? 'HOW BAD WAS|SENDING IT?' : 'HOW BAD WAS IT|ACTUALLY?',
      sub: `You said: ${DREAD[L.dread]}.`,
      progress: PROGRESS.reality,
      back: false,
      body: `<div class="choices">${DREAD.map((d, i) => `<button class="choice" data-a="reality" data-v="${i}">${d.toUpperCase()}</button>`).join('')}</div>`,
    }),
  }),
};

VIEWS.loop = () => {
  if (!S.active) return VIEWS.home();
  return (STEPS[S.active.step] || STEPS.thing)(S.active);
};
VIEWS.loop.after = () => {
  const L = S.active;
  if (!L) return;
  if (L.step === 'timer' && L.startedAt) startTick();
  if (L.step === 'draft') syncDraftLinks();
  if (L.step === 'verdict' && !L.verdictPlayed) {
    L.verdictPlayed = true;
    save();
    shake();
    buzz(40);
    if (L.verdict === 'send') sfx.horn();
    else sfx.boom();
    if (L.verdict === 'send') brainRain(14);
  }
};

function remaining(L) {
  return L.dur - (Date.now() - L.startedAt) / 1000;
}

function startTick() {
  const clock = document.getElementById('clock');
  const note = document.getElementById('clock-note');
  let rang = remaining(S.active) <= 0;
  const hype = document.getElementById('hype');
  const nextHype = () => {
    if (!hype || !S.active) return;
    S.active.hype = S.active.verdict === 'think' ? fresh('timer-think', THINK_TIMER_LINES).item : fresh('timer', TIMER_LINES).item;
    hype.textContent = C.addr(S.active.hype, S.who);
    hype.classList.remove('in');
    void hype.offsetWidth;
    hype.classList.add('in');
  };
  if (hype && !S.active.hype) nextHype();
  let hypeAt = Date.now();
  let lastCount = null;
  const tick = () => {
    if (!S.active) return;
    const left = remaining(S.active);
    if (clock) clock.textContent = C.fmtClock(left);
    if (Date.now() - hypeAt > 15000) {
      hypeAt = Date.now();
      nextHype();
    }
    const sec = Math.ceil(left);
    if (left > 0 && sec <= 5 && sec !== lastCount) {
      lastCount = sec;
      sfx.tick(1 + (5 - sec) * 0.12);
    }
    if (left <= 0 && !rang) {
      rang = true;
      buzz([120, 60, 120]);
      sfx.horn();
      if (note) note.textContent = 'Time. You can stop now.';
    }
  };
  tick();
  timerId = setInterval(tick, 250);
  try {
    navigator.wakeLock?.request('screen').catch(() => {});
  } catch { /* Not supported. */ }
}

function finishLoop() {
  const L = S.active;
  const today = C.dateKey();
  const before = S.w ?? 60;
  // The first 3 finishes a day count. More still get a receipt, but the brain isn't a microwave.
  const credit = L.outcome === 'bailed' ? null : C.creditToday(S.credit, today);
  if (credit) S.credit = credit.credit;
  const counts = !!credit?.counts;
  const after = counts ? C.smoothAfter(before, L.outcome) : before;
  const wisDelta = counts ? C.wisGain(L.outcome) : 0;
  const prevDay = S.lastDay;
  const prevStreak = S.streak;
  const daysBefore = days();
  const firstEver = !S.receipts.length;
  let forgiven = false;
  if (L.outcome !== 'bailed') {
    forgiven = C.forgivenGap(prevDay, today) && prevStreak > 0;
    S.streak = C.nextStreak(S.lastDay, S.streak, today);
    S.lastDay = today;
    if (L.source === 'daily') S.dailyDone[today] = true;
  }
  const receipt = {
    id: Date.now().toString(36),
    thing: L.thing,
    move: L.move,
    thoughtMin: L.thoughtMin,
    doneSec: L.outcome === 'bailed' ? null : L.doneSec,
    outcome: L.outcome,
    dread: L.dread,
    reality: L.outcome === 'bailed' ? null : L.reality,
    at: Date.now(),
    day: C.dayNumber(today),
    n: S.receipts.length + 1,
    streak: L.outcome === 'bailed' ? 0 : S.streak,
    kind: L.draftKind || null,
    to: L.draftKind ? (L.draftName ?? C.draftHints(L.thing).name) || '' : '',
    fu: C.followUpFor(L),
    draft: L.draft || null,
    closer: fresh('closer', CLOSERS).item,
  };
  const line = closeLine(receipt, {
    capped: credit && !credit.counts ? credit.n : 0,
    firstEver,
    streak: S.streak,
    streakUp: S.streak > prevStreak,
    gapDays: prevDay ? C.dayDiff(prevDay, today) : null,
    source: L.source,
    think: L.verdict === 'think',
  });
  S.receipts.unshift(receipt);
  S.w = after;
  S.wis += wisDelta;
  S.active = null;
  save();
  const daysAfter = days();
  const unlocked = [
    ...C.newlyOpen(UNLOCK_DAYS.lessons, daysBefore, daysAfter).map((id) => ({ kind: 'lessons', id })),
    ...C.newlyOpen(UNLOCK_DAYS.packs, daysBefore, daysAfter).map((id) => ({ kind: 'packs', id })),
  ];
  // Ask the browser not to clear this site's data. Harmless if it says no.
  if (firstEver && !framed) navigator.storage?.persist?.().catch(() => {});
  const finished = S.receipts.filter((x) => x.outcome !== 'bailed').length;
  // At most one new piece a day, so the closet fills over weeks, not one night.
  const drip = counts && S.lastDripDay !== today ? C.dripDue(finished, S.closet, S.closetOrder, DRIP_AT) : null;
  if (drip) {
    S.closet.push(drip);
    S.lastDripDay = today;
  }
  // Ask for a rating right after a win, twice ever. The system decides whether it actually shows.
  if (L.outcome !== 'bailed' && [3, 12].includes(finished) && !S.reviewAt.includes(finished)) {
    S.reviewAt.push(finished);
    setTimeout(requestReview, 2600);
  }
  save();
  refreshNudges();
  const flash = receipt.legendary ? 'sun' : fresh('flash', FLASHES).item;
  go('close', { receipt, before, after, wisDelta, showThing: false, fresh: true, line, unlocked, forgiven, drip, flash, firstEver });
}

// ---------- close and receipts ----------

const receiptDate = (at) => new Date(at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

function receiptHTML(r, showThing) {
  const rows = [];
  rows.push(['The thing', showThing ? esc(r.thing) : '<span class="redact" aria-label="Hidden"></span>']);
  if (r.thoughtMin) rows.push(['Overthought', C.fmtDuration(r.thoughtMin)]);
  const bailed = r.outcome === 'bailed';
  const kinda = r.outcome === 'some';
  rows.push(['Did it in', bailed ? 'Not today' : `${kinda ? 'Kinda. ' : ''}${C.fmtDid(r.doneSec)}`]);
  if (r.dread != null) rows.push(['You said', DREAD[r.dread]]);
  if (r.reality != null) rows.push(['It was', DREAD[r.reality]]);
  rows.push(['Thoughts', bailed ? 'Many' : '0']);
  const x = bailed ? null : C.ratio(r.thoughtMin, r.doneSec);
  const bigText = bailed ? 'CHICKENED OUT' : x ? C.fmtRatio(x) : 'DONE';
  const label = bailed ? 'NO PENALTY. NOTHING HAPPENED.' : x ? (kinda ? 'THINKING TO KINDA DOING' : 'THINKING TO DOING') : kinda ? 'KINDA COUNTS' : 'THAT’S THE WHOLE THING';
  return `<div class="receipt-wrap"><div class="receipt ${r.legendary ? 'gold' : `skin-${skinOf().id}`}">
    <p class="r-title">${wordmark()}</p>
    <p class="r-sub">RECEIPT #${r.n ?? r.day}${r.at ? ` · ${receiptDate(r.at)}` : ''}${r.legendary ? ' ★ LEGENDARY' : ''}</p>
    <div class="r-rows"><dl>${rows.map(([k, v]) => `<div class="r-row"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>
    <p class="r-big">${bigText}</p>
    <p class="r-label">${label}</p>
    <p class="r-closer">${esc((r.closer || CLOSER).toUpperCase())}</p>
  </div></div>`;
}

// Picked once, when the receipt is made. Bad outcomes and caught forecasts get fixed,
// plain lines; only the ordinary wins get jokes, moment lines or a gold receipt.
// May mark the receipt legendary.
function closeLine(r, ctx) {
  if (r.outcome === 'bailed') return fresh('bail', BAIL_LINES).item;
  if (r.reality === 3) return 'Okay. That one was bad. If it’s actually serious, talk to somebody who can help.';
  if (r.reality === 2) return 'That happens. Now you know something. Move on.';
  if (r.dread != null && r.reality < r.dread) return `You said ${DREAD[r.dread]}. It was ${DREAD[r.reality]}. Your brain is a liar.`;
  // A one-way door handled the right way gets a straight line, not a joke about speed.
  if (ctx.think) return 'A question, a date, a person who knows. That’s how a big one gets handled. The brain can clock out.';
  if (ctx.capped) return `That’s ${ctx.capped} today. The brain only smooths ${C.DAILY_CREDIT} a day. It’s a brain, not a microwave.`;
  if (r.doneSec != null && r.doneSec < 10) return 'Under 10 seconds. Either you’re a legend or you didn’t do it. We’ll never know.';
  if (Math.random() < C.LEGENDARY_ODDS) {
    // Unfound rare lines come first, so the collection fills before anything repeats.
    const unfound = RARE_LINES.filter((l) => !hasFound('rares', l));
    const rare = unfound.length ? unfound[Math.floor(Math.random() * unfound.length)] : fresh('rare', RARE_LINES).item;
    collect('rares', rare);
    r.legendary = true;
    r.rare = rare;
    return rare;
  }
  const moment = C.closeContext({ ...ctx, doneSec: r.doneSec });
  const pool = moment && CONTEXT_LINES[moment];
  if (pool && (pool.always || Math.random() < MOMENT_ODDS)) return fresh(`ctx:${moment}`, pool.lines).item;
  return fresh('done', DONE_LINES).item;
}

VIEWS.close = () => {
  const { receipt: r, before, after, wisDelta, showThing, fresh, fromHistory, line, unlocked = [], forgiven, drip, flash } = view;
  const toggle = `<label class="toggle"><input type="checkbox" data-c="show-thing" ${showThing ? 'checked' : ''}> Show what it was</label>`;
  if (fromHistory) {
    return {
      html: `<main class="screen close">
        ${big(`RECEIPT #${r.n ?? r.day}`, { max: 60 })}
        ${receiptHTML(r, showThing)}
        ${toggle}
        <div class="close-foot">
          <button class="btn mega" data-a="share-receipt">SHARE RECEIPT</button>
          <button class="btn ghost" data-a="tab" data-to="receipts">BACK</button>
        </div>
      </main>`,
    };
  }
  const intDelta = C.intOf(before) - C.intOf(after);
  const bailed = r.outcome === 'bailed';
  const stats = bailed ? 'NO PENALTY' : [intDelta ? `−${intDelta} INT` : '', `+${wisDelta} WIS`].filter(Boolean).join(' · ');
  const levelLines = bailed ? 'NO|PENALTY.' : [r.legendary ? 'LEGENDARY' : '', intDelta ? `−${intDelta} INT` : '', `+${wisDelta} WIS`].filter(Boolean).join('|');
  const overlay = fresh ? `<div class="levelup ${bailed ? 'sad' : `f-${flash || 'sun'}`}" id="levelup" data-a="skip-level">${big(levelLines, { max: 190, slam: true, center: true })}</div>` : '';
  // The cliffhanger: brain court is tomorrow.
  const ahead = trialAhead();
  const court = ahead?.how === 'soon' ? ahead : null;
  return {
    html: `<main class="screen close">
      <div class="close-head">
        <div id="close-brain">${brainSVG(fresh ? before : after, 'small')}</div>
        <div>
          <h1 class="score"><span id="count">${fresh ? before : after}</span>% <small>WRINKLED</small></h1>
          <p class="delta">${stats}</p>
        </div>
      </div>
      ${r.legendary ? '<p class="legend-tag">★ LEGENDARY RECEIPT ★</p>' : ''}
      <p class="close-line">${esc(line || '')}</p>
      ${forgiven ? '<p class="forgiven">You skipped yesterday. Streak kept. A day off is a day off.</p>' : ''}
      ${drip ? dripCard(drip, after) : ''}
      ${credMove(r)}
      ${court ? `<div class="court-soon"><b>${fill(TRIAL.soonTitle, { name: TRIAL.levels[court.day].name })}</b><span>${TRIAL.levels[court.day].soon}</span></div>` : ''}
      ${(view.firstEver || r.fu || court) && canNudge() && !S.nudge && !view.nudgeAsked ? `<div class="nudge-card">
        <b>${court ? TRIAL.offer : r.fu ? FOLLOW_UP.offer[r.fu.type] : 'WANT A NUDGE TOMORROW?'}</b>
        <span>${r.fu ? FOLLOW_UP.offer.sub : 'One a day. Skipped if you’ve already done something.'}</span>
        <div class="chips">${[[15, 30, 'AFTER SCHOOL'], [18, 0, '6 PM'], [21, 0, '9 PM']].map(([h, m, label]) => `<button class="chip" data-a="nudge" data-h="${h}" data-m="${m}">${label}</button>`).join('')}<button class="chip" data-a="nudge" data-h="">NAH</button></div>
      </div>` : ''}
      ${unlocked.map((u) => `<button class="unlock-card" data-a="${u.kind === 'lessons' ? 'lesson' : 'pack'}" data-id="${u.id}">
        <b>UNLOCKED</b><span>${esc(unlockName(u.kind, u.id))}</span></button>`).join('')}
      ${receiptHTML(r, showThing)}
      ${toggle}
      <div class="close-foot">
        <button class="btn mega" data-a="share-receipt">SHARE RECEIPT</button>
        <button class="btn ghost" data-a="tab" data-to="home">MOVE ON</button>
      </div>
    </main>${overlay}`,
  };
};

// After the first hearing, every checked guess moves the brain's credibility, and the receipt says by how much.
function credMove(r) {
  if (!S.trials.length || !['lie', 'called', 'worse'].includes(C.exhibitFor(r)?.type)) return '';
  const now = C.trialCase(S.receipts).cred;
  const was = C.trialCase(S.receipts.filter((x) => x.id !== r.id)).cred;
  if (now == null) return '';
  return `<p class="cred-move">${TRIAL.cred} <b>${was == null || was === now ? `STILL ${now}%` : `${was}% → ${now}%`}</b></p>`;
}

// A new piece of drip: shown on the brain, one tap to put it on.
function dripCard(id, w) {
  const info = WARDROBE_INFO.find((p) => p.id === id);
  if (!info) return '';
  const wearing = S.wear === id;
  return `<div class="drip-card">
    <div class="drip-brain">${brainSVG(w, 'tiny', id)}</div>
    <div class="drip-text">
      <b>NEW DRIP</b>
      <strong>${esc(info.name)}</strong>
      <span>${esc(info.line)}</span>
      <button class="btn" data-a="wear" data-id="${id}">${wearing ? 'TAKE IT OFF' : 'WEAR IT'}</button>
    </div>
  </div>`;
}

function dismissLevelUp() {
  const el = document.getElementById('levelup');
  if (!el || el.classList.contains('out')) return;
  clearTimeout(dismissLevelUp.t);
  el.classList.add('out');
  setTimeout(() => el.remove(), 260);
  const { before, after } = view;
  setTimeout(() => {
    const svg = document.querySelector('#close-brain svg');
    const count = document.getElementById('count');
    if (!svg || !count) return;
    updateBrain(svg, after);
    svg.classList.add('boing');
    const t0 = performance.now();
    const anim = (t) => {
      const p = Math.min((t - t0) / 700, 1);
      count.textContent = Math.round(before + (after - before) * p);
      if (p < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }, 200);
}

VIEWS.close.after = () => {
  if (!view.fresh) return;
  view.fresh = false;
  const bailed = view.receipt.outcome === 'bailed';
  shake();
  // A win feels like a win; bailing gets a light tap, never the same reward.
  buzz(bailed ? 12 : 'success');
  if (bailed) sfx.womp();
  else {
    const r = view.receipt;
    if (r.legendary) {
      sfx.legendary();
      celebrate({ shape: 'star', motion: 'burst', count: 48 });
    } else {
      sfx.horn();
      celebrate(fresh('celebrate', CELEBRATIONS).item);
    }
    // Every receipt gets its own little tune: same receipt, same tune.
    setTimeout(() => sfx.jingle(r.id), r.legendary ? 1500 : 1100);
    if (view.drip || view.unlocked?.length) setTimeout(() => sfx.unlock(), 2100);
  }
  dismissLevelUp.t = setTimeout(dismissLevelUp, 1500);
};

VIEWS.receipts = () => {
  const stats = C.lifetime(S.receipts);
  if (!S.receipts.length) {
    return {
      html: tabs('receipts', `${big('NO RECEIPTS.|THAT’S THE|PROBLEM.', { max: 110 })}
        <div style="flex:1;min-height:24px"></div>
        <button class="btn mega" data-a="start">${homeCta()}</button>`),
    };
  }
  // After the first hearing, the court's number; before it, the plain count.
  const cred = S.trials.length ? C.trialCase(S.receipts).cred : null;
  const forecast = cred != null
    ? `<div class="stat"><b>${cred}%</b><span>brain credibility</span></div>`
    : stats.forecasts ? `<div class="stat"><b>${stats.wrong} OF ${stats.forecasts}</b><span>times your brain lied</span></div>` : '';
  return {
    html: tabs('receipts', `${big('RECEIPTS', { max: 90 })}
      <div class="stats">
        <div class="stat wide"><b>${stats.ratio ? C.fmtRatio(stats.ratio) : `${stats.did} DONE`}</b><span>${stats.ratio ? 'thinking to doing, lifetime' : 'things done so far'}</span></div>
        <div class="stat"><b>${C.fmtDuration(stats.thoughtMin).toUpperCase()}</b><span>overthinking</span></div>
        <div class="stat"><b>${C.fmtDid(stats.doneSec).toUpperCase()}</b><span>actually doing it</span></div>
        ${forecast}
        <div class="stat"><b>${S.streak || 0}</b><span>day streak</span></div>
      </div>
      <button class="btn mega" data-a="share-lifetime" style="margin-top:14px">SHARE THE WHOLE RECORD</button>
      <p class="eyebrow section-label">History</p>
      <ul class="log">${S.receipts.map((r) => `<li><button class="log-item" data-a="open-receipt" data-id="${r.id}">
        <strong>${r.legendary ? '<span class="star" aria-label="Legendary">★</span> ' : ''}${esc(r.thing)}</strong>
        <span>${new Date(r.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <em>${r.outcome === 'bailed' ? 'chickened out' : `${r.outcome === 'some' ? 'kinda · ' : ''}${C.fmtDid(r.doneSec)}`}</em>
      </button></li>`).join('')}</ul>`),
  };
};

// ---------- method ----------

// Locked laws and packs show as redacted bars with a countdown, so there's a reason to come back.
VIEWS.method = () => {
  const d = days();
  const lockLabel = (need) => `OPENS IN ${dayWord(need - d).toUpperCase()}`;
  const rule = (l, i) => {
    if (!lessonOpen(l.id, d)) {
      return `<li><button class="rule locked" data-a="locked" data-need="${UNLOCK_DAYS.lessons[l.id]}"><span class="n">${i + 1}</span><span><i class="bars" aria-hidden="true"></i><small>${lockLabel(UNLOCK_DAYS.lessons[l.id])}</small></span></button></li>`;
    }
    return `<li><button class="rule ${S.read.includes(l.id) ? 'read' : ''}" data-a="lesson" data-id="${l.id}"><span class="n">${i + 1}</span><span>${esc(l.rule.replace(/\|/g, ' '))}</span></button></li>`;
  };
  const pack = (p) => (packOpen(p.id, d)
    ? `<button class="pack" data-a="pack" data-id="${p.id}">${esc(p.name)}</button>`
    : `<button class="pack locked" data-a="locked" data-need="${UNLOCK_DAYS.packs[p.id]}"><i class="bars" aria-hidden="true"></i><small>${lockLabel(UNLOCK_DAYS.packs[p.id])}</small></button>`);
  return {
    html: tabs('method', `${big('THE GREAT|METHOD', { max: 100 })}
      <ol class="rules">${LESSONS.map(rule).join('')}</ol>
      <p class="eyebrow section-label">Missions</p>
      <div class="packs">${PLAYBOOKS.map(pack).join('')}</div>`),
  };
};

// ---------- spin a dare ----------

function spinDare(hard) {
  const h = !!hard && S.pro;
  const pool = h ? HARD_DARES : darePool();
  const pick = fresh(h ? 'hard' : 'dare', pool).item;
  clearTimeout(VIEWS.spin.t);
  go('spin', { phase: 'spinning', pick, pool: C.shuffled(pool), tone: fresh('theme', THEMES).item, hard: h });
}

function darePool() {
  const d = days();
  return [...DARES, ...PLAYBOOKS.filter((p) => packOpen(p.id, d)).flatMap((p) => p.moves)];
}

VIEWS.spin = () => {
  const landed = view.phase === 'landed';
  return {
    tone: view.tone,
    html: step({
      title: landed ? (view.hard ? 'HARD|MODE.' : 'THE WHEEL|HAS SPOKEN.') : 'SPINNING…',
      max: 110,
      top: '<div style="flex:1"></div>',
      center: true,
      slam: landed,
      body: `<div class="reel ${landed ? 'landed' : ''}"><p id="reel" aria-live="polite">${esc(landed ? view.pick : view.pool[0])}</p></div>
        ${landed ? '<p class="sub center-text">The wheel doesn’t do take-backs. Well. One.</p>' : ''}`,
      foot: landed ? `<button class="btn mega" data-a="dare-go">DO IT</button><button class="btn ghost" data-a="spin">SPIN AGAIN</button>
        ${sellsPro() ? `<button class="link hard-link" data-a="spin-hard">${view.hard ? 'Back to normal dares' : `HARD MODE${S.pro ? '' : ' · PRO'}`}</button>` : ''}` : '',
    }),
  };
};
VIEWS.spin.after = () => {
  if (view.phase !== 'spinning') return;
  const reel = document.getElementById('reel');
  const { pool } = view;
  let i = 0;
  let delay = 45;
  const land = () => {
    view.phase = 'landed';
    render();
    sfx.boom();
    buzz(40);
    shake();
  };
  if (calm()) {
    land();
    return;
  }
  const spinStep = () => {
    if (view.name !== 'spin') return;
    i += 1;
    if (reel) reel.textContent = pool[i % pool.length];
    sfx.tick(1 + (i % 5) * 0.08);
    delay *= 1.15;
    if (delay < 380) VIEWS.spin.t = setTimeout(spinStep, delay);
    else land();
  };
  VIEWS.spin.t = setTimeout(spinStep, delay);
};

// ---------- the vault ----------

VIEWS.vault = () => {
  const d = days();
  const next = nextOpening(d);
  const openLaws = C.openIds(UNLOCK_DAYS.lessons, d).length;
  const openPacks = C.openIds(UNLOCK_DAYS.packs, d).length;
  const list = (items, kind, quote = false) => items.map((t) => (hasFound(kind, t)
    ? `<li>${quote ? '“' : ''}${esc(t)}${quote ? '”' : ''}</li>`
    : '<li class="unfound"><i class="bars" aria-hidden="true"></i></li>')).join('');
  const shelf = (title, have, total, note, body) => `<details class="shelf">
    <summary><b>${title}</b><span>${have} / ${total}</span></summary>
    <p class="shelf-note">${note}</p>
    <ul class="shelf-list">${body}</ul>
  </details>`;
  const koansHave = KOANS.filter((k) => hasFound('koans', k)).length;
  const raresHave = RARE_LINES.filter((k) => hasFound('rares', k)).length;
  const heardHave = objPool().filter((o) => hasFound('heard', o.q)).length;
  const sells = storeAvailable() || S.pro;
  const proCard = storeAvailable() && !S.pro
    ? '<button class="pro-card" data-a="shop"><b>R-MAXXING PRO</b><span>Bold messages, hard-mode dares, the group chat pack and 6 hats. One payment.</span><i>SEE IT</i></button>'
    : '';
  const proCloset = sells ? `<p class="closet-label">PRO DRIP</p><div class="closet">${PRO_WARDROBE_INFO.map((p) => (S.pro
    ? `<button class="closet-item ${S.wear === p.id ? 'on' : ''}" data-a="wear" data-id="${p.id}" aria-pressed="${S.wear === p.id}">${brainSVG(30, 'tiny', p.id)}<span>${esc(p.name)}</span></button>`
    : `<button class="closet-item locked pro" data-a="shop">${brainSVG(30, 'tiny ghost', p.id)}<span>PRO</span></button>`)).join('')}</div>` : '';
  const skins = sells ? `<details class="shelf">
          <summary><b>RECEIPT SKINS</b><span>${S.pro ? RECEIPT_SKINS.length : 1} / ${RECEIPT_SKINS.length}</span></summary>
          <p class="shelf-note">The color of every receipt you see and share. Gold receipts stay gold.</p>
          <div class="skins">${RECEIPT_SKINS.map((k) => `<button class="skin-chip ${skinOf().id === k.id ? 'on' : ''}" data-a="skin" data-id="${k.id}" style="--paper:${k.paper};--ink:${k.ink}">${k.name}${k.pro && !S.pro ? '<small>PRO</small>' : ''}</button>`).join('')}</div>
        </details>` : '';
  const closet = WARDROBE_INFO.map((p) => (S.closet.includes(p.id)
    ? `<button class="closet-item ${S.wear === p.id ? 'on' : ''}" data-a="wear" data-id="${p.id}" aria-pressed="${S.wear === p.id}">${brainSVG(30, 'tiny', p.id)}<span>${esc(p.name)}</span></button>`
    : `<div class="closet-item locked">${brainSVG(30, 'tiny ghost', null)}<span>???</span></div>`)).join('');
  return {
    html: tabs('vault', `${big('THE|VAULT', { max: 120 })}
      ${proCard}
      <div class="stats">
        <div class="stat"><b>${d}</b><span>day${d === 1 ? '' : 's'} of doing stuff</span></div>
        <div class="stat"><b>${next ? `${next.inDays}D` : 'ALL'}</b><span>${next ? 'until the next unlock' : 'laws and packs open'}</span></div>
      </div>
      ${next ? `<p class="vault-next">Next: ${esc(next.kind === 'lessons' ? 'a new law of the Method' : 'a new mission pack')}. Bails count. Showing up is the whole trick.</p>` : ''}
      <div class="shelves">
        <details class="shelf" open>
          <summary><b>CLOSET</b><span>${S.closet.length} / ${WARDROBE_INFO.length}</span></summary>
          <p class="shelf-note">Drip drops as you finish things. Tap to wear it, tap again to take it off.</p>
          <div class="closet">${closet}</div>
          ${proCloset}
        </details>
        ${skins}
        ${shelf('KOANS', koansHave, KOANS.length, 'One a day, on the ticker up top. Everybody gets the same one.', list(KOANS, 'koans'))}
        ${shelf('LEGENDARY', raresHave, RARE_LINES.length, 'About one receipt in twenty comes out gold.', list(RARE_LINES, 'rares'))}
        ${shelf('BUT WHAT IF…', heardHave, objPool().length, 'Every whine, answered. Tap BUT WHAT IF on the home screen.', list(objPool().map((o) => o.q), 'heard', true))}
        ${shelf('LAWS', openLaws, LESSONS.length, 'The Great Method opens up as you go.', LESSONS.map((l, i) => (lessonOpen(l.id, d) ? `<li>${i + 1}. ${esc(l.rule.replace(/\|/g, ' '))}</li>` : '<li class="unfound"><i class="bars" aria-hidden="true"></i></li>')).join(''))}
        ${shelf('MISSION PACKS', openPacks, PLAYBOOKS.length, 'Six missions in each.', PLAYBOOKS.map((p) => (packOpen(p.id, d) ? `<li>${esc(p.name)}</li>` : '<li class="unfound"><i class="bars" aria-hidden="true"></i></li>')).join(''))}
      </div>`),
  };
};

// The next open law after this one, skipping any still locked.
function nextLawLink(i) {
  const next = LESSONS.slice(i + 1).find((l) => lessonOpen(l.id));
  return next ? `<button class="link" data-a="lesson" data-id="${next.id}">Next law</button>` : '';
}

VIEWS.lesson = () => {
  const i = LESSONS.findIndex((l) => l.id === view.id);
  const l = LESSONS[i];
  return {
    tone: ['sun', 'pink', ''][i % 3],
    html: step({
      title: l.rule,
      max: 120,
      slam: true,
      eyebrow: `Law ${i + 1} of ${LESSONS.length}`,
      top: `<div class="bar"><i style="width:${((i + 1) / LESSONS.length) * 100}%"></i></div>`,
      body: `<p class="lesson-why">${esc(l.why)}</p>
        <p class="lesson-test">${esc(l.test)}</p>
        ${l.src ? `<p class="src">${esc(l.src)}</p>` : ''}`,
      foot: `<button class="btn mega" data-a="lesson-cta" data-act="${l.cta.act}">${esc(l.cta.label)}</button>
        ${nextLawLink(i)}`,
    }),
  };
};

VIEWS.pack = () => {
  const p = PLAYBOOKS.find((x) => x.id === view.id);
  return {
    html: step({
      title: p.name,
      max: 100,
      sub: 'Pick one. Do not compare them.',
      top: '<div style="flex:1"></div>',
      body: `<div class="choices">${p.moves.map((m) => `<button class="choice soft" data-a="pack-move" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>`,
    }),
  };
};

// ---------- loop check and brain dump ----------

VIEWS.check = () => {
  const i = checkRun.i;
  return {
    html: step({
      eyebrow: 'Did your last round of thinking…',
      title: CHECK_QS[i],
      progress: ((i + 1) / CHECK_QS.length) * 100,
      center: true,
      foot: `<div class="pair"><button class="btn ghost" data-a="check-a" data-v="0">NO</button><button class="btn" data-a="check-a" data-v="1">YES</button></div>`,
    }),
  };
};

VIEWS.checkResult = () => {
  if (view.real) {
    return {
      html: step({
        title: 'OKAY.|THAT’S REAL|THINKING.',
        sub: 'Something changed, so keep going. Give it 15 more minutes, then decide.',
        top: '<div style="flex:1"></div>',
        center: true,
        foot: '<button class="btn mega" data-a="tab" data-to="home">FIFTEEN MINUTES</button>',
      }),
    };
  }
  return {
    tone: 'pink',
    html: step({
      title: 'THAT WASN’T|THINKING.|THAT WAS|CHEWING.',
      slam: true,
      sub: 'Nothing new came out of it. Get out of your head first.',
      top: '<div style="flex:1"></div>',
      center: true,
      foot: `<button class="btn mega" data-a="move-body">MOVE FOR 2 MINUTES</button>
        <button class="btn ghost" data-a="dump">EMPTY MY HEAD</button>
        <button class="link" data-a="start-door">Run the door check instead</button>`,
    }),
  };
};

VIEWS.dump = () => ({
  html: step({
    title: 'EMPTY|YOUR HEAD.',
    max: 90,
    sub: 'Type all of it. Nothing gets saved. Then we burn it.',
    top: '<div style="flex:1"></div>',
    body: '<textarea id="dump" class="field" rows="5" aria-label="Brain dump" autofocus></textarea>',
    foot: '<button class="btn mega" data-a="dump-done">BURN IT</button>',
    inlineFoot: true,
  }),
});

VIEWS.dumpGone = () => ({
  tone: 'sun',
  html: step({
    title: 'GONE.',
    max: 200,
    slam: true,
    sub: 'It wasn’t saved anywhere. What’s the one thing left?',
    top: '<div style="flex:1"></div>',
    center: true,
    foot: `<button class="btn mega" data-a="start">DO THE ONE THING</button><button class="btn ghost" data-a="tab" data-to="home">NOTHING. I’M GOOD</button>`,
  }),
});

// ---------- moonwalk ----------

VIEWS.moonwalk = () => ({
  tone: 'blue',
  html: `<section class="step moon-stage" data-a="moon-skip">
    <div class="step-body center">
      ${big('DID A 360.|MOONWALKED|OUT.', { max: 110, slam: true })}
      <div class="moon">${brainSVG(10)}</div>
      <p class="sub center-text">Good call.</p>
    </div>
  </section>`,
});
VIEWS.moonwalk.after = () => {
  sfx.groove();
  clearTimeout(VIEWS.moonwalk.t);
  VIEWS.moonwalk.t = setTimeout(() => go('home'), calm() ? 900 : 2900);
};

// ---------- crisis and about ----------

// The number is written out as text too: call and text links don't work everywhere this page can run.
function helpLinks() {
  return `<div class="help-links">
    <p class="help-number">In the US, call or text <b>988</b>. Anywhere else: <b>findahelpline.com</b></p>
    <a class="btn" href="tel:988">Call 988 (US)</a>
    <a class="btn ghost" href="sms:988">Text 988 (US)</a>
    <a class="btn ghost" href="https://findahelpline.com" target="_blank" rel="noopener">Find a helpline in your country</a>
  </div>`;
}

// Deliberately the quietest screen in the app: no jokes, no sound, no motion.
// "kms" and "unalive" are often jokes. Ask, quietly, before assuming either way.
VIEWS.crisisCheck = () => ({
  tone: 'calm',
  html: `<section class="step quiet">
    <div class="step-body center">
      <h1 class="plain">${esc(CRISIS_CHECK_COPY.title)}</h1>
      <p class="sub">${esc(CRISIS_CHECK_COPY.sub)}</p>
    </div>
    <footer class="step-foot">
      <button class="btn" data-a="crisis-joke">${esc(CRISIS_CHECK_COPY.joke)}</button>
      <button class="btn ghost" data-a="crisis-real">${esc(CRISIS_CHECK_COPY.real)}</button>
    </footer>
  </section>`,
});

VIEWS.crisis = () => ({
  tone: 'calm',
  html: `<section class="step quiet">
    <div class="step-body center">
      <h1 class="plain">This one needs a person.</h1>
      <p class="sub">This app can’t help with what you wrote. If you’re thinking about hurting yourself or someone else, talk to someone now. It’s free and open all night. If someone is in immediate danger, call your local emergency number.</p>
      ${helpLinks()}
    </div>
    <footer class="step-foot"><button class="link" data-a="crisis-back">That’s not what I meant</button></footer>
  </section>`,
});

VIEWS.about = () => {
  const install = installPrompt ? '<button class="btn ghost" data-a="install">ADD TO HOME SCREEN</button>' : '';
  return {
    html: step({
      title: 'WHAT IS|THIS?',
      max: 90,
      top: '<div style="flex:1"></div>',
      body: `<div class="prose">
        <p>A joke that also works. It’s a game for acting faster on small stuff. It isn’t therapy, and it isn’t medical, legal or financial advice. Some doors are one-way, and for those you go slow and ask somebody who knows.</p>
        <h2>Your data</h2>
        <p>Everything stays on this device. No account, and nothing gets uploaded. What you share is up to you, and receipts hide what the thing was unless you choose to show it.</p>
        <h2>If it’s more than overthinking</h2>
        <p>If you’re really struggling, this isn’t the tool for that. A person is.</p>
        ${helpLinks()}
        <h2>Keep your progress</h2>
        <p>Your brain, streak and receipts live only on this device. A backup code carries them to a new phone, or back if they ever get cleared.</p>
        <button class="btn ghost" data-a="backup">BACKUP CODE</button>
        ${canNudge() ? `<h2>Daily nudge</h2>
        <p>One a day. If you’ve already done something that day, it skips it.</p>
        <div class="chips">${[[null, 0, 'OFF'], [9, 0, '9 AM'], [15, 30, '3:30 PM'], [18, 0, '6 PM'], [21, 0, '9 PM'], [22, 0, '10 PM']].map(([h, m, label]) => `<button class="chip ${(S.nudge?.h ?? null) === h && (S.nudge?.m || 0) === m ? 'on' : ''}" data-a="nudge" data-h="${h ?? ''}" data-m="${m}">${label}</button>`).join('')}</div>` : ''}
        ${storeAvailable() ? `<h2>Support it</h2>
        <p>${S.pro ? 'You have Pro. Thank you.' : 'Pro adds bold messages, hard-mode dares and the group chat pack. Tips just feed the brain.'}</p>
        <button class="btn ghost" data-a="shop">PRO AND TIP JAR</button>
        <button class="link" data-a="restore-purchases">Restore purchases</button>` : ''}
        <h2>What we call you</h2>
        ${callMe(false)}
        <h2>Volume</h2>
        <p>Quiet mode: no horns, no shaking, no brain rain, and a calmer main button. The buzz stays.</p>
        <div class="chips"><button class="chip ${S.quiet ? '' : 'on'}" data-a="quiet" data-v="0" aria-pressed="${!S.quiet}">LOUD</button><button class="chip ${S.quiet ? 'on' : ''}" data-a="quiet" data-v="1" aria-pressed="${!!S.quiet}">QUIET</button></div>
        <h2>Sound</h2>
        <p>No sound on an iPhone? Check the silent switch on the side. The app follows it.</p>
        <h2>Start over</h2>
        <button class="btn ghost" data-a="replay-intro" style="margin-top:12px">WATCH THE INTRO</button>
        <button class="btn ghost" data-a="rescan">SCAN MY BRAIN AGAIN</button>
        ${install}
        <button class="btn ghost" data-a="erase" id="erase">ERASE EVERYTHING</button>
        <a class="link" href="${framed || isNative() ? `${PUBLIC_URL}support.html` : 'support.html'}" target="_blank" rel="noopener">Help and support</a>
        <a class="link" href="${framed || isNative() ? `${PUBLIC_URL}privacy.html` : 'privacy.html'}" target="_blank" rel="noopener">Privacy policy</a>
      </div>`,
    }),
  };
};

// The code holds the receipts, including what each thing was, so it says so up front.
VIEWS.backup = () => {
  const code = C.encodeBackup(S);
  return {
    html: step({
      title: 'BACK UP|YOUR BRAIN',
      max: 100,
      top: '<div style="flex:1"></div>',
      body: `<div class="prose">
        <p>Copy this code and keep it somewhere private, like your notes app. It holds your receipts, including what each thing was.</p>
        <textarea id="backup-code" class="field code" rows="4" readonly aria-label="Your backup code">${esc(code)}</textarea>
        <button class="btn mega" data-a="backup-copy">COPY MY CODE</button>
        <h2>Restore</h2>
        <p>Paste a code here. It replaces everything on this device.</p>
        <textarea id="restore-code" class="field code" rows="3" aria-label="Paste a backup code"></textarea>
        <button class="btn ghost" data-a="restore" id="restore">RESTORE</button>
      </div>`,
    }),
  };
};

// ---------- pro and tips ----------

VIEWS.shop = () => {
  const prices = view.prices;
  // undefined while loading, null when the store doesn't know the product yet.
  const price = (id) => (prices ? prices[id] || null : undefined);
  const proPrice = price(PRODUCTS.pro.id);
  const proLabel = proPrice === undefined ? 'LOADING…' : proPrice ? `GET PRO · ${esc(proPrice)}` : 'NOT AVAILABLE RIGHT NOW';
  const proBlock = S.pro
    ? '<div class="pro-box owned"><b>YOU HAVE PRO</b><span>SAY IT BOLD is on every message. HARD MODE is on the dare wheel. Hats are in your closet. Thank you.</span></div>'
    : `<div class="pro-box">
        <b>${esc(PRODUCTS.pro.name)}</b>
        <p class="pro-pitch">${esc(PRODUCTS.pro.pitch)}</p>
        <div class="pro-preview">${PRO_WARDROBE_INFO.slice(0, 3).map((p) => brainSVG(30, 'tiny', p.id)).join('')}</div>
        <ul>${PRODUCTS.pro.perks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <button class="btn mega" data-a="buy" data-id="${PRODUCTS.pro.id}" ${proPrice ? '' : 'disabled'}>${proLabel}</button>
      </div>`;
  const tips = PRODUCTS.tips.map((t) => {
    const pr = price(t.id);
    return `<button class="tip" data-a="tip" data-id="${t.id}" ${pr ? '' : 'disabled'}><span>${esc(t.name)}</span><b>${pr === undefined ? '…' : esc(pr || '—')}</b></button>`;
  }).join('');
  return {
    html: step({
      title: 'PRO AND|TIP JAR',
      max: 100,
      top: '<div style="flex:1"></div>',
      body: `${isMockStore() ? '<p class="mock-note">TEST STORE. Nothing real is charged.</p>' : ''}
        ${proBlock}
        <h2 class="shop-h">TIP JAR</h2>
        <p class="shop-note">Tips don’t unlock anything. They keep the brain fed.</p>
        <div class="tips">${tips}</div>
        <button class="link" data-a="restore-purchases">Restore purchases</button>`,
    }),
  };
};
VIEWS.shop.after = () => {
  if (view.prices) return;
  loadProducts([PRODUCTS.pro.id, ...PRODUCTS.tips.map((t) => t.id)]).then((list) => {
    if (view.name !== 'shop') return;
    view.prices = Object.fromEntries(list.map((x) => [x.id, x.price]));
    render();
  });
};

// Owned purchases come from the store on every launch, so refunds take Pro away again.
// A store that can't be reached changes nothing.
async function refreshPro() {
  if (!storeAvailable() || isMockStore()) return;
  const ids = await ownedProducts();
  if (!Array.isArray(ids)) return;
  const pro = ids.includes(PRODUCTS.pro.id);
  if (pro !== S.pro) {
    S.pro = pro;
    ensureCloset();
    save();
    render();
  }
}

// ---------- nudges ----------

function refreshNudges() {
  if (!canNudge() || !S.nudge) return Promise.resolve(false);
  const times = C.nudgeTimes({ hour: S.nudge.h, minute: S.nudge.m || 0, doneToday: S.lastDay === C.dateKey() });
  const lines = C.shuffled(NUDGE_LINES).map((l) => C.addr(l, S.who));
  // A follow-up that will be due goes out first. Lock screens are public, so never the thing or a name.
  const fu = C.followUpDue(S.receipts, C.dateKey(new Date(Date.now() + 86400000)));
  if (fu) lines.unshift(FOLLOW_UP.nudge[fu.fu.type]);
  // Brain court beats everything on the day it's in session.
  if (times[0] && C.trialDue(S.receipts, S.trials, C.dateKey(times[0]))) lines.unshift(TRIAL.nudge);
  return scheduleNudges(times, lines);
}

// ---------- sharing ----------

async function share(makeCanvas, text, filename) {
  await fontsReady();
  const blob = await toBlob(makeCanvas());
  if (isNative() && await shareImage(blob, text, filename)) return;
  const file = new File([blob], filename, { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return;
    }
  } catch (err) {
    if (err?.name === 'AbortError') return; // They changed their mind.
  }
  shareSheet(blob, text, filename);
}

// No share sheet here (desktop, or an embedded viewer): show the card so it can be saved or screenshotted.
function shareSheet(blob, text, filename) {
  const url = URL.createObjectURL(blob);
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'Share card');
  sheet.innerHTML = `<div class="sheet-card">
    <img src="${url}" alt="Your share card">
    <p class="sheet-hint">Screenshot it, or press and hold the image to save it.</p>
    <button class="btn mega" data-s="copy">COPY THE TEXT</button>
    ${framed || isNative() ? '' : `<a class="btn ghost" href="${url}" download="${esc(filename)}">SAVE IMAGE</a>`}
    <textarea class="sheet-text" id="share-text" readonly hidden aria-label="Share text">${esc(text)}</textarea>
    <button class="link" data-s="close">Close</button>
  </div>`;
  const close = () => {
    sheet.remove();
    document.removeEventListener('keydown', onKey);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  sheet.addEventListener('click', async (e) => {
    if (e.target === sheet) return close();
    const b = e.target.closest('[data-s]');
    if (!b) return undefined;
    if (b.dataset.s === 'close') return close();
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied.');
    } catch {
      // Clipboard refused: show the text so it can be selected by hand.
      const box = sheet.querySelector('#share-text');
      box.hidden = false;
      box.select();
      toast('Couldn’t copy. Select the text below.');
    }
    return undefined;
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(sheet);
  sheet.querySelector('[data-s=copy]').focus();
}

// ---------- actions ----------

function startLoop(fields) {
  S.active = newLoop(fields);
  save();
  go('loop');
}

// Missions and playbook moves are already a tiny step, so they go straight to the fast screen.
function prefilled(move, source) {
  startLoop({ thing: move, move, source, step: 'fast', verdict: 'send', draftKind: C.detectDraftKind(move), dur: 120 });
}

function suggestFor(L) {
  L.draftKind = C.detectDraftKind(L.thing);
  if (L.draftCasual === undefined) L.draftCasual = C.chatty(L.thing);
  // After MAKE IT STUPID SMALL, a smaller version, not the same step.
  if (L.verdict === 'shrink') return MOVE_SUGGESTIONS[L.draftKind ? 'shrinkDraft' : 'shrink'];
  const kind = L.draftKind === 'family' && /\bcall/.test(L.thing.toLowerCase()) ? 'call' : C.suggestKind(L.thing, L.draftKind);
  const m = MOVE_SUGGESTIONS[kind];
  return Array.isArray(m) ? fresh(`move-${kind}`, m).item : m;
}

function startDraftClock(copied) {
  const L = S.active;
  if (!L || L.step !== 'draft') return;
  L.move = 'Send it.';
  L.dur = 120;
  L.startedAt = Date.now();
  buzz(30);
  sfx.windup();
  loopTo('timer');
  toast(copied ? 'Copied. Go send it.' : 'Couldn’t copy. Press and hold the message to copy it.');
}

// After the timer: ask how long it had been put off only if we never asked, and never for the head-clearing walk.
function afterTimer(L) {
  if (L.thoughtMin == null && L.source !== 'check') return loopTo('after', { push: false });
  return finishLoop();
}

function decideDoor(L) {
  L.verdict = C.doorVerdict(L.answers);
  L.verdictPlayed = false;
  if (L.verdict === 'think' && !L.move) L.move = DEFAULT_THINK_MOVE;
  // Went back and changed an answer: don't carry the slow-down plan into a send.
  if (L.verdict !== 'think' && L.move === DEFAULT_THINK_MOVE) L.move = '';
  loopTo('verdict');
}

// A phone locked overnight shouldn't turn into "did it in 9 hours".
const elapsedSec = (L) => Math.min(Math.round((Date.now() - L.startedAt) / 1000), L.dur + 3600);

const ACTIONS = {
  tab: (d) => {
    S.active = null;
    save();
    go(d.to);
  },
  about: () => go('about'),
  mute: (_, el) => {
    const off = sfx.toggleMute();
    el.classList.toggle('is-off', off);
    toast(off ? 'SOUND OFF' : 'SOUND ON. Nothing? Check the silent switch.');
  },
  start: () => {
    shake();
    buzz(30);
    startLoop({});
  },
  'start-door': () => startLoop({ full: true }),
  daily: () => prefilled(dailyMove(C.dateKey()), 'daily'),

  objection: () => nextObjection(view.name === 'loop' ? 'loop' : 'home'),
  'objection-next': () => nextObjection(view.back),
  'share-objection': () => {
    const o = objectionAt(view.i);
    return share(() => renderObjectionCard(o.q, o.answer), C.objectionShareText(o.q, o.answer, shareUrl()), 'but-what-if.png');
  },

  back: () => {
    if (view.name === 'objection') return go(view.back || 'home');
    if (view.name === 'loop' && S.active) {
      if (S.active.step === 'door' && S.active.doorI > 0) {
        S.active.doorI -= 1;
        save();
        return go('loop');
      }
      const prev = S.active.trail.pop();
      if (!prev) return go('home');
      S.active.step = prev;
      save();
      return go('loop');
    }
    if (view.name === 'lesson' || view.name === 'pack') return go('method');
    if (view.name === 'backup') return go('about');
    if (view.name === 'shop') return go(view.from && view.from !== 'shop' ? view.from : 'vault');
    return go('home');
  },
  exit: () => {
    if (view.name === 'objection') return go(view.back || 'home');
    S.active = null;
    save();
    return go(view.name === 'lesson' || view.name === 'pack' ? 'method' : 'home');
  },

  'intro-tap': (d, el, e) => {
    const i = view.i ?? 0;
    const backwards = e && e.clientX < window.innerWidth * 0.28;
    go('intro', { i: Math.max(0, backwards ? i - 1 : i + 1), hold: view.hold });
  },
  'intro-skip': () => go('intro', { i: LAST_CARD }),
  'replay-intro': () => go('intro', { i: 0 }),

  'quiz-start': () => {
    quizRun = { i: 0, answers: [], seconds: [], shownAt: performance.now() };
    go('quiz');
  },
  'quiz-skip': () => {
    S.w = 60;
    S.startW = 60;
    S.lastSeen = C.dateKey();
    save();
    go('home');
  },
  'quiz-answer': (d) => {
    quizRun.answers.push(Number(d.v));
    quizRun.seconds.push((performance.now() - quizRun.shownAt) / 1000);
    quizRun.i += 1;
    quizRun.shownAt = performance.now();
    buzz();
    if (quizRun.i < QUIZ.length) return go('quiz');
    const { wrinkled, totalSeconds } = C.scoreQuiz(quizRun.answers, quizRun.seconds);
    S.w = wrinkled;
    S.startW = wrinkled;
    S.quizSeconds = totalSeconds;
    S.typeName = TYPES[C.typeIndexFor(wrinkled)].name;
    S.lastSeen = C.dateKey();
    save();
    return go('quizResult', { fresh: true });
  },
  'share-quiz': () => {
    const t = TYPES[C.typeIndexFor(S.w)];
    return share(
      () => renderQuizCard({ wrinkled: S.w, typeName: t.name, seconds: S.quizSeconds, wis: S.wis, who: S.who }),
      C.quizShareText(S.w, t.name, shareUrl(), S.who),
      'my-brain-scan.png',
    );
  },

  'thing-next': () => {
    const L = S.active;
    L.thing = L.thing.trim();
    if (!L.thing) return undefined;
    if (C.detectCrisis(L.thing)) return go('crisis');
    if (!L.jokeOk && C.detectCrisisCheck(L.thing)) return go('crisisCheck', { next: 'thing-next' });
    const kind = C.detectOneWay(L.thing);
    if (kind) {
      L.kind = kind;
      L.forced = true;
      L.full = true;
      L.verdict = 'think';
      L.verdictPlayed = false;
      L.draftKind = null;
      L.move = ONE_WAY_COPY[kind].move;
      return loopTo('howlong');
    }
    L.kind = null;
    L.forced = false;
    if (L.full) return loopTo('howlong');
    L.verdict = 'send';
    L.move = suggestFor(L);
    return loopTo('fast');
  },
  'to-door': () => {
    S.active.full = true;
    return ACTIONS['thing-next']();
  },
  howlong: (d) => {
    const L = S.active;
    L.thoughtMin = Number(d.m);
    if (L.forced) return loopTo('verdict');
    L.doorI = 0;
    L.answers = {};
    return loopTo('door');
  },
  door: (d) => {
    const L = S.active;
    const q = DOOR[L.doorI];
    const yes = d.v === '1';
    L.answers[q.key] = yes;
    buzz();
    if (q.key === 'serious' && yes) return decideDoor(L);
    if (L.doorI < DOOR.length - 1) {
      L.doorI += 1;
      save();
      return go('loop');
    }
    return decideDoor(L);
  },
  'not-oneway': () => {
    const L = S.active;
    L.forced = false;
    L.kind = null;
    L.verdict = null;
    L.move = '';
    L.doorI = 0;
    L.answers = {};
    loopTo('door');
  },
  moonwalk: () => {
    S.active = null;
    save();
    go('moonwalk');
  },
  'moon-skip': () => {
    clearTimeout(VIEWS.moonwalk.t);
    go('home');
  },
  'verdict-next': () => {
    const L = S.active;
    if (L.verdict !== 'think') {
      const suggestion = suggestFor(L);
      if (!L.move) L.move = suggestion;
    }
    loopTo('fast');
  },
  chip: (d) => {
    S.active.move = d.v;
    save();
    go('loop');
  },
  'dread-pick': (d, el) => {
    const L = S.active;
    const v = Number(d.v);
    L.dread = L.dread === v ? null : v;
    save();
    buzz();
    el.parentElement.querySelectorAll('[data-a=dread-pick]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === L.dread)));
  },
  'fast-go': () => {
    const L = S.active;
    L.move = L.move.trim();
    if (!L.move) return undefined;
    if (C.detectCrisis(L.move)) return go('crisis');
    if (L.draftKind && L.dur === 600) L.dur = 120;
    if (!L.jokeOk && C.detectCrisisCheck(L.move)) return go('crisisCheck', { next: 'fast-go' });
    L.startedAt = Date.now();
    buzz(30);
    sfx.windup();
    return loopTo('timer');
  },

  'to-draft': () => {
    const L = S.active;
    L.draftVariant = L.draftVariant || 0;
    L.draftEdited = false;
    loopTo('draft');
  },
  'draft-kind': (d) => {
    const L = S.active;
    L.draftKind = d.v;
    L.draftVariant = 0;
    L.draftEdited = false;
    L.draft = null;
    save();
    go('loop');
  },
  'draft-clear': () => {
    const L = S.active;
    if (!L) return undefined;
    L.draft = '';
    L.draftEdited = true;
    save();
    render();
    return document.getElementById('draft')?.focus();
  },
  'draft-another': () => {
    const L = S.active;
    if (L.draftEdited && Date.now() - (L.anotherArmed || 0) > 4000) {
      L.anotherArmed = Date.now();
      return toast('That swaps out your edit. Tap again to swap it.');
    }
    L.anotherArmed = 0;
    L.draftVariant = (L.draftVariant || 0) + 1;
    L.draftEdited = false;
    L.draft = null;
    save();
    go('loop');
  },
  'draft-go': () => {
    const L = S.active;
    const text = currentDraft(L);
    // Nobody should send "[class]" to a professor.
    if (C.hasBlanks(text)) return toast('Fill in the [brackets] first.');
    L.draft = text;
    // Called straight from the tap, so the browser allows it.
    const copying = navigator.clipboard?.writeText(text);
    if (!copying) return startDraftClock(false);
    return copying.then(() => startDraftClock(true), () => startDraftClock(false));
  },
  // A real link opens Messages or Mail; the clock starts a beat later so the link isn't cancelled by the redraw.
  'draft-open': (d, el, e) => {
    const L = S.active;
    if (C.hasBlanks(currentDraft(L))) {
      e?.preventDefault();
      return toast('Fill in the [brackets] first.');
    }
    L.draft = currentDraft(L);
    save();
    setTimeout(() => startDraftClock(true), 600);
  },
  'draft-bold': () => {
    if (!S.pro) return go('shop', { from: 'loop' });
    const L = S.active;
    L.draftBold = !L.draftBold;
    L.draftCasual = false;
    L.draftVariant = 0;
    L.draftEdited = false;
    L.draft = null;
    save();
    return go('loop');
  },
  'draft-casual': () => {
    const L = S.active;
    L.draftCasual = !L.draftCasual;
    L.draftBold = false;
    L.draftVariant = 0;
    L.draftEdited = false;
    L.draft = null;
    save();
    go('loop');
  },
  'draft-calm': () => {
    const L = S.active;
    const box = document.getElementById('draft');
    const r = C.calmDown(box ? box.value : currentDraft(L));
    L.draft = r.text;
    L.draftEdited = true;
    save();
    if (box) box.value = r.text;
    syncDraftLinks();
    toast(C.calmReport(r.removed));
  },
  'draft-copy': () => {
    const text = S.active?.draft;
    if (!text) return undefined;
    if (C.hasBlanks(text)) return toast('Fill in the [brackets] first.');
    return navigator.clipboard?.writeText(text).then(() => toast('Copied.'), () => toast('Couldn’t copy. Press and hold the text instead.'));
  },
  'timer-short': () => {
    S.active.dur = 120;
    save();
    go('loop');
  },
  'timer-go': () => {
    S.active.startedAt = Date.now();
    save();
    buzz(30);
    sfx.windup();
    go('loop');
  },
  'timer-done': (d) => {
    const L = S.active;
    L.doneSec = elapsedSec(L);
    L.outcome = d.v === 'some' ? 'some' : 'did';
    if (L.dread != null) return loopTo('reality', { push: false });
    return afterTimer(L);
  },
  'timer-bail': () => {
    const L = S.active;
    L.doneSec = elapsedSec(L);
    L.outcome = 'bailed';
    finishLoop();
  },
  outcome: (d) => {
    const L = S.active;
    L.outcome = d.v;
    if (d.v === 'bailed') return finishLoop();
    if (L.dread != null) return loopTo('reality', { push: false });
    return afterTimer(L);
  },
  reality: (d) => {
    S.active.reality = Number(d.v);
    return afterTimer(S.active);
  },
  'after-howlong': (d) => {
    const m = Number(d.m);
    S.active.thoughtMin = m >= 0 ? m : null;
    finishLoop();
  },
  'skip-level': () => dismissLevelUp(),

  'share-receipt': () => {
    const r = view.receipt;
    const show = view.showThing;
    const skin = skinOf();
    return share(() => renderReceiptCard(r, show, skin.id === 'classic' ? null : skin), C.receiptShareText(r, shareUrl()), `receipt-${r.day}.png`);
  },
  'share-lifetime': () => {
    const stats = C.lifetime(S.receipts);
    const text = [`${BRAND.name} lifetime`, `Overthought: ${C.fmtDuration(stats.thoughtMin)}`, `Doing took: ${C.fmtDid(stats.doneSec)}`, shareUrl()].filter(Boolean).join('\n');
    return share(() => renderLifetimeCard(stats, S.w ?? 60, S.wis), text, 'lifetime-receipt.png');
  },
  'open-receipt': (d) => {
    const r = S.receipts.find((x) => x.id === d.id);
    if (r) go('close', { receipt: r, before: S.w, after: S.w, showThing: false, fresh: false, fromHistory: true });
  },

  lesson: (d) => {
    if (!lessonOpen(d.id)) return undefined;
    if (!S.read.includes(d.id)) S.read.push(d.id);
    save();
    go('lesson', { id: d.id });
  },
  'lesson-cta': (d) => {
    if (d.act === 'check') return ACTIONS.check();
    if (d.act === 'dump') return ACTIONS.dump();
    if (d.act === 'home') return go('home');
    if (d.act === 'door') return ACTIONS['start-door']();
    if (view.name === 'lesson' && view.id === 'when') return startLoop({ placeholder: 'when ___, i will ___' });
    return ACTIONS.start();
  },
  pack: (d) => (packOpen(d.id) ? go('pack', { id: d.id }) : undefined),
  'pack-move': (d) => prefilled(d.v, 'playbook'),
  poke: (_, el) => {
    const svg = el.querySelector('svg.brain');
    const move = fresh('poke-move', ['boing', 'spin', 'squash', 'jump', 'nope']).item;
    if (svg && !calm()) {
      svg.classList.remove('boing', 'spin', 'squash', 'jump', 'nope', 'wobble');
      void svg.getBoundingClientRect();
      svg.classList.add(move);
      clearTimeout(ACTIONS.poke.w);
      ACTIONS.poke.w = setTimeout(() => { svg.classList.remove(move); svg.classList.add('wobble'); }, 900);
    }
    const bubble = el.querySelector('.bubble');
    if (bubble) {
      bubble.textContent = C.addr(fresh('poke', POKE_LINES).item, S.who) || 'Hi.';
      bubble.classList.remove('on');
      void bubble.offsetWidth;
      bubble.classList.add('on');
      clearTimeout(ACTIONS.poke.t);
      ACTIONS.poke.t = setTimeout(() => bubble.classList.remove('on'), 1900);
    }
    sfx.squish();
    buzz(12);
  },
  wear: (d) => {
    if (!ownsPiece(d.id)) return;
    S.wear = S.wear === d.id ? null : d.id;
    setWorn(S.wear);
    save();
    sfx.swish();
    buzz(30);
    render();
  },
  spin: () => spinDare(view.name === 'spin' && view.hard),
  'spin-hard': () => (S.pro ? spinDare(!view.hard) : go('shop', { from: 'home' })),
  'dare-go': () => prefilled(view.pick, 'dare'),
  'fu-peek': (_, el) => el.classList.toggle('shown'),
  'fu-answer': (d) => {
    const r = S.receipts.find((x) => x.id === d.id);
    if (!r?.fu) return undefined;
    if (d.v === 'wait') {
      r.fu.asks = (r.fu.asks || 0) + 1;
      r.fu.snooze = C.dateKey();
      save();
      render();
      return toast(FOLLOW_UP.wait);
    }
    if (d.v === 'skip' || d.v === 'drop') {
      r.fu.state = 'skipped';
      save();
      refreshNudges();
      render();
      return toast(d.v === 'drop' ? FOLLOW_UP.drop : FOLLOW_UP.skip);
    }
    r.fu.state = 'done';
    r.fu.result = d.v;
    const lines = FOLLOW_UP.answers[d.v] || FOLLOW_UP.answers.fine;
    r.fu.line = fresh(`verdict-${d.v}`, lines.map((x) => x.a)).index;
    S.wis += 1;
    save();
    refreshNudges();
    return go('verdict', { id: r.id, fresh: true });
  },
  'fu-retry': (d) => {
    const r = S.receipts.find((x) => x.id === d.id);
    if (!r?.fu) return undefined;
    r.fu.state = 'done';
    r.fu.result = 'retry';
    const L = newLoop({ thing: r.thing, source: 'retry', step: 'fast', verdict: 'send' });
    L.move = suggestFor(L);
    if (r.kind) L.draftKind = r.kind;
    if (r.draft) {
      L.draft = r.draft;
      L.draftEdited = true;
    }
    S.active = L;
    save();
    return go('loop');
  },
  trial: () => {
    const lvl = trialToday();
    if (!lvl) return render();
    return go('trial', { day: lvl, stage: trialWitness() ? 'witness' : 'exhibits' });
  },
  // Yesterday's answer goes into evidence. The joke line still lands, as a toast.
  'trial-witness': (d) => {
    const r = S.receipts.find((x) => x.id === d.id);
    let line = '';
    if (r?.fu) {
      if (d.v === 'wait') {
        r.fu.asks = (r.fu.asks || 0) + 1;
        r.fu.snooze = C.dateKey();
        line = FOLLOW_UP.wait;
      } else {
        r.fu.state = 'done';
        r.fu.result = d.v;
        const lines = FOLLOW_UP.answers[d.v] || FOLLOW_UP.answers.fine;
        r.fu.line = fresh(`verdict-${d.v}`, lines.map((x) => x.a)).index;
        line = lines[r.fu.line].a.replace(/\|/g, ' ');
        S.wis += 1;
      }
      save();
      refreshNudges();
    }
    go('trial', { day: view.day, stage: 'exhibits' });
    if (line) toast(line);
    return undefined;
  },
  'trial-verdict': () => {
    if (!TRIAL.levels[view.day] || S.trials.some((t) => t.day === view.day)) return go('home');
    const c = C.trialCase(S.receipts, lastTrialAt());
    const prev = S.trials.length ? S.trials[S.trials.length - 1].cred : null;
    const entry = { day: view.day, at: Date.now(), verdict: C.trialVerdict(c), lies: c.lies, calls: c.calls, cred: c.cred, prev, thoughtMin: c.thoughtMin, doneSec: c.doneSec };
    S.trials.push(entry);
    S.wis += 1;
    save();
    refreshNudges();
    return go('trial', { day: view.day, stage: 'verdict', entry, fresh: true });
  },
  // The sentence: the one they've dodged longest, through the door check, since big ones deserve it.
  'trial-sentence': () => {
    if (view.entry?.verdict === 'continued') return startLoop({ source: 'trial' });
    return startLoop({ source: 'trial', full: true, title: TRIAL.bigOne.title, placeholder: TRIAL.bigOne.placeholder });
  },
  'share-trial': () => {
    const e = view.entry;
    if (!e) return undefined;
    const v = rulingFor(e);
    const answer = [...v.title.split('|'), ...(e.cred != null ? [`${e.cred}% CREDIBLE`] : [])].join('|');
    const text = [fill(TRIAL.share.text, { verdict: v.title.replace(/\|/g, ' ') }) + (e.cred != null ? ` Credibility: ${e.cred}%.` : ''), shareUrl()].filter(Boolean).join('\n');
    return share(() => renderObjectionCard(TRIAL.share.q, answer), text, 'brain-court.png');
  },
  'share-verdict': () => {
    const r = S.receipts.find((x) => x.id === view.id);
    if (!r?.fu) return undefined;
    const ans = verdictLine(r);
    const q = verdictQ(r, false);
    return share(() => renderObjectionCard(q, ans.a), C.objectionShareText(q, ans.a, shareUrl()), 'the-verdict.png');
  },
  who: (d) => {
    S.who = C.ADDRESSES.some((a) => a.id === d.v) ? d.v : 'brother';
    save();
    render();
    // Reminders already on the phone were written with the old name.
    if (S.nudge) refreshNudges();
  },
  quiet: (d) => {
    S.quiet = d.v === '1';
    S.quietAsked = true;
    save();
    sfx.setQuiet(S.quiet);
    render();
    toast(S.quiet ? 'Quiet mode. Inside voice.' : 'Loud mode. Sorry, neighbors.');
  },
  nudge: async (d) => {
    const h = d.h === '' ? null : Number(d.h);
    S.nudge = h == null ? null : { h, m: Number(d.m) || 0 };
    if (view.name === 'close') view.nudgeAsked = true;
    save();
    const ok = h == null ? await clearNudges() : await refreshNudges();
    if (h != null && !ok) {
      S.nudge = null;
      save();
      toast('Notifications are off for R-MAXXING. Turn them on in Settings.');
    } else toast(h == null ? 'Nudges off.' : 'Set. One a day, no guilt.');
    render();
  },
  shop: () => go('shop', { from: view.name === 'shop' ? view.from : view.name }),
  buy: async (d, el) => {
    if (el.dataset.busy) return;
    el.dataset.busy = '1';
    el.textContent = 'ONE SEC…';
    const r = await buyProduct(d.id);
    if (r.ok) {
      S.pro = true;
      ensureCloset();
      save();
      sfx.legendary();
      celebrate({ shape: 'star', motion: 'burst', count: 48 });
      buzz('success');
      toast('PRO. The brain thanks you.');
    } else if (r.error) {
      toast('That didn’t go through. Try again in a minute.');
    }
    if (view.name === 'shop') render();
  },
  tip: async (d, el) => {
    if (el.dataset.busy) return;
    el.dataset.busy = '1';
    const r = await buyProduct(d.id);
    delete el.dataset.busy;
    if (r.ok) {
      sfx.jingle(d.id + Date.now());
      celebrate({ shape: 'juice', motion: 'fountain', count: 26 });
      buzz('success');
      toast(fresh('tip-thanks', TIP_THANKS).item);
    } else if (r.error) {
      toast('That didn’t go through. Try again in a minute.');
    }
  },
  'restore-purchases': async () => {
    toast('Checking with the App Store…');
    const ids = await restorePurchases();
    if (!Array.isArray(ids)) return toast('Couldn’t reach the App Store. Try again.');
    S.pro = ids.includes(PRODUCTS.pro.id) || (isMockStore() && S.pro);
    ensureCloset();
    save();
    toast(S.pro ? 'Pro restored.' : 'No purchases found for this Apple ID.');
    return render();
  },
  skin: (d) => {
    const k = RECEIPT_SKINS.find((x) => x.id === d.id);
    if (!k) return undefined;
    if (k.pro && !S.pro) return ACTIONS.shop();
    S.skin = k.id;
    save();
    sfx.swish();
    return render();
  },
  locked: (d) => toast(`Opens after ${dayWord(Number(d.need) - days())} of doing stuff. Bails count.`),

  'install-go': async () => {
    if (view.installHelp) {
      view.installHelp = false;
      S.installLater = Date.now() + 14 * 86400000;
      save();
      return render();
    }
    if (installPrompt) {
      try {
        await installPrompt.prompt();
      } catch { /* Dismissed. */ }
      installPrompt = null;
      return render();
    }
    // iPhone Safari has no install prompt, so show the steps instead.
    view.installHelp = true;
    return render();
  },
  'install-later': () => {
    S.installLater = Date.now() + 7 * 86400000;
    view.installHelp = false;
    save();
    render();
  },

  backup: () => go('backup'),
  'backup-copy': async () => {
    const box = document.getElementById('backup-code');
    try {
      await navigator.clipboard.writeText(box.value);
      toast('Copied. Put it somewhere private.');
    } catch {
      box.select();
      toast('Couldn’t copy. Select the code and copy it by hand.');
    }
  },
  restore: (_, el) => {
    const data = C.decodeBackup(document.getElementById('restore-code')?.value);
    if (!data) {
      el.dataset.armed = '';
      el.textContent = 'RESTORE';
      return toast('That’s not a whole backup code. Paste all of it.');
    }
    if (el.dataset.armed !== '1') {
      el.dataset.armed = '1';
      el.textContent = `TAP AGAIN: REPLACE WITH ${data.receipts.length} RECEIPT${data.receipts.length === 1 ? '' : 'S'}`;
      return undefined;
    }
    S = hydrate(data);
    S.active = null;
    ensureCloset();
    save();
    toast('Restored. Welcome back.');
    return go(S.w == null ? 'intro' : 'home', S.w == null ? { i: 0 } : {});
  },

  check: () => {
    checkRun = { i: 0, any: false };
    go('check');
  },
  'check-a': (d) => {
    if (d.v === '1') checkRun.any = true;
    checkRun.i += 1;
    if (checkRun.i < CHECK_QS.length) return go('check');
    return go('checkResult', { real: checkRun.any });
  },
  'move-body': () => {
    S.active = newLoop({ thing: 'Got out of my head', move: 'Walk, push-ups, anything. Just move.', source: 'check', step: 'timer', verdict: 'send', dur: 120 });
    save();
    go('loop');
  },
  dump: () => go('dump'),
  'dump-done': () => {
    const box = document.getElementById('dump');
    if (C.detectCrisis(box.value)) {
      box.value = '';
      return go('crisis');
    }
    box.classList.add('burn');
    sfx.boom();
    setTimeout(() => go('dumpGone'), 850);
    return undefined;
  },

  'crisis-back': () => go(S.active ? 'loop' : 'home'),
  'crisis-real': () => go('crisis'),
  'crisis-joke': () => {
    if (!S.active) return go('home');
    S.active.jokeOk = true;
    save();
    const next = view.next || 'thing-next';
    go('loop');
    return ACTIONS[next]();
  },
  rescan: () => {
    S.active = null;
    go('intro', { i: LAST_CARD });
  },
  install: async () => {
    try {
      await installPrompt?.prompt();
    } catch { /* Dismissed. */ }
    installPrompt = null;
    render();
  },
  erase: (_, el) => {
    if (el.dataset.armed !== '1') {
      el.dataset.armed = '1';
      el.textContent = 'TAP AGAIN TO ERASE';
      return;
    }
    try {
      localStorage.removeItem(KEY);
    } catch { /* Nothing to remove. */ }
    S = blank();
    ensureCloset();
    go('intro', { i: 0 });
  },
};

// Silent actions: anything that makes its own noise, plus the crisis screen.
const QUIET = new Set(['crisis-joke', 'crisis-real', 'poke', 'wear', 'spin', 'timer-go', 'fast-go', 'draft-go', 'draft-open', 'dump-done', 'moonwalk', 'objection', 'objection-next', 'thing-next', 'to-door', 'crisis-back', 'mute', 'intro-tap', 'intro-skip', 'replay-intro']);

// ---------- events ----------

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const action = el.dataset.a;
  if (!QUIET.has(action)) sfx.pop();
  ACTIONS[action]?.(el.dataset, el, e);
});

root.addEventListener('input', (e) => {
  const t = e.target;
  if (['thing', 'move', 'draft'].includes(t.id)) grow(t);
  if (t.id === 'draft') document.getElementById('blank-note')?.toggleAttribute('hidden', !C.hasBlanks(t.value));
  if (!S.active) return;
  if (t.id === 'thing' || t.id === 'move') {
    S.active[t.id] = t.value;
    save();
    const next = document.getElementById('next');
    if (next) next.disabled = !t.value.trim();
  } else if (t.id === 'draft-name') {
    S.active.draftName = t.value;
    if (!S.active.draftEdited) {
      const box = document.getElementById('draft');
      if (box) {
        box.value = currentDraft(S.active);
        grow(box);
      }
    }
    save();
    syncDraftLinks();
  } else if (t.id === 'draft') {
    S.active.draft = t.value;
    S.active.draftEdited = true;
    save();
    syncDraftLinks();
  }
});

root.addEventListener('change', (e) => {
  if (e.target.dataset?.c === 'show-thing') {
    view.showThing = e.target.checked;
    render();
  }
});

window.addEventListener('resize', fitAll);

// The opener only runs while someone can see it. Leaving pauses it; coming back replays the current card.
document.addEventListener('visibilitychange', () => {
  if (view.name !== 'intro') return;
  if (document.visibilityState === 'hidden') {
    introTimers.forEach(clearTimeout);
    introTimers = [];
  } else {
    render();
  }
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
});

// ---------- boot ----------

function boot() {
  if (vsScore != null) history.replaceState(null, '', location.pathname + location.search);
  if (introParam != null) return go('intro', { i: Number(introParam) || 0, hold: true });
  if (S.w == null) return go('intro', { i: 0 });

  const today = C.dateKey();
  if (S.lastSeen) {
    const grown = C.regrow(S.w, S.startW ?? S.w, C.dayDiff(S.lastSeen, today));
    if (grown > S.w) {
      S.w = grown;
      setTimeout(() => toast('A few wrinkles grew back. That’s all that happened.'), 500);
    }
  }
  // Missed yesterday: say the streak is safe before they assume it isn't.
  if (C.forgivenGap(S.lastDay, today) && S.streak > 1) {
    setTimeout(() => toast(`You missed yesterday. Do one thing today and the ${S.streak}-day streak stays.`), 600);
  }
  S.lastSeen = today;
  refreshNudges();
  refreshPro();

  // A running timer survives a refresh or a locked phone. Stale drafts don't.
  if (S.active && Date.now() - S.active.createdAt > 12 * 3600 * 1000) S.active = null;
  save();
  if (S.active) return go('loop');

  if (vsScore != null) setTimeout(() => toast(`Your friend scored ${vsScore}%. You’re at ${S.w}%.`), 500);
  return go('home');
}

// Android with "Remove animations" (or animator scale 0) can freeze CSS animations on their first
// frame instead of skipping them: headlines stuck at 2.4x, faded-in text never arriving. Seen on an
// emulator on 2026-11-11. If the clock runs but finite animations haven't moved, turn them all off.
document.addEventListener('click', (e) => {
  const box = e.target;
  if (!(box instanceof HTMLTextAreaElement) || box.id !== 'draft' || box.selectionStart !== box.selectionEnd) return;
  const at = box.selectionStart;
  const v = box.value;
  const open = v.lastIndexOf('[', at);
  const close = open === -1 ? -1 : v.indexOf(']', open);
  if (close === -1 || close + 1 < at || v.slice(open, close).includes('\n')) return;
  box.setSelectionRange(open, close + 1);
});

function watchFrozenAnimations() {
  if (!document.getAnimations) return;
  const t0 = document.timeline?.currentTime;
  const w0 = performance.now();
  const shown = () => document.visibilityState === 'visible';
  const wasShown = shown();
  // Only animations that already existed then and still haven't moved count: a brand-new one
  // can read zero at the moment of checking.
  const before = new Set(document.getAnimations());
  setTimeout(() => {
    const t1 = document.timeline?.currentTime;
    if (t0 == null || t1 == null) return;
    const wall = performance.now() - w0;
    // The whole animation clock can stop (Android with animations turned off does this), which leaves
    // every headline on its first, scaled-up frame. A hidden page pauses the clock too, so that doesn't count.
    const clockStopped = wasShown && shown() && wall > 1000 && t1 - t0 < wall / 4;
    const stuck = clockStopped || (t1 - t0 >= 600 && document.getAnimations().some((a) => before.has(a) && a.playState === 'running' && !a.currentTime
      && Number.isFinite(a.effect?.getComputedTiming?.().endTime)));
    if (stuck) {
      document.documentElement.classList.add('no-anim');
      fitAll();
    }
  }, 1400);
}

boot();
watchFrozenAnimations();
fontsReady().then(fitAll);
document.fonts?.ready?.then(fitAll);

const isLocal = /^(localhost|127\.|\[::1\])/.test(location.host);
if (!framed && 'serviceWorker' in navigator && (!isLocal || location.search.includes('sw=1'))) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
