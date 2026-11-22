import {waveColor, wavePhase} from './rgb-wave.mjs';

// Dimensions are in the workstation's world units. X runs along a row, Z towards the typist.
const UNIT = 0.361;
const PITCH = 0.212;
const COS = Math.cos(PITCH);
const SIN = Math.sin(PITCH);
const FRONT = 3.12;
const BACK = -0.18;
const DECK_WIDTH = 8.8;
const WIDTH_UNITS = 22.7;
const ROW_Z = [0.36, 0.89, 1.297, 1.704, 2.111, 2.518];
const deckHeight = (z) => 0.9 - Math.tan(PITCH) * z;
const worldX = (unit) => (unit - WIDTH_UNITS / 2) * UNIT;

function keyboardLayout() {
  const caps = [];
  function key(row, left, code, label, w = 1, options = {}) {
    const { rows = 1, ...details } = options;
    caps.push({
      code, label, w,
      x: worldX(left + w / 2),
      z: ROW_Z[row] + (rows - 1) * 0.407 / 2,
      depth: 0.39 + (rows - 1) * 0.407 / COS,
      ...details,
    });
  }
  function rowKeys(row, left, entries) {
    for (const [code, label, w = 1, options] of entries) {
      key(row, left, code, label, w, options);
      left += w;
    }
  }
  const letters = (word) => Array.from(word, letter => ['Key' + letter, letter]);
  key(0, 0, 'Escape', 'esc', 1, { accent: true });
  for (let i = 0; i < 12; i++)
    key(0, 2 + i + Math.floor(i / 4) * 0.5, 'F' + (i + 1), 'F' + (i + 1));
  rowKeys(1, 0, [
    ['Backquote', '`', 1, { alt: '¬' }],
    ...Array.from('1234567890', (digit, index) => ['Digit' + digit, digit, 1, { alt: '!"£$%^&*()'[index] }]),
    ['Minus', '−', 1, { alt: '_' }], ['Equal', '=', 1, { alt: '+' }],
    ['Backspace', 'backspace', 2],
  ]);
  rowKeys(2, 0, [
    ['Tab', 'tab', 1.5], ...letters('QWERTYUIOP'),
    ['BracketLeft', '[', 1, { alt: '{' }], ['BracketRight', ']', 1, { alt: '}' }],
    ['Enter', 'enter', 1.5, { rows: 2, iso: true, accent: true }],
  ]);
  rowKeys(3, 0, [
    ['CapsLock', 'caps lock', 1.75], ...letters('ASDFGHJKL'),
    ['Semicolon', ';', 1, { alt: ':' }], ['Quote', "'", 1, { alt: '@' }],
    ['Backslash', '#', 1, { alt: '~' }],
  ]);
  rowKeys(4, 0, [
    ['ShiftLeft', 'shift', 1.25], ['IntlBackslash', '\\', 1, { alt: '|' }],
    ...letters('ZXCVBNM'), ['Comma', ',', 1, { alt: '<' }],
    ['Period', '.', 1, { alt: '>' }], ['Slash', '/', 1, { alt: '?' }], ['ShiftRight', 'shift', 2.75],
  ]);
  rowKeys(5, 0, [
    ['ControlLeft', 'ctrl', 1.25], ['MetaLeft', 'super', 1.25], ['AltLeft', 'alt', 1.25],
    ['Space', '', 6.25], ['AltRight', 'alt gr', 1.25], ['MetaRight', 'super', 1.25],
    ['ContextMenu', 'menu', 1.25], ['ControlRight', 'ctrl', 1.25],
  ]);
  const nav = 15.36;
  rowKeys(0, nav, [['PrintScreen', 'prt sc'], ['ScrollLock', 'scr lk'], ['Pause', 'pause']]);
  rowKeys(1, nav, [['Insert', 'ins'], ['Home', 'home'], ['PageUp', 'pg up']]);
  rowKeys(2, nav, [['Delete', 'del'], ['End', 'end'], ['PageDown', 'pg dn']]);
  key(4, nav + 1, 'ArrowUp', '↑');
  rowKeys(5, nav, [['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→']]);
  const pad = 18.7;
  rowKeys(1, pad, [
    ['NumLock', 'num'], ['NumpadDivide', '/'], ['NumpadMultiply', '×'], ['NumpadSubtract', '−'],
  ]);
  rowKeys(2, pad, [['Numpad7', '7'], ['Numpad8', '8'], ['Numpad9', '9'], ['NumpadAdd', '+', 1, { rows: 2 }]]);
  rowKeys(3, pad, [['Numpad4', '4'], ['Numpad5', '5'], ['Numpad6', '6']]);
  rowKeys(4, pad, [['Numpad1', '1'], ['Numpad2', '2'], ['Numpad3', '3'], ['NumpadEnter', 'enter', 1, { rows: 2 }]]);
  rowKeys(5, pad, [['Numpad0', '0', 2], ['NumpadDecimal', '.']]);
  return caps;
}

