import {beachLayout, hand, paintBall, paintBeach, paintPlayer, paintTide} from './sunset-scene.mjs';

const tossTime = .74;
const returnAt = tossTime + .29;
const playerReach = .74;
const friendReach = .94;

function fitCanvas(ctx) {
  const canvas = ctx.canvas;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const density = Math.min(window.devicePixelRatio, 1.5, 1780 / width, 1320 / height);
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  return beachLayout(width, height);
}

function arc(from, to, progress, lift) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress - Math.sin(Math.PI * progress) * lift,
  };
}

function drawRally(ctx, scene, round, catching, still) {
  const {player, friend, width, height} = scene;
  const playerHand = hand(player, playerReach);
  const friendHand = hand(friend, friendReach);
  const radius = Math.max(2.5, player.size * .103);
  let ball = playerHand;
  let reach = .34;
  let rotation = -.25;

  if (round) {
    const lift = Math.min(width * .097, height * .108);
    const {age, returnFlight} = round;
    reach += (friendReach - reach) * Math.min(1, age / tossTime);
    rotation += age * 6.5;
    if (still) {
      ball = {x: playerHand.x + radius * 2.6, y: playerHand.y - radius * 1.1};
    } else if (age < tossTime) {
      ball = arc(playerHand, friendHand, age / tossTime, lift * .77);
    } else if (age < returnAt) {
      ball = friendHand;
    } else {
      const progress = (age - returnAt) / returnFlight;
      ball = arc(friendHand, playerHand, Math.min(1, progress), lift);
      if (progress > 1) {
        // A late return drops into the sand in front of the player's feet.
        const fall = Math.min(1, (age - returnAt - returnFlight) / .60);
        ball.x -= radius * fall;
        ball.y += (player.y - radius - playerHand.y) * fall ** 2;
      }
    }
  }

  paintPlayer(ctx, friend, reach);
  paintPlayer(ctx, player, playerReach);
  if (catching) {
    ctx.beginPath();
    ctx.arc(playerHand.x, playerHand.y, radius * 1.75, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(1, radius * .17);
    ctx.strokeStyle = '#fff3cd';
    ctx.setLineDash([radius * .46, radius * .37]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  const drawn = {x: ball.x, y: ball.y - radius * .46, radius};
  paintBall(ctx, drawn.x, drawn.y, radius, rotation);
  return drawn;
}

export function createSunset(desktop, expandIfSmall) {
  const canvas = desktop.querySelector('.desktop-sunset');
  const monitor = desktop.closest('.monitor-screen');
  const welcome = monitor.querySelector('.welcome-sunset');
  const ctx = canvas.getContext('2d', {alpha: false});
  const greetingCtx = welcome.getContext('2d', {alpha: false});
  if (!ctx || typeof Path2D === 'undefined') return;
  const game = desktop.querySelector('.sunset-game');
  const button = game.querySelector('.sunset-pass');
  const label = button.querySelector('span');
  const score = game.querySelector('.sunset-score');
  const feedback = game.querySelector('.sunset-feedback');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cv = document.querySelector('.cv-reader');
  const coast = document.createElement('canvas');
  const coastCtx = coast.getContext('2d', {alpha: false});
  let scene, round, ripple, ball;
  let visible = true;
  let time = 0, frame = 0, last = 0, catches = 0;
  let prompt = 'Toss ball';

  function active() {
    return visible && !desktop.hidden && !monitor.hidden && !desktop.hasAttribute('data-open') &&
      !document.hidden && !cv?.open && canvas.clientWidth > 0 && canvas.clientHeight > 0;
  }

  function setPrompt(text) {
    if (prompt === text) return;
    prompt = text;
    label.textContent = text;
    button.toggleAttribute('data-catch', text === 'Catch ball');
    if (text === 'Catch ball') feedback.textContent = 'Catch it!';
    if (text === 'Wait…') canvas.classList.remove('ball-ready');
  }

  function finish(caught, message) {
    round = null;
    catches = caught ? catches + 1 : 0;
    setPrompt('Toss ball');
    score.textContent = catches === 1 ? '1 catch' : catches + ' catches';
    feedback.textContent = caught ? 'Nice catch!' : message;
  }

  function paint() {
    ctx.drawImage(coast, 0, 0, scene.width, scene.height);
    paintTide(ctx, scene, motion.matches ? 0 : time, ripple);
    ball = drawRally(ctx, scene, round, prompt === 'Catch ball', motion.matches);
  }

  function animate(now) {
    frame = 0;
    if (!active() || motion.matches) return;
    const elapsed = now - last;
    if (elapsed >= 30) {
      const step = Math.min(.10, elapsed / 1000);
      last = now;
      time += step;
      if (ripple) {
        ripple.progress += step / 1.65;
        if (ripple.progress >= 1) ripple = null;
      }
      if (round) {
        round.age += step;
        if (round.age >= round.catchUntil) finish(false, 'Missed it. Toss again!');
        else if (round.age >= round.catchFrom) setPrompt('Catch ball');
      }
      paint();
    }
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
    paint();
    if (!motion.matches) {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }

  button.addEventListener('click', () => {
    if (!active()) return;
    if (round) {
      if (prompt === 'Catch ball') finish(true);
      else finish(false, 'Too early. Toss again!');
    } else {
      const hadFocus = document.activeElement === button;
      expandIfSmall();
      if (hadFocus && document.activeElement !== button) button.focus({preventScroll: true});
      const returnFlight = .99 - Math.min(.28, catches * .044);
      const catchFrom = returnAt + returnFlight * .69;
      round = {age: motion.matches ? catchFrom : 0, returnFlight, catchFrom, catchUntil: returnAt + returnFlight + .61};
      setPrompt(motion.matches ? 'Catch ball' : 'Wait…');
      if (!motion.matches) feedback.textContent = 'Catch when the button lights up';
    }
    refresh();
  });
  button.addEventListener('keydown', event => {
    if (event.repeat && (event.key === ' ' || event.key === 'Enter')) event.preventDefault();
  });

  function pointAt(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * scene.width / rect.width,
      y: (event.clientY - rect.top) * scene.height / rect.height,
    };
  }

  function canTapBall({x, y}) {
    return prompt !== 'Wait…' && Math.hypot(x - ball.x, y - ball.y) <= Math.max(17, ball.radius * 1.9);
  }

  canvas.addEventListener('pointermove', event => {
    if (ball) canvas.classList.toggle('ball-ready', canTapBall(pointAt(event)));
  });
  canvas.addEventListener('pointerleave', () => canvas.classList.remove('ball-ready'));
  canvas.addEventListener('click', event => {
    if (!active() || !ball) return;
    const {x, y} = pointAt(event);
    if (canTapBall({x, y})) {
      button.focus({preventScroll: true});
      button.click();
      return;
    }
    if (y < scene.horizon || y >= scene.shore(x)) return;
    ripple = {x: x / scene.width, y: y / scene.height, progress: motion.matches ? .39 : 0};
    paint();
  });

  motion.addEventListener('change', () => {
    ripple = null;
    if (motion.matches && round) {
      round.age = round.catchFrom;
      setPrompt('Catch ball');
    }
    refresh();
  });

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
  game.hidden = false;
  refresh();
}
