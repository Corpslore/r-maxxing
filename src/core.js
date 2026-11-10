// Pure logic. No DOM, so everything here runs under `node --test`.

import { BRAND } from './content.js';

const DAY_MS = 86400000;
const FIRST_DAY_UTC = Date.UTC(2026, 10, 1); // Daily move #1

// ---------- dates ----------

export function dateKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function keyToUtc(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function dayDiff(fromKey, toKey) {
  return Math.round((keyToUtc(toKey) - keyToUtc(fromKey)) / DAY_MS);
}

export function dayNumber(key) {
  return Math.round((keyToUtc(key) - FIRST_DAY_UTC) / DAY_MS) + 1;
}

// Same move for everyone on a given date. Walks the list with a stride that
// shares no factor with its length, so nothing repeats until all have run.
export function dailyIndex(key, len) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  let stride = 17;
  while (gcd(stride, len) !== 1) stride += 1;
  const n = dayNumber(key) - 1;
  return ((n * stride) % len + len) % len;
}

// ---------- no repeats ----------

// A short, stable key for a line. "Seen" lists store these, so reordering the
// copy or adding new lines never confuses the rotation.
export function lineKey(text) {
  let h = 5381;
  const s = typeof text === 'string' ? text : JSON.stringify(text);
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// Shuffle bag. Every item comes up once before anything repeats, and a new round
// never opens with the item that closed the last one. Lines added later join the
// current round. Returns the pick and the updated seen list to store.
export function drawFresh(items, seen = [], rand = Math.random) {
  if (!items.length) return { index: -1, item: undefined, seen: [] };
  const keys = items.map(lineKey);
  const live = new Set(keys);
  let history = (Array.isArray(seen) ? seen : []).filter((k) => live.has(k));
  let pool = keys.map((_, i) => i).filter((i) => !history.includes(keys[i]));
  if (!pool.length) {
    const last = history[history.length - 1];
    history = [];
    pool = keys.map((_, i) => i).filter((i) => keys[i] !== last);
    // Every item is identical (or there's only one): nothing to avoid.
    if (!pool.length) pool = keys.map((_, i) => i);
  }
  const index = pool[Math.min(Math.floor(rand() * pool.length), pool.length - 1)];
  return { index, item: items[index], seen: [...history, keys[index]] };
}

// ---------- progress and unlocks ----------

// Distinct days with any receipt. Bails count: showing up is the habit.
export function daysActive(receipts) {
  return new Set((receipts || []).map((r) => dateKey(new Date(r.at)))).size;
}

// schedule: { id: daysNeeded }. Returns ids open at `days`.
export const openIds = (schedule, days) => Object.keys(schedule).filter((id) => (schedule[id] || 0) <= days);

// The nearest thing still locked, and how many more days of doing stuff it needs.
export function nextUnlock(schedule, days) {
  const ahead = Object.entries(schedule).filter(([, need]) => need > days).sort((a, b) => a[1] - b[1]);
  return ahead.length ? { id: ahead[0][0], inDays: ahead[0][1] - days } : null;
}

// What a new day of activity just opened.
export const newlyOpen = (schedule, before, after) => Object.keys(schedule).filter((id) => schedule[id] > before && schedule[id] <= after);

// Missed exactly one day: the streak survives, and the app should say so.
export const forgivenGap = (lastDay, today) => !!lastDay && dayDiff(lastDay, today) === 2;

// Which moment a closing line can be aimed at, most specific first, or null.
export function closeContext({ firstEver, streak, streakUp, gapDays, source, doneSec, date = new Date() }) {
  if (firstEver) return 'first';
  if (streakUp && [3, 7, 14, 30].includes(streak)) return `streak${streak}`;
  if (gapDays != null && gapDays >= 3) return 'back';
  if (source === 'dare') return 'dare';
  if (source === 'daily') return 'daily';
  if (doneSec != null && doneSec < 60) return 'quick';
  const h = date.getHours();
  if (h < 5) return 'late';
  if (h < 8) return 'early';
  const d = date.getDay();
  if (d === 1) return 'monday';
  if (d === 5) return 'friday';
  if (d === 0 || d === 6) return 'weekend';
  return null;
}

// About one finished thing in twenty comes out gold.
export const LEGENDARY_ODDS = 0.05;

// ---------- wardrobe drops ----------

// A per-person order for the wardrobe, so friends don't all get the same hat first.
export function shuffled(list, rand = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Which piece drops now, if any: one per threshold reached, next in the person's order.
export function dripDue(finished, owned, order, schedule) {
  const earned = schedule.filter((n) => n <= finished).length;
  if (owned.length >= earned) return null;
  return order.find((id) => !owned.includes(id)) || null;
}

// ---------- daily nudges ----------

// The next `days` nudge times at hour:minute. Today is skipped if it's done or already past.
export function nudgeTimes({ hour, minute = 0, now = new Date(), doneToday = false, days = 7 }) {
  const out = [];
  for (let i = 0; out.length < days && i < days + 1; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute, 0, 0);
    if (i === 0 && (doneToday || at <= now)) continue;
    out.push(at);
  }
  return out;
}

// ---------- backup codes ----------

const BACKUP_PREFIX = 'RMX1.';

// Everything but an in-progress loop, as one copyable line of text.
export function encodeBackup(state) {
  const { active, ...rest } = state || {};
  const bytes = new TextEncoder().encode(JSON.stringify(rest));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return BACKUP_PREFIX + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Returns the saved state, or null for anything that isn't a whole, valid code.
export function decodeBackup(code) {
  const s = String(code || '').replace(/\s+/g, '');
  if (!s.startsWith(BACKUP_PREFIX)) return null;
  try {
    let b = s.slice(BACKUP_PREFIX.length).replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    const bin = atob(b);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.receipts)) return null;
    return data;
  } catch {
    return null;
  }
}

