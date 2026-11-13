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

// ---------- daily credit ----------

// Only the first few finishes a day smooth the brain and earn drip, so it can't be farmed in a night.
export const DAILY_CREDIT = 3;
export function creditToday(credit, today, cap = DAILY_CREDIT) {
  const n = credit && credit.day === today ? credit.n + 1 : 1;
  return { counts: n <= cap, n, credit: { day: today, n } };
}

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

// People someone might mean harm to. Articles or "my" in front, so "kill the vibe" never matches.
const WHO = '(?:wife|husband|girlfriend|boyfriend|partner|ex|kids?|son|daughter|boss|mom|dad|mother|father|brother|sister|'
  + 'roommate|landlord|teacher|coworker|co-worker|neighbou?r|friend|manager|professor|coach|cousin|parents?|family|'
  + 'stepdad|stepmom|bully|classmate|guy|girl|dude|kid)';
const PEOPLE = `(?:him|her|them|someone|somebody|everyone|(?:my|his|her|their|the|this|that)\\s+${WHO})`;

// Self-harm and harm-to-others wording, including the slang the first version missed
// (found by simulated user reviews on 2026-11-11 and checked against this code).
const CRISIS = [
  /\bsuicid/,
  /\bsewer\s?slide\b/,
  /\bkill(?:ing)?\s+my\s?self\b/,
  /\bend(?:ing)?\s+(?:it\s+all|my\s+life)\b/,
  /\bhurt(?:ing)?\s+my\s?self\b/,
  /\bharm(?:ing)?\s+my\s?self\b/,
  /\bself[-\s]?harm/,
  /\b(?:cut|cutting|hang|hanging|shoot|shooting|drown|drowning|stab|stabbing|burn|burning|starve|starving)\s+my\s?self\b/,
  /\bslit(?:ting)?\s+(?:my\s+)?wrists?\b/,
  /\bnoose\b/,
  /\bover\s?dos/,
  /\b(?:bottle|handful|bunch|whole\s+pack)\s+of\s+(?:pills|meds|tylenol|advil|sleeping\s+pills)\b/,
  /\btak(?:e|ing)\s+(?:all|too\s+many)\s+(?:of\s+)?(?:my\s+)?(?:pills|meds)\b/,
  /\bjump(?:ing)?\s+(?:off|from)\s+(?:the|a|my)\s+(?:roof|bridge|building|balcony|cliff|overpass|ledge|parking\s+garage)\b/,
  /\bjump(?:ing)?\s+in\s+front\s+of\s+(?:a|the)\s+(?:train|car|bus|truck)\b/,
  /\b(?:want|wanna|wish)\b.{0,20}\b(?:die|dead)\b/,
  /\b(?:don't|dont|do not)\s+want\s+to\s+(?:be\s+(?:here|alive)|live|wake\s+up|exist)\b/,
  /\bno\s+(?:reason|point)\s+(?:to|in)\s+(?:live|living|go\s+on|going\s+on)\b/,
  /\bbetter\s+off\s+(?:without\s+me|dead)\b/,
  // Hurting someone. "hurt her feelings" and "shoot him a text" are ordinary overthinking, not this.
  new RegExp(`\\b(?:kill|killing|murder|murdering|shoot|shooting|stab|stabbing|strangle|strangling|choke|choking|beat\\s+up|hurt|hurting)\\s+${PEOPLE}\\b(?!\\s+(?:a|an)\\s+(?:text|message|dm|email|msg|note|line|look))(?!\\s*(?:'s)?\\s*(?:feelings|ego|pride|chances))`),
];

// Words that are often a joke ("kms", "unalive"): ask first instead of assuming either way.
const CRISIS_CHECK = [/\bkms\b/, /\bunaliv\w*/, /\bi'?m\s+(?:so\s+)?done\s+with\s+(?:life|everything)\b/];

export function detectCrisisCheck(text) {
  const t = norm(text);
  return !detectCrisis(text) && CRISIS_CHECK.some((re) => re.test(t));
}

export function detectCrisis(text) {
  const t = norm(text);
  return CRISIS.some((re) => re.test(t));
}

const ONE_WAY = [
  // Telling someone to end it. Not written, not sent.
  ['cruel', /\b(?:kys|kill\s+(?:your|ur|yo)\s?self|go\s+die)\b/],
  // Pics are one-way the moment they leave the phone.
  ['pics', /\b(?:send(?:ing)?|post(?:ing)?)\s+(?:\w+\s+){0,2}(?:pics|nudes|n00ds|photos?\s+of\s+(?:me|myself)|spicy\s+pics)\b/],
  ['safety', new RegExp(`\\b(?:drive\\s+(?:home\\s+)?(?:drunk|high|wasted|buzzed|faded)|driv(?:e|ing)\\s+(?:home\\s+)?after\\s+(?:\\d+|a\\s+few|some|two|three|four|five|six)\\s+(?:beers|drinks|shots)|drunk\\s+driv\\w*|driving\\s+after\\s+drink\\w*|driv(?:e|ing)\\s+without\\s+(?:a|my)\\s+licen[cs]e|guns?|firearms?|weapons?|knife|knives|razor|bleach|poison|stalk\\w*|follow(?:ing)?\\s+(?:him|her|them)|show(?:ing)?\\s+up\\s+at\\s+(?:his|her|their)|(?:punch|punching|slap|slapping|fight|fighting|attack|attacking|jump(?:ing)?)\\s+${PEOPLE}|hit(?:ting)?\\s+${PEOPLE}(?!\\s+up))\\b`)],
  // Hard no in here for anyone, and especially for a 16-year-old.
  ['teen', /\b(?:sneak(?:ing)?\s+out|meet(?:ing)?\s+(?:up\s+)?(?:with\s+)?(?:someone|somebody|a\s+(?:guy|girl|stranger|man|woman)|him|her|them)\s+(?:from|i\s+met\s+on|off)\s+(?:discord|online|snap\w*|insta\w*|tiktok|the\s+internet|roblox|reddit|an?\s+app|tinder|hinge|bumble)|get(?:ting)?\s+(?:drunk|high|wasted|faded|crossfaded)|drink(?:ing)?\s+(?:at|before)\s+(?:the|a|this)\s+party|vap(?:e|ing|es)|edibles?|weed|smok(?:e|ing)\s+(?:weed|a\s+joint|pot|cigs?|cigarettes)|shrooms|molly|percs?|xans?|skip(?:ping)?\s+school)\b/],
  ['health', /\b(?:chemo\w*|radiation|surgery|biopsy|diagnos\w*|tumou?rs?|cancer|insulin|medication|meds|antidepressants?|prescriptions?|stop\s+taking|pregnan\w*|abortion|rehab|detox|relapse\w*|pills|fasting\s+for\s+\w+\s+days|skip\w*\s+(?:my\s+)?(?:treatment|doctor|therapy))\b/],
  ['money', /\b(?:mortgage|loans?|bankrupt\w*|401k|retirement|life\s+savings|crypto\w*|bitcoin|day\s*trad\w*|options\s+trad\w*|margin|invest(?:ing)?\s+(?:all|my|in)|buy(?:ing)?\s+(?:a\s+)?(?:house|car|stocks?)|sell(?:ing)?\s+(?:my\s+)?(?:house|stocks?)|co-?sign\w*|gambl\w*|bet(?:ting)?\s+(?:my|all))\b/],
  ['law', /\b(?:lawsuit|sue|suing|custody|divorce|lawyer|attorney|immigration|plead\w*|arrest\w*|warrant|sign(?:ing)?\s+(?:the|a|this)\s+contract)\b/],
  ['life', /\b(?:quit(?:ting)?\s+(?:my\s+)?(?:job|work|school|college)|resign\w*|drop(?:ping)?\s+out|get(?:ting)?\s+married|propos(?:e|ing)|marry\w*|hav(?:e|ing)\s+a\s+(?:baby|kid)|break(?:ing)?\s+up|leav(?:e|ing)\s+my\s+(?:wife|husband|partner|girlfriend|boyfriend)|sell(?:ing)?\s+everything|mov(?:e|ing)\s+(?:across|to\s+another)\s+\w+|switch(?:ing)?\s+(?:my\s+)?majors?|chang(?:e|ing)\s+(?:my\s+)?majors?|accept(?:ing)?\s+(?:the|a|this)\s+(?:job\s+)?offer|tak(?:e|ing)\s+(?:the|a|this)\s+job\s+offer)\b/],
];

// Returns the kind of one-way door this looks like, or null.
export function detectOneWay(text) {
  const t = norm(text);
  for (const [kind, re] of ONE_WAY) if (re.test(t)) return kind;
  return null;
}

// ---------- drafts and the fast lane ----------

// Which ready-made message fits what they typed. Order matters: the first match wins, so the
// specific ones (professor, landlord) come before the general ones (reply, plans).
const DRAFT_PATTERNS = [
  ['rec', /\b(?:rec(?:ommendation)?\s+letter|letter\s+of\s+rec\w*|references?\s+letter)\b/],
  // Missed a quiz or class: a make-up ask, not an extension.
  ['missed', /\b(?:missed|skipped)\b[^.]*\b(?:quiz(?:zes)?|tests?|exams?|class(?:es)?|lectures?|labs?|midterms?)\b|\b(?:quiz(?:zes)?|tests?|exams?|class(?:es)?|lectures?|labs?|midterms?)\b[^.]*\b(?:missed|skipped)\b|\bmake[\s-]?up (?:quiz|test|exam|work)\b/],
  ['prof', /\b(?:professor|prof|my\s+ta|instructor|office\s+hours|extension|my\s+grade|syllabus)\b/],
  ['recruiter', /\brecruiter\b/],
  ['job', /\b(?:internship|job\s+application|application\s+status|the\s+interview|hiring\s+manager)\b/],
  ['landlord', /\b(?:landlord|property\s+manager|maintenance\s+request)\b/],
  ['roommate', /\broommates?\b/],
  ['group', /\b(?:group\s?chat|the\s+gc|gc)\b/],
  ['reacted', /\b(?:replied|reacted|responded|commented)\b[^.]*\bmy\s+(?:story|post|pic|reel|tiktok|snap)\b/],
  ['story', /\b(?:(?:her|his|their|a)\s+story|stor(?:y|ies)\s+repl\w*)\b/],
  ['askout', /\b(?:ask(?:ing)?\s+(?:\w+\s+)?out|on a date|go(?:ing)? out with)\b/],
  // After a fight: "u still mad?", "are we good". Making up, which isn't the same as apologizing.
  ['makeup', /\b(?:still mad|mad at (?:me|him|her|them|each other)|are we good|we(?:'re| are)? good\b|after (?:the|our|that) (?:fight|argument)|(?:had|got into) (?:a|an) (?:fight|argument))/],
  ['apology', /\b(?:apolog\w*|say(?:ing)? sorry|make (?:it|things) right)\b/],
  ['decline', /\b(?:say(?:ing)? no|declin\w*|back(?:ing)? out|turn(?:ing)? (?:it |them |him |her )?down|bail(?:ing)? on|cancel(?:l?ing)? (?:on|plans|our plans|my plans))\b/],
  ['refund', /\b(?:refund\w*|money back|return(?:ing)? (?:it|this|the))\b/],
  ['followup', /\b(?:follow(?:ing)?[\s-]?up|haven't heard|check(?:ing)? in on|chas(?:e|ing) (?:up|them|him|her))\b/],
  ['coach', /\bcoach\b/],
  // Being asked to cover: usually a yes, sometimes a no. Asking someone to cover FOR you stays a shift ask.
  ['cover', /\b(?:cover(?:ing)?|pick(?:ing)? up)\s+(?:(?:the|a|an|his|her|their|that|this|my|your)\s+)?(?:shifts?|sat(?:urday)?|sun(?:day)?|mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:rs(?:day)?)?|fri(?:day)?|tonight|tomorrow|close|open)\b|\bcan (?:u|you|i) cover\b/],
  ['shift', /^(?=.*\b(?:shifts?|schedule|clos(?:e|es|ing)|opens|opening shifts?|time off|days? off|(?:mon|tues|wednes|thurs|fri|satur|sun)days? off|take me off|hours|cover for)\b)(?=.*\b(?:manager|boss|supervisor|work|job|shift lead)\b)/],
  ['meeting', /\b(?:meeting|1:1|one[\s-]on[\s-]one|boss|manager|raise|promotion)\b/],
  ['family', /\b(?:mom|mum|mama|momma|dad|papa|parents?|grandma|grandpa|nana|abuela|abuelo)\b/],
  ['reconnect', /\b(?:(?:\d+|two|three|a few|a couple(?: of)?)\s+(?:weeks?|months?|years?)\s+ago|been (?:so long|forever|a while|ages)|in (?:weeks|months|forever|ages))\b/],
  ['reply', /\b(?:(?:snapped|texted|messaged|dm'?d|dmed) me|on (?:delivered|read)|left (?:him|her|them|it) on|haven'?t (?:replied|answered|responded|texted back)|didn'?t (?:reply|answer|respond|text back)|never (?:replied|answered|texted back)|(?:idk|don'?t know) what to (?:say|text|reply|send)|what to say back|(?:text|texted|texting|message|messaged|messaging|dm|dming|snap|snapped|snapping|email|emailing|write|writing|call|calling)\s+(?:\w+\s+){0,2}back|text(?:ing)?\s+(?:him|her|them|my\s+\w+)|repl(?:y|ying)|respond\w*|get(?:ting)? back to|answer\w*\s+(?:the |her |his |their |my |that )?(?:text|message|email|dm|snap))\b/],
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
// A name that already has a title ("Ms. Reyes") replaces "Professor {name}" whole. A known day or date
// fills [date] and [day].
const TITLED = /^(?:mr|mrs|ms|mx|miss|dr|coach|prof|professor)\b/i;
export function fillDraft(template, name, hints = {}) {
  const n = String(name || '').trim();
  let t = n && TITLED.test(n) ? template.replace(/\b(?:Professor|Coach) \{name\}/g, '{name}') : template;
  t = n ? t.replace(/\{name\}/g, n) : t.replace(/ \{name\}/g, '').replace(/\{name\}/g, '');
  if (hints.when) t = t.replace(/\[(?:date|day|day\/time)\]/gi, hints.when);
  if (hints.topic) t = t.replace(/\[dishes[^\]]*\]/gi, hints.topic);
  return t;
}

const MOVE_PATTERNS = [
  ['gym', /\b(?:gym|work ?out|workout|run|running|lift\w*|exercise|walk)\b/],
  ['email', /\b(?:e-?mail\w*|inbox)\b/],
  ['apply', /\b(?:apply|applying|application|resume|cv)\b/],
  ['clean', /\b(?:clean\w*|laundry|dishes|tidy|declutter)\b/],
  ['call', /\b(?:call|calling|phone|ring)\b/],
  ['write', /\b(?:write|writing|essay|paper|post|video|edit\w*|draft)\b/],
];

export function suggestKind(text, draftKind) {
  if (draftKind) return 'draft';
  const t = norm(text);
  for (const [kind, re] of MOVE_PATTERNS) if (re.test(t)) return kind;
  return 'default';
}

// "CALM IT DOWN": takes the anxious hedges out of a message the person wrote themselves, and says
// what it took out. Rules, not AI: nothing leaves the phone, and it never invents content.
const HEDGES = [
  ['sorry', /\b(?:so\s+)?sorry\s+(?:for|about|to)\s+(?:the\s+)?(?:late|slow|long|delayed)\s+(?:reply|response|text)[.!,]*\s*/gi],
  ['sorry', /\b(?:sorry\s+(?:to\s+bother\s+you|if\s+this\s+is\s+weird|for\s+bothering\s+you)|i'?m\s+sorry\s+if\s+this\s+is\s+(?:weird|random|a\s+lot))[.!,]*\s*/gi],
  ['no worries if not', /,?\s*\b(?:no\s+worries|totally\s+fine|no\s+pressure)\s+if\s+(?:not|you\s+can'?t|you'?re\s+busy)\b[.!]?/gi],
  ['if that makes sense', /,?\s*\bif\s+that\s+makes\s+sense\b/gi],
  ['i hope this isn’t weird', /\bi\s+hope\s+(?:this|that)\s+(?:isn'?t|is\s+not)\s+(?:weird|too\s+much|annoying)[.!,]*\s*/gi],
  ['just', /\bjust\s+(?=(?:wanted|checking|following|thought|wondering|a\s+quick|curious)\b)/gi],
  ['haha', /\s*\b(?:haha+|lol|lmao)\b\s*$/gi],
  ['extra !!', /!{2,}/g],
];

export function calmDown(text) {
  let out = String(text || '');
  const removed = {};
  for (const [label, re] of HEDGES) {
    out = out.replace(re, (m) => {
      removed[label] = (removed[label] || 0) + 1;
      return label === 'extra !!' ? '!' : '';
    });
  }
  // Tidy what's left: doubled spaces and punctuation stranded by a removal. Their casing stays theirs.
  out = out.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1').replace(/([.!?])[.,!?]+/g, '$1').replace(/^[\s,.]+|\s+$/g, '');
  return { text: out, removed };
}

// "Removed: 2 sorries, 1 just." for the toast.
export function calmReport(removed) {
  const parts = Object.entries(removed).map(([k, n]) => {
    if (k === 'sorry') return `${n} ${n === 1 ? 'sorry' : 'sorries'}`;
    if (k === 'just') return `${n} ${n === 1 ? '“just”' : '“justs”'}`;
    return `${n > 1 ? `${n}× ` : ''}“${k}”`;
  });
  return parts.length ? `Removed: ${parts.join(', ')}.` : 'Already calm. Nothing to take out.';
}

// Placeholders like [class] that still need filling before it's sent.
export const hasBlanks = (text) => /\[[^\]\n]{1,40}\]/.test(String(text || ''));

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
  // Ten days is ten days, not "1 week". Whole weeks, and four or more, read as weeks.
  if (m < 43200) return m % 10080 === 0 || m >= 40320 ? plural(Math.round(m / 10080), 'week') : plural(Math.round(m / 1440), 'day');
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

// ---------- brain court ----------
// On day 3, 7, 14 and 30 of showing up, the brain goes on trial with the person's own receipts as evidence.

export const TRIAL_DAYS = [3, 7, 14, 30];

// Days with a receipt before `today`. Today's own activity counts toward the next hearing, not this one.
export function daysActiveBefore(receipts, today) {
  return new Set((receipts || []).map((r) => dateKey(new Date(r.at))).filter((k) => k < today)).size;
}

// The hearing owed on `today`, or null. Only the latest one owed is held, so a long gap
// doesn't stack three trials up. `held` is the list of past hearings ({ day }).
export function trialDue(receipts, held, today) {
  const before = daysActiveBefore(receipts, today);
  const last = Math.max(0, ...(held || []).map((h) => h.day || 0));
  const owed = TRIAL_DAYS.filter((d) => d > last && before >= d - 1);
  return owed.length ? owed[owed.length - 1] : null;
}

// How the follow-up answer ranks on the same scale as the guess (DREAD: fine, awkward, bad, disaster).
const ANSWER_LEVEL = { fine: 0, weird: 1 };

// One exhibit per receipt. The next-day answer beats the same-day guess: it's how it actually went.
// Disasters and anything that read as a crisis stay out of court. Nothing about those is funny.
export function exhibitFor(r) {
  if (!r || detectCrisis(r.thing || '') || detectCrisisCheck(r.thing || '')) return null;
  const base = { id: r.id, at: r.at };
  if (r.outcome === 'bailed') return { ...base, type: r.fu?.result === 'did' ? 'overturned' : 'bail' };
  const ans = ANSWER_LEVEL[r.fu?.result];
  const was = ans ?? r.reality;
  if (was === 3) return null;
  if (r.dread != null && was != null) {
    const type = was < r.dread ? 'lie' : was > r.dread ? 'worse' : 'called';
    return { ...base, type, said: r.dread, was, answered: ans != null };
  }
  if (r.thoughtMin && r.doneSec) return { ...base, type: 'stall', thoughtMin: r.thoughtMin, doneSec: r.doneSec };
  return null;
}

// Share of checked guesses the brain got right, or null with nothing checked.
export const credibility = ({ lies, calls }) => (lies + calls ? Math.round((100 * calls) / (lies + calls)) : null);

// The case for one hearing: the brain's whole record, plus up to `max` exhibits from since the last
// hearing (lies first in line, then shown oldest first, like a court would).
export function trialCase(receipts, sinceAt = 0, max = 4) {
  const list = receipts || [];
  const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  // A bail that a later receipt did (round 2, or just trying again) is overturned, not a win for the brain.
  const redone = (r) => list.some((x) => x.at > r.at && x.outcome !== 'bailed' && same(x.thing, r.thing));
  const all = list
    .map((r) => {
      const e = exhibitFor(r);
      return e?.type === 'bail' && redone(r) ? { ...e, type: 'overturned' } : e;
    })
    .filter(Boolean);
  const lies = all.filter((e) => e.type === 'lie').length;
  const calls = all.filter((e) => e.type === 'called' || e.type === 'worse').length;
  const recent = all.filter((e) => e.at > sinceAt);
  const rank = { lie: 0, stall: 1, called: 2, worse: 2, overturned: 3, bail: 4 };
  const exhibits = [...recent]
    .sort((a, b) => rank[a.type] - rank[b.type] || b.at - a.at)
    .slice(0, max)
    .sort((a, b) => a.at - b.at);
  const timed = list.filter((r) => r.at > sinceAt && r.outcome !== 'bailed' && r.thoughtMin && r.doneSec);
  return {
    exhibits,
    lies,
    calls,
    cred: credibility({ lies, calls }),
    thoughtMin: timed.reduce((a, r) => a + r.thoughtMin, 0),
    doneSec: timed.reduce((a, r) => a + r.doneSec, 0),
  };
}

// guilty: lied more than it called it. split: even. accurate: mostly right (and you did them anyway).
// stalling: no guesses to check, but the thinking-to-doing time is on file. continued: nothing to rule on.
export function trialVerdict(c) {
  if (c.lies + c.calls > 0) return c.lies > c.calls ? 'guilty' : c.lies === c.calls ? 'split' : 'accurate';
  if (c.thoughtMin && c.doneSec) return 'stalling';
  return 'continued';
}

// Lie number n gets its own line: the first three in order, then a rotation. Same n, same line.
export function liarIndex(n, len) {
  if (!(n >= 1) || len < 1) return 0;
  if (n <= 3 || len <= 3) return Math.min(n, len) - 1;
  return 3 + ((n - 4) % (len - 3));
}

// ---------- today's rule ----------
// From the 4th day of showing up, every day gets a named rule that changes how a round plays,
// teased the day before. Hearing days belong to the court.

export const RULE_START = 4;
const RULE_ARC = { 4: 'speedrun', 5: 'double', 6: 'minute', 8: 'pick', 9: 'boss' };
export const RULE_CYCLE = ['speedrun', 'double', 'minute', 'pick', 'boss'];
// Rounds a rule needs before it's done. Everything not listed needs one.
export const RULE_ROUNDS = { double: 2 };

export function ruleForDay(n) {
  if (!(n >= RULE_START) || TRIAL_DAYS.includes(n)) return null;
  return RULE_ARC[n] || RULE_CYCLE[(n - 10) % RULE_CYCLE.length];
}

// Which day of showing up `today` is. It only moves when something gets done, so a gap skips nothing.
export const dayOfShowingUp = (receipts, today) => daysActiveBefore(receipts, today) + 1;
export const ruleOn = (receipts, today) => ruleForDay(dayOfShowingUp(receipts, today));

// Rounds of `rule` finished on `today`. Chickening out doesn't count.
export function ruleRounds(receipts, rule, today) {
  return (receipts || []).filter((r) => r.rule === rule && r.outcome !== 'bailed' && dateKey(new Date(r.at)) === today).length;
}
export const ruleDone = (receipts, rule, today) => ruleRounds(receipts, rule, today) >= (RULE_ROUNDS[rule] || 1);

// The speedrun record: the fastest thing fully done in 10 seconds or more. Under 10, nobody believes it.
export const RECORD_MIN_SEC = 10;
export function speedRecord(receipts) {
  const times = (receipts || []).filter((r) => r.outcome === 'did' && r.doneSec >= RECORD_MIN_SEC).map((r) => r.doneSec);
  return times.length ? Math.min(...times) : null;
}

// What a finished round of a rule earned. `before` is the receipts before this one.
// head: the word on the level-up screen. stamp: what goes on the receipt. Null when there's nothing to say.
export function ruleResult(r, before, { think = false } = {}) {
  if (!r?.rule || r.outcome === 'bailed') return null;
  const did = r.outcome === 'did';
  switch (r.rule) {
    case 'speedrun': {
      const record = speedRecord(before);
      const counts = did && r.doneSec >= RECORD_MIN_SEC;
      if (counts && record == null) return { kind: 'first', head: 'RECORD SET', stamp: 'RECORD SET', record };
      if (counts && r.doneSec < record) return { kind: 'win', head: 'NEW RECORD', stamp: 'NEW RECORD', record };
      return { kind: did && r.doneSec < RECORD_MIN_SEC ? 'fast' : 'miss', head: null, stamp: 'SPEEDRUN', record };
    }
    case 'double': {
      const today = dateKey(new Date(r.at));
      const rounds = ruleRounds(before, 'double', today) + 1;
      return rounds >= RULE_ROUNDS.double
        ? { kind: 'win', head: 'BACK TO BACK', stamp: 'BACK TO BACK', bonus: 1 }
        : { kind: 'round', head: `ROUND ${rounds}`, stamp: `ROUND ${rounds}` };
    }
    case 'minute':
      return r.doneSec != null && r.doneSec <= 60
        ? { kind: 'win', head: 'INSIDE THE MINUTE', stamp: 'ONE MINUTE' }
        : { kind: 'over', head: null, stamp: 'ONE MINUTE' };
    case 'pick':
      return { kind: 'win', head: null, stamp: 'THE APP PICKED' };
    case 'boss':
      if (think) return { kind: 'think', head: null, stamp: 'BOSS: ON PURPOSE' };
      return did ? { kind: 'win', head: 'BOSS DOWN', stamp: 'BOSS DOWN' } : { kind: 'hurt', head: 'BOSS HURT', stamp: 'BOSS HURT' };
    default:
      return null;
  }
}

// ---------- share text and challenge links ----------

export function parseVs(hash) {
  const m = /(?:^|[#&])vs=(\d{1,3})(?:&|$)/.exec(hash || '');
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 100 ? n : null;
}

// `url` can be empty (no shareable address yet), and then it's left off.
export function quizShareText(wrinkled, typeName, url, who = 'brother') {
  const text = `My brain is ${wrinkled}% wrinkled. Class: ${typeName}. INT ${intOf(wrinkled)}.\n${addr('{Bb}, how wrinkled is yours?', who)}`;
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
  if (r.streak > 1) lines.push(`Streak: ${r.streak} days`);
  if (r.thoughtMin) lines.push(`Overthought: ${fmtDuration(r.thoughtMin)}`);
  lines.push(r.outcome === 'bailed' ? 'Did it in: not today' : `Did it in: ${r.outcome === 'some' ? 'kinda, ' : ''}${fmtDid(r.doneSec)}`);
  const x = r.outcome === 'bailed' ? null : ratio(r.thoughtMin, r.doneSec);
  if (x) lines.push(`Ratio: ${fmtRatio(x)}`);
  if (url) lines.push(url);
  return lines.join('\n');
}

// ---------- what the app calls you ----------
// The copy writes {b}, {Bb} or {B} (lower, Capitalized, CAPS) wherever it used to say "brother".
// 'none' ("JUST TALK TO ME") drops the word along with the comma or period that went with it.
// `max` caps how many get the word on one screen; the rest drop out the same way.
export const ADDRESSES = [
  { id: 'brother', label: 'BROTHER' },
  { id: 'bestie', label: 'BESTIE' },
  { id: 'champ', label: 'CHAMP' },
  { id: 'none', label: 'JUST TALK TO ME' },
];

export function addr(text, who = 'brother', max = Infinity) {
  let s = String(text ?? '');
  if (!s.includes('{')) return s;
  const word = who === 'none' ? null : (ADDRESSES.find((a) => a.id === who) || ADDRESSES[0]).id;
  let used = 0;
  s = s.replace(/\{(b|Bb|B)\}/g, (m, k) => {
    if (!word || used >= max) return `{-${k}}`;
    used += 1;
    if (k === 'B') return word.toUpperCase();
    if (k === 'Bb') return word[0].toUpperCase() + word.slice(1);
    return word;
  });
  // "Two-way door, {b}." becomes "Two-way door."
  s = s.replace(/,\s*\{-(?:b|Bb|B)\}/g, '');
  // "{Bb}, how wrinkled is yours?" becomes "How wrinkled is yours?"
  s = s.replace(/\{-(?:b|Bb|B)\}[,.!]?\s*([a-z]?)/g, (m, c) => c.toUpperCase());
  return s;
}

// ---------- using what they typed in the draft ----------
// A name with a title ("ms reyes"), or whoever "snapped me", and a day or date ("dec 1", "friday").
// Rules, not AI: if nothing clear is there, nothing is filled and the [blank] stays.
const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const WHEN_RE = new RegExp(`\\b(?:(${MONTHS})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b|(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|tonight|this weekend|next week)\\b)`);
const TITLE_RE = /\b(mr|mrs|ms|mx|miss|dr|coach|professor|prof)\.?\s+([a-z][a-z'-]{1,20})\b/;
const SENDER_RE = /\b([a-z][a-z'-]{1,20})(?:\s+from\s+[a-z]+)?\s+(?:(?:snapped|texted|messaged|dm'?d|dmed|called|asked)(?:\s+me)?\b|(?:replied|reacted|commented|responded)\b)/;
const NOT_A_NAME = new Set(['havent', "haven't", 'hasnt', "hasn't", 'cant', "can't", 'coach', 'roommate', 'bestie', 'crush', 'ex', 'sister',
  'brother', 'cousin', 'aunt', 'uncle', 'asked', 'texted', 'called', 'messaged', 'replied', 'snapped', 'needs', 'keeps', 'has', 'had', 'just', 'why', 'what', 'when', 'where', 'how', 'about', 'said', 'says', 'told', 'is', 'was', 'to', 'for', 'if', 'me',
  'the', 'a', 'an', 'on', 'at', 'in', 'i', 'you', 'we', 'didnt', "didn't", 'wont', "won't", 'cut', 'benched', 'yelled', 'gave', 'after', 'before',
  'wants', 'thinks', 'class', 'history', 'chem', 'math', 'english', 'practice', 'team', 'from', 'he', 'she', 'they', 'someone', 'somebody', 'everyone', 'nobody', 'who', 'it', 'this', 'that', 'my', 'mom', 'dad',
  'boss', 'manager', 'friend', 'guy', 'girl', 'teacher', 'just', 'finally', 'literally', 'also', 'and', 'but', 'so', 'then', 'still', 'never', 'already', 'once', 'again']);
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
const ROOM_TOPICS = [
  ['boyfriend', /\b(?:boyfriend|bf)\b/], ['girlfriend', /\b(?:girlfriend|gf)\b/], ['guests', /\b(?:guests?|people over|sleep(?:ing)? ?over|sleepovers?)\b/],
  ['noise', /\b(?:noise|loud|music)\b/], ['dishes', /\bdishes\b/], ['bathroom', /\bbathroom\b/], ['trash', /\b(?:trash|garbage)\b/],
  ['thermostat', /\b(?:thermostat|temperature|heat|ac)\b/], ['cleaning', /\b(?:mess|messy|cleaning|clean)\b/],
];

export function draftHints(text) {
  const t = norm(text);
  let name = '';
  const titled = TITLE_RE.exec(t);
  if (titled && !NOT_A_NAME.has(titled[2])) {
    const title = titled[1] === 'prof' ? 'professor' : titled[1];
    name = `${cap(title)}${['mr', 'mrs', 'ms', 'mx', 'dr'].includes(title) ? '.' : ''} ${cap(titled[2])}`;
  } else {
    const sender = SENDER_RE.exec(t);
    if (sender && !NOT_A_NAME.has(sender[1])) name = cap(sender[1]);
  }
  let when = '';
  const w = WHEN_RE.exec(t);
  if (w) when = w[1] ? `${cap(w[1].slice(0, 3))} ${Number(w[2])}` : /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/.test(w[3]) ? cap(w[3]) : w[3];
  // Only about a shared room: "clean my room" isn't a roommate talk.
  const shared = /\b(?:roommates?|suitemates?|dorm|our room|our apartment|housemates?)\b/.test(t);
  const topic = shared ? (ROOM_TOPICS.find(([, re]) => re.test(t)) || [''])[0] : '';
  return topic ? { name, when, topic } : { name, when };
}

// Texting places get the lowercase version of a message by default.
export const chatty = (text) => /\b(?:texted|texting|snap\w*|sc|dm'?d|dms?|dming|delivered|on read|gc|group ?chat|insta|ig|tiktok|discord|story|stories)\b/.test(norm(text));

// ---------- day 2: following up ----------
// What changes overnight is the answer. A message sent today gets "did they answer?" tomorrow, and
// something bailed on today gets "round 2?". Never for one-way doors or anything the safety checks flag.
export const FOLLOW_UP_DAYS = 3;

export function followUpFor({ thing, outcome, draftKind, verdict }) {
  if (detectCrisis(thing) || detectCrisisCheck(thing)) return null;
  // One-way doors never get pushed toward doing the thing. If they did the thinking step
  // (write the question, a date, somebody who knows), a few days later we ask whether it got a date.
  if (verdict === 'think' || detectOneWay(thing)) return outcome === 'did' || outcome === 'some' ? { type: 'plan', state: 'open', asks: 0 } : null;
  if (outcome === 'bailed') return { type: 'retry', state: 'open', asks: 0 };
  if (draftKind && (outcome === 'did' || outcome === 'some')) return { type: 'reply', state: 'open', asks: 0 };
  return null;
}

// The newest open follow-up from an earlier day, at most FOLLOW_UP_DAYS old. One at a time.
export function followUpDue(receipts, today) {
  for (const r of receipts || []) {
    // "Not yet" puts it off until tomorrow.
    if (!r.fu || r.fu.state !== 'open' || !r.at || r.fu.snooze === today) continue;
    const age = dayDiff(dateKey(new Date(r.at)), today);
    if (age >= 1 && age <= FOLLOW_UP_DAYS) return r;
  }
  return null;
}

// "yesterday", "2 days ago": how the card says when it happened.
export const agoWord = (at, today) => {
  const n = dayDiff(dateKey(new Date(at)), today);
  return n <= 1 ? 'YESTERDAY' : `${n} DAYS AGO`;
};
