import {createWelcome, fitDisplay} from './assets/machine/welcome.mjs';
import {createPrint} from './assets/machine/print.mjs';
import {createCVReader} from './assets/machine/cv-reader.mjs';
import {createDesktop} from './assets/desktop/desktop.mjs';

const stage = document.querySelector('.studio');
const viewport = stage.querySelector('.viewport');
const power = stage.querySelector('.power');
const lamp = stage.querySelector('.lamp-control');
const screen = stage.querySelector('.monitor-screen');
let machine;
let powered = true;
let lampOn = true;
let automaticClick = false;
let reading = false;
let expanded = false;
let glassCorners;
let mousePose = {x: 0, y: 0};

const welcome = createWelcome(screen, {
  pressKey(code, down) {
    if (down) keyDown(code, 'welcome');
    else keyUp(code, 'welcome');
  },
  moveMouse: moveModel,
  pressMouse(down) {
    automaticClick = down;
    machine?.pressMouse(0, automaticClick || mouseButtons.has(0));
  },
  mousePosition: () => mousePose,
  onEntered() {
    if (glassCorners) fitDisplay(screen, glassCorners);
    desktop.open();
    // Present the desktop before compiling the room's shaders.
    if (stage.dataset.renderer === 'print') {
      requestAnimationFrame(() => requestAnimationFrame(upgradeToWebGL));
    }
  },
});

const cv = createCVReader(stage, on => {
  reading = on;
  syncWelcome();
  if (on) releaseAll();
  if (on) desktop.pauseMedia();
  machine?.setPaused(reading || expanded);
});

const desktop = createDesktop(screen, {
  readCV: cv.open,
  onExpand(on) {
    expanded = on;
    machine?.setPaused(reading || expanded);
  },
});

function syncWelcome() {
  const visible = Boolean(machine) && powered && !document.hidden;
  welcome.setActive(visible && !reading, visible);
}

function positionControls(powerRect, lampRect, glass) {
  glassCorners = glass;
  fitDisplay(screen, glass);
  for (const [button, rect] of [[power,powerRect],[lamp,lampRect]]) {
    if (!rect) continue;
    for (const name of ['left', 'top', 'width', 'height']) {
      button.style[name] = rect[name] + 'px';
    }
    button.hidden = false;
  }
}

function switchRenderer(next, name) {
  machine?.stop();
  machine = next;
  stage.dataset.renderer = name;
  machine.setPower(powered);
  machine.setLamp(lampOn);
  machine.moveMouse(mousePose.x, mousePose.y, true);
  for (const code of pressedAt.keys()) machine.pressKey(code, true);
  for (const button of mouseButtons) machine.pressMouse(button, true);
  if (automaticClick) machine.pressMouse(0, true);
  machine.setPaused(reading || expanded);
}

async function upgradeToWebGL() {
  try {
    const {createWorkstation} = await import('./assets/machine/workstation.mjs');
    const next = await createWorkstation(viewport, positionControls);
    switchRenderer(next, 'webgl');
  } catch (error) {
    console.info('Using the rendered workstation view.', error.message);
  }
}

async function start() {
  try {
    switchRenderer(await createPrint(stage, positionControls), 'print');
  } catch {
    await upgradeToWebGL();
  }
  syncWelcome();
  let previousSize = [stage.clientWidth, stage.clientHeight];
  new ResizeObserver(() => {
    const size = [stage.clientWidth, stage.clientHeight];
    if (size[0] !== previousSize[0] || size[1] !== previousSize[1]) {
      machine?.resize();
      cv.resize();
    }
    previousSize = size;
  }).observe(stage);
  viewport.addEventListener('webglcontextlost', async (event) => {
    event.preventDefault();
    if (stage.dataset.renderer === 'webgl') {
      switchRenderer(await createPrint(stage, positionControls), 'print');
    }
  }, {once: true});
}

// A directly tapped key and a physical key may own the same switch at once.
// Keep a short minimum travel time so a quick tap survives the next paint.
const held = new Map();
const releaseTimers = new Map();
const pressedAt = new Map();
function keyDown(code, source) {
  if (!code) return;
  if (!held.has(code)) held.set(code, new Set());
  const owners = held.get(code);
  if (owners.has(source)) return;
  owners.add(source);
  clearTimeout(releaseTimers.get(code));
  releaseTimers.delete(code);
  pressedAt.set(code, performance.now());
  machine?.pressKey(code, true);
}

