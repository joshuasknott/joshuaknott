import {createMouseLights} from './mouse-lights.mjs';
import {createKeyboardGlow} from './keyboard-glow.mjs';
import {mountActivityPrint} from './activity-artwork.mjs';

// The photographed scene handles the intro and browsers using a software GPU.
export async function createPrint(stage, onResize) {
  const print = stage.querySelector('.print');
  const chassis = print.querySelector('.machine-print');
  const initialMouse = print.querySelector('.initial-mouse');
  const asset = file => new URL(file, import.meta.url).href;
  const response = await fetch(asset('print-map.json'));
  if (!response.ok) throw new Error('The workstation interaction map could not load.');
  const map = await response.json();
  const keys = new Map(map.keys.map(key => [key.code, key.poly]));
  function loadMouse(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('The mouse image could not load.'));
      image.src = asset(file);
    });
  }
  const [mouse, leftMouse] = await Promise.all([
    loadMouse('mouse.webp'), loadMouse('mouse-left.webp').catch(() => null)
  ]);
  const mouseLights = createMouseLights(mouse);
  const leftLights = leftMouse && createMouseLights(leftMouse);
  const keyboardGlow = createKeyboardGlow(print, map);
  const poster = mountActivityPrint(print, map.artwork);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const layer = document.createElement('canvas');
  layer.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  print.appendChild(layer);
  const ctx = layer.getContext('2d');
  const held = new Set(), buttons = new Set();
  let nx = 0, ny = 0, powered = true, lampOn = true, wheelCue = 0;
  let wheelTimer = 0, frame = 0;
  let paused = false;
  const unlitMouse = new Image();
  unlitMouse.onload = invalidate;
  unlitMouse.onerror = () => unlitMouse.removeAttribute('src');
  const lampLit = {on:'workstation.webp', off:'workstation-off.webp'};
  const lampDark = {on:'workstation-lamp-off.webp', off:'workstation-all-off.webp'};
  function showRoom() {
    const room = lampOn ? lampLit : lampDark;
    const next = asset(room[powered ? 'on' : 'off']);
    if (chassis.src !== next) chassis.src = next;
    invalidate();
  }

  function drawMouse(seconds) {
    const [mx, my, mw, mh] = map.mouse;
    const x = mx * layer.width / 100, y = my * layer.height / 100;
    const w = mw * layer.width / 100, h = mh * layer.height / 100;
    const wheel = map.wheel ?? [mx + 0.47 * mw, my + 0.55 * mh];
    const dx = nx * layer.width * 0.026;
    const dy = ny * layer.height * 0.032;
    const leftOnly = powered && leftMouse !== null && buttons.size === 1 && buttons.has(0);
    const depression = buttons.size && !leftOnly ? h * 0.015 : 0;
    let mouseImage = powered ? (leftOnly ? leftLights : mouseLights).at(seconds) : mouse;
    if (!powered && unlitMouse.complete && unlitMouse.naturalWidth) mouseImage = unlitMouse;
    ctx.drawImage(mouseImage, x + dx, y + dy + depression, w, h);
    if (wheelCue || buttons.has(1)) {
      const wx = wheel[0] * layer.width / 100 + dx;
      const wy = wheel[1] * layer.height / 100 + dy + depression;
      ctx.lineWidth = Math.max(1, layer.width * 0.0016);
      ctx.strokeStyle = powered ? '#a7f5ff' : '#64686e';
      ctx.beginPath();
      ctx.moveTo(wx - w * 0.018, wy + wheelCue * h * 0.010);
      ctx.lineTo(wx + w * 0.018, wy + wheelCue * h * 0.010);
      ctx.stroke();
    }
  }

  function draw(now) {
    frame = 0;
    if (document.hidden || paused) return;
    const seconds = reduced.matches ? 0 : now / 1000;
    ctx.clearRect(0, Math.floor(layer.height * .76), layer.width, layer.height);
    if (powered) keyboardGlow.updateLighting(seconds);
    drawMouse(seconds);
    if (initialMouse) initialMouse.style.visibility = 'hidden';
    const travel = Math.max(1, layer.height * 0.0028);
    const drawCap = chassis.complete && chassis.naturalWidth;
    for (const code of held) {
      const points = keys.get(code);
      ctx.save();
      ctx.beginPath();
      points.forEach(([u, v], i) => {
        const x = u * layer.width / 100, y = v * layer.height / 100;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#0c1117';
      ctx.fillRect(0, 0, layer.width, layer.height);
      if (drawCap) ctx.drawImage(chassis, 0, travel, layer.width, layer.height);
      const color = powered ? keyboardGlow.colorForKey(code) : 0x060a10;
      ctx.fillStyle = '#' + color.toString(16).padStart(6, '0') + (powered ? '70' : '4d');
      ctx.fillRect(0, 0, layer.width, layer.height);
      ctx.restore();
    }
    if (powered && !reduced.matches) invalidate();
  }
  function invalidate() {
    if (!frame && !paused && !document.hidden) frame = requestAnimationFrame(draw);
  }
  chassis.addEventListener('load', invalidate);
  reduced.addEventListener('change', invalidate);

  function resize() {
    const rect = print.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    layer.width = Math.max(1, Math.round(rect.width * dpr));
    layer.height = Math.max(1, Math.round(rect.height * dpr));
    keyboardGlow.resize();
    poster.resize();
    function buttonRect([u, v, w, h], minimum) {
      const width = Math.max(minimum, w * rect.width / 100);
      const height = Math.max(minimum, h * rect.height / 100);
      return {
        left: rect.left - stageRect.left + (u + w / 2) * rect.width / 100 - width / 2,
        top: rect.top - stageRect.top + (v + h / 2) * rect.height / 100 - height / 2,
        width, height
      };
    }
    const screenQuad = map.screen.map(([u, v]) => ({
      x: rect.left - stageRect.left + u * rect.width / 100,
      y: rect.top - stageRect.top + v * rect.height / 100,
    }));
    onResize(buttonRect(map.power, 25), map.lamp && buttonRect(map.lamp, 30), screenQuad);
    invalidate();
  }

  function hitKeyAt(clientX, clientY) {
    const rect = print.getBoundingClientRect();
    const x = (clientX - rect.left) * 100 / rect.width, y = (clientY - rect.top) * 100 / rect.height;
    for (const [code, poly] of keys) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [ax, ay] = poly[i], [bx, by] = poly[j];
        if ((ay > y) !== (by > y) && x < ax + (bx - ax) * (y - ay) / (by - ay)) inside = !inside;
      }
      if (inside) return code;
    }
  }
  resize();
  return {
    resize, hitKeyAt,
    pressKey(code, down) {
      if (!keys.has(code) || held.has(code) === down) return;
      if (down) held.add(code); else held.delete(code);
      invalidate();
    },
    moveMouse(x, y) {
      nx = Math.max(-1, Math.min(1, x));
      ny = Math.max(-1, Math.min(1, y));
      invalidate();
    },
    pressMouse(button, down) {
      if (down) buttons.add(button); else buttons.delete(button);
      invalidate();
    },
    scroll(delta) {
      wheelCue = Math.sign(delta);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelCue = 0; invalidate(); }, 100);
      invalidate();
    },
    setPower(on) {
      powered = on;
      keyboardGlow.setPower(on);
      if (!on && !unlitMouse.hasAttribute('src')) unlitMouse.src = asset('mouse-off.webp');
      showRoom();
    },
    setLamp(on) {
      lampOn = on;
      showRoom();
    },
    setPaused(on) { paused = on; if (!on) invalidate(); },
    stop() {
      clearTimeout(wheelTimer);
      cancelAnimationFrame(frame);
      unlitMouse.onload = null;
      unlitMouse.onerror = null;
      chassis.removeEventListener('load', invalidate);
      reduced.removeEventListener('change', invalidate);
      keyboardGlow.stop();
      poster.remove();
      layer.remove();
      if (initialMouse) initialMouse.style.visibility = '';
    }
  };
}
