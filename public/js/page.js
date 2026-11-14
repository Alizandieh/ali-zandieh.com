// All visible type is painted into two canvases: the panel page image and the
// nav slab image. Each shard samples its slice of these images.

let scratchCtx = null;

function getScratch() {
  if (!scratchCtx) {
    const c = document.createElement('canvas');
    c.width = 8;
    c.height = 8;
    scratchCtx = c.getContext('2d');
  }
  return scratchCtx;
}

const footerPhoto = { src: './images/Ali-Zandieh-2.png', image: null, ready: false, onLoad: null };

let fadeCanvas = null;

function getFadeCanvas(size) {
  if (!fadeCanvas) fadeCanvas = document.createElement('canvas');
  if (fadeCanvas.width !== size) {
    fadeCanvas.width = size;
    fadeCanvas.height = size;
  }
  return fadeCanvas;
}

function loadFooterPhoto() {
  if (footerPhoto.image) return;
  const img = new Image();
  img.onload = () => {
    footerPhoto.ready = true;
    if (footerPhoto.onLoad) footerPhoto.onLoad();
  };
  img.src = footerPhoto.src;
  footerPhoto.image = img;
}

export function onFooterPhotoLoad(callback) {
  footerPhoto.onLoad = callback;
  loadFooterPhoto();
}

export function textureDpr() {
  const dpr = window.devicePixelRatio || 1;
  return Math.min(Math.max(dpr, 1.5), 3);
}

function setFont(ctx, size, weight) {
  ctx.font = `${weight} ${size}px Inter, sans-serif`;
}

function drawTracked(ctx, text, x, y, tracking) {
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = `${tracking}px`;
    ctx.fillText(text, x, y);
    ctx.letterSpacing = '0px';
    return;
  }
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
}

export function measureTracked(text, size, weight, tracking) {
  const ctx = getScratch();
  setFont(ctx, size, weight);
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = `${tracking}px`;
    const w = ctx.measureText(text).width;
    ctx.letterSpacing = '0px';
    return w;
  }
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + tracking;
  return Math.max(0, w - tracking);
}

