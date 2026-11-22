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
    for (const asset of [project.cover, project.image, project.video].filter(Boolean)) {
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

test("project recordings retain evidence limitations without inventing website capture notes", async () => {
  const { projects } = await portfolioFromPage();
  for (const project of projects.filter(project => project.video)) {
    assert.match(project.note, /Recorded.*2026/, project.id);
  }
  assert.match(projects.find(project => project.id === "betwfriends").note, /demo credit.*not tested/);
  assert.match(projects.find(project => project.id === "pianoforte").note, /silent.*not verified/);
  assert.equal(projects.find(project => project.id === "surrey-ai").note, undefined);
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
