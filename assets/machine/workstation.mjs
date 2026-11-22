import * as THREE from './vendor/three.module.min.mjs';
import {createChassis} from './chassis.mjs';
import {createKeyboard} from './keyboard.mjs';
import {createMouse} from './mouse.mjs';
import {lightStudio} from './studio.mjs';
import {createRoom} from './room.mjs';
import {createLamp} from './lamp.mjs';
import {createFurnishings} from './room-furnishings.mjs';

const frameWidth = 1200;
const frameHeight = 710;

export async function assemble(canvas, {realtime = false} = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true, powerPreference: 'low-power',
  });
  if (realtime) {
    const gl = renderer.getContext();
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const device = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
    if (/swiftshader|llvmpipe|software rasterizer|microsoft basic render/i.test(device)) {
      renderer.dispose();
      throw new Error('Software GPU detected.');
    }
  }
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;

  const scene = new THREE.Scene();
  const chassis = createChassis(THREE);
  const keyboard = createKeyboard(THREE);
  const mouse = createMouse(THREE);
  chassis.group.scale.x = 1.055;
  keyboard.group.scale.set(.86, .62, .86);
  keyboard.group.position.set(-0.32, 0, 2.92);
  mouse.group.position.set(-0.90, 0, 1.89);
  scene.add(chassis.group, keyboard.group, mouse.group);
  const lamp = createLamp(THREE);
  const room = await createRoom(THREE);
  const furnishings = createFurnishings(THREE);
  scene.add(room, furnishings, lamp.group);
  const lighting = lightStudio(THREE, renderer, scene, mouse.group.getObjectByName('Mouse body'));

  // A long lens keeps the screen square to the viewer while revealing the keys.
  const distance = 32;
  const elevation = THREE.MathUtils.degToRad(16);
  const target = new THREE.Vector3(0, 2.73, 0.3);
  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(4.63 / distance));
  const camera = new THREE.PerspectiveCamera(fov, frameWidth/frameHeight, 1, 100);
  camera.position.copy(target).add(new THREE.Vector3(0,
    distance * Math.sin(elevation), distance * Math.cos(elevation)));
  camera.lookAt(target);
  camera.updateMatrixWorld();
  let width = 0;
  let height = 0;
  function resize(w, h, dpr) {
    width = w;
    height = h;
    // Leave both the lamp and the framed contribution chart inside a phone viewport.
    const portrait = w / h <= 0.8;
    const portraitZoom = portrait ? 1.04 : 1;
    const scale = Math.min(w / frameWidth, h / frameHeight) * portraitZoom;
    const frameW = w / scale;
    const frameH = h / scale;
    // Expand the viewing frame with the viewport while keeping the optical
    // axis perpendicular to the middle of the display in plan view.
    camera.setViewOffset(frameWidth, frameHeight,
      (frameWidth - frameW) / 2 + (portrait ? .024 * frameW : 0), (frameHeight - frameH) / 2,
      frameW, frameH);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
  }
  function project(worldPoint) {
    const point = worldPoint.clone().project(camera);
    return {x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2};
  }
  function setPower(on) {
    chassis.setPower(on);
    keyboard.setPower(on);
    mouse.setPower(on);
  }
  return {renderer, scene, chassis, keyboard, mouse, room, furnishings, lamp, camera, lighting, resize, project, setPower};
}