// ---------- the brain scan ----------

// answers: 0, 1 or 2 per question (2 is most wrinkled). seconds: time per question.
export function scoreQuiz(answers, seconds) {
  const max = answers.length * 2;
  const sum = answers.reduce((a, b) => a + b, 0);
  const total = seconds.reduce((a, b) => a + b, 0);
  const avg = total / Math.max(seconds.length, 1);
  const base = (sum / max) * 85;
  // Taking your time counts against you. That's the joke and the measurement.
  const penalty = Math.min(Math.max((avg - 3) / 7, 0), 1) * 15;
  return {
    wrinkled: Math.round(Math.min(Math.max(base + penalty, 3), 100)),
    totalSeconds: Math.round(total),
  };
}

export function typeIndexFor(wrinkled) {
  if (wrinkled < 15) return 0;
  if (wrinkled < 40) return 1;
  if (wrinkled < 65) return 2;
  if (wrinkled < 85) return 3;
  return 4;
}

// ---------- wrinkles and streaks ----------

export function smoothAfter(wrinkled, outcome) {
  if (outcome === 'bailed') return wrinkled; // Bailing costs nothing. See the Method.
  if (outcome === 'some') return Math.max(0, wrinkled - 1);
  return Math.max(0, wrinkled - Math.max(2, Math.round(wrinkled * 0.08)));
}

// Wrinkles creep back slowly after two idle days, never past where you started.
export function regrow(wrinkled, startWrinkled, idleDays) {
  if (idleDays <= 2) return wrinkled;
  const grown = wrinkled + Math.min(idleDays - 2, 10);
  return Math.max(wrinkled, Math.min(grown, startWrinkled));
}

// Character stats, RPG style: doing things lowers INT and raises WIS.
export const START_WIS = 3;
export const intOf = (wrinkled) => Math.min(20, Math.max(1, Math.ceil(wrinkled / 5)));
export const wisGain = (outcome) => ({ did: 2, some: 1 }[outcome] || 0);
export const thoughtsPerMinute = (wrinkled) => Math.round(wrinkled * 9);

// One missed day doesn't break a streak. A day off is a day off.
export function nextStreak(lastDay, streak, today) {
  if (!lastDay) return 1;
  const diff = dayDiff(lastDay, today);
  if (diff <= 0) return Math.max(streak, 1);
  if (diff <= 2) return streak + 1;
  return 1;
}

// ---------- the door check ----------

export function doorVerdict({ serious, undo, cheap, solo }) {
  if (serious) return 'think';
  const reds = [undo, cheap, solo].filter((x) => x === false).length;
  if (reds === 0) return 'send';
  return reds === 1 ? 'shrink' : 'think';
}

const norm = (text) => String(text || '').replace(/[‘’]/g, "'").toLowerCase();

const PEOPLE = '(?:him|her|them|my\\s+(?:wife|husband|girlfriend|boyfriend|partner|ex|kids?|son|daughter|boss|mom|dad|mother|father|brother|sister|roommate))';

