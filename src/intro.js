// Illustrations for the opener. Plain SVG and CSS, so they're crisp at any size and cost nothing to load.
import { brainSVG } from './brain.js';
import { BRAND, INTRO } from './content.js';

const fighterName = () => 'SMOOTH BRAIN';

// Fighting-game select screen. The overthinker gets knocked out.
export function vsScene() {
  return `<div class="vs-scene" aria-hidden="true">
    <div class="fighter left"><div class="f-brain">${brainSVG(96)}</div><span class="plate">${INTRO.rival}</span></div>
    <div class="vs-mark">VS</div>
    <div class="fighter right"><div class="f-brain">${brainSVG(4)}</div><span class="plate">${fighterName()}</span></div>
    <div class="ko">K.O.</div>
  </div>`;
}

function spiralPath() {
  let d = '';
  for (let i = 0; i <= 260; i++) {
    const t = (i / 260) * Math.PI * 8;
    const r = 6 + t * 5.3;
    d += `${i ? 'L' : 'M'}${(150 + r * Math.cos(t)).toFixed(1)} ${(150 + r * Math.sin(t)).toFixed(1)}`;
  }
  return d;
}

export function spiralScene() {
  return `<div class="spiral-wrap" aria-hidden="true">
    <svg class="spiral" viewBox="0 0 300 300"><path d="${spiralPath()}"/></svg>
    <div class="spiral-brain">${brainSVG(96)}</div>
  </div>`;
}

export function everestScene() {
  return `<div class="everest" aria-hidden="true">
    <svg viewBox="0 0 360 220">
      <path d="M-20 220L104 92L210 220Z" fill="#3D49FF"/>
      <path d="M26 220L196 30L352 220Z" fill="#DDE1FF"/>
      <path d="M196 30L168 62L183 57L196 70L209 55L225 63Z" fill="#fff"/>
      <g class="flag"><path d="M196 30V-2" stroke="#0B0B0B" stroke-width="4"/><path d="M196 -2L228 6L196 15Z" fill="#FF2B1C"/></g>
    </svg>
    <div class="climber">${brainSVG(4)}</div>
  </div>`;
}

