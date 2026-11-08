// The mascot. One geometry, drawn two ways: SVG for the UI and canvas for share cards.
// `w` is percent wrinkled, 0 to 100. Below 15 it earns the sunglasses.

const BODY = 'M58 128C50 72 104 30 162 32C226 34 270 78 264 134C260 172 224 190 182 188C150 186 128 194 102 188C76 182 62 160 58 128Z';
const CEREB = 'M186 176C204 164 246 166 250 192C254 216 222 226 202 216C186 208 176 190 186 176Z';
const STEM = 'M168 184C182 200 186 224 176 242C170 252 154 250 156 238C160 222 152 206 142 190Z';

const LOBES = [
  [72, 98, 24], [96, 62, 26], [134, 42, 28], [178, 40, 28], [220, 58, 27], [250, 94, 25],
  [260, 136, 23], [238, 170, 20], [76, 150, 24], [100, 180, 20], [138, 186, 16],
];

// First in the list is the last to go.
const WRINKLES = [
  'M112 78C124 64 140 84 156 70S186 62 196 78',
  'M214 96C226 86 238 104 252 94',
  'M76 112C88 100 96 122 110 110',
  'M214 134C226 124 236 142 250 132',
  'M84 146C96 136 106 156 118 146',
  'M122 168C136 158 150 176 166 166',
  'M100 52C112 42 126 58 140 46',
  'M178 52C192 42 206 60 222 50',
  'M182 160C194 152 206 164 220 154',
  'M70 88C78 78 88 90 96 80',
  'M232 68C240 62 250 72 256 66',
  'M146 92C156 84 168 98 180 90',
  'M94 94C102 88 108 100 116 92',
  'M208 114C216 108 224 120 232 114',
  'M92 168C100 162 108 174 116 168',
  'M156 46C164 40 172 52 182 46',
];

const STRIPES = ['M200 197C212 191 230 193 241 201', 'M206 209C216 205 226 205 235 211'];

export const BRAIN_COLORS = { body: '#FF8FB4', fold: '#E0447F', face: '#14090D', drop: '#6CC8FF' };

const SHADES = ['M118 108H160V118C160 130 150 136 139 136S118 130 118 118Z', 'M166 108H208V118C208 130 198 136 187 136S166 130 166 118Z'];
const SHADES_BAR = 'M112 110H214';

const FACES = {
  walnut: {
    eyes: 'dots',
    strokes: ['M128 114L146 108', 'M198 114L180 108', 'M150 142C155 136 160 146 165 140S173 144 177 140'],
    drop: 'M214 96C208 106 208 114 214 114C220 114 220 106 214 96Z',
  },
  committee: { eyes: 'dots', strokes: ['M152 140L176 140'] },
  light: { eyes: 'dots', strokes: ['M150 136C156 146 172 146 178 136'] },
  bowling: { eyes: 'shades', strokes: ['M146 146C152 160 176 160 182 146'] },
};

export function moodFor(w) {
  if (w >= 65) return 'walnut';
  if (w >= 40) return 'committee';
  if (w >= 15) return 'light';
  return 'bowling';
}

function spec(w) {
  const clamped = Math.min(Math.max(w, 0), 100);
  return {
    folds: Math.ceil((clamped / 100) * WRINKLES.length),
    lobe: Math.min(Math.max((clamped - 8) / 62, 0), 1),
    shine: clamped < 25 ? (25 - clamped) / 25 : 0,
    stripes: clamped >= 8,
    mood: moodFor(clamped),
  };
}

function faceMarkup(mood) {
  const f = FACES[mood];
  const dots = f.eyes === 'dots' ? '<circle cx="140" cy="122" r="6.5"/><circle cx="186" cy="122" r="6.5"/>' : '';
  const shades = f.eyes === 'shades'
    ? `<g class="b-shades"><path class="b-bar" d="${SHADES_BAR}"/>${SHADES.map((d) => `<path d="${d}"/>`).join('')}</g>`
    : '';
  const lines = f.strokes.map((d) => `<path d="${d}"/>`).join('');
  const drop = f.drop ? `<path class="b-drop" d="${f.drop}"/>` : '';
  return `${dots}${shades}<g class="b-lines">${lines}</g>${drop}`;
}

