// A counterbalanced drafting lamp. Its opening points towards the desk and the
// viewer, exposing the rolled rim, cream reflector and opal bulb.
export function createLamp(THREE) {
  const group = new THREE.Group();
  group.name = 'Articulated desk lamp';
  group.position.set(-6.47, 0, 0.04);
  const housing = new THREE.Group();
  housing.name = 'Lamp hardware';
  group.add(housing);
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const metal = (color, roughness, metalness) =>
    new THREE.MeshStandardMaterial({color, roughness, metalness});
  const enamel = metal(0x74775a, 0.37, 0.22);
  const gunmetal = metal(0x454846, 0.46, 0.62);
  const aluminium = metal(0xb2b4ac, 0.38, 0.72);
  const brass = metal(0xac916c, 0.39, 0.62);
  const rubber = metal(0x252723, 0.85, 0.03);
  const amber = metal(0xe6a455, 0.35, 0.06);
  const reflector = metal(0xd4c6aa, 0.47, 0.22);
  const glass = metal(0xdfdbcd, 0.40, 0.02);

  function part(geometry, material, parent = housing) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function turned(points, material, parent = housing) {
    return part(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 52),
      material, parent);
  }

  const base = new THREE.Group();
  base.position.set(-0.10, 0, 0.03);
  housing.add(base);
  turned([[0.40,0.008],[0.446,0.01],[0.459,0.026],[0.462,0.047]], rubber, base);
  turned([[0.459,0.039],[0.486,0.041],[0.511,0.058],[0.514,0.071],[0.505,0.092],
    [0.471,0.118],[0.363,0.153],[0.25,0.171],[0.096,0.181],[0,0.181]], enamel, base);
  const collar = turned([[0.096,0],[0.112,0.010],[0.112,0.035],[0.082,0.054],
    [0.082,0.136],[0.073,0.145]], gunmetal, base);
  collar.position.set(0, 0.173, -0.022);

  function bar(a, b, width, depth, material) {
    const delta = b.clone().sub(a);
    const mesh = part(new THREE.BoxGeometry(width, delta.length(), depth), material);
    mesh.position.copy(a).lerp(b, 0.5);
    mesh.quaternion.setFromUnitVectors(v(0, 1, 0), delta.normalize());
    return mesh;
  }
  function wire(points, radius, material, steps = 24) {
    return part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), steps, radius, 7, false), material);
  }
  const lower = v(-0.10, 0.325, 0.01);
  const elbow = v(-0.51, 1.27, -0.08);
  const upper = v(0.06, 2.43, -0.10);
  // Paired links sandwich each joint. The offset second rods maintain the
  // parallelogram, and the external spring spans the lower link.
  for (const z of [-0.044, 0.044]) {
    const offset = v(0, 0, z);
    bar(lower.clone().add(offset), elbow.clone().add(offset), 0.079, 0.048, enamel);
    bar(elbow.clone().add(offset), upper.clone().add(offset), 0.073, 0.048, enamel);
  }
  const linkShift = v(0.11, -0.036, 0);
  bar(lower.clone().add(linkShift), elbow.clone().add(linkShift), 0.042, 0.066, aluminium);
  bar(elbow.clone().add(linkShift), upper.clone().add(linkShift), 0.041, 0.058, gunmetal);

  const springAnchor = lower.clone().add(v(-0.045,0.12,0.085));
  const springHook = elbow.clone().add(v(0.10,-0.11,0.085));
  const axis = springHook.clone().sub(springAnchor).normalize();
  const side = new THREE.Vector3().crossVectors(axis, v(0,0,1)).normalize();
  const up = new THREE.Vector3().crossVectors(axis, side).normalize();
  const coil = [springAnchor];
  for (let i = 0; i <= 112; i++) {
    const t = i / 112;
    const angle = t * Math.PI * 28;
    coil.push(springAnchor.clone().lerp(springHook, 0.06 + t * 0.88)
      .addScaledVector(side, Math.cos(angle) * 0.027)
      .addScaledVector(up, Math.sin(angle) * 0.027));
  }
  coil.push(springHook);
  wire(coil, 0.0075, aluminium, 150);

  function pivot(center, radius) {
    const hub = part(new THREE.CylinderGeometry(radius,radius,0.166,32), gunmetal);
    hub.position.copy(center);
    hub.rotation.x = Math.PI / 2;
    const washer = part(new THREE.CylinderGeometry(radius * 0.78, radius * 0.82, 0.022,32), aluminium);
    washer.position.copy(center).z += 0.088;
    washer.rotation.x = Math.PI / 2;
    const bolt = part(new THREE.CylinderGeometry(radius * 0.44, radius * 0.44, 0.023,6), brass);
    bolt.position.copy(center).z += 0.106;
    bolt.rotation.x = Math.PI / 2;
    const screw = part(new THREE.BoxGeometry(radius * 0.53,0.009,0.003), rubber);
    screw.position.copy(center).z += 0.119;
    screw.rotation.z = 0.41;
  }
  pivot(lower, 0.094);
  pivot(elbow, 0.100);
  pivot(upper, 0.083);

  const head = new THREE.Group();
  head.name = 'Enamelled reflector';
  const aim = v(0.40,-0.72,0.565).normalize();
  head.position.set(0.18,2.235,0.07);
  head.quaternion.setFromUnitVectors(v(0,-1,0), aim);
  housing.add(head);
  const joint = v(0,0.224,0).applyQuaternion(head.quaternion).add(head.position);
  bar(upper, joint, 0.09, 0.096, brass);
  turned([[0.474,-0.421],[0.489,-0.415],[0.493,-0.402],[0.489,-0.387],
    [0.456,-0.282],[0.392,-0.126],[0.289,0.043],[0.199,0.128],
    [0.140,0.163],[0.118,0.178],[0.118,0.231],[0.097,0.250],[0,0.250]], enamel, head);
  turned([[0.113,0.149],[0.182,0.112],[0.271,0.031],[0.372,-0.127],
    [0.445,-0.287],[0.470,-0.385],[0.473,-0.412]], reflector, head);
  turned([[0.469,-0.412],[0.471,-0.422],[0.478,-0.426],[0.486,-0.422],
    [0.490,-0.413]], brass, head);
  turned([[0.104,0.232],[0.108,0.239],[0.108,0.267],[0.081,0.283],
    [0,0.283]], gunmetal, head);
  const socket = turned([[0.076,-0.095],[0.088,-0.086],[0.088,0.105],[0,0.115]], rubber, head);
  socket.position.y = 0.012;
  const bulb = part(new THREE.SphereGeometry(0.167,36,20), glass, head);
  bulb.scale.y = 1.27;
  bulb.position.y = -0.238;
  bulb.castShadow = false;

  // The light pool is additive, so the desk's wood grain remains visible.
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const poolGradient = ctx.createRadialGradient(64,64,0,64,64,64);
  poolGradient.addColorStop(0,'rgba(255,205,123,.62)');
  poolGradient.addColorStop(0.34,'rgba(249,181,86,.39)');
  poolGradient.addColorStop(0.68,'rgba(237,148,60,.13)');
  poolGradient.addColorStop(1,'rgba(237,148,60,0)');
  ctx.fillStyle = poolGradient;
  ctx.fillRect(0,0,size,size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.82,3.25), new THREE.MeshBasicMaterial({
    map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    toneMapped: false, opacity: 0.43,
  }));
  pool.name = 'Lamp light on desktop';
  pool.position.set(0.96,0.005,1.08);
  pool.rotation.set(-Math.PI/2,0,-0.24);
  pool.renderOrder = 0;
  group.add(pool);

  const light = new THREE.PointLight(0xffc684, 1.6, 3.8, 2);
  light.position.copy(head.position).addScaledVector(aim, 0.45);
  group.add(light);
  const switchPart = new THREE.Group();
  switchPart.name = 'Desk lamp switch';
  switchPart.position.set(0.036,0.146,0.315);
  switchPart.rotation.x = 0.23;
  base.add(switchPart);
  turned([[0.073,0.001],[0.076,0.010],[0.071,0.019],[0.053,0.020]], gunmetal, switchPart);
  const plunger = turned([[0.049,0.011],[0.051,0.019],[0.049,0.040],[0.041,0.049],[0,0.049]],
    amber, switchPart);
  function setOn(on) {
    light.intensity = on ? 1.6 : 0;
    pool.visible = on;
    glass.emissive.setHex(on ? 0xffda93 : 0x000000);
    glass.emissiveIntensity = on ? 1.9 : 0;
    reflector.emissive.setHex(on ? 0xffae54 : 0x000000);
    reflector.emissiveIntensity = on ? 0.44 : 0;
    amber.emissive.setHex(on ? 0x743707 : 0x000000);
    amber.emissiveIntensity = on ? 0.44 : 0;
    plunger.position.y = on ? -0.008 : 0;
  }
  setOn(true);
  return {group, housing, switchPart, setOn};
}
