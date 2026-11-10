// Share images, drawn on canvas. 1080x1920 fits Stories, Reels and TikTok.

import { drawBrain } from './brain.js';
import { BRAND, CLOSER, DREAD } from './content.js';
import { fmtDid, fmtDuration, fmtRatio, intOf, ratio, thoughtsPerMinute } from './core.js';

const SUN = '#FFE500';
const INK = '#0B0B0B';
const WHITE = '#FFFDF5';
const PINK = '#FF3D8B';
const MUTE = '#67624F';
const DISPLAY = '"Anton", Impact, sans-serif';
const BODY = '"Bricolage Grotesque", system-ui, sans-serif';
const MONO = '"DM Mono", ui-monospace, monospace';

export async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load(`400 100px "Anton"`),
      document.fonts.load(`800 40px "Bricolage Grotesque"`),
      document.fonts.load(`500 40px "DM Mono"`),
    ]);
  } catch { /* Falls back to system fonts. */ }
}

function canvas(w, h, bg = SUN) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  return [c, ctx];
}

function lines(ctx, text, maxW) {
  const out = [];
  let cur = '';
  for (const word of String(text).split(/\s+/)) {
    const next = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(next).width > maxW && cur) {
      out.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

function centered(ctx, text, cx, y, font, color = INK) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, y);
}

function fitSize(ctx, text, maxW, maxSize) {
  ctx.font = `400 100px ${DISPLAY}`;
  return Math.min(maxSize, Math.floor((100 * maxW) / ctx.measureText(text).width));
}

// Stacks lines, each scaled to fill the width, like a wheat-paste poster. Returns the bottom y.
function poster(ctx, textLines, cx, top, maxW, maxSize, color = INK) {
  let y = top;
  for (const line of textLines) {
    const size = fitSize(ctx, line, maxW, maxSize);
    y += size * 1.02;
    centered(ctx, line, cx, y, `400 ${size}px ${DISPLAY}`, color);
    y += size * 0.08;
  }
  return y;
}

// A hyphen in the brand name becomes a censor bar.
function wordmark(ctx, cx, y, size, color = INK) {
  const parts = BRAND.name.split('-');
  ctx.font = `400 ${size}px ${DISPLAY}`;
  const barW = size * 0.5;
  const gap = size * 0.08;
  const widths = parts.map((p) => ctx.measureText(p).width);
  const total = widths.reduce((a, b) => a + b, 0) + (parts.length - 1) * (barW + gap * 2);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  parts.forEach((p, i) => {
    ctx.fillText(p, x, y);
    x += widths[i];
    if (i < parts.length - 1) {
      ctx.fillRect(x + gap, y - size * 0.82, barW, size * 0.82);
      x += barW + gap * 2;
    }
  });
}

// No address on the card when it's local or inside an embedded viewer, whose host isn't the app's.
const footerHost = () => {
  try {
    if (window.self !== window.top) return '';
  } catch {
    return '';
  }
  if (/^(localhost|127\.|\[::1\])/.test(location.host)) return '';
  // Host plus folder, so a card from a project page (user.github.io/app) still leads back to the app.
  return (location.host + location.pathname.replace(/index\.html$/, '')).replace(/\/$/, '');
};

function statBar(ctx, label, value, x, y, w) {
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `400 60px ${DISPLAY}`;
  ctx.fillText(`${label} ${value}`, x, y);
  const barX = x + 210;
  ctx.fillStyle = 'rgba(11,11,11,.16)';
  ctx.fillRect(barX, y - 44, w - 210, 44);
  ctx.fillStyle = INK;
  ctx.fillRect(barX, y - 44, (w - 210) * Math.min(value / 20, 1), 44);
}

export function renderQuizCard({ wrinkled, typeName, seconds, wis }) {
  const [c, ctx] = canvas(1080, 1920);
  wordmark(ctx, 540, 190, 62);
  let y = poster(ctx, [`${wrinkled}%`, 'WRINKLED'], 540, 200, 920, 340);
  drawBrain(ctx, 300, y + 10, 480, wrinkled);
  y += 10 + 480 * (256 / 270) + 12;

  const size = fitSize(ctx, typeName, 760, 92);
  ctx.font = `400 ${size}px ${DISPLAY}`;
  const pillW = ctx.measureText(typeName).width + 90;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(540 - pillW / 2, y, pillW, size + 44, 20);
  ctx.fill();
  centered(ctx, typeName, 540, y + size + 12, `400 ${size}px ${DISPLAY}`, SUN);
  y += size + 44 + 74;

  statBar(ctx, 'INT', intOf(wrinkled), 110, y, 860);
  y += 72;
  statBar(ctx, 'WIS', wis, 110, y, 860);
  y += 58;

  const note = seconds != null
    ? `Took ${seconds} seconds on a question about tacos.`
    : `${thoughtsPerMinute(wrinkled)} thoughts per minute.`;
  ctx.font = `800 36px ${BODY}`;
  const noteLines = lines(ctx, note, 920);
  noteLines.forEach((l, i) => centered(ctx, l, 540, y + i * 44, `800 36px ${BODY}`));
  y += noteLines.length * 44 + 30;
  centered(ctx, footerHost() || 'BROTHER, WHAT’S YOUR SCORE?', 540, y, `400 50px ${DISPLAY}`, INK);
  return c;
}