export function brainSVG(w, cls = '') {
  const s = spec(w);
  const lobes = LOBES.map(([x, y, r]) => `<circle class="b-lobe" cx="${x}" cy="${y}" r="${r}" style="transform:scale(${s.lobe})"/>`).join('');
  const folds = WRINKLES.map((d, i) => `<path class="b-fold ${i < s.folds ? '' : 'off'}" d="${d}" pathLength="1" stroke-dashoffset="${i < s.folds ? 0 : 1}"/>`).join('');
  const stripes = STRIPES.map((d) => `<path d="${d}"/>`).join('');
  return `<svg class="brain ${cls}" viewBox="20 0 270 256" role="img" aria-label="A brain, ${Math.round(w)} percent wrinkled">
    <path class="b-body" d="${STEM}"/><path class="b-body" d="${CEREB}"/>
    <g class="b-stripes" style="opacity:${s.stripes ? 1 : 0}">${stripes}</g>
    <g class="b-lobes">${lobes}</g><path class="b-body" d="${BODY}"/>
    <g class="b-folds">${folds}</g>
    <ellipse class="b-shine" cx="112" cy="72" rx="28" ry="13" transform="rotate(-28 112 72)" style="opacity:${s.shine * 0.65}"/>
    <g class="b-face">${faceMarkup(s.mood)}</g>
  </svg>`;
}

// Updates in place so the CSS transitions run: folds retract, lobes sink, shine arrives.
export function updateBrain(svg, w) {
  const s = spec(w);
  svg.querySelectorAll('.b-fold').forEach((el, i) => {
    el.setAttribute('stroke-dashoffset', i < s.folds ? 0 : 1);
    el.classList.toggle('off', i >= s.folds);
  });
  svg.querySelectorAll('.b-lobe').forEach((el) => { el.style.transform = `scale(${s.lobe})`; });
  svg.querySelector('.b-shine').style.opacity = s.shine * 0.65;
  svg.querySelector('.b-stripes').style.opacity = s.stripes ? 1 : 0;
  svg.querySelector('.b-face').innerHTML = faceMarkup(s.mood);
  svg.setAttribute('aria-label', `A brain, ${Math.round(w)} percent wrinkled`);
}

// Draws into a box whose left edge is x and top is y, `width` wide.
export function drawBrain(ctx, x, y, width, w) {
  const s = spec(w);
  const k = width / 270;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-20, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.fillStyle = BRAIN_COLORS.body;
  ctx.fill(new Path2D(STEM));
  ctx.fill(new Path2D(CEREB));

  ctx.strokeStyle = BRAIN_COLORS.fold;
  ctx.lineWidth = 6;
  if (s.stripes) STRIPES.forEach((d) => ctx.stroke(new Path2D(d)));

  ctx.fillStyle = BRAIN_COLORS.body;
  LOBES.forEach(([cx, cy, r]) => {
    if (s.lobe <= 0) return;
    ctx.beginPath();
    ctx.arc(cx, cy, r * s.lobe, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fill(new Path2D(BODY));

  WRINKLES.slice(0, s.folds).forEach((d) => ctx.stroke(new Path2D(d)));

  if (s.shine > 0) {
    ctx.save();
    ctx.globalAlpha = s.shine * 0.65;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(112, 72, 28, 13, (-28 * Math.PI) / 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const f = FACES[s.mood];
  ctx.fillStyle = BRAIN_COLORS.face;
  ctx.strokeStyle = BRAIN_COLORS.face;
  ctx.lineWidth = 5.5;
  if (f.eyes === 'dots') {
    [[140, 122], [186, 122]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (f.eyes === 'shades') {
    ctx.stroke(new Path2D(SHADES_BAR));
    SHADES.forEach((d) => ctx.fill(new Path2D(d)));
  }
  f.strokes.forEach((d) => ctx.stroke(new Path2D(d)));
  if (f.drop) {
    ctx.fillStyle = BRAIN_COLORS.drop;
    ctx.fill(new Path2D(f.drop));
  }
  ctx.restore();
}
