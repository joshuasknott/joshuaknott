import {fitQuad} from './projection.mjs';
import {createCVHands} from './cv-hands.mjs';
import {createPaperBend} from './cv-paper.mjs';

// Projected A4 corners on the desk, measured in the scene's 1200 × 710 frame.
const deskCorners = [[263, 473], [441, 480], [386, 573], [189, 563]];
const sheetWidth = 600;
const sheetHeight = sheetWidth * 297 / 210;

function easeBetween(x, start, end) {
  const t = Math.max(0, Math.min(1, (x - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

function cornersOf(rect) {
  return [
    {x: rect.left, y: rect.top}, {x: rect.right, y: rect.top},
    {x: rect.right, y: rect.bottom}, {x: rect.left, y: rect.bottom},
  ];
}

export function createCVReader(stage, onReading) {
  const desk = stage.querySelector('.desk-cv');
  const print = stage.querySelector('.print');
  const reader = document.querySelector('.cv-reader');
  const scroll = reader.querySelector('.reader-scroll');
  const page = reader.querySelector('.cv-page');
  const flying = reader.querySelector('.flying-cv');
  const back = reader.querySelector('.reader-back');
  const minus = reader.querySelector('.zoom-out');
  const plus = reader.querySelector('.zoom-in');
  const zoomLabel = reader.querySelector('.reader-zoom');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let resting, facing;
  let zoom = 1;
  let fraction = 0;
  let frame = 0;
  let opening = false;
  let textLayer;
  let returnFocus = desk;
  let afterClose;
  let readFrame = 0;
  let pendingPickup;
  const hands = createCVHands(reader.querySelector('.cv-hands'));
  const bendPaper = createPaperBend(flying, desk.querySelector('img'), sheetWidth, sheetHeight);

  async function loadTextLayer() {
    const response = await fetch(new URL('../documents/cv-page.html', import.meta.url));
    if (!response.ok) throw new Error('CV text unavailable');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const layer = doc.querySelector('.cv-page-layer');
    if (layer) {
      page.append(document.importNode(layer, true));
      page.querySelector('img').alt = '';
    }
  }

  function sizePage() {
    const padding = parseFloat(getComputedStyle(scroll).paddingLeft) * 2;
    const width = Math.min(820, scroll.clientWidth - padding);
    page.style.setProperty('--page-width', Math.round(width * zoom) + 'px');
    minus.disabled = zoom <= 1;
    plus.disabled = zoom >= 2.5;
    zoomLabel.textContent = Math.round(zoom * 100) + '%';
  }

  function resize() {
    const r = print.getBoundingClientRect();
    resting = deskCorners.map(([x, y]) => ({
      x: r.left + x * r.width / 1200, y: r.top + y * r.height / 710,
    }));
    const parent = stage.getBoundingClientRect();
    fitQuad(desk, resting.map(p => ({x: p.x - parent.left, y: p.y - parent.top})), sheetWidth, sheetHeight);
    desk.hidden = false;
    if (reader.open) {
      sizePage();
      facing = cornersOf(page.getBoundingClientRect());
      if (reader.classList.contains('is-travelling')) paint(fraction);
      else refreshHands();
    }
  }

  function refreshHands() {
    if (!reader.open || readFrame || reader.classList.contains('is-travelling')) return;
    readFrame = requestAnimationFrame(() => {
      readFrame = 0;
      if (!reader.open || reader.classList.contains('is-travelling')) return;
      if (reduced.matches) hands.clear();
      else hands.draw(cornersOf(page.getBoundingClientRect()), 1, 1);
    });
  }

  function paint(progress) {
    const t = easeBetween(progress, .445, 1);
    // The first thumb closes at .305. Let it peel its corner up while the
    // opposite edge still rests on the desk. The same path settles on return.
    const curl = easeBetween(progress, .305, .445) * (1 - easeBetween(progress, .47, .75));
    const lift = Math.sin(t * Math.PI) * Math.min(115, innerHeight * .14);
    const points = resting.map((p, i) => ({
      x: p.x + (facing[i].x - p.x) * t,
      y: p.y + (facing[i].y - p.y) * t - lift * (i < 2 ? 1 : .75),
    }));
    // Hand over to the desk copy only when the last corner has settled.
    const onDesk = t === 0 && curl === 0;
    reader.classList.toggle('is-on-desk', onDesk);
    desk.style.visibility = onDesk ? '' : 'hidden';
    reader.dataset.phase = pendingPickup ? 'loading' : opening ?
      (t > 0 ? 'lift' : progress >= .26 ? 'grasp' : 'reach') :
      (t > 0 ? 'lower' : progress > .25 ? 'release' : 'withdraw');
    fitQuad(flying, points, sheetWidth, sheetHeight);
    const deskDepth = resting[3].y - resting[0].y;
    const pageDepth = Math.max(deskDepth, points[3].y - points[0].y);
    const gripOffset = bendPaper(reduced.matches ? 0 : curl * deskDepth / pageDepth);
    flying.style.setProperty('--tab-opacity', String(1 - Math.min(1, t * 7)));
    reader.style.setProperty('--shade', String(.76 * t));
    reader.style.setProperty('--blur', (5 * t).toFixed(2) + 'px');
    flying.style.filter = 'brightness(' + (.9 + .1 * t) + ')';
    if (!reduced.matches) hands.draw(points, progress, t, gripOffset);
    else hands.clear();
  }

  function travel(to) {
    pendingPickup = undefined;
    cancelAnimationFrame(frame);
    opening = to === 1;
    const from = fraction;
    const duration = reduced.matches ? 0 : Math.abs(to - from) * (opening ? 1340 : 1190);
    const start = performance.now();
    reader.classList.add('is-travelling');
    function step(now) {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      fraction = from + (to - from) * t;
      paint(fraction);
      if (t < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      frame = 0;
      reader.classList.remove('is-travelling');
      if (opening) {
        reader.dataset.phase = 'reading';
        refreshHands();
      } else {
        hands.clear();
        reader.classList.remove('is-on-desk');
        reader.removeAttribute('data-phase');
        desk.style.visibility = '';
        reader.close();
        onReading(false);
        afterClose?.();
        afterClose = undefined;
        (returnFocus.isConnected ? returnFocus : desk).focus({preventScroll: true});
      }
    }
    step(start);
  }

  function open(opener = desk, onReturn) {
    if (reader.open) {
      if (!opening) travel(1);
      return;
    }
    returnFocus = opener;
    afterClose = onReturn;
    onReading(true);
    reader.classList.add('is-travelling');
    reader.showModal();
    zoom = 1;
    sizePage();
    scroll.scrollTo(0, 0);
    facing = cornersOf(page.getBoundingClientRect());
    textLayer ??= loadTextLayer().catch(() => { textLayer = undefined; });
    if (reduced.matches || hands.prepared) {
      travel(1);
      return;
    }
    const request = Symbol();
    pendingPickup = request;
    opening = true;
    paint(fraction);
    hands.ready.then(() => {
      if (pendingPickup === request && reader.open) travel(1);
    });
  }

  function putDown() {
    if (!reader.open || !opening) return;
    if (!reader.classList.contains('is-travelling')) facing = cornersOf(page.getBoundingClientRect());
    travel(0);
  }

  function changeZoom(next) {
    if (frame) return;
    const viewport = scroll.getBoundingClientRect();
    const centerX = viewport.left + scroll.clientWidth / 2;
    const centerY = viewport.top + scroll.clientHeight / 2;
    const before = page.getBoundingClientRect();
    const relativeX = (centerX - before.left) / before.width;
    const relativeY = (centerY - before.top) / before.height;
    zoom = Math.min(2.5, Math.max(1, next));
    sizePage();
    const after = page.getBoundingClientRect();
    scroll.scrollBy(after.left + relativeX * after.width - centerX,
      after.top + relativeY * after.height - centerY);
    refreshHands();
  }

  desk.addEventListener('click', () => open(desk));
  back.addEventListener('click', putDown);
  reader.addEventListener('cancel', event => { event.preventDefault(); putDown(); });
  scroll.addEventListener('click', event => { if (event.target === scroll) putDown(); });
  scroll.addEventListener('scroll', refreshHands, {passive: true});
  reduced.addEventListener('change', () => {
    if (!reader.open) return;
    if (pendingPickup && !reduced.matches) return;
    if (reader.classList.contains('is-travelling')) travel(opening ? 1 : 0);
    else refreshHands();
  });
  minus.addEventListener('click', () => changeZoom(zoom - .5));
  plus.addEventListener('click', () => changeZoom(zoom + .5));
  resize();
  return {resize, open};
}
