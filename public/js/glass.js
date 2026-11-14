// Geometry and material helpers for the smoked-glass pieces.

const EPS = 1e-9;

export function signedArea(points) {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

export function ensureCCW(points) {
  return signedArea(points) < 0 ? points.slice().reverse() : points.slice();
}

export function centroid(points) {
  const pts = ensureCCW(points);
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    const cross = p.x * q.y - q.x * p.y;
    a += cross;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
  }
  if (Math.abs(a) < EPS) {
    const avg = pts.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    return { x: avg.x / pts.length, y: avg.y / pts.length };
  }
  a *= 0.5;
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

function normalize(v) {
  const l = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / l, y: v.y / l };
}

// Inward offset of a simple polygon by d (miter joints, clamped).
export function offsetPolygon(points, d) {
  const pts = ensureCCW(points);
  const n = pts.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const e1 = normalize({ x: cur.x - prev.x, y: cur.y - prev.y });
    const e2 = normalize({ x: next.x - cur.x, y: next.y - cur.y });
    const n1 = { x: -e1.y, y: e1.x };
    const n2 = { x: -e2.y, y: e2.x };
    const p1 = { x: cur.x + n1.x * d, y: cur.y + n1.y * d };
    const p2 = { x: cur.x + n2.x * d, y: cur.y + n2.y * d };
    const cross = e1.x * e2.y - e1.y * e2.x;
    if (Math.abs(cross) < 1e-6) {
      out.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
      continue;
    }
    const t = ((p2.x - p1.x) * e2.y - (p2.y - p1.y) * e2.x) / cross;
    const hit = { x: p1.x + e1.x * t, y: p1.y + e1.y * t };
    if (Math.hypot(hit.x - cur.x, hit.y - cur.y) > d * 7) {
      out.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
    } else {
      out.push(hit);
    }
  }
  return out;
}

// Closed shape with rounded (convex) corners. Concave corners stay sharp;
// the bevel softens them.
export function roundedShape(THREE, points, radius) {
  const pts = ensureCCW(points);
  const n = pts.length;
  const shape = new THREE.Shape();
  const corners = [];

  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const v1 = normalize({ x: prev.x - cur.x, y: prev.y - cur.y });
    const v2 = normalize({ x: next.x - cur.x, y: next.y - cur.y });
    const dot = Math.max(-1, Math.min(1, v1.x * v2.x + v1.y * v2.y));
    const angle = Math.acos(dot);

    if (angle > Math.PI - 0.03) {
      corners.push({ a: cur, b: cur, c: null });
      continue;
    }

    const l1 = Math.hypot(prev.x - cur.x, prev.y - cur.y);
    const l2 = Math.hypot(next.x - cur.x, next.y - cur.y);
    const maxT = Math.min(l1, l2) * 0.45;
    const t = Math.min(radius / Math.tan(angle / 2), maxT);
    corners.push({
      a: { x: cur.x + v1.x * t, y: cur.y + v1.y * t },
      b: { x: cur.x + v2.x * t, y: cur.y + v2.y * t },
      c: cur,
    });
  }

  shape.moveTo(corners[0].b.x, corners[0].b.y);
  for (let i = 1; i <= n; i++) {
    const c = corners[i % n];
    shape.lineTo(c.a.x, c.a.y);
    if (c.c) {
      shape.quadraticCurveTo(c.c.x, c.c.y, c.b.x, c.b.y);
    } else {
      shape.lineTo(c.b.x, c.b.y);
    }
  }
  shape.closePath();
  return shape;
}

export function buildExtrude(THREE, points, opts) {
  const shape = roundedShape(THREE, points, opts.radius);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: opts.depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: opts.bevel,
    bevelSize: opts.bevel,
    bevelSegments: opts.bevelSegments ?? 3,
    curveSegments: opts.curveSegments ?? 8,
  });
  geo.computeBoundingBox();
  return { geo, shape, frontZ: geo.boundingBox.max.z };
}

export function buildSlice(THREE, points, radius, curveSegments = 7) {
  const shape = roundedShape(THREE, points, radius);
  const geo = new THREE.ShapeGeometry(shape, curveSegments);
  geo.computeBoundingBox();
  return geo;
}

// MeshPhysicalMaterial with the lavender cursor emission injected through
// onBeforeCompile. All glow materials share one uniform object.
export function makeGlassMaterial(THREE, glowUniforms, opts = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: opts.color ?? 0x17171b,
    roughness: opts.roughness ?? 0.36,
    metalness: 0,
    clearcoat: opts.clearcoat ?? 0.7,
    clearcoatRoughness: opts.clearcoatRoughness ?? 0.12,
    specularIntensity: opts.specularIntensity ?? 0.7,
    iridescence: opts.iridescence ?? 0.55,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [250, 650],
    envMapIntensity: opts.envMapIntensity ?? 1,
  });

  if (glowUniforms) {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uGlowPointer = glowUniforms.pointer;
      shader.uniforms.uGlowStrength = glowUniforms.strength;
      shader.uniforms.uGlowRadius = glowUniforms.radius;

      shader.vertexShader =
        'varying vec3 vGlowWorld;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n  vGlowWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;'
        );

      shader.fragmentShader =
        'uniform vec3 uGlowPointer;\nuniform float uGlowStrength;\nuniform float uGlowRadius;\nvarying vec3 vGlowWorld;\n' +
        shader.fragmentShader.replace(
          'vec3 totalEmissiveRadiance = emissive;',
          `vec3 totalEmissiveRadiance = emissive;
          {
            float glowD = distance(vGlowWorld.xy, uGlowPointer.xy);
            float glow = exp(-1.6 * pow(glowD / uGlowRadius, 2.0));
            totalEmissiveRadiance += vec3(0.42, 0.37, 0.62) * 0.16 * uGlowStrength * glow;
          }`
        );
    };
    mat.customProgramCacheKey = () => 'facet-glass-glow';
  }

  return mat;
}

export function makeSliceMaterial(THREE, texture) {
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    alphaTest: 0.01,
    side: THREE.FrontSide,
  });
}
