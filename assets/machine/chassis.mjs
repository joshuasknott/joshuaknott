// Positive Z faces the visitor. The casework is lofted from a series of milled
// profiles so the edge breaks and the recessed glass catch actual scene light.
export function createChassis(THREE) {
  const group = new THREE.Group();
  group.name = "Workstation display and pedestal";
  const centerY = 4.24;
  const frontZ = -0.10;
  const screenY = 4.35;
  const screenWidth = 10.15;
  const screenHeight = 5.30;
  const metal = (color, roughness = 0.48, metalness = 0.48) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const housing = metal(0x353b44);
  const fascia = metal(0x535d68, 0.44, 0.46);
  const rim = metal(0x75808b, 0.33, 0.63);
  const back = metal(0x373e46, 0.52);
  const gasket = metal(0x161a20, 0.68, 0.16);
  const machined = metal(0x505964, 0.44, 0.62);
  const inside = metal(0x0c1118, 0.70, 0.10);

  function add(geometry, material, parent = group) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function profile(width, height, radius, z, x = 0, y = centerY) {
    const corners = [
      [width / 2 - radius, height / 2 - radius],
      [-width / 2 + radius, height / 2 - radius],
      [-width / 2 + radius, -height / 2 + radius],
      [width / 2 - radius, -height / 2 + radius],
    ];
    const points = [];
    const segments = 8;
    corners.forEach(([cx, cy], corner) => {
      for (let i = 0; i <= segments; i++) {
        const angle = (corner + i / segments) * Math.PI / 2;
        points.push([
          x + cx + radius * Math.cos(angle),
          y + cy + radius * Math.sin(angle), z,
        ]);
      }
    });
    return points;
  }

  function loft(profiles, material, parent = group) {
    const positions = profiles.flat(2);
    const indices = [];
    const count = profiles[0].length;
    for (let row = 0; row < profiles.length - 1; row++) {
      for (let i = 0; i < count; i++) {
        const a = row * count + i;
        const b = row * count + (i + 1) % count;
        const c = a + count;
        indices.push(a, b, c, b, b + count, c);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return add(geometry, material, parent);
  }

  function face(width, height, radius, material, x, y, z, parent = group) {
    const contour = profile(width, height, radius, 0, 0, 0);
    const shape = new THREE.Shape(contour.map(([a, b]) => new THREE.Vector2(a, b)));
    const geometry = new THREE.ShapeGeometry(shape);
    // ShapeGeometry emits UVs in local model units.
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, uv.getX(i) / width + 0.5, uv.getY(i) / height + 0.5);
    }
    const mesh = add(geometry, material, parent);
    mesh.position.set(x, y, z);
    return mesh;
  }

  // A low aluminium foot and a neck with a real cable pass-through support
  // the display. Keep the front edge of the foot behind the separate keyboard.
  const foot = new THREE.Group();
  foot.name = "Machined monitor foot";
  foot.rotation.x = -Math.PI / 2;
  foot.position.z = -0.13;
  group.add(foot);
  loft([
    profile(2.66, 1.55, 0.105, 0.007, 0, 0),
    profile(2.70, 1.59, 0.109, 0.032, 0, 0),
    profile(2.70, 1.59, 0.109, 0.056, 0, 0),
  ], gasket, foot);
  loft([
    profile(2.70, 1.59, 0.109, 0.050, 0, 0),
    profile(2.85, 1.72, 0.126, 0.063, 0, 0),
    profile(2.85, 1.72, 0.126, 0.096, 0, 0),
    profile(2.81, 1.69, 0.112, 0.120, 0, 0),
    profile(2.74, 1.62, 0.10, 0.139, 0, 0),
  ], machined, foot);
  face(2.74, 1.62, 0.10, metal(0x57616b, 0.46), 0, 0, 0.139, foot);

  const neckOutline = profile(0.81, 1.30, 0.085, 0, 0, 0.815);
  const neckShape = new THREE.Shape(neckOutline.map(([x,y]) => new THREE.Vector2(x,y)));
  const cablePort = profile(0.29, 0.47, 0.136, 0, 0, 0.81);
  neckShape.holes.push(new THREE.Path(cablePort.map(([x,y]) => new THREE.Vector2(x,y)).reverse()));
  const neckGeometry = new THREE.ExtrudeGeometry(neckShape, {
    depth: 0.31, bevelEnabled: true, bevelThickness: 0.037, bevelSize: 0.038,
    bevelSegments: 3,
  });
  const neckVerts = neckGeometry.getAttribute("position");
  for (let i = 0; i < neckVerts.count; i++) {
    const y = neckVerts.getY(i);
    neckVerts.setX(i, neckVerts.getX(i) * (1.15 - y * 0.104));
    neckVerts.setZ(i, neckVerts.getZ(i) - 0.58 - y * 0.12);
  }
  neckGeometry.computeVertexNormals();
  const neck = add(neckGeometry, [metal(0x65717b, 0.43, 0.58), machined]);
  neck.name = "Tapered pedestal with cable opening";

  // The monitor shell has a deep rear bevel, a hairline assembly seam and a
  // bright cut edge on the front. Only the narrow lower rail is exposed.
  const rear = face(10.07, 5.40, 0.13, back, 0, centerY, -0.557);
  rear.rotation.y = Math.PI;
  loft([
    profile(10.07, 5.40, 0.130, -0.557),
    profile(10.12, 5.45, 0.143, -0.541),
    profile(10.34, 5.67, 0.138, -0.312),
    profile(10.35, 5.68, 0.137, -0.278),
  ], back);
  loft([
    profile(10.35, 5.68, 0.137, -0.278),
    profile(10.343, 5.673, 0.136, -0.272),
    profile(10.343, 5.673, 0.136, -0.254),
    profile(10.36, 5.69, 0.138, -0.244),
  ], gasket);
  loft([
    profile(10.36, 5.69, 0.138, -0.244),
    profile(10.39, 5.72, 0.143, -0.221),
    profile(10.39, 5.72, 0.143, -0.133),
  ], housing);
  loft([
    profile(10.39, 5.72, 0.143, -0.133),
    profile(10.38, 5.71, 0.138, -0.120),
    profile(10.35, 5.68, 0.123, -0.103),
    profile(10.337, 5.667, 0.118, frontZ),
  ], rim);
  const aperture = profile(screenWidth + 0.045, screenHeight + 0.045, 0.085,
    frontZ, 0, screenY);
  const front = loft([profile(10.337, 5.667, 0.118, frontZ), aperture], fascia);
  // The fascia is one flat aluminium sheet. Separate the tooling
  // strokes from its lighting so angled surfaces still take real highlights.
  const brushed = document.createElement("canvas");
  brushed.width = 512;
  brushed.height = 512;
  const brushCtx = brushed.getContext("2d");
  brushCtx.fillStyle = "#f8f8f8";
  brushCtx.fillRect(0, 0, 512, 512);
  let seed = 17;
  function noise() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  for (let i = 0; i < 920; i++) {
    brushCtx.fillStyle = "rgba(0,0,0," + noise() * 0.027 + ")";
    brushCtx.fillRect(noise() * 620 - 150, noise() * 512, 30 + noise() * 300, 1.1);
  }
  fascia.map = new THREE.CanvasTexture(brushed);
  fascia.map.colorSpace = THREE.SRGBColorSpace;
  const frontUV = [];
  const frontPos = front.geometry.getAttribute("position");
  for (let i = 0; i < frontPos.count; i++) {
    frontUV.push(frontPos.getX(i) / 10.39 + 0.5, (frontPos.getY(i) - 1.38) / 5.72);
  }
  front.geometry.setAttribute("uv", new THREE.Float32BufferAttribute(frontUV, 2));
  loft([
    aperture,
    profile(screenWidth + 0.015, screenHeight + 0.015, 0.075, frontZ - 0.012, 0, screenY),
    profile(screenWidth, screenHeight, 0.07, frontZ - 0.015, 0, screenY),
  ], gasket);

  // A photographed softbox would be reflected even in a blank, unlit screen.
  // Bake that subtle reflection into the glass to keep its appearance stable
  // in both WebGL environments and product-shot lighting.
  const glassCanvas = document.createElement("canvas");
  glassCanvas.width = 1024;
  glassCanvas.height = 512;
  const glassCtx = glassCanvas.getContext("2d");
  const falloff = glassCtx.createLinearGradient(80, 0, 710, 680);
  falloff.addColorStop(0, "#1c222a");
  falloff.addColorStop(0.42, "#10151c");
  falloff.addColorStop(0.82, "#0b0f14");
  falloff.addColorStop(1, "#12171c");
  glassCtx.fillStyle = falloff;
  glassCtx.fillRect(0, 0, 1024, 512);
  const softbox = glassCtx.createLinearGradient(0, 0, 750, 430);
  softbox.addColorStop(0, "rgba(207,222,235,.22)");
  softbox.addColorStop(0.31, "rgba(178,197,217,.12)");
  softbox.addColorStop(0.47, "rgba(150,169,190,.072)");
  softbox.addColorStop(0.486, "rgba(152,173,191,.070)");
  softbox.addColorStop(0.50, "rgba(152,173,191,.018)");
  softbox.addColorStop(0.55, "rgba(127,145,166,0)");
  glassCtx.fillStyle = softbox;
  glassCtx.fillRect(0, 0, 1024, 512);
  const glassMap = new THREE.CanvasTexture(glassCanvas);
  glassMap.colorSpace = THREE.SRGBColorSpace;
  const glassMaterial = new THREE.MeshBasicMaterial({ map: glassMap, toneMapped: false });
  const screen = face(screenWidth + 0.002, screenHeight + 0.002, 0.07,
    glassMaterial, 0, screenY, frontZ - 0.015);
  screen.name = "Blank flat glass display";
  screen.receiveShadow = false;
  screen.castShadow = false;

  // The laser-etched mark is set into the lower lip, like a maker's signature.
  function decal(width, height, x, y, paint) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = Math.max(24, Math.round(640 * height / width));
    const ctx = canvas.getContext("2d");
    paint(ctx, canvas);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map, transparent: true, depthWrite: false, toneMapped: false,
    });
    const mesh = add(new THREE.PlaneGeometry(width, height), material);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.position.set(x, y, frontZ + 0.002);
    return mesh;
  }
  decal(1.37, 0.170, -4.27, 1.544, (ctx, canvas) => {
    ctx.fillStyle = "#c7d0d6";
    const polygon = (points) => {
      ctx.beginPath();
      points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.closePath();
      ctx.fill();
    };
    polygon([[8,52],[21,52],[29,44],[29,12],[40,12],[40,48],[26,63],[8,63]]);
    polygon([[45,12],[56,12],[56,34],[77,12],[91,12],[67,37],[94,63],[79,63],
      [56,40],[56,63],[45,63]]);
    ctx.font = "500 52px Arial, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("Joshua Knott", 114, canvas.height / 2 + 1);
  });

  const powerButton = new THREE.Group();
  powerButton.name = "Power";
  group.add(powerButton);
  powerButton.position.set(4.91, 1.545, frontZ + 0.002);
  powerButton.scale.setScalar(0.60);
  const switchParts = new THREE.Group();
  powerButton.add(switchParts);
  function disc(radius, depth, z, material, parent) {
    const piece = add(new THREE.CylinderGeometry(radius, radius, depth, 48), material, parent);
    piece.rotation.x = Math.PI / 2;
    piece.position.z = z;
    return piece;
  }
  disc(0.191, 0.022, 0, inside, powerButton);
  disc(0.169, 0.030, 0.020, rim, switchParts);
  disc(0.157, 0.013, 0.039, machined, switchParts);
  const lamp = new THREE.MeshBasicMaterial({ color: 0xb4eeff, toneMapped: false });
  const icon = add(new THREE.TorusGeometry(0.069, 0.008, 8, 36, Math.PI * 1.64),
    lamp, switchParts);
  icon.rotation.z = Math.PI * 0.68;
  icon.position.z = 0.047;
  const stroke = add(new THREE.CapsuleGeometry(0.008, 0.063, 3, 8), lamp, switchParts);
  stroke.position.set(0, 0.055, 0.048);
  icon.castShadow = false;
  stroke.castShadow = false;

  function setPower(on) {
    lamp.color.setHex(on ? 0xb4eeff : 0x707980);
    glassMaterial.color.setHex(on ? 0xffffff : 0xb4b7b8);
    switchParts.position.z = on ? -0.006 : 0.006;
  }
  setPower(true);
  return { group, screen, powerButton, setPower };
}
