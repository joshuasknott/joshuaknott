const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "../..");

async function portfolioFromPage() {
  const { readPortfolio } = await import("../../assets/desktop/portfolio.mjs");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const record = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  return readPortfolio(JSON.parse(record[1])["@graph"]);
}

test("every desktop project has real local media and contact destinations match the CV", async () => {
  const { projects, contacts } = await portfolioFromPage();
  assert.deepEqual(projects.slice(0, 3).map(project => project.id), ["mivlet", "memvella", "ollo"]);
  assert.equal(new Set(projects.map(project => project.id)).size, 13);
  for (const project of projects) {
    assert.ok(project.name && project.description && project.alt, project.id);
    assert.equal(project.cover, undefined, 'cards use real project screenshots');
    for (const asset of [project.image, project.video].filter(Boolean)) {
      assert.ok(fs.statSync(path.join(root, asset)).isFile(), asset);
    }
  }
  const cv = fs.readFileSync(path.join(root, "assets/documents/cv-page.html"), "utf8");
  for (const contact of contacts) assert.ok(cv.includes(contact.href.replace(/\/$/, "")), contact.href);
});

test("the local portfolio guide distinguishes named projects, CV facts and missing details", async () => {
  const { createGuide } = await import("../../assets/desktop/guide.mjs");
  const answer = createGuide(await portfolioFromPage());
  const funding = await answer("Which project received funding?", []);
  assert.equal(funding.matches[0].route, "memvella");
  assert.match(funding.text, /£1,500/);
  assert.equal((await answer("Tell me more about it", [funding])).matches[0].route, "memvella");
  assert.match((await answer("When does Josh graduate?", [])).text, /June 2027/);
  assert.match((await answer("How can I get in touch?", [])).text, /joshhknott@gmail\.com/);
  assert.match((await answer("Pianoforte", [])).text, /live AI tutor replies were not verified/);
  assert.equal((await answer("What is his favourite ice cream?", [])).matches.length, 0);
});

