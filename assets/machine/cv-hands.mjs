import {fitQuad} from './projection.mjs';

// Both photographs share the same registration and thumb contacts. The bare
// forearms extend to the bottom of the source, towards the viewer.
const hands = [
  {side: -1, startX: 0, thumbX: 438, thumbY: 148, pageY: .64},
  {side: 1, startX: 1036, thumbX: 1111, thumbY: 254, pageY: .68},
];
const cropWidth = 500;
const sourceHeight = 1024;

function portion(value, beginning, end) {
  const t = Math.min(1, Math.max(0, (value - beginning) / (end - beginning)));
  return t * t * (3 - 2 * t);
}

function makeHand(layer, hand) {
  const sprite = document.createElement('div');
  sprite.className = 'cv-hand';
  const poses = ['reach', 'grip'].map(name => {
    const image = new Image();
    image.src = new URL('cv-hands-' + name + '.webp', import.meta.url).href;
    image.alt = '';
    image.draggable = false;
    image.style.left = -hand.startX + 'px';
    sprite.append(image);
    return image;
  });
  layer.append(sprite);
  return {...hand, sprite, poses};
}

export function createCVHands(layer) {
  const limbs = hands.map(hand => makeHand(layer, hand));
  let prepared = false;
  let available = false;
  // Both limbs use the same two source images. Decode each photographic
  // pose before the first reach so the fingers and sheet appear together.
  const ready = Promise.all(limbs[0].poses.map(image => image.decode())).then(
    () => { prepared = true; available = true; },
    () => { prepared = true; },
  );

  function draw(points, progress, lift, bendOffset) {
    if (!available) {
      layer.hidden = true;
      return;
    }
    layer.hidden = false;
    const width = layer.clientWidth, height = layer.clientHeight;
    if (!width || !height) return;
    const [tl,tr,br,bl] = points;
    const span = (Math.hypot(tr.x - tl.x, tr.y - tl.y) + Math.hypot(br.x - bl.x, br.y - bl.y)) / 2;
    const scale = Math.min(span, 830) * .00091;
    for (const {side, thumbX, thumbY, startX, pageY, sprite, poses} of limbs) {
      const left = side < 0;
      const top = left ? tl : tr, bottom = left ? bl : br;
      const offset = bendOffset?.(left ? 0 : 1, pageY);
      const gripX = top.x + (bottom.x - top.x) * pageY - side * scale * 12 + (offset?.x || 0);
      const gripY = top.y + (bottom.y - top.y) * pageY + (offset?.y || 0);
      const lag = left ? 0 : .048;
      const near = 1 - portion(progress, lag, .265 + lag);
      const pinch = portion(progress, .272 + lag, .305 + lag);
      const x = gripX + side * near * Math.min(width * .16, 140);
      const y = gripY + near * (height - gripY + scale * 170 + 12);
      const compact = Math.max(0, Math.min(1, (650 - width) / 300));
      const angle = -side * (.16 + .64 * compact - .10 * lift + .22 * near);
      const cos = Math.cos(angle), sin = Math.sin(angle);

      // The thumb stays at the measured contact and scale. Moving down the
      // single perspective plane grows the forearm towards the lens, even
      // when the physical sheet occupies only a few pixels on a phone.
      const length = sourceHeight - thumbY;
      const outerU = (left ? 0 : 1536) - thumbX;
      const innerU = (left ? 176 : 1290) - thumbX;
      const toFloor = (height - y + 24) / (length * cos + outerU * sin);
      const toSide = ((left ? x : width - x) + 24) / Math.abs(innerU * cos - length * sin);
      const endScale = Math.max(scale, Math.min(toFloor, toSide));
      const depth = (1 - scale / endScale) / length;
      const corners = [[0,0], [cropWidth,0], [cropWidth,sourceHeight], [0,sourceHeight]].map(([sx,sy]) => {
        const u = sx + startX - thumbX, v = sy - thumbY;
        const s = scale / (1 - depth * v);
        return {x: x + (u * cos - v * sin) * s, y: y + (u * sin + v * cos) * s};
      });
      fitQuad(sprite, corners, cropWidth, sourceHeight);
      poses[0].style.opacity = String(1 - pinch);
      poses[1].style.opacity = String(pinch);
    }
  }
  return {ready, get prepared() { return prepared; }, draw, clear() { layer.hidden = true; }};
}