const CRISIS = [
  /\bsuicid/,
  /\bkill(?:ing)?\s+my\s?self\b/,
  /\bend(?:ing)?\s+(?:it\s+all|my\s+life)\b/,
  /\bhurt(?:ing)?\s+my\s?self\b/,
  /\bharm(?:ing)?\s+my\s?self\b/,
  /\bself[-\s]?harm/,
  /\bcut(?:ting)?\s+my\s?self\b/,
  /\bover\s?dos/,
  /\b(?:want|wanna|wish)\b.{0,20}\b(?:die|dead)\b/,
  /\b(?:don't|dont|do not)\s+want\s+to\s+(?:be\s+(?:here|alive)|live|wake\s+up|exist)\b/,
  /\bno\s+(?:reason|point)\s+(?:to|in)\s+(?:live|living|go\s+on|going\s+on)\b/,
  /\bbetter\s+off\s+(?:without\s+me|dead)\b/,
  new RegExp(`\\b(?:kill|killing|hurt|hurting|shoot|shooting|stab|stabbing|strangle|strangling|beat\\s+up)\\s+${PEOPLE}\\b`),
];

export function detectCrisis(text) {
  const t = norm(text);
  return CRISIS.some((re) => re.test(t));
}

const ONE_WAY = [
  ['safety', /\b(?:drive\s+(?:home\s+)?(?:drunk|high)|drunk\s+driv\w*|driving\s+after\s+drink\w*|guns?|firearms?|weapons?|stalk\w*|follow(?:ing)?\s+(?:him|her|them)|show(?:ing)?\s+up\s+at\s+(?:his|her|their))\b/],
  ['health', /\b(?:chemo\w*|radiation|surgery|biopsy|diagnos\w*|tumou?rs?|cancer|insulin|medication|meds|antidepressants?|prescriptions?|stop\s+taking|pregnan\w*|abortion|rehab|detox|relapse\w*|fasting\s+for\s+\w+\s+days|skip\w*\s+(?:my\s+)?(?:treatment|doctor|therapy))\b/],
  ['money', /\b(?:mortgage|loans?|bankrupt\w*|401k|retirement|life\s+savings|crypto\w*|bitcoin|day\s*trad\w*|options\s+trad\w*|margin|invest(?:ing)?\s+(?:all|my|in)|buy(?:ing)?\s+(?:a\s+)?(?:house|car|stocks?)|sell(?:ing)?\s+(?:my\s+)?(?:house|stocks?)|co-?sign\w*|gambl\w*|bet(?:ting)?\s+(?:my|all))\b/],
  ['law', /\b(?:lawsuit|sue|suing|custody|divorce|lawyer|attorney|immigration|plead\w*|arrest\w*|warrant|sign(?:ing)?\s+(?:the|a|this)\s+contract)\b/],
  ['life', /\b(?:quit(?:ting)?\s+(?:my\s+)?(?:job|work)|resign\w*|drop(?:ping)?\s+out|get(?:ting)?\s+married|propos(?:e|ing)|marry\w*|hav(?:e|ing)\s+a\s+(?:baby|kid)|break(?:ing)?\s+up|leav(?:e|ing)\s+my\s+(?:wife|husband|partner|girlfriend|boyfriend)|sell(?:ing)?\s+everything|mov(?:e|ing)\s+(?:across|to\s+another)\s+\w+)\b/],
];

// Returns the kind of one-way door this looks like, or null.
export function detectOneWay(text) {
  const t = norm(text);
  for (const [kind, re] of ONE_WAY) if (re.test(t)) return kind;
  return null;
}

// ---------- drafts and the fast lane ----------

// Which ready-made message fits what they typed. Order matters: the first match wins.
const DRAFT_PATTERNS = [
  ['askout', /\b(?:ask(?:ing)?\s+(?:\w+\s+)?out|on a date|go(?:ing)? out with|my crush)\b/],
  ['apology', /\b(?:apolog\w*|say(?:ing)? sorry|make (?:it|things) right)\b/],
  ['decline', /\b(?:say(?:ing)? no|declin\w*|back(?:ing)? out|turn(?:ing)? (?:it |them |him |her )?down|bail(?:ing)? on|cancel(?:l?ing)? (?:on|plans|our plans|my plans))\b/],
  ['refund', /\b(?:refund\w*|money back|return(?:ing)? (?:it|this|the))\b/],
  ['followup', /\b(?:follow(?:ing)?[\s-]?up|haven't heard|check(?:ing)? in on|chas(?:e|ing) (?:up|them|him|her))\b/],
  ['meeting', /\b(?:meeting|1:1|one[\s-]on[\s-]one|boss|manager|raise|promotion)\b/],
  ['reply', /\b(?:(?:text|texting|message|messaging|dm|email|emailing|write|writing|call|calling)\s+(?:\w+\s+){0,2}back|repl(?:y|ying)|respond\w*|get(?:ting)? back to|answer\w*\s+(?:the |her |his |their |my |that )?(?:text|message|email|dm))\b/],
  ['reconnect', /\b(?:reach(?:ing)? out|reconnect\w*|haven't (?:talked|spoken)|old friend|been (?:a while|forever))\b/],
  ['issue', /\b(?:bring(?:ing)? (?:it |this |that )?up|say (?:the|that) (?:annoying|hard|awkward) thing|talk(?:ing)? to (?:him|her|them) about|bother(?:s|ing) me)\b/],
  ['favor', /\b(?:favou?r|ask(?:ing)? for help|need help from)\b/],
  ['plans', /\b(?:hang(?:ing)? out|hangout|catch(?:ing)? up|make plans|invit\w*|what are you doing|grab (?:food|a drink|coffee|lunch|dinner)|get together)\b/],
];

export function detectDraftKind(text) {
  const t = norm(text);
  for (const [kind, re] of DRAFT_PATTERNS) if (re.test(t)) return kind;
  return null;
}

// Templates write "Hey {name}," so a blank name leaves "Hey," rather than a gap.
export function fillDraft(template, name) {
  const n = String(name || '').trim();
  return n ? template.replace(/\{name\}/g, n) : template.replace(/ \{name\}/g, '').replace(/\{name\}/g, '');
}

const MOVE_PATTERNS = [
  ['gym', /\b(?:gym|work ?out|workout|run|running|lift\w*|exercise|walk)\b/],
  ['email', /\b(?:email|e-mail|inbox)\b/],
  ['apply', /\b(?:apply|applying|application|resume|cv)\b/],
  ['clean', /\b(?:clean\w*|laundry|dishes|tidy|declutter)\b/],
  ['call', /\b(?:call|phone|ring)\b/],
  ['write', /\b(?:write|writing|essay|paper|post|video|edit\w*|draft)\b/],
];

export function suggestKind(text, draftKind) {
  if (draftKind) return 'draft';
  const t = norm(text);
  for (const [kind, re] of MOVE_PATTERNS) if (re.test(t)) return kind;
  return 'default';
}

// Works on iPhone and Android. Inside some embedded viewers these links do nothing, so copy is the main path.
export const smsHref = (body) => `sms:?&body=${encodeURIComponent(body)}`;
export const mailHref = (subject, body) => `mailto:?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body)}`;

// ---------- formatting ----------

const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`;

export function fmtDuration(minutes) {
  const m = Math.round(minutes);
  if (m < 60) return plural(Math.max(m, 0), 'min').replace('mins', 'min');
  if (m < 1440) return plural(Math.round(m / 60), 'hour');
  if (m < 10080) return plural(Math.round(m / 1440), 'day');
  if (m < 43200) return plural(Math.round(m / 10080), 'week');
  if (m < 525600) return plural(Math.round(m / 43200), 'month');
  return plural(Math.round(m / 525600), 'year');
}

export function fmtClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function fmtDid(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} sec` : `${m} min`;
}

export function ratio(thoughtMinutes, doneSeconds) {
  if (!thoughtMinutes || !doneSeconds) return null;
  return Math.max(1, Math.round((thoughtMinutes * 60) / Math.max(doneSeconds, 1)));
}

export const fmtRatio = (r) => `${r.toLocaleString('en-US')}:1`;

// ---------- lifetime stats ----------

export function lifetime(receipts) {
  const done = receipts.filter((r) => r.outcome !== 'bailed');
  const thoughtMin = done.reduce((a, r) => a + (r.thoughtMin || 0), 0);
  const doneSec = done.reduce((a, r) => a + (r.doneSec || 0), 0);
  const tracked = done.filter((r) => r.dread != null && r.reality != null);
  return {
    count: receipts.length,
    did: done.length,
    thoughtMin,
    doneSec,
    ratio: ratio(thoughtMin, doneSec),
    forecasts: tracked.length,
    // Predicted worse than it went: your brain was wrong.
    wrong: tracked.filter((r) => r.reality < r.dread).length,
  };
}

// ---------- share text and challenge links ----------

export function parseVs(hash) {
  const m = /(?:^|[#&])vs=(\d{1,3})(?:&|$)/.exec(hash || '');
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 100 ? n : null;
}

// `url` can be empty (no shareable address yet), and then it's left off.
export function quizShareText(wrinkled, typeName, url) {
  const text = `My brain is ${wrinkled}% wrinkled. Class: ${typeName}. INT ${intOf(wrinkled)}.\nBrother, how wrinkled is yours?`;
  return url ? `${text}\n${url}#vs=${wrinkled}` : text;
}

export function objectionShareText(q, answer, url) {
  const text = `${q}\n${answer.replace(/\|/g, ' ')}`;
  return url ? `${text}\n${url}` : text;
}

export function clockNow(d = new Date()) {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function receiptShareText(r, url) {
  const lines = [`${BRAND.name} #${r.day}${r.legendary ? ' ★ LEGENDARY' : ''}`];
  if (r.thoughtMin) lines.push(`Overthought: ${fmtDuration(r.thoughtMin)}`);
  lines.push(r.outcome === 'bailed' ? 'Did it in: not today' : `Did it in: ${fmtDid(r.doneSec)}`);
  const x = r.outcome === 'bailed' ? null : ratio(r.thoughtMin, r.doneSec);
  if (x) lines.push(`Ratio: ${fmtRatio(x)}`);
  if (url) lines.push(url);
  return lines.join('\n');
}