function keyUp(code, source) {
  const owners = held.get(code);
  if (!owners?.delete(source) || owners.size) return;
  held.delete(code);
  if (source === 'welcome') {
    pressedAt.delete(code);
    machine?.pressKey(code, false);
    return;
  }
  const delay = Math.max(0, 100 - (performance.now() - pressedAt.get(code)));
  releaseTimers.set(code, setTimeout(() => {
    releaseTimers.delete(code);
    pressedAt.delete(code);
    machine?.pressKey(code, false);
  }, delay));
}

window.addEventListener('keydown', event => {
  if (reading) return;
  keyDown(event.code, 'hardware');
  if (!event.repeat && event.key === 'Enter' && !event.target.closest?.('button') && welcome.tryEnter()) {
    event.preventDefault();
  }
});
window.addEventListener('keyup', event => keyUp(event.code, 'hardware'));

const contacts = new Map();
const mouseButtons = new Set();
const buttonMasks = [1, 4, 2, 8, 16];
function syncButtons(buttons) {
  buttonMasks.forEach((mask, button) => {
    const down = (buttons & mask) !== 0;
    if (down === mouseButtons.has(button)) return;
    if (down) mouseButtons.add(button);
    else mouseButtons.delete(button);
    machine?.pressMouse(button, down || (button === 0 && automaticClick));
  });
}
function moveModel(x, y) {
  mousePose = {x, y};
  machine?.moveMouse(x, y);
}
function move(event) {
  if (welcome.steeringMouse) return;
  const rect = stage.getBoundingClientRect();
  moveModel(2 * (event.clientX - rect.left) / rect.width - 1,
    2 * (event.clientY - rect.top) / rect.height - 1);
}
stage.addEventListener('pointermove', event => {
  if (event.isPrimary) move(event);
  if (event.pointerType === 'mouse') syncButtons(event.buttons);
});
stage.addEventListener('pointerdown', event => {
  if (event.isPrimary) move(event);
  if (event.pointerType === 'mouse' || event.isPrimary) syncButtons(event.buttons);
  if (event.button !== 0 || event.target.closest('button, .portfolio-desktop')) return;
  const code = machine?.hitKeyAt(event.clientX, event.clientY);
  if (code) {
    contacts.set(event.pointerId, code);
    keyDown(code, event.pointerId);
    if (code === 'Enter' || code === 'NumpadEnter') welcome.tryEnter();
    stage.setPointerCapture(event.pointerId);
  }
});
function endContact(event) {
  const code = contacts.get(event.pointerId);
  if (code) keyUp(code, event.pointerId);
  contacts.delete(event.pointerId);
  if (event.pointerType === 'mouse' || event.isPrimary) syncButtons(event.buttons);
}
window.addEventListener('pointerup', endContact);
window.addEventListener('pointercancel', endContact);
stage.addEventListener('lostpointercapture', endContact);
stage.addEventListener('wheel', event => {
  if (!event.ctrlKey) machine?.scroll(event.deltaY * (event.deltaMode === 1 ? 16 : 1));
}, {passive: true});

function releaseAll() {
  for (const id of releaseTimers.values()) clearTimeout(id);
  for (const code of pressedAt.keys()) machine?.pressKey(code, false);
  releaseTimers.clear();
  pressedAt.clear();
  held.clear();
  contacts.clear();
  syncButtons(0);
}
window.addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => {
  syncWelcome();
  if (document.hidden) {
    releaseAll();
    desktop.pauseMedia();
  }
  else machine?.resize();
});
power.addEventListener('click', () => {
  powered = !powered;
  power.setAttribute('aria-pressed', String(powered));
  machine?.setPower(powered);
  if (!powered) desktop.pauseMedia();
  syncWelcome();
});

lamp.addEventListener('click', () => {
  lampOn = !lampOn;
  lamp.setAttribute('aria-pressed', String(lampOn));
  machine?.setLamp(lampOn);
});

start();
