const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('activity uses the newest successful snapshot and retains it on remote failure', async () => {
  const elements = new Map(['contributions', 'contributions-grid', 'contributions-count', 'last-updated'].map(id => [id, { replaceChildren() {} }]));
  const requests = new Map();
  const document = {
    documentElement: { dataset: {} },
    querySelector: () => null, querySelectorAll: () => [],
    getElementById: id => elements.get(id),
    createElement: () => ({ dataset: {}, setAttribute() {}, appendChild() {} }),
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../main.js'), 'utf8'), {
    document, window: { addEventListener() {}, scrollY: 0 }, AbortSignal,
    fetch: url => new Promise((resolve, reject) => requests.set(url, { resolve, reject })),
  });
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const snapshot = (total, date) => ({ totalContributions: total, updatedAt: '2026-09-01T00:00:00Z', contributionsUpdatedAt: date, days: [{ date: '2026-09-17', count: 1 }] });
  requests.get('data/stats.json').resolve({ ok: true, json: async () => snapshot(2011, '2026-09-17T17:00:00Z') });
  await flush();
  assert.match(elements.get('contributions-count').textContent, /2,011/);
  assert.equal(elements.get('last-updated').dateTime, '2026-09-17T17:00:00.000Z');
  requests.get('https://raw.githubusercontent.com/joshuasknott/joshuaknott/main/data/stats.json').resolve({ ok: true, json: async () => snapshot(2002, '2026-09-17T15:00:00Z') });
  await flush();
  assert.match(elements.get('contributions-count').textContent, /2,011/);

  // A new page load with an unavailable remote still renders its local data.
  requests.clear();
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../main.js'), 'utf8'), {
    document, window: { addEventListener() {}, scrollY: 0 }, AbortSignal,
    fetch: url => new Promise((resolve, reject) => requests.set(url, { resolve, reject })),
  });
  requests.get('data/stats.json').resolve({ ok: true, json: async () => snapshot(2011, '2026-09-17T17:00:00Z') });
  requests.get('https://raw.githubusercontent.com/joshuasknott/joshuaknott/main/data/stats.json').reject(new Error('Offline'));
  await flush();
  assert.match(elements.get('contributions-count').textContent, /2,011/);
});
