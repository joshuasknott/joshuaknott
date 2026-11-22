// The lower-left corner bends across a diagonal. Each band has two straight
// rulings, so an affine transform can carry the printed text along with it.
const crease = .24;
const count = 12;
const bands = Array.from({length: count}, (_, i) => {
  const near = i / count, far = (i + 1) / count;
  const start = crease + (1 - crease) * near;
  const end = crease + (1 - crease) * far;
  const slope = (near + far) / (1 - crease);
  const strip = new Path2D();
  // A subpixel overlap keeps antialiasing from opening hairlines at the seams.
  strip.moveTo(0, start - .0015);
  strip.lineTo(1 - start + .0015, 1);
  strip.lineTo(1 - end, 1);
  strip.lineTo(0, end);
  strip.closePath();
  return {strip, slope, intercept: near * near - slope * start};
});

export function createPaperBend(flying, fallback, width, height) {
  const image = flying.querySelector('img');
  const canvas = flying.querySelector('.cv-paper-bend');
  const ctx = canvas.getContext('2d');
  const texture = document.createElement('canvas');
  canvas.width = texture.width = width;
  canvas.height = texture.height = Math.ceil(height);
  let source;

  return function bend(amount) {
    const photo = image.complete && image.naturalWidth ? image : fallback;
    const active = Boolean(amount > 0 && ctx && photo.complete && photo.naturalWidth);
    flying.classList.toggle('is-bent', active);
    if (!active) return;
    if (source !== photo) {
      texture.getContext('2d').drawImage(photo, 0, 0, texture.width, texture.height);
      source = photo;
    }
    const dx = .033 * amount, dy = -.17 * amount;
    ctx.setTransform(canvas.width, 0, 0, canvas.height, 0, 0);
    ctx.clearRect(0, 0, 1, 1);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0);
    ctx.lineTo(1, 1);
    ctx.lineTo(1 - crease, 1);
    ctx.lineTo(0, crease);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(texture, 0, 0, 1, 1);
    ctx.restore();

    for (const {strip, slope, intercept} of bands) {
      ctx.save();
      ctx.transform(1 - dx * slope, -dy * slope, dx * slope, 1 + dy * slope, dx * intercept, dy * intercept);
      ctx.clip(strip);
      ctx.drawImage(texture, 0, 0, 1, 1);
      ctx.restore();
    }
    // Shade the turned edge as its angle to the desk lamp changes.
    const shade = ctx.createLinearGradient((1 - crease) / 2, (1 + crease) / 2, dx, 1 + dy);
    shade.addColorStop(0, 'transparent');
    shade.addColorStop(.45, 'rgba(57,48,43,.04)');
    shade.addColorStop(1, 'rgba(57,48,43,.23)');
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = amount;
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, 1, 1);
    ctx.restore();

    // Displace the fingertips by the same amount as the texture underneath,
    // projected through the sheet's current perspective.
    const matrix = new DOMMatrixReadOnly(flying.style.transform);
    return (u, v) => {
      const distance = Math.max(0, (v - u - crease) / (1 - crease));
      const curve = distance * distance;
      const flat = matrix.transformPoint({x: u * width, y: v * height});
      const bent = matrix.transformPoint({x: (u + dx * curve) * width, y: (v + dy * curve) * height});
      return {x: bent.x / bent.w - flat.x / flat.w, y: bent.y / bent.w - flat.y / flat.w};
    };
  };
}
