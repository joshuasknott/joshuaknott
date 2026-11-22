// Project a flat element into four clockwise corners, beginning at top left.
export function fitQuad(element, [tl, tr, br, bl], width, height) {
  const dx1 = tr.x - br.x, dx2 = bl.x - br.x;
  const dy1 = tr.y - br.y, dy2 = bl.y - br.y;
  const dx = tl.x - tr.x + br.x - bl.x;
  const dy = tl.y - tr.y + br.y - bl.y;
  const determinant = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(determinant) < .0001) return;
  const g = (dx * dy2 - dx2 * dy) / determinant;
  const h = (dx1 * dy - dx * dy1) / determinant;
  element.style.transform = 'matrix3d(' + [
    (tr.x - tl.x + g * tr.x) / width, (tr.y - tl.y + g * tr.y) / width, 0, g / width,
    (bl.x - tl.x + h * bl.x) / height, (bl.y - tl.y + h * bl.y) / height, 0, h / height,
    0, 0, 1, 0, tl.x, tl.y, 0, 1,
  ].join(',') + ')';
}