// The cart sits still while the water, posts and speed lines move: it reads as fast and never jitters off-screen.
// Built in the cart's own frame (forward is +x), then tilted 25 degrees onto the slide.
function raccoonInCart() {
  const grid = [-30, -8, 14, 34].map((x) => `<path d="M${x} -38L${x * 0.86} 4"/>`).join('')
    + [-24, -10].map((y) => `<path d="M${-52 + (y + 38) * 0.24} ${y}H${52 - (y + 38) * 0.24}"/>`).join('');
  return `
    <path d="M-20 -44C-40 -52 -58 -66 -82 -70" stroke="#A9A9B5" stroke-width="15" stroke-linecap="round" fill="none"/>
    <path d="M-20 -44C-40 -52 -58 -66 -82 -70" stroke="#2B2B33" stroke-width="15" stroke-dasharray="8 8" fill="none"/>
    <circle cx="-82" cy="-70" r="7.5" fill="#2B2B33"/>
    <ellipse cx="0" cy="-40" rx="24" ry="18" fill="#8E8E99"/>
    <g stroke="#8E8E99" stroke-width="11" stroke-linecap="round"><path d="M-12 -50L-34 -98"/><path d="M16 -50L40 -98"/></g>
    <circle cx="-34" cy="-98" r="7" fill="#2B2B33"/><circle cx="40" cy="-98" r="7" fill="#2B2B33"/>
    <circle cx="2" cy="-70" r="27" fill="#8E8E99"/>
    <ellipse cx="2" cy="-56" rx="15" ry="10" fill="#ECE8E2"/>
    <path d="M-22 -72C-14 -80 18 -80 26 -72C28 -64 18 -60 12 -66C6 -62 -2 -62 -8 -66C-14 -60 -24 -64 -22 -72Z" fill="#2B2B33"/>
    <g stroke="#ECE8E2" stroke-width="4" stroke-linecap="round" fill="none"><path d="M-18 -80Q-10 -86 -2 -82"/><path d="M6 -82Q14 -86 22 -80"/></g>
    <circle cx="-8" cy="-71" r="4.6" fill="#fff"/><circle cx="12" cy="-71" r="4.6" fill="#fff"/>
    <circle cx="-6.6" cy="-72" r="2.3" fill="#0B0B0B"/><circle cx="13.4" cy="-72" r="2.3" fill="#0B0B0B"/>
    <ellipse cx="2" cy="-62" rx="4.6" ry="3.2" fill="#0B0B0B"/>
    <path d="M-6 -56Q2 -43 10 -56Z" fill="#6B1020"/>
    <path d="M-27 -76A29 29 0 0 1 31 -76Z" fill="#FF2B1C"/>
    <path d="M2 -105V-76" stroke="#fff" stroke-width="6"/>
    <path d="M-30 -76H34M22 -78L42 -73" stroke="#0B0B0B" stroke-width="4" stroke-linecap="round"/>
    <path d="M-56 -38H56L46 4H-46Z" fill="rgba(215,218,224,.22)" stroke="#D7DAE0" stroke-width="5" stroke-linejoin="round"/>
    <g stroke="#D7DAE0" stroke-width="3">${grid}</g>
    <path d="M-56 -38L-70 -54" stroke="#D7DAE0" stroke-width="5" stroke-linecap="round"/>
    <path d="M-75 -59L-66 -50" stroke="#FF2B1C" stroke-width="8" stroke-linecap="round"/>
    <path d="M-46 4L-40 14H38L46 4" stroke="#D7DAE0" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <circle cx="-36" cy="18" r="8" fill="#0B0B0B"/><circle cx="34" cy="18" r="8" fill="#0B0B0B"/>
    <circle cx="-36" cy="18" r="3" fill="#D7DAE0"/><circle cx="34" cy="18" r="3" fill="#D7DAE0"/>`;
}

export function raccoonScene() {
  const drops = [[196, 166, 26, -40], [196, 166, 40, -26], [192, 168, 14, -50], [132, 139, 6, -38], [134, 140, -10, -30], [198, 166, 52, -12]]
    .map(([x, y, dx, dy], i) => `<circle cx="${x}" cy="${y}" r="${3 + (i % 3)}" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${(i * 0.09).toFixed(2)}s"/>`)
    .join('');
  const speed = [0, 1, 2].map((i) => `<path d="M${18 + i * 18} ${52 + i * 24}l70 32.6" style="animation-delay:${(i * 0.14).toFixed(2)}s"/>`).join('');
  return `<svg class="scene raccoon-scene" viewBox="0 0 360 240" aria-hidden="true">
    <circle cx="314" cy="44" r="30" fill="#FFE500"/>
    <g class="speed">${speed}</g>
    <g stroke="#0B0B0B" stroke-width="7"><path d="M60 151V240"/><path d="M170 202V240"/></g>
    <path d="M-20 76L380 262V300L-20 114Z" fill="#1E2BFF"/>
    <path d="M-20 62L380 248V262L-20 76Z" fill="#8FDBFF"/>
    <path class="water" d="M-20 69L380 255" stroke="#fff" stroke-width="3" stroke-dasharray="16 22" stroke-linecap="round"/>
    <g transform="translate(176 131) rotate(25)"><g class="ride-in"><g class="jitter">${raccoonInCart()}</g></g></g>
    <g class="spray">${drops}</g>
  </svg>`;
}

export const SCENES = {
  vs: vsScene,
  spiral: spiralScene,
  everest: everestScene,
  raccoon: raccoonScene,
  free: () => `<div class="free-brain" aria-hidden="true">${brainSVG(4)}</div>`,
};