// Each level follows the same outline so the bevel, skirt and top have continuous edges.
function outline(width, depth, radius, iso = false) {
  const x = width / 2;
  const z = depth / 2;
  const corners = [[-x, -z], [x, -z], [x, z]];
  if (iso) corners.push([-x + UNIT / 4, z], [-x + UNIT / 4, 0], [-x, 0]);
  else corners.push([-x, z]);
  const points = [];
  for (let i = 0; i < corners.length; i++) {
    const p = corners[i];
    const near = (other) => {
      const dx = other[0] - p[0], dz = other[1] - p[1];
      const length = Math.hypot(dx, dz);
      const t = Math.min(radius / length, 0.45);
      return [p[0] + t * dx, p[1] + t * dz];
    };
    const start = near(corners[(i + corners.length - 1) % corners.length]);
    const end = near(corners[(i + 1) % corners.length]);
    for (let step = 0; step <= 4; step++) {
      const t = step / 4, s = 1 - t;
      points.push([
        s * s * start[0] + 2 * s * t * p[0] + t * t * end[0],
        s * s * start[1] + 2 * s * t * p[1] + t * t * end[1],
      ]);
    }
  }
  return points;
}

const buffers = () => ({ pos: [], col: [], uv: [], ix: [] });
function connect(b, lower, upper, count) {
  for (let i = 0; i < count; i++) {
    const j = (i + 1) % count;
    b.ix.push(lower + i, upper + i, upper + j, lower + i, upper + j, lower + j);
  }
}
function addGeometry(THREE, group, b, material, shadow = false) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
  if (b.col.length) geo.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
  if (b.uv.length) geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
  geo.setIndex(b.ix);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = shadow;
  mesh.receiveShadow = shadow;
  group.add(mesh);
  return mesh;
}

function buildShell(THREE, group) {
  const middle = (FRONT + BACK) / 2;
  const length = FRONT - BACK;
  function shell(levels, material, closeBase = false) {
    const b = buffers();
    let last, count;
    for (const [inset, height] of levels) {
      const ring = outline(DECK_WIDTH - 2 * inset, length - 2 * inset, 0.14);
      const start = b.pos.length / 3;
      count = ring.length;
      for (const [x, z] of ring) b.pos.push(x, height(z + middle), z + middle);
      if (last !== undefined) connect(b, last, start, count);
      last = start;
    }
    // A second ring splits the planar top from the bevel, like a machined face.
    const top = b.pos.length / 3;
    b.pos.push(...b.pos.slice(last * 3, (last + count) * 3));
    const center = b.pos.length / 3;
    b.pos.push(0, levels.at(-1)[1](middle), middle);
    for (let i = 0; i < count; i++) b.ix.push(center, top + (i + 1) % count, top + i);
    if (closeBase) {
      const base = b.pos.length / 3;
      b.pos.push(...b.pos.slice(0, count * 3));
      const bottom = b.pos.length / 3;
      b.pos.push(0, levels[0][1](middle), middle);
      for (let i = 0; i < count; i++) b.ix.push(bottom, base + i, base + (i + 1) % count);
    }
    return addGeometry(THREE, group, b, material, true);
  }
  const satin = (color, roughness) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.36 });
  const underside = z => 0.034 + (FRONT - z) * 0.081;
  const seamHeight = z => 0.108 + (FRONT - z) * 0.116;
  shell([[0.15, underside], [0.085, z => underside(z) + 0.021], [0.028, z => seamHeight(z) - 0.018],
    [0.032, seamHeight]], satin('#1a1e25', 0.52), true);
  shell([[0.052, seamHeight], [0.052, z => seamHeight(z) + 0.019]], satin('#11151b', 0.75));
  shell([[0.033, z => seamHeight(z) + 0.019], [0.006, z => seamHeight(z) + 0.043],
    [0.001, z => deckHeight(z) - 0.079], [0.009, z => deckHeight(z) - 0.056],
    [0.075, z => deckHeight(z) - 0.009], [0.095, deckHeight]], satin('#353b44', 0.48));
  // Four recessed rubber feet support the raised back independently of the monitor.
  const rubber = new THREE.MeshStandardMaterial({ color: '#171a1e', roughness: 0.92 });
  for (const x of [-3.75, 3.75]) for (const z of [0.16, 2.82]) {
    const height = underside(z) + 0.038;
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, height, 18), rubber);
    foot.name = 'Keyboard foot';
    foot.scale.set(1.35, 1, 0.72);
    foot.position.set(x, height / 2, z);
    foot.castShadow = true;
    group.add(foot);
  }
}