export function renderObjectionCard(q, answer) {
  const [c, ctx] = canvas(1080, 1920, PINK);
  wordmark(ctx, 540, 280, 62);
  ctx.font = `800 54px ${BODY}`;
  let y = 400;
  lines(ctx, `“${q}”`, 900).forEach((l) => {
    centered(ctx, l, 540, y, `800 54px ${BODY}`);
    y += 66;
  });
  y = poster(ctx, answer.split('|'), 540, y + 20, 920, 400);
  drawBrain(ctx, 340, Math.min(y + 40, 1260), 400, 8);
  const host = footerHost();
  if (host) centered(ctx, host, 540, 1680, `500 34px ${MONO}`);
  return c;
}

function zigzagPaper(ctx, x, y, w, h, size = 30, fill = WHITE) {
  const tooth = w / Math.round(w / size); // Whole teeth only, or the edges come out slanted.
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const count = Math.round(w / tooth);
  for (let i = 0; i < count; i++) {
    ctx.lineTo(x + i * tooth + tooth / 2, y - tooth / 2);
    ctx.lineTo(x + (i + 1) * tooth, y);
  }
  ctx.lineTo(x + w, y + h);
  for (let i = 0; i < count; i++) {
    ctx.lineTo(x + w - i * tooth - tooth / 2, y + h + tooth / 2);
    ctx.lineTo(x + w - (i + 1) * tooth, y + h);
  }
  ctx.closePath();
  ctx.fill();
}

function dashed(ctx, x1, x2, y) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function row(ctx, label, value, y, left, right) {
  ctx.font = `500 36px ${MONO}`;
  ctx.fillStyle = MUTE;
  ctx.textAlign = 'left';
  ctx.fillText(label, left, y);
  ctx.fillStyle = INK;
  ctx.textAlign = 'right';
  ctx.fillText(value, right, y);
}

// A fixed pseudo-random pattern, so the same receipt always looks the same.
function barcode(ctx, x, y, w, h) {
  ctx.fillStyle = INK;
  let px = x;
  let seed = 7;
  while (px < x + w) {
    seed = (seed * 31 + 11) % 97;
    const bar = 3 + (seed % 4) * 3;
    if (px + bar > x + w) break;
    ctx.fillRect(px, y, bar, h);
    px += bar + 4 + (seed % 3) * 3;
  }
}

