// Layout metrics shared by the WebGL scene, the canvases and the DOM layer.
// All values are CSS pixels. The block is centred on screen; S scales the
// reference design (block width 1730) down to the current block width.

export const CELLS = [
  { id: 'A', hero: true, points: ['TL', 'tAB', 'J0', 'bAD', 'BL'] },
  { id: 'B', points: ['tAB', 'tBC', 'J1', 'J0'] },
  { id: 'C', points: ['tBC', 'tCE', 'J2', 'J1'] },
  { id: 'D', points: ['J0', 'J1', 'J2', 'bDE', 'bAD'] },
  { id: 'E', points: ['tCE', 'TR', 'BR', 'bDE', 'J2'] },
];

// Panel-normalised points (x right, y down). Corners stay pinned so the slab
// outline holds while the cuts breathe.
const POINT_SPECS = [
  ['TL', 0, 0],
  ['TR', 1, 0],
  ['BR', 1, 1],
  ['BL', 0, 1],
  ['tAB', 0.22, 0],
  ['tBC', 0.515, 0],
  ['tCE', 0.84, 0],
  ['bAD', 0.34, 1],
  ['bDE', 0.865, 1],
  ['J0', 0.385, 0.72],
  ['J1', 0.48, 0.62],
  ['J2', 0.716, 0.49],
];

const JUNCTIONS = new Set(['J0', 'J1', 'J2']);

function pointDrift(name, index) {
  const corner = !name.startsWith('t') && !name.startsWith('b') && !JUNCTIONS.has(name);
  if (corner) {
    return { ampX: 0, ampY: 0, phase: 0, periodX: 10, periodY: 10 };
  }
  const phase = index * 2.399963;
  const periodX = 10 + ((index * 7.13) % 10.5);
  const periodY = 12 + ((index * 4.71) % 8);
  return {
    ampX: 0.03,
    ampY: JUNCTIONS.has(name) ? 0.05 : 0,
    phase,
    periodX,
    periodY,
  };
}

const POINTS = POINT_SPECS.map(([name, x, y], i) => ({
  name,
  x,
  y,
  ...pointDrift(name, i),
}));

export function computeLayout(W, H) {
  const phone = W < 640;
  const small = W < 760;
  const marginX = W * 0.055;
  const marginY = phone ? 16 : H * 0.085;
  const blockW = Math.max(280, W - marginX * 2);
  const blockH = Math.max(360, H - marginY * 2);
  const S = blockW / 1730;
  const navH = blockH * 0.108;
  const gap = 14 * S;
  const panelW = blockW;
  const panelH = blockH - navH - gap;
  const panelTop = blockH / 2 - navH - gap;
  const portrait = H > W * 1.05;

  const eyebrowSize = Math.max(11 * S, small ? 9 : 0);
  const headlineSize = Math.max(
    Math.min(panelW * 0.078, panelH * 0.2),
    phone ? 34 : 0
  );
  const subSize = Math.max(24 * S, small ? 13 : 0);
  const pillW = Math.max(116 * S, small ? 100 : 0);
  const pillH = Math.max(40 * S, small ? 34 : 0);
  const pillFont = Math.max(15 * S, small ? 12 : 0);
  const readFont = Math.max(15 * S, small ? 12 : 0);
  const footerSize = Math.max(11 * S, small ? 9 : 0);

  const left = panelW * (small ? 0.07 : 0.072);
  const eyebrowBaseline = panelH * 0.135;
  const headlineTop = panelH * (small ? 0.17 : 0.205);
  const headlineBaseline = headlineTop + headlineSize * 0.78;
  const headlineLineHeight = headlineSize * 0.97;
  const headlineBottom = headlineTop + headlineLineHeight * 2;

  const subLineHeight = subSize * (small ? 1.45 : 1.5);
  const subLines = small
    ? [
      '15+ years building resilient Websites,',
      'Cloud infrastructure, Kubernetes Platforms,',
      'and GitOps workflows.',
    ]
    : [
      '15+ years building resilient Websites, Cloud infrastructure,',
      'Kubernetes platforms and GitOps workflows.',
    ];
  const subBaseline = Math.max(
    panelH * 0.57,
    headlineBottom + panelH * 0.1
  );
  const subBaselines = subLines.map((_, i) => subBaseline + i * subLineHeight);
  const subBaseline2 = subBaselines[subBaselines.length - 1];

  const pillTop = Math.max(panelH * 0.675, subBaseline2 + panelH * 0.075);
  const readBaseline = pillTop + pillH * 0.64;
  const readX = left + pillW + Math.max(28 * S, 16);
  const footerBaseline = panelH * 0.94;

  const pad = Math.max(blockW * 0.024, 14);
  const markSize = Math.max(20 * S, 14);
  const wordSize = Math.max(18 * S, 13);
  const linkSize = Math.max(15 * S, 11);
  const wordX = pad + markSize + Math.max(9 * S, 6);

  return {
    W,
    H,
    phone,
    small,
    portrait,
    marginX,
    marginY,
    blockW,
    blockH,
    S,
    navH,
    gap,
    panelW,
    panelH,
    panelTop,
    page: {
      left,
      eyebrowBaseline,
      eyebrowSize,
      headlineSize,
      headlineLineHeight,
      headlineBaseline,
      headlineBaseline2: headlineBaseline + headlineLineHeight,
      headlineTop,
      subSize,
      subLineHeight,
      subBaseline,
      subBaseline2,
      subLines,
      subBaselines,
      pill: { x: left, y: pillTop, w: pillW, h: pillH, r: 6 * S, fontSize: pillFont },
      read: { x: readX, baseline: readBaseline, fontSize: readFont },
      footer: { baseline: footerBaseline, size: footerSize, left, right: panelW * 0.072 },
    },
    nav: {
      pad,
      markSize,
      wordSize,
      linkSize,
      wordX,
      centerY: navH / 2,
    },
  };
}

// World-space corners and cut points for the current frame. World units are
// CSS pixels; the block is centred at the origin with y up.
export function patternWorld(layout, time, pointerWorld) {
  const { panelW, panelH, panelTop, portrait } = layout;
  const pts = {};

  for (const p of POINTS) {
    let nx = p.x;
    let ny = p.y;

    if (p.ampX) nx += Math.sin((time * 2 * Math.PI) / p.periodX + p.phase) * p.ampX;
    if (p.ampY) ny += Math.sin((time * 2 * Math.PI) / p.periodY + p.phase * 1.7) * p.ampY;

    if (portrait) {
      const swap = nx;
      nx = ny;
      ny = swap;
    }

    let x = -panelW / 2 + nx * panelW;
    let y = panelTop - ny * panelH;

    if (pointerWorld) {
      const dx = x - pointerWorld.x;
      const dy = y - pointerWorld.y;
      const d = Math.hypot(dx, dy);
      const R = 0.6 * panelW;
      if (d > 0.0001 && d < R) {
        const push = (1 - d / R) * 0.05 * panelW;
        x += (dx / d) * push;
        y += (dy / d) * push;
      }
    }

    pts[p.name] = { x, y };
  }

  return pts;
}

export function cellPolygon(pts, cell) {
  return cell.points.map((name) => pts[name]);
}