export async function createWorkstation(canvas, onResize) {
  const {renderer, scene, chassis, keyboard, mouse, lamp, furnishings, camera, resize, project, setPower} = await assemble(canvas, {realtime: true});
  const ray = new THREE.Raycaster();
  const point = new THREE.Vector2();
  const bounds = new THREE.Box3();
  const screen = chassis.screen;
  screen.geometry.computeBoundingBox();
  const {min, max} = screen.geometry.boundingBox;
  const glassCorners = [
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(min.x, min.y, max.z),
  ];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const foliage = furnishings.getObjectByName('Plant foliage');
  let foliageBounds;
  let sway = 0;
  let velocity = 0;
  let lastPointer;
  let frame = 0;
  let last = 0;
  let powered = true;
  let paused = false;
  let lastShadow = 0;
  // The RGB wave only changes emitted light. Reuse the shadow map at rest.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  function draw(now) {
    frame = 0;
    if (document.hidden || paused) { last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1/60;
    last = now;
    const moving = mouse.update(reduced.matches ? 2 : dt);
    const swaying = Math.abs(sway) + Math.abs(velocity) > .0008;
    if (swaying) {
      // Integrate in small steps even if a previous frame took a long time.
      const steps = Math.ceil(dt * 120) || 1;
      for (let i=0; i<steps; i++) {
        velocity -= (75*sway + 8*velocity) * dt/steps;
        sway += velocity * dt/steps;
      }
    } else { sway = 0; velocity = 0; }
    foliage.rotation.z = sway;
    const seconds = reduced.matches ? 0 : now / 1000;
    if (powered) {
      keyboard.updateLights(seconds);
      mouse.updateLights(seconds);
    }
    if ((moving || swaying) && now - lastShadow > 90) {
      renderer.shadowMap.needsUpdate = true;
      lastShadow = now;
    }
    renderer.render(scene, camera);
    if (moving || swaying || (powered && !reduced.matches)) frame = requestAnimationFrame(draw);
    else last = 0;
  }
  function invalidate() {
    if (!frame && !paused && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function fit() {
    const rect = canvas.getBoundingClientRect();
    resize(rect.width, rect.height, Math.min(window.devicePixelRatio || 1, 2));
    scene.updateMatrixWorld(true);
    function controlRect(object, minimum) {
      bounds.setFromObject(object);
      const projected = [];
      for (const x of [bounds.min.x,bounds.max.x])
        for (const y of [bounds.min.y,bounds.max.y])
          for (const z of [bounds.min.z,bounds.max.z])
            projected.push(project(new THREE.Vector3(x,y,z)));
      const xs = projected.map(p => p.x), ys = projected.map(p => p.y);
      const left = Math.min(...xs), top = Math.min(...ys);
      const w = Math.max(...xs) - left, h = Math.max(...ys) - top;
      const width = Math.max(minimum,w), height = Math.max(minimum,h);
      return {left:left+(w-width)/2, top:top+(h-height)/2, width, height};
    }
    foliageBounds = controlRect(foliage,0);
    const screenQuad = glassCorners.map(corner => project(screen.localToWorld(corner.clone())));
    onResize(controlRect(chassis.powerButton,28), controlRect(lamp.housing,32), screenQuad);
    invalidate();
  }
  fit();
  reduced.addEventListener('change', invalidate);
  return {
    resize: fit,
    pressKey(code, down) { keyboard.press(code, down); renderer.shadowMap.needsUpdate = true; invalidate(); },
    moveMouse(nx, ny, immediate = false) {
      mouse.move(nx, ny);
      if (immediate) mouse.update(2);
      const x = (nx + 1) * canvas.clientWidth / 2;
      const y = (ny + 1) * canvas.clientHeight / 2;
      const b = foliageBounds;
      if (lastPointer && !reduced.matches && x >= b.left && x <= b.left+b.width &&
          y >= b.top && y <= b.top+b.height) {
        velocity = THREE.MathUtils.clamp(velocity - (x-lastPointer.x)*.006 -
          (y-lastPointer.y)*.0015, -.85, .85);
      }
      lastPointer = {x,y};
      invalidate();
    },
    pressMouse(button, down) { mouse.press(button, down); invalidate(); },
    scroll(delta) { mouse.scroll(delta); invalidate(); },
    setPower(on) { powered = on; setPower(on); invalidate(); },
    setLamp(on) { lamp.setOn(on); invalidate(); },
    setPaused(on) { paused = on; if (!on) invalidate(); },
    hitKeyAt(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      point.set((clientX - r.left) / r.width * 2 - 1, 1 - (clientY - r.top) / r.height * 2);
      ray.setFromCamera(point, camera);
      return ray.intersectObjects(keyboard.keys, false)[0]?.object.userData.code;
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      reduced.removeEventListener('change', invalidate);
      renderer.dispose();
    }
  };
}
