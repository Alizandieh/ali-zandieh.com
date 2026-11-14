import { computeLayout, patternWorld, cellPolygon, CELLS } from './layout.js';
import { drawPage, drawNav, measureNavLinks, onFooterPhotoLoad } from './page.js';

const $ = (id) => document.getElementById(id);

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function enableStatic() {
  document.body.classList.add('static');
  window.__facetReady = true;
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (reduceMotion.matches || !webglOK()) {
  enableStatic();
} else {
  boot().catch((err) => {
    console.error('Facet scene failed:', err);
    enableStatic();
  });
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}

// Homography from a w×h rectangle to a screen-space quad (tl, tr, br, bl).
function quadMatrix(w, h, q) {
  const [q0, q1, q2, q3] = q;
  const sx = q0.x - q1.x + q2.x - q3.x;
  const sy = q0.y - q1.y + q2.y - q3.y;
  let a, b, c, d, e, f, g1, g2;

  if (Math.abs(sx) < 1e-6 && Math.abs(sy) < 1e-6) {
    a = q1.x - q0.x;
    b = q3.x - q0.x;
    c = q0.x;
    d = q1.y - q0.y;
    e = q3.y - q0.y;
    f = q0.y;
    g1 = 0;
    g2 = 0;
  } else {
    const dx1 = q1.x - q2.x;
    const dx2 = q3.x - q2.x;
    const dy1 = q1.y - q2.y;
    const dy2 = q3.y - q2.y;
    const den = dx1 * dy2 - dx2 * dy1;
    g1 = (sx * dy2 - dx2 * sy) / den;
    g2 = (dx1 * sy - sx * dy1) / den;
    a = q1.x - q0.x + g1 * q1.x;
    b = q3.x - q0.x + g2 * q3.x;
    c = q0.x;
    d = q1.y - q0.y + g1 * q1.y;
    e = q3.y - q0.y + g2 * q3.y;
    f = q0.y;
  }

  const A = a / w;
  const B = b / h;
  const D = d / w;
  const E = e / h;
  const G1 = g1 / w;
  const G2 = g2 / h;

  return `matrix3d(${A},${D},0,${G1}, ${B},${E},0,${G2}, 0,0,1,0, ${c},${f},0,1)`;
}

async function boot() {
  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  const glass = await import('./glass.js');

  const canvas = $('stage');
  const layer = $('layer');
  const defs = $('definitions');
  const backBtn = $('back');
  const readLink = $('read');
  const pill = $('pill');
  defs.inert = true;


  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050507);

  const camera = new THREE.PerspectiveCamera(30, 1, 200, 6000);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.42;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xeef2ff, 1.8);
  key.position.set(-0.55, 0.75, 1);
  scene.add(key);

  const block = new THREE.Group();
  block.rotation.order = 'YXZ';
  scene.add(block);

  const glowUniforms = {
    pointer: { value: new THREE.Vector3() },
    strength: { value: 0 },
    radius: { value: 300 },
  };

  const pageCanvas = document.createElement('canvas');
  const navCanvas = document.createElement('canvas');
  const pageTexture = new THREE.CanvasTexture(pageCanvas);
  pageTexture.colorSpace = THREE.SRGBColorSpace;
  pageTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const navTexture = new THREE.CanvasTexture(navCanvas);
  navTexture.colorSpace = THREE.SRGBColorSpace;
  navTexture.anisotropy = pageTexture.anisotropy;

  const pageSliceMat = glass.makeSliceMaterial(THREE, pageTexture);
  const navSliceMat = glass.makeSliceMaterial(THREE, navTexture);

  const sliverMat = glass.makeGlassMaterial(THREE, null, {
    color: 0x1b1b21,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    specularIntensity: 0.9,
    iridescence: 0.35,
    envMapIntensity: 1.8,
  });

  const state = {
    mode: 'intro',
    layout: null,
    time: 0,
    navLinks: [],
    pillHover: false,
    readHover: false,
    navHover: -1,
    labelHover: false,
    sliverHover: false,
    pointer: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      inside: false,
      world: null,
      ndc: new THREE.Vector2(0, 0),
    },
    tilt: { x: (0.8 * Math.PI) / 180, y: (-1.2 * Math.PI) / 180 },
    glow: 0,
    sliver: { tipX: 0, tipY: 0, showAt: 0, hideAt: 0 },
    flightStart: 0,
    defsOpened: false,
    rebuildAcc: 0,
    hovered: null,
    baseIrid: 0.55,
  };

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const pointerWorld = new THREE.Vector3();

  // ------------------------------------------------------------------
  // Pieces
  // ------------------------------------------------------------------

  const pieces = [];
  const cellPieces = [];
  let navPiece = null;
  let sliver = null;

  function makePieceMesh(material) {
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    const slice = new THREE.Mesh(new THREE.BufferGeometry(), pageSliceMat);
    slice.raycast = () => {};
    mesh.add(slice);
    block.add(mesh);
    return { mesh, slice };
  }

  function initPieces() {
    const navMat = glass.makeGlassMaterial(THREE, glowUniforms);
    const nav = makePieceMesh(navMat);
    navPiece = {
      id: 'nav',
      isNav: true,
      mesh: nav.mesh,
      slice: nav.slice,
      material: navMat,
      home: new THREE.Vector3(),
      z: 0,
      zVel: 0,
      rotX: 0,
      rotY: 0,
      rotXVel: 0,
      rotYVel: 0,
      hover: 0,
      delay: 0,
      fly: null,
    };
    pieces.push(navPiece);

    CELLS.forEach((cell, i) => {
      const mat = glass.makeGlassMaterial(THREE, glowUniforms);
      const { mesh, slice } = makePieceMesh(mat);
      const piece = {
        id: cell.id,
        isNav: false,
        index: i,
        mesh,
        slice,
        material: mat,
        home: new THREE.Vector3(),
        z: 0,
        zVel: 0,
        rotX: 0,
        rotY: 0,
        rotXVel: 0,
        rotYVel: 0,
        hover: 0,
        delay: 0,
        fly: null,
      };
      cellPieces.push(piece);
      pieces.push(piece);
    });

    // Sliver (Back)
    const sliverMesh = new THREE.Mesh(new THREE.BufferGeometry(), sliverMat);
    sliverMesh.visible = false;
    scene.add(sliverMesh);
    sliver = {
      mesh: sliverMesh,
      center: new THREE.Vector2(),
      half: new THREE.Vector2(1, 1),
      baseRotX: 0.08,
      baseRotY: -0.16,
      rim: null,
    };
  }

  function assignFlights() {
    const S = state.layout.S;
    pieces.forEach((piece, i) => {
      const dir = new THREE.Vector2(piece.home.x, piece.home.y);
      if (dir.length() < 1) dir.set(0.2, 0.4);
      dir.normalize();
      piece.fly = {
        offset: new THREE.Vector3(
          dir.x * (350 + Math.random() * 450) * S,
          dir.y * (250 + Math.random() * 350) * S - (150 + Math.random() * 350) * S,
          (420 + Math.random() * 380) * S
        ),
        axis: new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize(),
        angle: 2 + Math.random() * 1.6,
        order: i,
      };
    });
  }

  function rebuildNav() {
    const { blockW, blockH, navH, gap, S } = state.layout;
    const w = blockW - gap;
    const h = navH - gap;
    const r = 20 * S;
    const rect = [
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
    ];

    const { geo, frontZ } = glass.buildExtrude(THREE, rect, {
      radius: r,
      depth: 13 * S,
      bevel: 2.6 * S,
    });
    navPiece.mesh.geometry.dispose();
    navPiece.mesh.geometry = geo;
    navPiece.home.set(0, blockH / 2 - navH / 2, 0);
    navPiece.mesh.position.copy(navPiece.home);

    const sgeo = glass.buildSlice(THREE, rect, r);
    const pos = sgeo.attributes.position;
    const uv = sgeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, 0.5 + pos.getX(i) / blockW, 0.5 + pos.getY(i) / navH);
    }
    navPiece.slice.geometry.dispose();
    navPiece.slice.geometry = sgeo;
    navPiece.slice.position.z = frontZ + 0.9 * S;
    navPiece.slice.material = navSliceMat;
  }

  function rebuildCells(time) {
    const { layout } = state;
    const { S, gap, panelW, panelH, panelTop } = layout;
    const pts = patternWorld(layout, time, state.pointer.world);

    for (const piece of cellPieces) {
      const poly = cellPolygon(pts, CELLS[piece.index]);
      const inset = glass.offsetPolygon(poly, gap / 2);
      const c = glass.centroid(inset);
      const local = inset.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));

      const { geo, frontZ } = glass.buildExtrude(THREE, local, {
        radius: 20 * S,
        depth: 13 * S,
        bevel: 2.6 * S,
      });
      piece.mesh.geometry.dispose();
      piece.mesh.geometry = geo;
      piece.home.set(c.x, c.y, 0);
      piece.mesh.position.set(c.x, c.y, piece.z);

      // The extrude's top face keeps the full outline, so the printed slice
      // can run right up to the cut and be split only by the gap.
      const localS = local.map((p) => ({ x: p.x, y: p.y }));
      const sgeo = glass.buildSlice(THREE, localS, 20 * S);
      const pos = sgeo.attributes.position;
      const uv = sgeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const wx = pos.getX(i) + c.x;
        const wy = pos.getY(i) + c.y;
        uv.setXY(i, (wx + panelW / 2) / panelW, 1 - (panelTop - wy) / panelH);
      }
      piece.slice.geometry.dispose();
      piece.slice.geometry = sgeo;
      piece.slice.position.z = frontZ + 0.9 * S;
      piece.slice.material = pageSliceMat;
    }
  }

  function rebuildSliver() {
    const { W, H } = state.layout;
    const k = W / 1918;
    const frac = [
      [0.147, 0.243],
      [0.252, 0.169],
      [0.287, 0.277],
      [0.151, 0.258],
    ];
    const pts = frac.map(([fx, fy]) => ({ x: fx * W - W / 2, y: H / 2 - fy * H }));
    const c = glass.centroid(pts);
    const local = pts.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
    const { geo, shape, frontZ } = glass.buildExtrude(THREE, local, {
      radius: 14 * k,
      depth: 11 * k,
      bevel: 2.4 * k,
    });
    sliver.mesh.geometry.dispose();
    sliver.mesh.geometry = geo;
    sliver.mesh.position.set(c.x, c.y, 0);
    sliver.center.set(c.x, c.y);

    if (!sliver.rim) {
      sliver.rim = new THREE.LineLoop(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({
          color: 0xdfe3ff,
          transparent: true,
          opacity: 0.55,
          toneMapped: false,
        })
      );
      sliver.mesh.add(sliver.rim);
    }
    const rimPts = shape
      .getPoints(80)
      .map((p) => new THREE.Vector3(p.x, p.y, frontZ + 0.05 * k));
    sliver.rim.geometry.dispose();
    sliver.rim.geometry = new THREE.BufferGeometry().setFromPoints(rimPts);
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    sliver.half.set(
      Math.max(1, (Math.max(...xs) - Math.min(...xs)) / 2),
      Math.max(1, (Math.max(...ys) - Math.min(...ys)) / 2)
    );
  }

  // ------------------------------------------------------------------
  // DOM layer
  // ------------------------------------------------------------------

  const dom = {
    eyebrow: $('eyebrow'),
    headline: [$('headline-0'), $('headline-1')],
    sub: $('sub'),
    pill,
    read: readLink,
    metaLeft: $('meta-left'),
    metaRight: $('meta-right'),
    navWord: $('nav-word'),
    navLinks: Array.from(document.querySelectorAll('.nav-link')),
    dots: Array.from(document.querySelectorAll('.dot')),
    signin: $('signin'),
    meta: $('meta'),
  };

  function place(el, x, y, size, weight, tracking) {
    if (!el) return;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.fontSize = `${size}px`;
    el.style.fontWeight = String(weight);
    el.style.letterSpacing = `${tracking || 0}px`;
    el.style.lineHeight = '1';
  }

  function styleLayer() {
    const { blockW, blockH, navH, gap, page } = state.layout;
    layer.style.width = `${blockW}px`;
    layer.style.height = `${blockH}px`;
    layer.style.setProperty('--nav-h', `${navH}px`);
    layer.style.setProperty('--panel-top', `${navH + gap}px`);
    layer.style.setProperty('--panel-h', `${blockH - navH - gap}px`);

    place(
      dom.eyebrow,
      page.left,
      page.eyebrowBaseline - page.eyebrowSize * 0.865,
      page.eyebrowSize,
      500,
      page.eyebrowSize * 0.2
    );

    dom.headline.forEach((el, i) => {
      const baseline = i === 0 ? page.headlineBaseline : page.headlineBaseline2;
      place(
        el,
        page.left,
        baseline - page.headlineSize * 0.865,
        page.headlineSize,
        500,
        -page.headlineSize * 0.045
      );
    });

    dom.sub.innerHTML = page.subLines.join('<br>');
    dom.sub.style.whiteSpace = 'nowrap';
    dom.sub.style.left = `${page.left}px`;
    dom.sub.style.top = `${page.subBaseline - page.subSize * 0.865}px`;
    dom.sub.style.fontSize = `${page.subSize}px`;
    dom.sub.style.fontWeight = '400';
    dom.sub.style.letterSpacing = '0px';
    dom.sub.style.lineHeight = `${page.subLineHeight}px`;

    const hideLinks = state.layout.small;
    dom.navLinks.forEach((el) => {
      el.style.display = hideLinks ? 'none' : 'flex';
    });
    dom.dots.forEach((el) => {
      el.style.display = hideLinks ? 'none' : 'flex';
    });

    dom.pill.style.left = `${page.pill.x}px`;
    dom.pill.style.top = `${page.pill.y}px`;
    dom.pill.style.width = `${page.pill.w}px`;
    dom.pill.style.height = `${page.pill.h}px`;
    dom.pill.style.borderRadius = `${page.pill.r}px`;
    dom.pill.style.fontSize = `${page.pill.fontSize}px`;
    dom.pill.style.fontWeight = '500';

    place(
      dom.read,
      page.read.x,
      page.read.baseline - page.read.fontSize * 0.865,
      page.read.fontSize,
      500,
      0
    );

    dom.meta.style.left = `${page.footer.left}px`;
    dom.meta.style.right = `${page.footer.right}px`;
    dom.meta.style.top = `${page.footer.baseline - page.footer.size * 0.865}px`;
    dom.meta.style.fontSize = `${page.footer.size}px`;
    dom.meta.style.fontWeight = '400';

    dom.navWord.style.left = `${state.layout.nav.wordX}px`;
    dom.navWord.style.fontSize = `${state.layout.nav.wordSize}px`;
    dom.navWord.style.fontWeight = '600';
    dom.navWord.style.letterSpacing = `${-state.layout.nav.wordSize * 0.01}px`;

    dom.signin.style.right = `${state.layout.nav.pad}px`;
    dom.signin.style.fontSize = `${state.layout.nav.linkSize}px`;
    dom.signin.style.fontWeight = '500';
  }

  function styleNavDom() {
    const links = state.navLinks;
    const linkItems = links.filter((l) => l.kind === 'link');
    const dots = links.filter((l) => l.kind === 'dot');

    dom.navLinks.forEach((el, i) => {
      const item = linkItems[i];
      if (!item) return;
      el.style.left = `${item.x - 4}px`;
      el.style.padding = '0 4px';
      el.style.fontSize = `${state.layout.nav.linkSize}px`;
      el.style.fontWeight = '500';
      el.style.letterSpacing = `${item.tracking}px`;
    });

    dom.dots.forEach((el, i) => {
      const item = dots[i];
      if (!item) return;
      el.style.left = `${item.x}px`;
      el.style.fontSize = `${state.layout.nav.linkSize}px`;
    });
  }

  function refreshText() {
    state.navLinks = measureNavLinks(state.layout);
    drawPage(pageCanvas, state.layout, state);
    drawNav(navCanvas, state.layout, state, state.navLinks);
    pageTexture.needsUpdate = true;
    navTexture.needsUpdate = true;
    styleNavDom();
  }

  onFooterPhotoLoad(() => {
    if (state.layout) refreshText();
  });

  // ------------------------------------------------------------------
  // Layout
  // ------------------------------------------------------------------

  function setupLayout() {
    const layout = computeLayout(window.innerWidth, window.innerHeight);
    state.layout = layout;
    const { W, H } = layout;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.position.set(0, 0, H / (2 * Math.tan(Math.PI / 12)));
    camera.updateProjectionMatrix();

    glowUniforms.radius.value = 300 * layout.S;

    styleLayer();
    refreshText();
    rebuildNav();
    rebuildSliver();
    rebuildCells(state.time);

    if (state.mode === 'defs' || state.mode === 'shattering') {
      sliver.mesh.visible = true;
      sliver.mesh.scale.setScalar(1);
      backBtn.classList.add('on');
      pieces.forEach((p) => (p.mesh.visible = false));
    }
  }

  // ------------------------------------------------------------------
  // Interaction
  // ------------------------------------------------------------------

  function updatePointerWorld() {
    if (!state.pointer.inside) {
      state.pointer.world = null;
      return;
    }
    state.pointer.ndc.set(
      (state.pointer.x / window.innerWidth) * 2 - 1,
      -(state.pointer.y / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(state.pointer.ndc, camera);
    const hit = raycaster.ray.intersectPlane(plane, pointerWorld);
    state.pointer.world = hit ? pointerWorld.clone() : null;
  }

  function pickPiece() {
    if (!state.pointer.inside) return null;
    raycaster.setFromCamera(state.pointer.ndc, camera);
    const targets = pieces.map((p) => p.mesh).filter((m) => m.visible);
    const hits = raycaster.intersectObjects(targets, false);
    if (!hits.length) return null;
    return pieces.find((p) => p.mesh === hits[0].object) || null;
  }

  function pickSliver() {
    if (!sliver.mesh.visible || !state.pointer.inside) return false;
    raycaster.setFromCamera(state.pointer.ndc, camera);
    return raycaster.intersectObject(sliver.mesh, false).length > 0;
  }

  function springStep(piece, dt) {
    const S = state.layout.S;
    const hovered = state.hovered === piece;
    const targetZ = hovered ? (piece.isNav ? 32 * S : 50 * S) : 0;
    const r = 170 * S;
    let targetRotX = 0;
    let targetRotY = 0;

    if (hovered && state.pointer.world) {
      const dx = state.pointer.world.x - piece.home.x;
      const dy = state.pointer.world.y - piece.home.y;
      const amp = piece.isNav ? 0.1 : 0.24;
      targetRotY = clamp(dx / r, -1, 1) * amp;
      targetRotX = clamp(dy / r, -1, 1) * amp;
    }

    let rem = dt;
    while (rem > 0) {
      const h = Math.min(rem, 1 / 120);
      piece.zVel += (targetZ - piece.z) * 170 * h - piece.zVel * 19 * h;
      piece.z += piece.zVel * h;
      piece.rotXVel += (targetRotX - piece.rotX) * 170 * h - piece.rotXVel * 19 * h;
      piece.rotX += piece.rotXVel * h;
      piece.rotYVel += (targetRotY - piece.rotY) * 170 * h - piece.rotYVel * 19 * h;
      piece.rotY += piece.rotYVel * h;
      rem -= h;
    }

    piece.mesh.position.z = piece.z;
    piece.mesh.rotation.set(piece.rotX, piece.rotY, 0);

    piece.hover += ((hovered ? 1 : 0) - piece.hover) * (1 - Math.exp(-dt / 0.18));
    piece.material.iridescence =
      state.baseIrid + (1 - state.baseIrid) * piece.hover;
    piece.material.envMapIntensity = 1 + 0.9 * piece.hover;
  }

  function resetPiece(piece) {
    piece.z = 0;
    piece.zVel = 0;
    piece.rotX = 0;
    piece.rotY = 0;
    piece.rotXVel = 0;
    piece.rotYVel = 0;
    piece.mesh.position.set(piece.home.x, piece.home.y, 0);
    piece.mesh.rotation.set(0, 0, 0);
    piece.mesh.scale.setScalar(1);
  }

  function tiltTarget() {
    if (!state.pointer.inside || state.mode !== 'idle') {
      return { x: (0.8 * Math.PI) / 180, y: (-1.2 * Math.PI) / 180 };
    }
    const x = (state.pointer.x / window.innerWidth) * 2 - 1;
    const y = (state.pointer.y / window.innerHeight) * 2 - 1;
    return {
      x: (-y * 5.5 * Math.PI) / 180 + (0.8 * Math.PI) / 180,
      y: (x * 7 * Math.PI) / 180 - (1.2 * Math.PI) / 180,
    };
  }

  // ------------------------------------------------------------------
  // Shatter / reassemble
  // ------------------------------------------------------------------

  function shatter() {
    if (state.mode !== 'idle') return;
    state.mode = 'shattering';
    state.defsOpened = false;
    state.flightStart = state.time;
    state.sliver.showAt = state.time + 0.3;
    state.sliver.hideAt = 0;
    state.sliverHover = false;
    layer.classList.add('hidden');
    layer.inert = true;
    pieces.forEach((p) => {
      p.delay = p.isNav ? 0 : 0.05 + p.index * 0.05;
      p.mesh.visible = true;
      resetPiece(p);
    });
    sliver.mesh.visible = false;
    sliver.mesh.scale.setScalar(0.001);
    backBtn.classList.remove('on');
  }

  function reassemble() {
    if (state.mode !== 'defs' && state.mode !== 'shattering') return;
    state.mode = 'returning';
    state.flightStart = state.time;
    state.sliver.hideAt = state.time;
    state.defsOpened = false;
    defs.classList.remove('open');
    defs.setAttribute('aria-hidden', 'true');
    defs.inert = true;
    backBtn.classList.remove('on');
    layer.inert = false;
    pieces.forEach((p, i) => {
      p.delay = i * 0.03;
      p.mesh.visible = true;
    });
  }

  function startIntro() {
    state.mode = 'intro';
    state.flightStart = state.time + 0.15;
    layer.classList.add('hidden');
    layer.inert = true;
    pieces.forEach((p, i) => {
      p.delay = i * 0.03;
      p.mesh.visible = true;
      p.mesh.scale.setScalar(1);
      p.mesh.position.set(
        p.home.x + p.fly.offset.x,
        p.home.y + p.fly.offset.y,
        p.home.z + p.fly.offset.z
      );
      p.mesh.quaternion.setFromAxisAngle(p.fly.axis, p.fly.angle);
    });
    sliver.mesh.visible = false;
    backBtn.classList.remove('on');
  }

  function flightOut(now) {
    const GRAV = 2600 * state.layout.S;
    pieces.forEach((p) => {
      const t = now - state.flightStart - p.delay;
      if (t < 0) return;
      const prog = clamp(t / 0.72, 0, 1);
      const e = prog * prog * prog;
      const home = p.home;
      p.mesh.position.set(
        home.x + p.fly.offset.x * e,
        home.y + p.fly.offset.y * e - 0.5 * GRAV * t * t,
        home.z + p.fly.offset.z * e
      );
      const q = new THREE.Quaternion().setFromAxisAngle(p.fly.axis, p.fly.angle * e);
      p.mesh.quaternion.copy(q);
      if (t > 1.05) p.mesh.visible = false;
    });
  }

  function flightIn(now) {
    pieces.forEach((p) => {
      const t = now - state.flightStart - p.delay;
      if (t < 0) return;
      const prog = clamp(t / 0.72, 0, 1);
      const e = easeOutBack(prog);
      const inv = 1 - e;
      const home = p.home;
      p.mesh.position.set(
        home.x + p.fly.offset.x * inv,
        home.y + p.fly.offset.y * inv,
        home.z + p.fly.offset.z * inv
      );
      const q = new THREE.Quaternion().setFromAxisAngle(p.fly.axis, p.fly.angle * inv);
      p.mesh.quaternion.copy(q);
      if (prog >= 1) resetPiece(p);
    });
  }

  function flightDone(now) {
    let done = true;
    for (const p of pieces) {
      if (now - state.flightStart - p.delay < 0.72) {
        done = false;
        break;
      }
    }
    return done;
  }

  // ------------------------------------------------------------------
  // Sliver
  // ------------------------------------------------------------------

  function updateSliver(now, dt) {
    const s = state.sliver;

    if (state.mode === 'shattering' || state.mode === 'defs') {
      const t = now - s.showAt;
      if (t >= 0) {
        sliver.mesh.visible = true;
        const grow = easeOutBack(clamp(t / 0.55, 0, 1));
        sliver.mesh.scale.setScalar(Math.max(0.001, grow));
        if (t > 0.18) backBtn.classList.add('on');
      }
    } else if (state.mode === 'returning') {
      const t = now - s.hideAt;
      if (t < 0.25) {
        const shrink = 1 - clamp(t / 0.25, 0, 1);
        sliver.mesh.scale.setScalar(Math.max(0.001, shrink));
      } else {
        sliver.mesh.visible = false;
      }
    } else {
      sliver.mesh.visible = false;
    }

    if (!sliver.mesh.visible) return;

    if (state.mode === 'defs') {
      const hit = pickSliver();
      state.sliverHover = hit || state.labelHover;
      canvas.style.cursor = state.sliverHover ? 'pointer' : 'default';
    } else {
      state.sliverHover = false;
      canvas.style.cursor = 'default';
    }

    let tx = 0;
    let ty = 0;
    if (state.sliverHover && state.pointer.world) {
      tx = clamp((state.pointer.world.y - sliver.center.y) / sliver.half.y, -1, 1) * 0.14;
      ty = clamp((state.pointer.world.x - sliver.center.x) / sliver.half.x, -1, 1) * 0.14;
    }
    s.tipX += (tx - s.tipX) * (1 - Math.exp(-dt / 0.15));
    s.tipY += (ty - s.tipY) * (1 - Math.exp(-dt / 0.15));

    const wobble = Math.sin(now * Math.PI * 2) * 0.035;
    sliver.mesh.rotation.set(
      sliver.baseRotX + s.tipX,
      sliver.baseRotY + s.tipY,
      wobble,
      'YXZ'
    );
  }

  // ------------------------------------------------------------------
  // Frame
  // ------------------------------------------------------------------

  const tmpV = new THREE.Vector3();

  function projectCorner(x, y, z) {
    tmpV.set(x, y, z).applyMatrix4(block.matrixWorld).project(camera);
    return {
      x: (tmpV.x * 0.5 + 0.5) * state.layout.W,
      y: (-tmpV.y * 0.5 + 0.5) * state.layout.H,
    };
  }

  function updateDomMatrix() {
    const { blockW, blockH, S } = state.layout;
    const frontZ = 15.6 * S;
    const q = [
      projectCorner(-blockW / 2, blockH / 2, frontZ),
      projectCorner(blockW / 2, blockH / 2, frontZ),
      projectCorner(blockW / 2, -blockH / 2, frontZ),
      projectCorner(-blockW / 2, -blockH / 2, frontZ),
    ];
    layer.style.transform = quadMatrix(blockW, blockH, q);
  }

  function update(now, dt) {
    state.time = now;
    updatePointerWorld();

    if (state.mode === 'idle') {
      const target = tiltTarget();
      const k = 1 - Math.exp(-dt / 0.3);
      state.tilt.x += (target.x - state.tilt.x) * k;
      state.tilt.y += (target.y - state.tilt.y) * k;

      state.hovered = pickPiece();

      state.rebuildAcc += dt;
      if (state.rebuildAcc >= 1 / 45) {
        state.rebuildAcc = state.rebuildAcc % (1 / 45);
        rebuildCells(now);
      }
    } else {
      const base = tiltTarget();
      const k = 1 - Math.exp(-dt / 0.3);
      state.tilt.x += (base.x - state.tilt.x) * k;
      state.tilt.y += (base.y - state.tilt.y) * k;
      state.hovered = null;
    }

    block.rotation.x = state.tilt.x;
    block.rotation.y = state.tilt.y;
    block.updateMatrixWorld(true);

    if (state.mode === 'idle') {
      for (const piece of pieces) springStep(piece, dt);
    }

    if (state.mode === 'intro') {
      flightIn(now);
      if (flightDone(now)) {
        state.mode = 'idle';
        layer.classList.remove('hidden');
        layer.inert = false;
      }
    } else if (state.mode === 'shattering') {
      flightOut(now);
      if (!state.defsOpened && now - state.flightStart >= 0.28) {
        state.defsOpened = true;
        defs.classList.add('open');
        defs.setAttribute('aria-hidden', 'false');
        defs.inert = false;
      }
      if (now - state.flightStart > 1.25) state.mode = 'defs';
    } else if (state.mode === 'returning') {
      flightIn(now);
      if (flightDone(now)) {
        state.mode = 'idle';
        layer.classList.remove('hidden');
        layer.inert = false;
      }
    }

    updateSliver(now, dt);

    const glowTarget = state.pointer.inside && state.mode === 'idle' ? 1 : 0;
    state.glow += (glowTarget - state.glow) * (1 - Math.exp(-dt / 0.25));
    glowUniforms.strength.value = state.glow;
    if (state.pointer.world) {
      glowUniforms.pointer.value.copy(state.pointer.world);
    }

    updateDomMatrix();
  }

  let last = performance.now();

  function frame(nowMs) {
    requestAnimationFrame(frame);
    const now = nowMs / 1000;
    const dt = Math.min(0.05, Math.max(0.001, now - last));
    last = now;
    update(now, dt);
    renderer.render(scene, camera);
    window.__facetReady = true;
  }

  // ------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------

  window.addEventListener('pointermove', (e) => {
    state.pointer.x = e.clientX;
    state.pointer.y = e.clientY;
    state.pointer.inside = true;
  });

  document.addEventListener('pointerleave', () => {
    state.pointer.inside = false;
  });

  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) state.pointer.inside = false;
  });

  window.addEventListener('blur', () => {
    state.pointer.inside = false;
  });

  readLink.addEventListener('click', (e) => {
    e.preventDefault();
    shatter();
  });

  pill.addEventListener('pointerenter', () => {
    state.pillHover = true;
    refreshText();
  });
  pill.addEventListener('pointerleave', () => {
    state.pillHover = false;
    refreshText();
  });

  readLink.addEventListener('pointerenter', () => {
    state.readHover = true;
    refreshText();
  });
  readLink.addEventListener('pointerleave', () => {
    state.readHover = false;
    refreshText();
  });

  dom.navLinks.forEach((el) => {
    el.addEventListener('pointerenter', () => {
      state.navHover = Number(el.dataset.nav);
      refreshText();
    });
    el.addEventListener('pointerleave', () => {
      state.navHover = -1;
      refreshText();
    });
    el.addEventListener('click', (e) => {
      if (state.mode !== 'idle') return;
      e.preventDefault();
      const target = document.querySelector(el.getAttribute('href'));
      shatter();
      window.setTimeout(() => {
        target?.scrollIntoView({
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
          block: 'start',
        });
      }, 900);
    });
  });

  backBtn.addEventListener('click', reassemble);
  backBtn.addEventListener('pointerenter', () => (state.labelHover = true));
  backBtn.addEventListener('pointerleave', () => (state.labelHover = false));

  canvas.addEventListener('click', () => {
    if (state.mode === 'defs' && pickSliver()) reassemble();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') reassemble();
  });

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      setupLayout();
      if (state.mode === 'idle') {
        for (const p of pieces) resetPiece(p);
      }
    });
  });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    enableStatic();
  });

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------

  initPieces();
  setupLayout();
  assignFlights();

  await Promise.race([
    document.fonts.load('500 100px Inter').then(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
  refreshText();

  startIntro();

  requestAnimationFrame((t) => {
    last = t / 1000;
    frame(t);
  });
}
