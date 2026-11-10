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

// ---------- the wardrobe ----------
// Each piece is a list of shapes in the brain's own coordinates, drawn on top of everything.
// Hats ride down as the lobes shrink, so they stay on the head; `face` pieces don't move.
const K = '#0B0B0B';
const circle = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
export const WARDROBE = {
  partyhat: [
    { d: 'M136 32L190 28L166 -44Z', fill: '#3BD1FF', stroke: K, w: 4 },
    { d: 'M150 0L178 -2', stroke: '#FFE500', w: 6 },
    { d: 'M144 16L184 13', stroke: '#FFE500', w: 6 },
    { d: circle(166, -46, 10), fill: '#FF3D8B', stroke: K, w: 4 },
  ],
  crown: [
    { d: 'M122 32L128 -8L146 12L162 -16L178 12L196 -8L202 32Z', fill: '#FFD400', stroke: K, w: 4 },
    { d: circle(162, 16, 5), fill: '#FF3D8B' },
    { d: circle(137, 21, 4), fill: '#3BD1FF' },
    { d: circle(187, 21, 4), fill: '#3BD1FF' },
  ],
  helmet: [
    { d: 'M92 52C92 -6 232 -10 236 52Z', fill: '#FF3B30', stroke: K, w: 5 },
    { d: 'M163 -4V50', stroke: '#FFFFFF', w: 12 },
    { d: 'M96 52H232', stroke: K, w: 8 },
  ],
  propeller: [
    { d: 'M120 34C120 -4 206 -4 206 34Z', fill: '#2B6BFF', stroke: K, w: 4 },
    { d: 'M112 34H214', stroke: K, w: 7 },
    { d: 'M163 0V-22', stroke: K, w: 6 },
    { d: 'M108 -26C132 -46 152 -32 163 -24C174 -32 194 -46 218 -26C194 -10 174 -16 163 -24C152 -16 132 -10 108 -26Z', fill: '#FFE500', stroke: K, w: 4, cls: 'b-prop' },
    { d: circle(163, -24, 6), fill: '#FF3D8B', stroke: K, w: 3 },
  ],
  halo: [
    { d: 'M118 -14a45 12 0 1 0 90 0a45 12 0 1 0 -90 0', stroke: '#FFE500', w: 8, cls: 'b-halo' },
  ],
  chefhat: [
    { d: circle(140, 2, 18), fill: '#FFFFFF', stroke: K, w: 4 },
    { d: circle(186, 2, 18), fill: '#FFFFFF', stroke: K, w: 4 },
    { d: circle(163, -10, 22), fill: '#FFFFFF', stroke: K, w: 4 },
    { d: 'M130 32V10H196V32Z', fill: '#FFFFFF', stroke: K, w: 4 },
  ],
  sweatband: [
    { d: 'M66 100C78 44 246 40 260 100', stroke: '#FF3D8B', w: 16 },
    { d: 'M66 100C78 44 246 40 260 100', stroke: '#FFFFFF', w: 4 },
  ],
  cowboy: [
    { d: 'M124 34C120 -8 140 -16 163 -6C186 -16 206 -8 202 34Z', fill: '#A0682F', stroke: '#3A2410', w: 4 },
    { d: 'M125 20H201', stroke: '#3A2410', w: 7 },
    { d: 'M84 30C116 50 210 50 242 28C238 44 204 56 163 56C122 56 88 46 84 30Z', fill: '#8B5A2B', stroke: '#3A2410', w: 4 },
  ],
  cone: [
    { d: 'M142 32L184 32L170 -40H156Z', fill: '#FF7A00', stroke: K, w: 4 },
    { d: 'M150 6H176', stroke: '#FFFFFF', w: 8 },
    { d: 'M147 20H179', stroke: '#FFFFFF', w: 6 },
    { d: 'M126 34H200', stroke: '#FF7A00', w: 10 },
  ],
  headphones: [
    { d: 'M86 100C80 4 246 4 240 100', stroke: K, w: 10 },
    { d: 'M64 88h26a6 6 0 0 1 6 6v42a6 6 0 0 1 -6 6h-26a6 6 0 0 1 -6 -6v-42a6 6 0 0 1 6 -6z', fill: '#FF3D8B', stroke: K, w: 4 },
    { d: 'M236 88h26a6 6 0 0 1 6 6v42a6 6 0 0 1 -6 6h-26a6 6 0 0 1 -6 -6v-42a6 6 0 0 1 6 -6z', fill: '#FF3D8B', stroke: K, w: 4 },
  ],
  bow: [
    { d: 'M200 24C160 -22 140 62 200 38Z', fill: '#FF3D8B', stroke: K, w: 5 },
    { d: 'M200 24C240 -22 260 62 200 38Z', fill: '#FF3D8B', stroke: K, w: 5 },
    { d: circle(200, 31, 10), fill: '#C2185B', stroke: K, w: 4 },
  ],
  mustache: [
    { d: 'M163 136C150 124 128 126 124 144C138 136 150 142 163 141C176 142 188 136 202 144C198 126 176 124 163 136Z', fill: '#3A2410', stroke: K, w: 3, face: true },
  ],
};

let worn = null;
export const setWorn = (id) => { worn = WARDROBE[id] ? id : null; };
export const getWorn = () => worn;

const hatShift = (lobe) => Math.round((1 - lobe) * 18);

function wardrobeMarkup(id, lobe) {
  const parts = WARDROBE[id];
  if (!parts) return '';
  const shapes = (face) => parts.filter((p) => !!p.face === face).map((p) => `<path class="${p.cls || ''}" d="${p.d}" style="fill:${p.fill || 'none'};stroke:${p.stroke || 'none'};stroke-width:${p.w || 0};stroke-linejoin:round;stroke-linecap:round"/>`).join('');
  return `<g class="b-acc" data-id="${id}"><g class="b-hat" transform="translate(0 ${hatShift(lobe)})">${shapes(false)}</g>${shapes(true)}</g>`;
}

function drawWardrobe(ctx, id, lobe) {
  const parts = WARDROBE[id];
  if (!parts) return;
  parts.forEach((p) => {
    ctx.save();
    if (!p.face) ctx.translate(0, hatShift(lobe));
    const path = new Path2D(p.d);
    if (p.fill) {
      ctx.fillStyle = p.fill;
      ctx.fill(path);
    }
    if (p.stroke) {
      ctx.strokeStyle = p.stroke;
      ctx.lineWidth = p.w || 1;
      ctx.stroke(path);
    }
    ctx.restore();
  });
}

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

export function brainSVG(w, cls = '', wear = worn) {
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
    ${wear ? wardrobeMarkup(wear, s.lobe) : ''}
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
  svg.querySelector('.b-hat')?.setAttribute('transform', `translate(0 ${hatShift(s.lobe)})`);
  svg.setAttribute('aria-label', `A brain, ${Math.round(w)} percent wrinkled`);
}

// Draws into a box whose left edge is x and top is y, `width` wide.
export function drawBrain(ctx, x, y, width, w, wear = worn) {
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
  if (wear) drawWardrobe(ctx, wear, s.lobe);
  ctx.restore();
}