export function measureNavLinks(layout) {
  if (layout.small) return [];
  const { linkSize } = layout.nav;
  const texts = ['Platform', 'Impact', 'Experience'];
  const tracking = linkSize * 0.01;
  const dotGap = Math.max(linkSize * 0.62, 6);
  const items = [];
  let x = layout.blockW * 0.4;

  texts.forEach((text, i) => {
    const w = measureTracked(text, linkSize, 500, tracking);
    items.push({ kind: 'link', index: i, text, x, w, tracking });
    x += w + dotGap;
    if (i < 2) {
      const dw = measureTracked('·', linkSize, 500, 0);
      items.push({ kind: 'dot', index: i, text: '·', x, w: dw, tracking: 0 });
      x += dw + dotGap;
    }
  });

  return items;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function prepare(canvas, w, h, dpr) {
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.textBaseline = 'alphabetic';
  return ctx;
}

export function drawPage(canvas, layout, state) {
  const dpr = textureDpr();
  const { panelW, panelH } = layout;
  const p = layout.page;
  const ctx = prepare(canvas, panelW, panelH, dpr);

  // Eyebrow
  setFont(ctx, p.eyebrowSize, 500);
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  drawTracked(ctx, 'LEAD PLATFORM ENGINEER · DEVOPS · SRE', p.left, p.eyebrowBaseline, p.eyebrowSize * 0.2);

  // Headline
  const gradient = ctx.createLinearGradient(
    0,
    p.headlineTop,
    0,
    p.headlineTop + p.headlineLineHeight * 2
  );
  gradient.addColorStop(0, '#dcdce0');
  gradient.addColorStop(1, '#bdbdc3');
  setFont(ctx, p.headlineSize, 500);
  ctx.fillStyle = gradient;
  drawTracked(ctx, 'Platforms', p.left, p.headlineBaseline, -p.headlineSize * 0.045);
  drawTracked(ctx, 'that scale', p.left, p.headlineBaseline2, -p.headlineSize * 0.045);

  // Sub
  setFont(ctx, p.subSize, 400);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  p.subLines.forEach((line, i) => {
    drawTracked(ctx, line, p.left, p.subBaselines[i], 0);
  });

  // Open studio pill
  const pill = p.pill;
  roundRect(ctx, pill.x, pill.y, pill.w, pill.h, pill.r);
  ctx.fillStyle = state.pillHover ? '#36d67e' : '#e9e9ed';
  ctx.fill();
  setFont(ctx, pill.fontSize, 500);
  ctx.fillStyle = '#101013';
  const pillText = 'Email Ali';
  const pillTextW = measureTracked(pillText, pill.fontSize, 500, 0);
  drawTracked(
    ctx,
    pillText,
    pill.x + (pill.w - pillTextW) / 2,
    pill.y + pill.h / 2 + pill.fontSize * 0.35,
    0
  );

  // Read paper link
  const read = p.read;
  setFont(ctx, read.fontSize, 500);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const readText = 'Explore work';
  const readTracking = read.fontSize * 0.005;
  drawTracked(ctx, readText, read.x, read.baseline, read.fontSize * 0.005);

  // Arrow drawn as strokes: the bundled latin Inter has no arrow glyph.
  const readW = measureTracked(readText, read.fontSize, 500, readTracking);
  const ax = read.x + readW + read.fontSize * 0.5;
  const ay = read.baseline - read.fontSize * 0.3;
  const alen = read.fontSize * 0.8;
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = Math.max(1, read.fontSize * 0.08);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + alen, ay);
  ctx.moveTo(ax + alen * 0.58, ay - alen * 0.3);
  ctx.lineTo(ax + alen, ay);
  ctx.lineTo(ax + alen * 0.58, ay + alen * 0.3);
  ctx.stroke();

  if (state.readHover) {
    const w = readW + read.fontSize * 0.5 + alen;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(read.x, read.baseline + read.fontSize * 0.28, w, 1);
  }

  // Footer metadata
  setFont(ctx, p.footer.size, 400);
  ctx.fillStyle = 'rgba(255,255,255,0.34)';
  drawTracked(ctx, '', p.footer.left, p.footer.baseline, 0);
  if (footerPhoto.ready) {
    const photoSize = layout.phone
      ? panelW * 0.28
      : layout.small
        ? panelW * 0.22
        : p.footer.size * 5 * 5;
    const photoX = panelW - p.footer.right - photoSize + photoSize * 0.2;
    const photoY = p.eyebrowBaseline - p.eyebrowSize;
    const img = footerPhoto.image;
    const px = Math.round(photoSize * dpr);
    const faded = getFadeCanvas(px);
    const fctx = faded.getContext('2d');
    fctx.clearRect(0, 0, px, px);
    const scale = Math.max(px / img.naturalWidth, px / img.naturalHeight);
    const sw = px / scale;
    const sh = px / scale;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) * 0.2;
    fctx.drawImage(img, sx, sy, sw, sh, 0, 0, px, px);
    fctx.globalCompositeOperation = 'destination-in';
    const half = px / 2;
    const mask = fctx.createRadialGradient(half, half, half * 0.55, half, half, half);
    mask.addColorStop(0, 'rgba(0,0,0,1)');
    mask.addColorStop(1, 'rgba(0,0,0,0)');
    fctx.fillStyle = mask;
    fctx.fillRect(0, 0, px, px);
    fctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(faded, photoX, photoY, photoSize, photoSize);
  }
}

export function drawNav(canvas, layout, state, links) {
  const dpr = textureDpr();
  const { blockW, navH } = layout;
  const n = layout.nav;
  const ctx = prepare(canvas, blockW, navH, dpr);
  const cy = n.centerY;

  // Square mark cut by a diagonal: a facet.
  const m = n.markSize;
  const mx = n.pad;
  const my = cy - m / 2;
  roundRect(ctx, mx, my, m, m, Math.max(3, m * 0.18));
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(1, m * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx + m * 0.08, my + m * 0.92);
  ctx.lineTo(mx + m * 0.92, my + m * 0.08);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx + m * 0.92, my + m * 0.08);
  ctx.lineTo(mx + m * 0.92, my + m * 0.92);
  ctx.lineTo(mx + m * 0.08, my + m * 0.92);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();

  // Wordmark
  setFont(ctx, n.wordSize, 600);
  ctx.fillStyle = '#ffffff';
  drawTracked(ctx, 'Ali Zandieh', n.wordX, cy + n.wordSize * 0.35, -n.wordSize * 0.01);

  // Links
  setFont(ctx, n.linkSize, 500);
  for (const item of links) {
    const hover = state.navHover === item.index;
    if (item.kind === 'link') {
      ctx.fillStyle = hover ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)';
      drawTracked(ctx, item.text, item.x, cy + n.linkSize * 0.35, item.tracking);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      drawTracked(ctx, item.text, item.x, cy + n.linkSize * 0.35, 0);
    }
  }

  // Sign in
  const signText = 'Contact';
  const signW = measureTracked(signText, n.linkSize, 500, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  drawTracked(ctx, signText, blockW - n.pad - signW, cy + n.linkSize * 0.35, 0);
}