function keyAtlas(THREE, caps) {
  const columns = 11, rows = Math.ceil(caps.length / columns), tile = 128;
  function layer() {
    const c = document.createElement('canvas');
    c.width = columns * tile;
    c.height = rows * tile;
    return c.getContext('2d');
  }
  const albedo = layer(), emission = layer();
  function tileUv(index, u, v) {
    return [(index % columns + 0.01 + 0.98 * u) / columns,
      1 - (Math.floor(index / columns) + 0.01 + 0.98 * v) / rows];
  }
  for (const [index, cap] of caps.entries()) {
    const x = index % columns * tile, z = Math.floor(index / columns) * tile;
    const plain = /^(Key|Digit|Numpad\d)/.test(cap.code) || cap.alt;
    for (const [ctx, emissive] of [[albedo, false], [emission, true]]) {
      ctx.save();
      ctx.translate(x, z);
      ctx.fillStyle = emissive ? '#000000' : cap.accent ? '#3c4552' : plain ? '#2d343d' : '#29313b';
      ctx.fillRect(0, 0, tile, tile);
      const tall = cap.depth > 0.5;
      // Use the cap's physical proportions for consistent legend size across wide keys.
      ctx.scale(1 / cap.w, tall ? 0.5 : 1);
      const span = tile * cap.w;
      const mid = tall ? tile : tile / 2;
      const arrow = ['↑', '←', '↓', '→'].includes(cap.label);
      ctx.fillStyle = emissive ? '#ffffff' : '#47515b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const size = arrow ? 66 : cap.label.length <= 1 ? 55 : cap.label.length <= 3 ? 43 : 35;
      ctx.font = '500 ' + size + 'px Arial, sans-serif';
      // A narrower stamp compensates for the shallow viewing angle of the deck.
      ctx.scale(0.81, 1.1);
      if (cap.label) ctx.fillText(cap.label, span * (cap.alt ? 0.32 : 0.5) / 0.81, mid / 1.1, (span - 10) / 0.81);
      if (cap.alt) {
        ctx.fillStyle = emissive ? '#b8b8b8' : '#39424b';
        ctx.font = '500 38px Arial, sans-serif';
        ctx.fillText(cap.alt, span * 0.76 / 0.81, (mid - 7) / 1.1);
      }
      if (cap.code === 'Space') {
        ctx.fillStyle = emissive ? '#ffffff' : '#47515b';
        ctx.fillRect((span / 2 - 24) / 0.81, (mid + 14) / 1.1, 48 / 0.81, 4);
      } else if (['KeyF', 'KeyJ', 'Numpad5'].includes(cap.code) && !emissive) {
        ctx.fillStyle = '#4e5964';
        ctx.fillRect((span / 2 - 15) / 0.81, (mid + 39) / 1.1, 30 / 0.81, 3);
      }
      ctx.restore();
    }
  }
  function texture(ctx) {
    const tex = new THREE.CanvasTexture(ctx.canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }
  const letters = texture(emission);
  letters.colorSpace = THREE.NoColorSpace;
  letters.channel = 1;
  return { map: texture(albedo), letters, tileUv };
}

// A shared cyclic lookup lets every diffuser and legend move with a single UV offset.
function paletteTexture(THREE) {
  const width = 256, data = new Uint8Array(width * 4);
  for (let i = 0; i < width; i++) {
    const rgb = waveColor(i / width);
    data.set([rgb >> 16, (rgb >> 8) & 255, rgb & 255, 255], i * 4);
  }
  const texture = new THREE.DataTexture(data, width, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function capVertex(target, cap, x, y, z) {
  target.push(cap.x + x, deckHeight(cap.z) + 0.026 + y * COS - z * SIN, cap.z + y * SIN + z * COS);
}

function buildCap(b, cap, index, tileUv) {
  const w = UNIT * cap.w - 0.035, d = cap.depth - 0.039;
  const levels = [
    [0.008, 0.006, 0.029, 0.52], [0.000, 0.029, 0.029, 0.71],
    [0.015, 0.080, 0.031, 0.78], [0.043, 0.144, 0.032, 0.93],
    [0.054, 0.158, 0.035, 1], [0.069, 0.163, 0.040, 1],
  ];
  let last, count;
  const topW = w - levels.at(-1)[0], topD = d - levels.at(-1)[0];
  for (const [inset, height, r, shade] of levels) {
    const ring = outline(w - inset, d - inset, r, cap.iso);
    const start = b.pos.length / 3;
    count = ring.length;
    for (const [x, z] of ring) {
      capVertex(b.pos, cap, x, height * 0.79, z - (height / 0.163) * 0.012);
      b.col.push(shade, shade, shade);
      b.uv.push(...tileUv(index, 0.02, 0.02));
    }
    if (last !== undefined) connect(b, last, start, count);
    last = start;
  }
  // The top is a separate UV island so the legends never smear down the key skirt.
  const top = b.pos.length / 3;
  const ring = outline(topW, topD, levels.at(-1)[2], cap.iso);
  for (const [x, z] of ring) {
    capVertex(b.pos, cap, x, 0.163 * 0.79, z - 0.012);
    b.col.push(1, 1, 1);
    b.uv.push(...tileUv(index, x / topW + 0.5, z / topD + 0.5));
  }
  const center = b.pos.length / 3;
  capVertex(b.pos, cap, 0, 0.155 * 0.79, -0.012);
  b.col.push(1, 1, 1);
  b.uv.push(...tileUv(index, 0.5, 0.5));
  for (let i = 0; i < count; i++) b.ix.push(center, top + (i + 1) % count, top + i);
}

function buildDiffuser(b, cap, u) {
  const w = UNIT * cap.w - 0.01, d = cap.depth - 0.013;
  let last;
  for (const [inset, y, brightness] of [[0.008, -0.013, 0.17], [0, 0.009, 0.61], [0.026, 0.018, 0.92], [0.07, 0.018, 0.26]]) {
    const start = b.pos.length / 3;
    const ring = outline(w - inset, d - inset, 0.036, cap.iso);
    for (const [x, z] of ring) {
      capVertex(b.pos, cap, x, y, z);
      b.col.push(brightness, brightness, brightness);
      b.uv.push(u, 0.5);
    }
    if (last !== undefined) connect(b, last, start, ring.length);
    last = start;
  }
}

function buildLightSpill(b, cap, u) {
  const w = UNIT * cap.w - 0.011, d = cap.depth - 0.014;
  let last;
  // Light falling on the switch plate rolls off into the opaque material between keys.
  for (const [expand, brightness] of [[0.14, 0], [0.09, 0.014], [0.047, 0.06], [0.015, 0.18], [-0.014, 0.31]]) {
    const start = b.pos.length / 3;
    const ring = outline(w + expand, d + expand, 0.043 + Math.max(0, expand / 4), cap.iso);
    for (const [x, z] of ring) {
      capVertex(b.pos, cap, x, -0.011, z);
      b.col.push(brightness, brightness, brightness);
      b.uv.push(u, 0.5);
    }
    if (last !== undefined) connect(b, last, start, ring.length);
    last = start;
  }
}

function keyboardPlate(THREE, group) {
  const b = buffers();
  const material = new THREE.MeshStandardMaterial({ color: '#151c25', roughness: 0.61, metalness: 0.32 });
  // Separate wells keep the function row and the navigation cluster purposefully spaced.
  const zones = [[0, 15, 0.13, 0.575], [0, 15, 0.661, 2.753],
    [15.36, 18.36, 0.13, 0.575], [15.36, 18.36, 0.661, 1.523],
    [16.36, 17.36, 1.884, 2.37], [15.36, 18.36, 2.286, 2.753],
    [18.7, 22.7, 0.661, 2.753]];
  for (const [left, right, rear, front] of zones) {
    const start = b.pos.length / 3;
    const mx = worldX((left + right) / 2), mz = (rear + front) / 2;
    const ring = outline((right - left) * UNIT + 0.045, front - rear, 0.036);
    for (const [x, z] of ring) b.pos.push(mx + x, deckHeight(mz + z) + 0.006, mz + z);
    const ctr = b.pos.length / 3;
    b.pos.push(mx, deckHeight(mz) + 0.006, mz);
    for (let i = 0; i < ring.length; i++) b.ix.push(ctr, start + (i + 1) % ring.length, start + i);
  }
  addGeometry(THREE, group, b, material);
}

export function createKeyboard(THREE) {
  const group = new THREE.Group();
  group.name = 'Mechanical keyboard';
  buildShell(THREE, group);
  keyboardPlate(THREE, group);
  const layout = keyboardLayout();
  const atlas = keyAtlas(THREE, layout);
  const capMaterial = new THREE.MeshStandardMaterial({
    map: atlas.map,
    roughness: 0.54, metalness: 0.08, vertexColors: true,
  });
  const capBuffer = buffers(), lightBuffer = buffers(), spillBuffer = buffers();
  const palette = paletteTexture(THREE), legendUv = [];
  const keys = [], switches = new Map();
  const hitGeometry = new THREE.BoxGeometry(1, 1, 1);
  const hitMaterial = new THREE.MeshBasicMaterial();
  for (const [index, cap] of layout.entries()) {
    const first = capBuffer.pos.length / 3, firstLight = lightBuffer.col.length / 3;
    buildCap(capBuffer, cap, index, atlas.tileUv);
    const u = cap.x / (WIDTH_UNITS * UNIT) + 0.5;
    for (let i = first; i < capBuffer.pos.length / 3; i++) legendUv.push(u, 0.5);
    buildDiffuser(lightBuffer, cap, u);
    buildLightSpill(spillBuffer, cap, u);
    const hit = new THREE.Mesh(hitGeometry, hitMaterial);
    hit.visible = false;
    hit.rotation.x = PITCH;
    hit.scale.set(UNIT * cap.w - 0.018, 0.13, cap.depth - 0.018);
    hit.position.set(cap.x, deckHeight(cap.z) + 0.09, cap.z + 0.010);
    hit.userData.code = cap.code;
    group.add(hit);
    keys.push(hit);
    switches.set(cap.code, { first, end: capBuffer.pos.length / 3, firstLight,
      endLight: lightBuffer.col.length / 3, hit, down: false });
  }
  const caps = addGeometry(THREE, group, capBuffer, capMaterial, true);
  caps.name = 'Sculpted double-shot keycaps';
  const legendGeometry = new THREE.BufferGeometry();
  legendGeometry.setIndex(caps.geometry.index);
  legendGeometry.setAttribute('position', caps.geometry.getAttribute('position'));
  legendGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(legendUv, 2));
  legendGeometry.setAttribute('uv1', caps.geometry.getAttribute('uv'));
  const legends = new THREE.Mesh(legendGeometry, new THREE.MeshBasicMaterial({
    map: palette, alphaMap: atlas.letters, transparent: true, blending: THREE.AdditiveBlending,
    toneMapped: false, depthWrite: false,
  }));
  legends.name = 'Backlit keyboard legends';
  group.add(legends);
  const lights = addGeometry(THREE, group, lightBuffer, new THREE.MeshBasicMaterial({ map: palette, vertexColors: true, toneMapped: false }));
  lights.name = 'Switch light diffusers';
  const spill = addGeometry(THREE, group, spillBuffer, new THREE.MeshBasicMaterial({
    map: palette, vertexColors: true, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  spill.name = 'Light on the switch plate';
  const pos = caps.geometry.getAttribute('position');
  const colours = caps.geometry.getAttribute('color');
  const glows = lights.geometry.getAttribute('color');
  for (const attr of [pos, colours, glows]) attr.setUsage(THREE.DynamicDrawUsage);
  function dirty(attr, start, end) {
    attr.addUpdateRange?.(start * 3, (end - start) * 3);
    attr.needsUpdate = true;
  }
  function press(code, down) {
    const sw = switches.get(code);
    if (!sw || sw.down === down) return;
    sw.down = down;
    const travel = down ? 0.108 : 0;
    for (let i = sw.first; i < sw.end; i++) {
      pos.setY(i, capBuffer.pos[i * 3 + 1] - travel * COS);
      pos.setZ(i, capBuffer.pos[i * 3 + 2] - travel * SIN);
      const base = capBuffer.col[i * 3];
      colours.setXYZ(i, base * (down ? 2.7 : 1), base * (down ? 3.1 : 1), base * (down ? 3.5 : 1));
    }
    sw.hit.position.y += (down ? -1 : 1) * 0.108 * COS;
    sw.hit.position.z += (down ? -1 : 1) * 0.108 * SIN;
    for (let i = sw.firstLight; i < sw.endLight; i++) {
      const gain = down ? 2.3 : 1;
      glows.setXYZ(i, lightBuffer.col[i * 3] * gain, lightBuffer.col[i * 3 + 1] * gain, lightBuffer.col[i * 3 + 2] * gain);
    }
    dirty(pos, sw.first, sw.end);
    dirty(colours, sw.first, sw.end);
    dirty(glows, sw.firstLight, sw.endLight);
  }
  function setPower(on) {
    lights.visible = on;
    spill.visible = on;
    legends.visible = on;
  }
  function updateLights(seconds) {
    palette.offset.x = -wavePhase(seconds);
  }
  return { group, press, keys, setPower, updateLights };
}
