import {beachLayout, paintBeach, paintTide} from './sunset-scene.mjs';

function fitCanvas(ctx) {
  const canvas = ctx.canvas;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const density = Math.min(window.devicePixelRatio, 1.5, 1280 / width, 900 / height);
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  return beachLayout(width, height);
}

export function createSunset(desktop) {
  const canvas = desktop.querySelector('.desktop-sunset');
  const monitor = desktop.closest('.monitor-screen');
  const welcome = monitor.querySelector('.welcome-sunset');
  const ctx = canvas.getContext('2d', {alpha: false});
  const greetingCtx = welcome.getContext('2d', {alpha: false});
  if (!ctx || typeof Path2D === 'undefined') return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cv = document.querySelector('.cv-reader');
  const coast = document.createElement('canvas');
  const coastCtx = coast.getContext('2d', {alpha: false});
  let scene;
  let visible = true;
  let time = 0, frame = 0, last = 0;

  function active() {
    return visible && !desktop.hidden && !monitor.hidden && !desktop.hasAttribute('data-open') &&
      !document.hidden && !cv?.open && canvas.clientWidth > 0 && canvas.clientHeight > 0;
  }

  function paintWater() {
    const top = Math.floor(scene.horizon * canvas.height / scene.height);
    const y = top * scene.height / canvas.height;
    ctx.drawImage(coast, 0, top, coast.width, coast.height - top, 0, y, scene.width, scene.height - y);
    paintTide(ctx, scene, motion.matches ? 0 : time * .35);
  }

  function animate(now) {
    frame = 0;
    if (!active() || motion.matches) return;
    time += Math.min(.05, (now - last) / 1000);
    last = now;
    paintWater();
    frame = requestAnimationFrame(animate);
  }

  function refresh() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!active()) return;
    if (scene?.width !== canvas.clientWidth || scene?.height !== canvas.clientHeight) {
      scene = fitCanvas(ctx);
      coast.width = canvas.width;
      coast.height = canvas.height;
      coastCtx.setTransform(coast.width / scene.width, 0, 0, coast.height / scene.height, 0, 0);
      paintBeach(coastCtx, scene);
    }
    ctx.drawImage(coast, 0, 0, scene.width, scene.height);
    paintWater();
    if (!motion.matches) {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }

  motion.addEventListener('change', refresh);
  const changes = new MutationObserver(refresh);
  changes.observe(desktop, {attributes: true, attributeFilter: ['hidden', 'data-open']});
  changes.observe(monitor, {attributes: true, attributeFilter: ['hidden']});
  if (cv) changes.observe(cv, {attributes: true, attributeFilter: ['open']});
  new ResizeObserver(refresh).observe(canvas);
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting === visible) return;
    visible = entry.isIntersecting;
    refresh();
  }).observe(canvas);
  document.addEventListener('visibilitychange', refresh);

  if (greetingCtx) new ResizeObserver(() => {
    if (!welcome.clientWidth || !welcome.clientHeight) return;
    const layout = fitCanvas(greetingCtx);
    paintBeach(greetingCtx, layout);
    paintTide(greetingCtx, layout, 0);
  }).observe(welcome);
  refresh();
}
