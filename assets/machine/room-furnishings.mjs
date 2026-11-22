// Tabletop furnishings are modeled at the same scale as the workstation.
export function createFurnishings(THREE) {
  const group = new THREE.Group();
  group.name = 'Tabletop plant and books';
  const plant = new THREE.Group();
  plant.position.set(6.19, 0, -1.09);
  group.add(plant);
  let seed = 89731;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const vec = (x, y, z) => new THREE.Vector3(x, y, z);
  function mesh(parent, geo, mat, name) {
    const part = new THREE.Mesh(geo, mat);
    part.name = name;
    part.castShadow = part.receiveShadow = true;
    parent.add(part);
    return part;
  }
  function texture(w, h, paint) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    paint(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }
  const clay = texture(256, 256, (ctx, w, h) => {
    const pixels = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (x + y * w) * 4;
      const glaze = 1.5 * Math.sin(y * 0.36) + 1.1 * Math.sin(y * 1.1);
      const grain = (random() - 0.5) * 12 - (random() < 0.017 ? 22 : 0);
      pixels.data[i] = 190 + grain + glaze;
      pixels.data[i + 1] = 181 + grain + glaze;
      pixels.data[i + 2] = 158 + grain + glaze;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
  });
  const ceramic = new THREE.MeshStandardMaterial({ map: clay, roughness: 0.39, metalness: 0.02 });
  const profile = [
    [0, 0.012], [0.347, 0.012], [0.363, 0.020], [0.369, 0.058], [0.389, 0.063],
    [0.406, 0.085], [0.44, 0.19], [0.494, 0.44], [0.526, 0.66], [0.524, 0.75],
    [0.518, 0.777], [0.500, 0.786], [0.482, 0.775], [0.475, 0.752],
    [0.478, 0.705], [0.458, 0.615], [0, 0.615],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  mesh(plant, new THREE.LatheGeometry(profile, 80), ceramic, 'Speckled stoneware');

  const soilTexture = texture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#352c24';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5400; i++) {
      ctx.fillStyle = ['#271d15', '#4b3b2e', '#584438', '#302a21', '#796c55'][Math.floor(random() * 5)];
      ctx.fillRect(random() * w, random() * h, 0.3 + random() * 2.6, 0.3 + random() * 1.3);
    }
  });
  const soil = mesh(plant, new THREE.CircleGeometry(0.478, 64),
    new THREE.MeshStandardMaterial({ map: soilTexture, roughness: 1 }), 'Potting soil');
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 0.714;
  const foliage = new THREE.Group();
  foliage.name = 'Plant foliage';
  foliage.position.y = soil.position.y;
  plant.add(foliage);

  // Each blade has its own curved silhouette and surface. The same venation map
  // is sampled along the midrib of every leaf, including the rolled margins.
  const venation = texture(256, 512, (ctx, w, h) => {
    const wash = ctx.createLinearGradient(0, 0, w, 0);
    for (const [t, c] of [[0, '#c6cfc0'], [.19, '#dce2d4'], [.42, '#e6eadd'], [.5, '#c9d6c0'], [.58, '#e4e6d9'], [.84, '#d5ddcf'], [1, '#c4cdbd']])
      wash.addColorStop(t, c);
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
    for (let y = 15; y < h - 5; y += 9 + random() * 6) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = 'rgba(145,165,122,0.44)';
        ctx.lineWidth = 0.6 + random() * 0.8;
        ctx.beginPath();
        ctx.moveTo(w / 2, y);
        ctx.bezierCurveTo(w / 2 + side * 24, y - 16, w / 2 + side * 95, y - 46, w / 2 + side * 128, y - 41);
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.moveTo(w / 2 - 2.4, h);
    ctx.quadraticCurveTo(w / 2 - 1.2, .45 * h, w / 2, 0);
    ctx.quadraticCurveTo(w / 2 + 1.6, .42 * h, w / 2 + 2.4, h);
    ctx.fillStyle = '#f4ebc8';
    ctx.fill();
  });
  const leaves = { pos: [], color: [], uv: [], idx: [] };
  const branches = { pos: [], color: [], idx: [] };
  function stem(points, r0, r1, hue) {
    const curve = new THREE.CatmullRomCurve3(points);
    const n = 12, sides = 7;
    const frames = curve.computeFrenetFrames(n, false);
    const first = branches.pos.length / 3;
    const base = new THREE.Color(hue);
    for (let i = 0; i <= n; i++) {
      const p = curve.getPointAt(i / n);
      const radius = r0 + (r1 - r0) * (i / n);
      for (let j = 0; j < sides; j++) {
        const theta = j / sides * 2 * Math.PI;
        const side = Math.cos(theta), front = Math.sin(theta);
        const v = p.clone().addScaledVector(frames.normals[i], side * radius)
          .addScaledVector(frames.binormals[i], front * radius);
        branches.pos.push(v.x, v.y, v.z);
        const shade = 0.90 + 0.10 * Math.sin(theta * 3);
        branches.color.push(base.r * shade, base.g * shade, base.b * shade);
        if (i < n) {
          const a = first + i * sides + j, b = first + i * sides + (j + 1) % sides;
          branches.idx.push(a, b, a + sides, b, b + sides, a + sides);
        }
      }
    }
    return curve;
  }
  function leaf(node, angle, length, width, lift, roll, tone) {
    const dx = Math.cos(angle), dz = Math.sin(angle);
    const start = node.clone().add(vec(dx * 0.12, 0.044, dz * 0.12));
    stem([node, node.clone().add(vec(dx * .052, .026, dz * .052)), start], 0.011, 0.007, '#788355');
    const arch = length * (0.20 + random() * 0.08);
    const curl = (random() - 0.5) * 0.13;
    const first = leaves.pos.length / 3, rings = 20, across = 10;
    const pigment = new THREE.Color(tone);
    for (let i = 0; i <= rings; i++) {
      const u = i / rings;
      const vein = Math.sin(Math.PI * u);
      const breadth = Math.max(0.002, vein ** 0.77) * (1.15 - 0.34 * u) * width * 0.5;
      const tip = start.clone().add(vec(dx * length * u, lift * u + arch * vein, dz * length * u));
      const twist = roll + Math.sin(u * Math.PI * 0.72) * curl;
      const tangent = vec(-dz * Math.cos(twist), Math.sin(twist), dx * Math.cos(twist));
      for (let j = 0; j <= across; j++) {
        const v = (j / across - .5) * 2;
        const folded = Math.abs(v) ** 1.22 * breadth * 0.19 - (Math.abs(v) ** 3 * breadth * 0.31);
        const margin = Math.abs(v) ** 3 * .008 * Math.sin(u * 19.1 + angle) * vein;
        const p = tip.clone().addScaledVector(tangent, v * breadth);
        p.y += folded + margin;
        leaves.pos.push(p.x, p.y, p.z);
        const val = 0.88 + 0.13 * Math.sin(u * Math.PI) + (v * .036);
        leaves.color.push(pigment.r * val, pigment.g * val, pigment.b * val);
        leaves.uv.push(j / across, u);
        if (i < rings && j < across) {
          const a = first + i * (across + 1) + j;
          leaves.idx.push(a, a + 1, a + across + 1, a + 1, a + across + 2, a + across + 1);
        }
      }
    }
  }
  const shoots = [
    [vec(-.03,.69,.02), vec(-.12,1.23,-.01), vec(.03,1.99,.005), vec(-.01,2.86,-.035)],
    [vec(.10,.69,.035), vec(.19,1.13,.11), vec(.30,1.66,.13), vec(.30,2.12,.16)],
    [vec(-.17,.69,.10), vec(-.25,.96,.16), vec(-.30,1.28,.19), vec(-.28,1.68,.18)],
  ];
  const palette = ['#335b37', '#365937', '#46683e', '#40643d', '#527348', '#304e32'];
  shoots.forEach((points, k) => {
    const axis = stem(points, .046 - k * .008, .010, k === 0 ? '#69654a' : '#606848');
    const count = [10, 6, 4][k];
    for (let i = 0; i < count; i++) {
      const h = 0.20 + 0.76 * i / (count - 1);
      const node = axis.getPoint(h);
      const a = [2.42, .41, 2.81][k] + i * 2.36;
      const length = (.61 + .15 * Math.sin(h * Math.PI) - .21 * h ** 4) * (1 - k * .12);
      const lift = (-.21 + h * .56 + (random() - .5) * .18) * (1 - k * .1);
      const turn = (Math.sin(a) < 0 ? .30 : -.28) + Math.cos(a) * -.63 + (random() - .5) * .3;
      leaf(node, a, length, length * (.47 + random() * .16), lift, turn, palette[(i * 5 + k) % palette.length]);
    }
    const end = points.at(-1);
    // A rolled stipule at the newest node is characteristic of the rubber plant.
    stem([end, end.clone().add(vec(.026,.12,-.008)), end.clone().add(vec(.039,.23,.006))], .026, .002, '#914f3d');
  });
  function finish(buff, material, name) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(buff.pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(buff.color, 3));
    if (buff.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(buff.uv, 2));
    geo.setIndex(buff.idx);
    geo.computeVertexNormals();
    geo.translate(0, -foliage.position.y, 0);
    mesh(foliage, geo, material, name);
  }
  finish(branches, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .79, side: THREE.DoubleSide }), 'Woody stems and petioles');
  finish(leaves, new THREE.MeshPhysicalMaterial({
    vertexColors: true, map: venation, roughness: .46, clearcoat: .13,
    clearcoatRoughness: .54, side: THREE.DoubleSide,
  }), 'Rubber plant leaves');

  const linen = texture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#cfd0c9';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 128; i += 2) {
      ctx.fillStyle = 'rgba(255,255,245,0.3)';
      ctx.fillRect(i, 0, 1, h);
      ctx.fillStyle = 'rgba(90,92,82,0.24)';
      ctx.fillRect(0, i, w, 1);
    }
  });
  const paper = texture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#cfc9b7';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2 + Math.floor(random() * 3)) {
      ctx.fillStyle = random() > .5 ? '#aaa594' : '#e1dbcd';
      ctx.fillRect(0, y, w, .6 + random() * .7);
    }
  });
  const pages = new THREE.MeshStandardMaterial({ map: paper, roughness: .91 });
  function book(x, z, y, yaw, width, depth, thickness, color, elastic) {
    const bookGroup = new THREE.Group();
    bookGroup.position.set(x, y, z);
    bookGroup.rotation.y = yaw;
    group.add(bookGroup);
    const cloth = new THREE.MeshStandardMaterial({ map: linen, color, roughness: .89 });
    function block(w, h, d, x, y, z, mat, name) {
      mesh(bookGroup, new THREE.BoxGeometry(w, h, d), mat, name).position.set(x, y, z);
    }
    const board = .014;
    block(width - .035, thickness - board * 2, depth - .047, 0, thickness / 2, -.002, pages, 'Paper edges');
    block(width, board, depth, 0, board / 2, 0, cloth, 'Rear book board');
    block(width, board, depth, 0, thickness - board / 2, 0, cloth, 'Front book board');
    block(.039, thickness - board, depth, -.5 * width + .017, thickness / 2, 0, cloth, 'Linen spine');
    if (elastic) {
      const band = new THREE.MeshStandardMaterial({ color: '#343c36', roughness: .92 });
      block(.032, thickness + .005, depth + .005, .5 * width - .15, thickness / 2, 0, band, 'Notebook elastic');
    }
  }
  book(5.78, -.03, .002, -.135, 1.29, .88, .146, '#526265', false);
  book(5.81, -.015, .148, -.052, 1.10, .78, .096, '#9b7954', true);
  return group;
}