// gold: the legendary receipt. Black card, gold paper, a banner on top.
function receiptFrame(sub, rows, bigText, bigLabel, { gold = false } = {}) {
  const [c, ctx] = canvas(1080, 1920, gold ? INK : SUN);
  const left = 170;
  const right = 910;
  const maxW = right - left;

  // Measure first, so the paper fits its content and sits centered on the card.
  ctx.font = `500 36px ${MONO}`;
  const blocks = rows.map(([, value, opts]) => {
    if (!opts?.block) return null;
    const all = lines(ctx, value, maxW);
    const kept = all.slice(0, 3);
    if (all.length > 3) {
      let last = `${kept[2]}…`;
      while (ctx.measureText(last).width > maxW) last = `${last.slice(0, -2).trimEnd()}…`;
      kept[2] = last;
    }
    return kept;
  });
  const rowsH = blocks.reduce((h, b) => h + (b ? 52 + b.length * 48 + 28 : 74), 0);
  ctx.font = `500 30px ${MONO}`;
  const closer = lines(ctx, CLOSER.toUpperCase(), maxW);
  const bigSize = fitSize(ctx, bigText, maxW, 210);
  const paperH = 268 + rowsH + bigSize * 1.08 + 54 + 42 + 62 + closer.length * 42 + 12 + 78 + 106;
  const top = Math.max(200, Math.round((1920 - paperH) / 2));
  zigzagPaper(ctx, 100, top, 880, paperH, 30, gold ? SUN : WHITE);
  if (gold) centered(ctx, 'LEGENDARY RECEIPT', 540, top - 54, `400 72px ${DISPLAY}`, SUN);

  wordmark(ctx, 540, top + 112, 92);
  centered(ctx, sub, 540, top + 168, `500 30px ${MONO}`, MUTE);
  dashed(ctx, left, right, top + 208);

  let y = top + 272;
  for (let i = 0; i < rows.length; i++) {
    const [label, value, opts] = rows[i];
    if (opts?.redacted) {
      row(ctx, label, '', y, left, right);
      ctx.fillStyle = INK;
      ctx.fillRect(right - 360, y - 32, 360, 42);
      y += 74;
    } else if (opts?.block) {
      ctx.font = `500 36px ${MONO}`;
      ctx.fillStyle = MUTE;
      ctx.textAlign = 'left';
      ctx.fillText(label, left, y);
      y += 52;
      ctx.fillStyle = INK;
      blocks[i].forEach((l) => {
        ctx.textAlign = 'left';
        ctx.fillText(l, left, y);
        y += 48;
      });
      y += 28;
    } else {
      row(ctx, label, value, y, left, right);
      y += 74;
    }
  }

  dashed(ctx, left, right, y - 16);
  y += 10 + bigSize;
  centered(ctx, bigText, 540, y, `400 ${bigSize}px ${DISPLAY}`);
  y += 54;
  centered(ctx, bigLabel, 540, y, `500 30px ${MONO}`, MUTE);
  y += 40;
  dashed(ctx, left, right, y);
  y += 60;

  closer.forEach((l) => {
    centered(ctx, l, 540, y, `500 30px ${MONO}`);
    y += 42;
  });

  barcode(ctx, 240, y - 12, 600, 78);
  centered(ctx, footerHost() || 'NO REFUNDS ON THINKING', 540, y + 112, `500 28px ${MONO}`, MUTE);
  return c;
}

const stamp = (ms) => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

export function renderReceiptCard(r, showThing) {
  const rows = [];
  if (showThing && r.thing) rows.push(['THE THING', r.thing, { block: true }]);
  else rows.push(['THE THING', '', { redacted: true }]);
  if (r.thoughtMin) rows.push(['OVERTHOUGHT', fmtDuration(r.thoughtMin).toUpperCase()]);
  const bailed = r.outcome === 'bailed';
  rows.push(['DID IT IN', bailed ? 'NOT TODAY' : fmtDid(r.doneSec).toUpperCase()]);
  if (r.dread != null) rows.push(['YOU SAID', DREAD[r.dread].toUpperCase()]);
  if (r.reality != null) rows.push(['IT WAS', DREAD[r.reality].toUpperCase()]);
  rows.push(['THOUGHTS', bailed ? 'MANY' : '0']);
  const x = bailed ? null : ratio(r.thoughtMin, r.doneSec);
  const big = bailed ? 'CHICKENED OUT' : x ? fmtRatio(x) : 'DONE';
  const label = bailed ? 'NO PENALTY. NOTHING HAPPENED.' : x ? 'THINKING TO DOING' : 'THAT’S THE WHOLE THING';
  return receiptFrame(`RECEIPT #${r.day}   ${stamp(r.at)}`, rows, big, label, { gold: !!r.legendary });
}

export function renderLifetimeCard(stats, wrinkled, wis, at = Date.now()) {
  const rows = [
    ['RECEIPTS', String(stats.count)],
    ['OVERTHOUGHT', fmtDuration(stats.thoughtMin).toUpperCase()],
    ['DOING TOOK', fmtDid(stats.doneSec).toUpperCase()],
  ];
  if (stats.forecasts) rows.push(['BRAIN LIED', `${stats.wrong} OF ${stats.forecasts}`]);
  rows.push(['INT', String(intOf(wrinkled))]);
  rows.push(['WIS', String(wis)]);
  const big = stats.ratio ? fmtRatio(stats.ratio) : `${wrinkled}%`;
  const label = stats.ratio ? 'THINKING TO DOING' : 'WRINKLED';
  return receiptFrame(`LIFETIME   ${stamp(at)}`, rows, big, label);
}

export function renderIcon(size, maskable = false) {
  const [c, ctx] = canvas(size, size);
  const width = size * (maskable ? 0.62 : 0.8);
  const height = width * (256 / 270);
  drawBrain(ctx, (size - width) / 2, (size - height) / 2, width, 6);
  return c;
}

export function renderOG() {
  const [c, ctx] = canvas(1200, 630);
  wordmark(ctx, 345, 96, 66);
  poster(ctx, ['HOW WRINKLED', 'IS YOUR', 'BRAIN?'], 345, 104, 600, 165);
  drawBrain(ctx, 680, 110, 480, 88);
  return c;
}

export const toBlob = (c) => new Promise((resolve) => c.toBlob(resolve, 'image/png'));
