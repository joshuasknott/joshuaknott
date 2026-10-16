const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const projects = JSON.parse(html.match(/id="project-data"[^>]*>([\s\S]*?)<\/script>/)[1]);

function setup() {
  let document;
  function element(dataset = {}) {
    const listeners = new Map(), attributes = new Map(), classes = new Set();
    return {
      dataset, hidden: false, children: [], currentTime: 0, readyState: 0, paused: true,
      classList: {
        add: name => classes.add(name), remove: name => classes.delete(name),
        toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
        contains: name => classes.has(name),
      },
      setAttribute: (key, value) => attributes.set(key, value),
      getAttribute: key => attributes.get(key),
      hasAttribute: key => attributes.has(key),
      removeAttribute: key => attributes.delete(key),
      append(...items) { this.children.push(...items); },
      replaceChildren(...items) { this.children = items; },
      addEventListener(name, listener) {
        if (!listeners.has(name)) listeners.set(name, []);
        listeners.get(name).push(listener);
      },
      async fire(name, event = {}) {
        for (const listener of listeners.get(name) || []) await listener(event);
        await new Promise(resolve => setImmediate(resolve));
      },
      focus() { document.activeElement = this; },
      load() {}, pause() { this.paused = true; },
      async play() { this.paused = false; },
    };
  }
  const cards = projects.map(project => {
    const cover = element({ project: project.id });
    const title = element({ project: project.id });
    const card = Object.assign(element({ category: project.category }), {
      id: project.id, cover, title,
      querySelector: () => cover,
    });
    return card;
  });
  const groups = ['products', 'websites', 'experiments'].map(projectGroup => element({ projectGroup }));
  const filters = element();
  const filterButtons = ['all', 'products', 'websites', 'experiments'].map(filter => element({ filter }));
  filters.querySelectorAll = () => filterButtons;
  const ids = new Map(['filter-status', 'dialog-title', 'dialog-category', 'dialog-description',
    'dialog-mote-logo', 'capture-note', 'dialog-image', 'media-error', 'dialog-links', 'walkthrough']
    .map(id => [id, element()]));
  const closeButton = element();
  const dialog = Object.assign(element(), {
    open: false,
    showModal() { this.open = true; },
    async close() { this.open = false; await this.fire('close'); },
    querySelector: () => closeButton,
  });
  ids.set('project-dialog', dialog);
  ids.set('project-data', { textContent: JSON.stringify(projects) });
  const location = { hash: '', pathname: '/', search: '' };
  document = {
    hidden: false, activeElement: null, body: element(), documentElement: element(),
    addEventListener() {}, createElement: () => element(),
    getElementById: id => ids.get(id),
    querySelector: selector => selector === '.project-filters' ? filters : null,
    querySelectorAll: selector => ({
      '.project-card': cards, '.project-grid': groups,
      '[data-project]': cards.flatMap(card => [card.cover, card.title]),
    }[selector] || []),
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'main.js'), 'utf8'), {
    document, location, AbortSignal,
    history: { pushState(_state, _unused, url) { location.hash = url; }, replaceState() {} },
    window: {
      addEventListener() {},
      matchMedia: query => ({ matches: query.includes('pointer: fine'), addEventListener() {} }),
    },
    fetch: async () => ({ ok: false }),
  });
  const click = trigger => trigger.fire('click', { preventDefault() {} });
  return { document, cards, groups, filters, filterButtons, dialog, ids, click };
}

test('every project cover and title opens the modal, including website projects', async () => {
  const app = setup();
  for (const card of app.cards) {
    for (const trigger of [card.cover, card.title]) {
      await app.click(trigger);
      assert.equal(app.dialog.open, true, card.id);
      const project = projects.find(project => project.id === card.id);
      assert.equal(app.ids.get('dialog-title').textContent, project.name);
      assert.equal(app.ids.get('dialog-image').hidden, Boolean(project.video));
      await app.dialog.close();
      assert.equal(app.document.activeElement, trigger, 'closing restores the clicked project');
    }
  }
});

test('hover previews remain inline and stop when the project opens', async () => {
  const app = setup();
  const card = app.cards.find(card => card.id === 'mivlet');
  const preview = card.cover.children[0];
  await card.fire('pointerenter', { pointerType: 'mouse' });
  assert.equal(preview.paused, false);
  assert.equal(card.classList.contains('is-playing'), true);
  await card.fire('pointerleave');
  assert.equal(preview.paused, true);
  await card.fire('pointerenter', { pointerType: 'mouse' });
  await app.click(card.cover);
  assert.equal(preview.paused, true);
  assert.equal(app.dialog.open, true);
});

test('category filters hide empty groups as well as nonmatching cards', async () => {
  const app = setup();
  for (const button of app.filterButtons) {
    await app.filters.fire('click', { target: { closest: () => button } });
    assert.deepEqual(app.groups.filter(group => !group.hidden).map(group => group.dataset.projectGroup),
      button.dataset.filter === 'all' ? ['products', 'websites', 'experiments'] : [button.dataset.filter]);
    for (const card of app.cards) {
      assert.equal(card.hidden, button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
    }
  }
});
