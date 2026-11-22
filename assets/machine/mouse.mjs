import {waveColor, wavePhase} from './rgb-wave.mjs';

// A section through the shell runs from one grip, over the back of the mouse,
// to the other grip. The buttons and the unbroken palm inherit that same curve.
export function createMouse(THREE) {
  const group = new THREE.Group();
  group.name = 'Wireless gaming mouse';
  const body = new THREE.Group();
  body.name = 'Mouse body';
  group.add(body);

  const pi = Math.PI;
  const halfPi = pi / 2;
  const clamp = THREE.MathUtils.clamp;
  const material = (color, roughness, metalness = 0) =>
    new THREE.MeshStandardMaterial({color, roughness, metalness});
  const graphite = material(0x343c46, 0.53, 0.09);
  const switches = material(0x39414a, 0.50, 0.07);
  const base = material(0x272e36, 0.62);
  const rubber = material(0x191e24, 0.81);
  const thumb = material(0x353e48, 0.51);
  const samples = 256;
  const spectrum = new Uint8Array(samples * 4);
  for (let i = 0; i < samples; i++) {
    const rgb = waveColor((i + 0.5) / samples);
    spectrum.set([rgb >> 16, (rgb >> 8) & 255, rgb & 255, 255], i * 4);
  }
  const lightStrip = new THREE.DataTexture(spectrum, samples, 1);
  lightStrip.colorSpace = THREE.SRGBColorSpace;
  lightStrip.wrapS = THREE.RepeatWrapping;
  lightStrip.magFilter = lightStrip.minFilter = THREE.LinearFilter;
  lightStrip.needsUpdate = true;
  const guide = new THREE.MeshStandardMaterial({
    color: 0x29323c, emissive: 0xffffff, emissiveMap: lightStrip, emissiveIntensity: 1.02,
    metalness: 0.08, roughness: 0.31,
  });
  // The guides share a spatial coordinate in the mouse housing, so a single
  // wave passes through the wheel, status light and different rim sections.
  function mapGuide(geometry, xOffset = 0, zOffset = 0, onWheel = false) {
    const position = geometry.getAttribute('position');
    const uv = new Float32Array(position.count * 2);
    for (let i = 0; i < position.count; i++) {
      const x = onWheel ? xOffset + position.getZ(i) : position.getX(i);
      const z = onWheel ? zOffset - position.getX(i) : position.getZ(i);
      uv[i * 2] = .36 + .74 * x + .08 * z;
      uv[i * 2 + 1] = .5;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }

  function add(name, geometry, finish, parent = body) {
    const mesh = new THREE.Mesh(geometry, finish);
    mesh.name = name;
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function grid(rows, columns, sample) {
    const positions = [], normals = [], indices = [];
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= columns; j++) {
        const {point, normal} = sample(i/rows, j/columns);
        positions.push(point.x, point.y, point.z);
        if (normal) normals.push(normal.x, normal.y, normal.z);
        if (i === rows || j === columns) continue;
        const a = i*(columns+1)+j, b = a+columns+1;
        indices.push(a,b,a+1, a+1,b,b+1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
    geometry.setIndex(indices);
    if (normals.length) geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    else geometry.computeVertexNormals();
    return geometry;
  }

  function section(t) {
    const a = (t-.5)*pi;
    const sine = Math.sin(a), cosine = Math.max(0,Math.cos(a));
    const length = (sine+1)/2;
    // Flared fingertip supports narrow into the thumb grip. The heel has a
    // rounder plan profile than the toe so the palm clears the desk smoothly.
    const waist = .061*Math.exp(-(((length-.40)/.15)**2));
    const flare = .047*Math.exp(-(((length-.70)/.23)**2));
    const width = (.515-waist+flare)*cosine**(.55+.30*length);
    const rim = .112+.052*(1-length);
    const rise = (.324+.069*Math.sin((length-.43)*pi))*cosine**.93;
    return {z:.895*sine, width, rim, rise};
  }
  function surface(t, angle) {
    const s = section(t);
    const across = Math.sin(angle), dome = Math.max(0,Math.cos(angle));
    const saddle = .010*Math.exp(-(((s.z+.42)/.31)**2)-(((Math.abs(across)-.50)/.23)**2));
    return new THREE.Vector3(s.width*across, s.rim+s.rise*dome**.89-saddle, s.z);
  }
  function smoothSample(t, angle) {
    const point = surface(t, angle);
    if (t <= .00001 || t >= .99999)
      return {point, normal:new THREE.Vector3(0,0,t < .5 ? -1 : 1)};
    const h = .0001;
    const tangent = surface(Math.min(1,t+h),angle).sub(surface(Math.max(0,t-h),angle));
    const across = surface(t,Math.min(halfPi,angle+h)).sub(surface(t,Math.max(-halfPi,angle-h)));
    return {point, normal:tangent.cross(across).normalize()};
  }

  function perimeter(u) {
    const onRight = u <= .5;
    const s = section(onRight ? 2*u : (1-u)*2);
    return {x:s.width*(onRight ? 1 : -1), z:s.z, y:s.rim};
  }
  // The diffuser is captured between two physical parts. These profiles also
  // round the underside away from the desk instead of ending in a sharp skirt.
  function band(name, finish, levels) {
    return add(name, grid(levels.length-1,144,(v,u) => {
      const p = perimeter(u);
      const [size, height] = levels[Math.round(v*(levels.length-1))];
      return {point:new THREE.Vector3(p.x*size,height(p.y),p.z*size)};
    }),finish);
  }
  band('Recessed lower housing',base,[
    [.86,()=>.013],[.912,()=>.019],[.953,()=>.033],[.978,h=>h*.39],
    [.989,h=>h-.058],[.994,h=>h-.050],
  ]);
  const halo = band('Continuous RGB diffuser',guide,[
    [.994,h=>h-.050],[.997,h=>h-.047],[.999,h=>h-.030],[1,h=>h-.027],
  ]);
  mapGuide(halo.geometry);
  halo.castShadow = false;
  band('Upper grip lip',graphite,[
    [1,h=>h-.027],[1.001,h=>h-.020],[1.001,h=>h-.010],[1,h=>h],
  ]);

  const socket = grid(62,42,(t,u) => {
    const {point,normal} = smoothSample(t,(u-.5)*pi);
    point.x *= .987;
    point.z *= .988;
    point.y -= .039;
    return {point,normal};
  });
  add('Switch frame',socket,rubber);

  const seam = angle => .526+.073*Math.cos(angle)**2;
  const palm = grid(46,58,(s,u) => {
    const angle = (u-.5)*pi;
    const start = seam(angle)+.0027;
    return smoothSample(start+(1-start)*s,angle);
  });
  add('Solid palm shell',palm,graphite);

  const wheelT = .385;
  const wheelZ = section(wheelT).z;
  const hinge = new THREE.Vector3(0,.40,.20);
  function button(side) {
    const geo = grid(49,32,(s,u) => {
      const cross = side < 0 ? 1-u : u;
      const t = s*(seam(cross*halfPi)-.0027);
      const {z,width} = section(t);
      const wheelPocket = .055*Math.exp(-(((z-wheelZ)/.151)**6));
      const slotAngle = Math.asin(Math.min(.65,(.0055+wheelPocket)/Math.max(.005,width)));
      const angle = side*(slotAngle+cross*(halfPi-slotAngle));
      return smoothSample(t,angle);
    });
    geo.translate(-hinge.x,-hinge.y,-hinge.z);
    const cap = add(side<0?'Left click':'Right click',geo,switches);
    cap.position.copy(hinge);
    return cap;
  }
  const left = button(-1), right = button(1);

  const wheelRadius = .124;
  const wheel = add('Treaded scroll wheel',grid(144,12,(s,u) => {
    const theta = s*2*pi;
    const edge = Math.abs(2*u-1)**5;
    const radius = wheelRadius-.008*edge+.002*Math.cos(theta*30);
    return {point:new THREE.Vector3((u-.5)*.096,Math.cos(theta)*radius,Math.sin(theta)*radius)};
  }),rubber);
  wheel.position.set(0,surface(wheelT,0).y-wheelRadius+.027,wheelZ);
  for (const side of [-1,1]) {
    const ring = add('Wheel sidewall',new THREE.CylinderGeometry(.114,.114,.008,40),base,wheel);
    ring.rotation.z = halfPi;
    ring.position.x = .048*side;
    const rim = add('Illuminated encoder ring',new THREE.TorusGeometry(.103,.005,7,48),guide,wheel);
    rim.rotation.y = halfPi;
    rim.position.x = .053*side;
    mapGuide(rim.geometry, rim.position.x, wheelZ, true);
  }
  const wheelRestY = wheel.position.y;

  // Conform the small status window to the curved shell. It stays flush even
  // at the shallow desktop camera angle.
  const status = grid(6,24,(v,u) => {
    const t = .705+(v-.5)*.010;
    const span = Math.sqrt(Math.max(0,1-(2*v-1)**2));
    const a = (u-.5)*.30*span;
    const {point,normal} = smoothSample(t,a);
    return {point:point.addScaledVector(normal,.0014),normal};
  });
  mapGuide(status);
  add('Power indicator',status,guide).castShadow=false;

  const thumbKeys = [-.18,.041].map((z,index) => {
    const t = Math.asin(z/.895)/pi+.5;
    const cap = add('Thumb button '+(index+1),new THREE.CapsuleGeometry(.021,.124,5,12),thumb);
    cap.rotation.x = halfPi;
    const angle = -1.345;
    const p = surface(t,angle);
    cap.position.set(p.x-.003,p.y,p.z);
    cap.scale.z = .75;
    return cap;
  });
  const thumbRest = thumbKeys.map(cap=>cap.position.x);

  const homeX=5.45, homeZ=2.30;
  body.position.set(homeX,0,homeZ);
  const down = Array(5).fill(false);
  let targetX=homeX, targetZ=homeZ, wheelAngle=0;
  function advance(object,axis,target,amount) {
    if (object[axis]===target) return false;
    const old=object[axis];
    object[axis]=Math.abs(target-old)<.00012?target:old+(target-old)*amount;
    return true;
  }
  return {
    group,
    updateLights(seconds) {
      lightStrip.offset.x = -wavePhase(seconds);
    },
    setPower(on) {
      guide.emissiveIntensity = on ? 1.02 : 0;
      guide.color.setHex(on ? 0x29323c : 0x303841);
    },
    move(nx,ny) {
      targetX=homeX+clamp(nx,-1,1)*.33;
      targetZ=homeZ+clamp(ny,-1,1)*.58;
    },
    press(button,pressed) {
      if (button>=0 && button<down.length) down[button]=Boolean(pressed);
    },
    scroll(delta) { wheelAngle+=clamp(delta*.012,-1.3,1.3); },
    update(dt) {
      const motion=1-Math.exp(-18*Math.max(0,dt));
      const click=1-Math.exp(-55*Math.max(0,dt));
      let changed=advance(body.position,'x',targetX,motion);
      changed=advance(body.position,'z',targetZ,motion)||changed;
      changed=advance(wheel.rotation,'x',wheelAngle,motion)||changed;
      changed=advance(wheel.position,'y',wheelRestY-(down[1] ? .024 : 0),click)||changed;
      for(const [index,cap] of [[0,left],[2,right]]) {
        changed=advance(cap.rotation,'x',down[index]?-.034:0,click)||changed;
        changed=advance(cap.position,'y',hinge.y-(down[index] ? .004 : 0),click)||changed;
      }
      for(const [i,cap] of thumbKeys.entries())
        changed=advance(cap.position,'x',thumbRest[i]+(down[i+3] ? .014 : 0),click)||changed;
      return changed;
    },
  };
}