test("the no-script portfolio retains every catalog project and a direct CV link", async () => {
  const { projects } = await portfolioFromPage();
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const fallback = html.match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
  const ids = [...fallback.matchAll(/data-fallback-project="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids, projects.map(project => project.id));
  assert.match(fallback, /href="assets\/documents\/Joshua-Knott-CV.pdf"/);
  assert.match(fallback, /href="mailto:joshhknott@gmail.com"/);
});

test("project recordings retain evidence limitations and refreshed websites have capture dates", async () => {
  const { projects } = await portfolioFromPage();
  for (const project of projects.filter(project => project.video)) {
    assert.match(project.note, /Recorded.*2026/, project.id);
  }
  assert.match(projects.find(project => project.id === "betwfriends").note, /demo credit.*not tested/);
  assert.match(projects.find(project => project.id === "pianoforte").note, /silent.*not verified/);
  for (const id of ['memvella', 'surrey-ai', 'surrey-business', 'surrey-neurotech']) {
    const project = projects.find(project => project.id === id);
    assert.match(project.note, /22 November 2026/);
    assert.match(project.image, /2026-11\/.+-20261122.webp/);
    assert.ok(fs.statSync(path.join(root, project.image)).size < 250000);
  }
});

test("guide handles aliases, typos, specific fields, lists and navigation links", async () => {
  const {createGuide} = await import('../../assets/desktop/guide.mjs');
  const answer = createGuide(await portfolioFromPage());
  for (const [question, route] of [['memvela', 'memvella'], ['mivelt', 'mivlet'], ['token maxxer', 'tokenmaxxer'], ['mivleet', 'mivlet'], ['uni', 'about'], ['resume', 'cv'], ['reach Josh', 'contact']]) {
    const result = await answer(question);
    assert.equal(result.matches[0].route, route, question);
    assert.equal(result.links[0].route, route);
  }
  assert.match((await answer('What tech is Mivlet built with?')).text, /React and TypeScript.*Rust and Tauri/);
  assert.match((await answer('What stack is Poppyfish built with?')).text, /does not specify/);
  const source = await answer('Is Mivlet open source?');
  assert.ok(source.links.some(link => link.href === 'https://github.com/joshuasknott/mivlet'));
  assert.match(source.text, /does not establish its licence/);
  assert.match((await answer('Is Ollo open source?')).text, /No source repository/);
  assert.ok((await answer('Link to Memvella')).links.some(link => link.href === 'https://memvella.me'));
  assert.match((await answer('Link to Poppyfish')).text, /No public website/);
  assert.deepEqual((await answer('What games has he made?')).matches.map(note => note.route), ['poppycheese', 'poppyfish']);
  const aiProjects = await answer('What AI projects has Josh built?');
  const portfolio = await portfolioFromPage();
  const expectedAI = portfolio.projects.filter(project => /\bAI\b/i.test([project.label, project.topics, project.description, project.build].filter(Boolean).join(' ')));
  assert.deepEqual(aiProjects.matches.map(note => note.route), expectedAI.map(project => project.id));
  assert.ok(aiProjects.matches.some(note => note.route === 'ollo'));
  assert.ok(aiProjects.links.some(link => link.route === 'ollo'));
  const namedSociety = await answer('What AI projects did Surrey AI Society do?');
  assert.equal(namedSociety.matches[0].route, 'surrey-ai');
  assert.ok(!namedSociety.text.startsWith('AI projects in the portfolio:'));
  const presidency = await answer('What did Josh do as President of Surrey AI Society?');
  assert.equal(presidency.matches[0].route, 'about');
  assert.match(presidency.text, /President.*160\+.*14-person committee/);
  assert.equal(presidency.links[0].label, 'About Josh');
  assert.ok(presidency.related.some(link => link.route === 'surrey-ai' && link.label === 'Surrey AI Society'));
  const presidencyLinks = [...presidency.links, ...presidency.related];
  assert.equal(new Set(presidencyLinks.map(link => link.label)).size, presidencyLinks.length);
  assert.match((await answer('hello!')).text, /Hi!/);
  assert.match((await answer('thank you')).text, /welcome/);
  for (const question of ['', 'What is his favourite ice cream?']) {
    const result = await answer(question);
    assert.equal(result.suggestions.length, 3);
    assert.equal(result.matches.length, 0);
  }
  const focused = await answer('Which project received funding?');
  assert.ok(!focused.text.includes('\n\n'));
});

test("guide returns locally without waiting for the optional model, streams and handles failure", async t => {
  const {createGuide} = await import('../../assets/desktop/guide.mjs');
  const prior = globalThis.LanguageModel;
  t.after(() => { if (prior === undefined) delete globalThis.LanguageModel; else globalThis.LanguageModel = prior; });
  const answer = createGuide(await portfolioFromPage());
  let destroyed = false;
  const updates = [];
  globalThis.LanguageModel = {availability: async () => 'available', create: async () => ({
    async *promptStreaming() { yield 'Mivlet'; yield 'Mivlet is an AI workspace.'; },
    destroy() { destroyed = true; },
  })};
  const result = await answer('Mivlet', [], {onUpdate: value => updates.push(value.text)});
  assert.match(result.text, /workspace/);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(updates, ['Mivlet', 'Mivlet is an AI workspace.']);
  assert.equal(destroyed, true);
  globalThis.LanguageModel.create = async () => { throw new Error('unavailable'); };
  let fallback;
  await answer('Mivlet', [], {onUpdate: value => { fallback = value; }});
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fallback.text, result.text);
  globalThis.LanguageModel.availability = () => new Promise(() => {});
  const controller = new AbortController();
  const immediate = await answer('Mivlet', [], {signal: controller.signal, onUpdate: () => assert.fail('aborted model')});
  controller.abort();
  assert.equal(immediate.text, result.text);
});

test("coastal animation pauses when hidden, offscreen or reduced motion is requested", async t => {
  const {createSunset} = await import('../../assets/desktop/sunset.mjs');
  const names = ['window', 'document', 'Path2D', 'matchMedia', 'MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const prior = new Map(names.map(name => [name, globalThis[name]]));
  t.after(() => { for (const [name, value] of prior) { if (value === undefined) delete globalThis[name]; else globalThis[name] = value; } });
  const noop = () => {};
  let paints = 0, sequence = 0, intersect;
  const frames = new Map(), listeners = new Map();
  const context = canvas => new Proxy({canvas, drawImage() { paints++; }, createLinearGradient: () => ({addColorStop: noop}), createRadialGradient: () => ({addColorStop: noop})}, {get: (target, key) => target[key] || noop});
  const canvas = () => { const value = {clientWidth: 320, clientHeight: 180}; value.getContext = () => context(value); return value; };
  const main = canvas(), welcome = canvas();
  const monitor = {hidden: false, querySelector: () => welcome};
  const desktop = {hidden: false, hasAttribute: () => false, querySelector: () => main, closest: () => monitor};
  const motion = {matches: false, addEventListener: (_, callback) => { motion.change = callback; }};
  globalThis.window = {devicePixelRatio: 1};
  globalThis.document = {hidden: false, querySelector: () => null, createElement: canvas, addEventListener: (name, callback) => listeners.set(name, callback)};
  globalThis.Path2D = class {moveTo() {} lineTo() {} closePath() {}};
  globalThis.matchMedia = () => motion;
  globalThis.MutationObserver = class {observe() {}};
  globalThis.ResizeObserver = class {observe() {}};
  globalThis.IntersectionObserver = class {constructor(callback) { intersect = callback; } observe() {}};
  globalThis.requestAnimationFrame = callback => { frames.set(++sequence, callback); return sequence; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  createSunset(desktop);
  assert.equal(frames.size, 1);
  const before = paints;
  const [id, callback] = frames.entries().next().value;
  frames.delete(id); callback(performance.now() + 16.7);
  assert.ok(paints > before);
  document.hidden = true; listeners.get('visibilitychange')();
  assert.equal(frames.size, 0);
  document.hidden = false; listeners.get('visibilitychange')();
  assert.equal(frames.size, 1);
  intersect([{isIntersecting: false}]);
  assert.equal(frames.size, 0);
  intersect([{isIntersecting: true}]);
  motion.matches = true; motion.change();
  assert.equal(frames.size, 0);
  const still = paints;
  assert.equal(paints, still);
});

test("the workstation loads its entry point, styles and fallback from the static site", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const origin = new URL("https://example.test/");
  const tags = html.match(/<(?:img|script|link)\b[^>]*>/gi);
  const sources = [];
  for (const tag of tags) {
    if (/^<link/i.test(tag) && !/\brel="stylesheet"/i.test(tag)) continue;
    const attribute = tag.match(/\b(?:src|href)="([^"]+)"/i);
    if (attribute) sources.push(attribute[1]);
  }
  assert.ok(sources.some(source => /\.js(?:\?|$)/.test(source)), "module entry point");
  assert.ok(sources.some(source => /\.css(?:\?|$)/.test(source)), "stylesheet");
  assert.ok(sources.some(source => /\.(?:webp|png|jpe?g)(?:\?|$)/.test(source)), "fallback image");
  for (const source of sources) {
    const url = new URL(source, origin);
    assert.equal(url.origin, origin.origin, source);
    assert.ok(fs.statSync(path.join(root, decodeURIComponent(url.pathname))).isFile(), source);
  }
});

test("physical keycaps handle simultaneous keys, repeated keydowns and independent release", async (t) => {
  const THREE = await import("../../assets/machine/vendor/three.module.min.mjs");
  const { createKeyboard } = await import("../../assets/machine/keyboard.mjs");
  // The legend atlas needs a drawing surface. Geometry, switches and picking
  // use the real Three.js implementation and do not need a GPU.
  const noop = () => {};
  const prior = globalThis.document;
  globalThis.document = {
    createElement() {
      const canvas = {};
      canvas.getContext = () => ({
        canvas, save: noop, restore: noop, scale: noop, translate: noop,
        fillRect: noop, fillText: noop,
      });
      return canvas;
    },
  };
  t.after(() => {
    if (prior === undefined) delete globalThis.document;
    else globalThis.document = prior;
  });
  const keyboard = createKeyboard(THREE);
  keyboard.group.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  const visibleParts = keyboard.group.children.filter(part => part.visible);
  function capHeight(code) {
    const key = keyboard.keys.find(part => part.userData.code === code);
    assert.ok(key, code);
    ray.ray.origin.set(key.position.x, 4, key.position.z);
    ray.ray.direction.set(0, -1, 0);
    return ray.intersectObjects(visibleParts)[0].point.y;
  }
  const a = capHeight("KeyA");
  const shift = capHeight("ShiftLeft");
  keyboard.press("KeyA", true);
  const down = capHeight("KeyA");
  assert.ok(down < a);
  assert.equal(capHeight("ShiftLeft"), shift);
  keyboard.press("KeyA", true);
  keyboard.press("ShiftLeft", true);
  assert.equal(capHeight("KeyA"), down);
  assert.ok(capHeight("ShiftLeft") < shift);
  keyboard.press("KeyA", false);
  assert.equal(capHeight("KeyA"), a);
  assert.ok(capHeight("ShiftLeft") < shift);
  keyboard.press("ShiftLeft", false);
  assert.equal(capHeight("ShiftLeft"), shift);
});

async function makeMouse() {
  const THREE = await import("../../assets/machine/vendor/three.module.min.mjs");
  const { createMouse } = await import("../../assets/machine/mouse.mjs");
  return createMouse(THREE);
}

function settle(mouse) {
  for (let frame = 0; frame < 180; frame++) {
    if (!mouse.update(1 / 60)) return;
  }
  assert.fail("Mouse motion did not settle");
}

test("the physical mouse follows both pointer axes and settles at its starting position", async () => {
  const mouse = await makeMouse();
  const body = mouse.group.getObjectByName("Mouse body");
  const start = body.position.clone();
  mouse.move(1, -1);
  settle(mouse);
  assert.ok(body.position.x > start.x, "right");
  assert.ok(body.position.z < start.z, "away from the viewer");
  mouse.move(-1, 1);
  settle(mouse);
  assert.ok(body.position.x < start.x, "left");
  assert.ok(body.position.z > start.z, "towards the viewer");
  mouse.move(0, 0);
  settle(mouse);
  assert.ok(body.position.distanceTo(start) < 0.0001);
});

test("mouse switches travel independently and release while the scroll wheel turns", async () => {
  const mouse = await makeMouse();
  const left = mouse.group.getObjectByName("Left click");
  const right = mouse.group.getObjectByName("Right click");
  const wheel = mouse.group.getObjectByName("Treaded scroll wheel");
  const leftStart = left.position.y;
  const rightStart = right.position.y;
  const wheelStart = wheel.getWorldQuaternion(wheel.quaternion.clone());
  mouse.press(0, true);
  settle(mouse);
  assert.ok(left.position.y < leftStart);
  assert.equal(right.position.y, rightStart);
  mouse.press(2, true);
  mouse.press(0, false);
  mouse.scroll(120);
  settle(mouse);
  assert.equal(left.position.y, leftStart);
  assert.ok(right.position.y < rightStart);
  const wheelEnd = wheel.getWorldQuaternion(wheel.quaternion.clone());
  assert.ok(wheelStart.angleTo(wheelEnd) > 0);
  mouse.press(2, false);
  settle(mouse);
  assert.equal(right.position.y, rightStart);
});
