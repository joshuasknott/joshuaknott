// A panoramic softbox rig gives the metal and the molded plastic different
// highlights without fetching an external environment map.
function studioPanorama(THREE) {
  const width = 256;
  const height = 128;
  const pixels = new Float32Array(width * height * 4);
  const cards = [
    [-0.82, 0.45, 0.36, 0.5, 2.0],
    [0.74, 0.45, -0.46, 0.32, 3.4],
    [0.18, 0.91, 0.37, 0.42, 1.8],
  ];
  for (let y = 0; y < height; y++) {
    const latitude = (y / height - 0.5) * Math.PI;
    const dy = Math.sin(latitude);
    for (let x = 0; x < width; x++) {
      const longitude = (x / width - 0.5) * Math.PI * 2;
      const dx = Math.cos(latitude) * Math.cos(longitude);
      const dz = Math.cos(latitude) * Math.sin(longitude);
      let radiance = 0.13 + 0.23 * (dy + 1) * 0.5;
      for (const [cx, cy, cz, radius, intensity] of cards) {
        const distance = Math.acos(Math.min(1, Math.max(-1, dx * cx + dy * cy + dz * cz)));
        radiance += intensity * Math.max(0, Math.min(1, (radius - distance) / 0.12));
      }
      const i = 4 * (y * width + x);
      pixels[i] = radiance * 0.96;
      pixels[i + 1] = radiance;
      pixels[i + 2] = radiance * 1.045;
      pixels[i + 3] = 1;
    }
  }
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat, THREE.FloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
}

// Layered contact shadows anchor each object to the seamless studio surface.
// The mouse shadow is parented to the mouse so it stays under the shell.
function contactShadow(THREE, width, depth, rounded, opacity, spread) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  for (const [blur, alpha, inset] of [[spread, 0.28, 0.14], [spread * 0.38, 0.45, 0.18], [spread * 0.12, 0.55, 0.205]]) {
    const x = canvas.width * inset;
    const y = canvas.height * inset;
    ctx.filter = 'blur(' + blur + 'px)';
    ctx.fillStyle = 'rgba(13,20,27,' + alpha + ')';
    ctx.beginPath();
    ctx.roundRect(x, y, canvas.width - 2*x, canvas.height - 2*y, rounded);
    ctx.fill();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshBasicMaterial({
    map, transparent: true, depthWrite: false, opacity, toneMapped: false
  }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// Skylight underneath the raised display casts a soft, wide shadow on the desk.
function caseShadow(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(192,192,4,192,192,192);
  gradient.addColorStop(0, 'rgba(27,23,21,.44)');
  gradient.addColorStop(.46, 'rgba(27,23,21,.30)');
  gradient.addColorStop(.78, 'rgba(27,23,21,.10)');
  gradient.addColorStop(1, 'rgba(27,23,21,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,384,384);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(15.8,6.25),
    new THREE.MeshBasicMaterial({map, transparent:true, depthWrite:false, toneMapped:false}));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(.18, -.032, -.32);
  shadow.renderOrder = -3;
  return shadow;
}

function addSurfaceGrain(THREE, scene) {
  const side = 128;
  const pixels = new Uint8Array(side * side * 4);
  let seed = 7281;
  for (let i = 0; i < pixels.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed >>> 24;
    pixels.set([noise, noise, noise, 255], i);
  }
  const grain = new THREE.DataTexture(pixels, side, side);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.generateMipmaps = true;
  grain.minFilter = THREE.LinearMipmapLinearFilter;
  grain.magFilter = THREE.LinearFilter;
  grain.needsUpdate = true;
  const materials = new Set();
  scene.traverse(object => {
    for (const material of [].concat(object.material || [])) {
      if (material.isMeshStandardMaterial) materials.add(material);
    }
  });
  for (const material of materials) {
    material.onBeforeCompile = shader => {
      shader.uniforms.finishGrain = {value:grain};
      shader.vertexShader = 'varying vec3 vFinishPosition;\n' + shader.vertexShader
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFinishPosition = position;');
      shader.fragmentShader = 'varying vec3 vFinishPosition; uniform sampler2D finishGrain;\n' + shader.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
          vec2 grainUV = vFinishPosition.xy + vec2(0.37, 0.95) * vFinishPosition.z;
          float speck = texture2D(finishGrain, grainUV * 0.69).r - 0.5;
          diffuseColor.rgb *= 1.0 + 0.16 * speck;`);
    };
  }
}

export function lightStudio(THREE, renderer, scene, mouseBody) {
  const environment = studioPanorama(THREE);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const reflection = pmrem.fromEquirectangular(environment);
  scene.environment = reflection.texture;
  environment.dispose();
  pmrem.dispose();

  const sky = new THREE.HemisphereLight(0xf3f6ff, 0xad9b88, 0.83);
  scene.add(sky);
  const key = new THREE.DirectionalLight(0xfff2df, 1.95);
  key.position.set(-7, 10, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {left: -8, right: 8, top: 8, bottom: -8, near: 0.2, far: 30});
  key.shadow.normalBias = 0.012;
  key.shadow.bias = -0.00017;
  key.shadow.radius = 4;
  key.shadow.intensity = 0.54;
  key.shadow.blurSamples = 6;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe4efff, 1.30);
  rim.position.set(5, 5, -5);
  scene.add(rim);

  const cast = caseShadow(THREE);
  scene.add(cast);
  addSurfaceGrain(THREE, scene);
  const shadow = contactShadow(THREE, 11.8, 4.55, 44, 0.89, 48);
  shadow.position.set(-0.28, -0.012, 4.23);
  shadow.renderOrder = -2;
  scene.add(shadow);
  const foot = contactShadow(THREE, 4.55, 2.77, 65, 0.88, 50);
  foot.position.set(0.035, -0.012, -0.10);
  foot.renderOrder = -2;
  scene.add(foot);
  for (const [x,z,w,d] of [[-6.48,.04,1.75,1.46],[6.2,-1.08,1.72,1.68],[5.80,.01,1.99,1.31]]) {
    const contact = contactShadow(THREE,w,d,80,.82,45);
    contact.position.set(x+.04,-.029,z+.025);
    contact.renderOrder=-2;
    scene.add(contact);
    contact.name = 'Tabletop contact';
  }
  const mouseShadow = contactShadow(THREE, 1.67, 2.64, 155, 0.83, 45);
  mouseShadow.position.set(0.055, -0.008, 0.025);
  mouseShadow.renderOrder = -1;
  mouseBody.add(mouseShadow);
  return {shadow, cast, foot, reflection};
}
