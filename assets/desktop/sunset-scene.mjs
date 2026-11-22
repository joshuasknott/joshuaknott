// The coast is drawn in CSS pixels, then rasterized at the display's density.
export function beachLayout(width, height) {
  const portrait = width <= height;
  const horizon = height * (portrait ? .386 : .498);
  const sun = {
    x: width * (portrait ? .72 : .805),
    y: height * (portrait ? .305 : .369),
    radius: Math.min(width * .091, height * .069),
  };
  const shore = x => {
    const distance = x / width;
    return height * ((portrait ? .755 : .836) - distance * (portrait ? .126 : .202) +
      Math.sin(distance * Math.PI * 1.3) * .025);
  };
  const water = new Path2D();
  water.moveTo(0, horizon);
  water.lineTo(width, horizon);
  for (let i = 48; i >= 0; i--) {
    const x = width * i / 48;
    water.lineTo(x, shore(x));
  }
  water.closePath();

  return {width, height, portrait, horizon, sun, shore, water};
}

function linear(ctx, x0, y0, x1, y1, stops) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [at, color] of stops) gradient.addColorStop(at, color);
  return gradient;
}

function ellipse(ctx, x, y, width, height, color, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, rotation, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function path(ctx, points, color, thickness = 0) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  if (thickness) {
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
  } else {
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function seededRandom() {
  let seed = 18473;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function cloud(ctx, x, y, width, height, lit) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(width, height);
  ctx.fillStyle = linear(ctx, -.4, -.4, .4, .3, [
    [0, '#74476500'], [.25, '#86516e85'], [.66, '#bb6d7ba8'],
    [1, lit ? '#ffd1a5b5' : '#ed9c94aa'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-.59, .12);
  ctx.bezierCurveTo(-.34, .05, -.26, -.37, -.08, -.3);
  ctx.bezierCurveTo(.12, -.52, .17, .02, .6, -.09);
  ctx.bezierCurveTo(.39, .09, .21, .05, .16, .19);
  ctx.bezierCurveTo(.06, .43, -.24, .16, -.59, .12);
  ctx.fill();
  ctx.fillStyle = linear(ctx, -.48, 0, .57, .2, [
    [0, '#ffc7a400'], [.48, lit ? '#ffc8a37a' : '#e9948a95'], [1, '#ffb99900'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-.51, .17);
  ctx.bezierCurveTo(-.20, .06, .03, .42, .58, -.02);
  ctx.bezierCurveTo(.18, .45, .01, .35, -.51, .17);
  ctx.fill();
  ctx.restore();
}

function paintSky(ctx, scene) {
  const {width: w, height: h, horizon, sun, portrait} = scene;
  ctx.fillStyle = linear(ctx, 0, 0, 0, horizon, [
    [0, '#463a61'], [.31, '#825573'], [.64, '#ce7f82'], [.86, '#f2a07d'], [1, '#ffc594'],
  ]);
  ctx.fillRect(0, 0, w, horizon + 1);
  const glow = ctx.createRadialGradient(sun.x, sun.y, sun.radius * .5, sun.x, sun.y, h * .49);
  glow.addColorStop(0, '#ffce7690');
  glow.addColorStop(.38, '#ffb3785c');
  glow.addColorStop(1, '#ff8c7000');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, horizon + 1);

  cloud(ctx, w * .17, h * .117, w * .58, h * .11, false);
  cloud(ctx, w * .76, h * .14, w * .68, h * .115, false);
  cloud(ctx, w * .42, h * .218, w * .51, h * .060, true);
  cloud(ctx, w * 1.015, h * .249, w * .49, h * .062, true);
  cloud(ctx, w * .088, horizon - h * .076, w * .46, h * .051, true);
  cloud(ctx, w * .50, horizon - h * .029, w * .63, h * .029, true);

  const warmth = ctx.createRadialGradient(sun.x, sun.y, sun.radius * .65, sun.x, sun.y, sun.radius * 2.55);
  warmth.addColorStop(0, '#fff1af9c');
  warmth.addColorStop(1, '#ffbd7c00');
  ellipse(ctx, sun.x, sun.y, sun.radius * 2.55, sun.radius * 2.55, warmth);
  ellipse(ctx, sun.x, sun.y, sun.radius, sun.radius, linear(ctx, sun.x, sun.y - sun.radius, sun.x,
    sun.y + sun.radius, [[0, '#fff9ca'], [.64, '#ffe797'], [1, '#ffc071']]));

  // A small flock gives the quiet upper sky a sense of distance.
  const wings = Math.min(w, h) * .015;
  ctx.strokeStyle = '#57374ddb';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(.7, wings * .12);
  const birds = portrait ? [[.22, .258], [.275, .245], [.158, .232]] : [[.215, .262], [.246, .249], [.169, .237]];
  for (const [x, y] of birds) {
    ctx.save();
    ctx.translate(x * w, y * h);
    ctx.rotate(-.13);
    ctx.beginPath();
    ctx.moveTo(-wings, 0);
    ctx.quadraticCurveTo(-wings * .42, -wings * .42, 0, wings * .12);
    ctx.quadraticCurveTo(wings * .49, -wings * .48, wings, -wings * .17);
    ctx.stroke();
    ctx.restore();
  }
}

function paintHeadland(ctx, {width: w, height: h, horizon, portrait}) {
  const profiles = [
    {reach: .50, color: '#a2737e', ridge: [[0, -.075],[.11, -.067],[.22, -.041],[.32, -.048],[.63, -.022],[.82, -.017],[1, .001]]},
    {reach: .34, color: '#77596d', ridge: [[0, -.062],[.16, -.05],[.35, -.025],[.48, -.028],[.61, -.009],[.84, .003],[1, .009]]},
    {reach: .20, color: '#524858', ridge: [[0, -.032],[.17, -.024],[.34, -.005],[.48, -.005],[.69, .018],[.88, .026],[1, .032]]},
  ];
  for (const {reach, color, ridge} of profiles) {
    const edge = w * reach * (portrait ? 1.13 : 1);
    path(ctx, [...ridge.map(([x, y]) => [x * edge, horizon + y * h]),
      [edge * .58, horizon + h * .034], [0, horizon + h * .055]], color);
  }
}

function paintSand(ctx, scene, random) {
  const {width: w, height: h, horizon, shore, sun} = scene;
  ctx.fillStyle = linear(ctx, w * .74, h * .66, w * .16, h, [
    [0, '#e7ab7e'], [.43, '#cb876b'], [.8, '#ad685b'], [1, '#92504f'],
  ]);
  ctx.fillRect(0, horizon, w, h - horizon);
  const light = ctx.createRadialGradient(sun.x, h * .72, 0, sun.x, h * .72, w * .66);
  light.addColorStop(0, '#ffd18b68');
  light.addColorStop(1, '#ffae6900');
  ctx.fillStyle = light;
  ctx.fillRect(0, horizon, w, h - horizon);

  for (let i = 0; i < w * h / 62; i++) {
    const x = random() * w;
    const y = horizon + random() * (h - horizon);
    if (y < shore(x)) continue;
    const depth = (y - horizon) / (h - horizon);
    ctx.fillStyle = i % 3 ? '#643f4627' : '#ffe3ad66';
    ctx.fillRect(x, y, .55 + random() * 3.6 * depth, .43 + random() * .85 * depth);
  }

  // Wet sand ahead of the incoming wash.
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(w, horizon);
  for (let i = 48; i >= 0; i--) {
    const x = w * i / 48;
    ctx.lineTo(x, shore(x) + h * (.038 + .007 * Math.cos(x / w * 22)));
  }
  ctx.closePath();
  ctx.fillStyle = '#7e51576e';
  ctx.fill();
}

function paintSea(ctx, scene, random) {
  const {width: w, height: h, horizon, water, sun} = scene;
  const depth = h - horizon;
  ctx.save();
  ctx.clip(water);
  ctx.fillStyle = linear(ctx, 0, horizon, 0, h * .86, [
    [0, '#797687'], [.14, '#636f82'], [.50, '#416778'], [.82, '#2b5768'], [1, '#315768'],
  ]);
  ctx.fillRect(0, horizon, w, depth);
  const reflection = ctx.createRadialGradient(sun.x, horizon, 0, sun.x, horizon, h * .58);
  reflection.addColorStop(0, '#ffae718c');
  reflection.addColorStop(.45, '#ffae712c');
  reflection.addColorStop(1, '#ffae7100');
  ctx.fillStyle = reflection;
  ctx.fillRect(0, horizon, w, depth);

  // Spacing and width grow toward the shore.
  for (let i = 1; i <= 28; i++) {
    const near = (i / 28) ** 1.9;
    const y = horizon + near * depth;
    const offset = h * near * .024;
    ctx.beginPath();
    ctx.moveTo(-10, y + offset);
    ctx.bezierCurveTo(w * .29, y - offset, w * .63, y + offset * .82, w + 10, y - offset * .7);
    ctx.lineWidth = .6 + near * h * .012;
    ctx.strokeStyle = i % 3 === 0 ? '#afc4ba51' : '#213d575c';
    ctx.stroke();
  }
  for (let i = 0; i < w * h / 365; i++) {
    const near = random() ** 1.9;
    const x = random() * w;
    const y = horizon + near * depth;
    ctx.fillStyle = i % 3 === 0 ? '#e9d4b75c' : '#1f41544c';
    ctx.fillRect(x, y, w * (.004 + near * .05) * random(), .6 + near * h * .0037);
  }
  ctx.fillStyle = '#ffdec66e';
  ctx.fillRect(0, horizon, w, Math.max(.6, h * .0019));
  ctx.restore();
}

function rock(ctx, x, y, size, light) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ellipse(ctx, -.2, -.04, .96, .20, '#55394446', -.07);
  path(ctx, [[-.8,-.03],[-.59,-.23],[-.39,-.54],[.11,-.62],[.54,-.39],[.78,-.04],[.21,.073]], '#5f414d');
  path(ctx, [[-.59,-.23],[-.39,-.54],[.11,-.62],[.54,-.39],[.06,-.31],[-.29,-.16]], light);
  path(ctx, [[.06,-.31],[.54,-.39],[.78,-.04],[.21,.073]], '#774d52');
  ctx.restore();
}

function paintForeground(ctx, scene, random) {
  const {width: w, height: h, portrait} = scene;
  const unit = Math.min(w, h) * .12;
  rock(ctx, w * .063, h * .967, unit, '#ae735f');
  rock(ctx, w * .10, h * .944, unit * .43, '#bf836b');
  rock(ctx, w * .947, h * .953, unit * .62, '#a96b5c');
  rock(ctx, w * .891, h * .974, unit * .40, '#b87660');
  for (const [x, y, spread, size] of [[.016,1.012,.046,.96],[.073,1.024,.030,.66],[.98,1.012,.056,1.1],[.931,1.023,.033,.67]]) {
    const strands = portrait ? 13 : 19;
    for (let i = 0; i < strands; i++) {
      const start = w * (x + (random() - .5) * spread);
      const height = unit * size * (.25 + random() * .64);
      const lean = unit * (random() - .48) * .91;
      ctx.beginPath();
      ctx.moveTo(start - unit * .029, y * h);
      ctx.quadraticCurveTo(start + lean * .14, y * h - height * .78, start + lean, y * h - height);
      ctx.quadraticCurveTo(start + lean * .46, y * h - height * .59, start + unit * .027, y * h);
      ctx.fillStyle = ['#5f434f', '#785247', '#ad7651', '#cb905d'][i % 4];
      ctx.fill();
    }
  }
}

export function paintBeach(ctx, scene) {
  const random = seededRandom();
  paintSky(ctx, scene);
  paintSand(ctx, scene, random);
  paintSea(ctx, scene, random);
  paintHeadland(ctx, scene);
  paintForeground(ctx, scene, random);
}

export function paintTide(ctx, scene, time) {
  const {width: w, height: h, horizon, shore, water, sun} = scene;
  ctx.save();
  ctx.clip(water);
  ctx.lineCap = 'round';
  // Successive foam edges break against the same curved wet-sand boundary.
  for (let wave = 0; wave < 3; wave++) {
    const roll = .5 + .5 * Math.sin(time * 1.08 - wave * 1.8);
    const inset = h * (.004 + wave * .024 + .012 * roll);
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const x = w * i / 64;
      const y = shore(x) - inset + Math.sin(i * .49 + wave + time) * h * .0025;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = wave ? '#c5d4c99c' : '#f6d1b9d4';
    ctx.lineWidth = Math.max(1, h * (.0037 - wave * .00065));
    ctx.stroke();
    ctx.translate(0, 1.8);
    ctx.lineWidth *= 2;
    ctx.strokeStyle = '#f8d2bf31';
    ctx.stroke();
    ctx.translate(0, -1.8);
  }
  for (let i = 0; i < 63; i++) {
    const depth = (i / 63) ** 1.65;
    const wave = Math.sin(i * 7.13 + time * (1.1 + depth));
    const x = sun.x - depth * sun.radius * .17 + wave * sun.radius * (.48 + 2.24 * depth);
    const y = horizon + h * (.005 + depth * .33) + Math.cos(i * .91 + time) * depth * 3.3;
    ctx.globalAlpha = (.56 + .35 * wave) * (1 - .8 * depth);
    ctx.fillStyle = i % 3 === 0 ? '#fff0b2' : '#ffbc83';
    ctx.fillRect(x - sun.radius * .22, y, sun.radius * (.18 + .74 * depth), .65 + depth * 2);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
