import {waveColor, wavePhase} from './rgb-wave.mjs';

// Coordinates in the registered 288 × 193 sprite. The rim follows the desk
// plane. The higher wheel and status window each have their own projected row.
function guidePhase(x, y) {
  if (y < 24) return .334 + .00437 * (x - 127);
  if (y > 54 && y < 74 && x > 115 && x < 180) return .403 + .00437 * (x - 149);
  return .36 + .00437 * (x - 132.3) - .00049 * (y - 81.5);
}

export function createMouseLights(sprite) {
  const canvas = document.createElement('canvas');
  canvas.width = sprite.naturalWidth;
  canvas.height = sprite.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sprite, 0, 0);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = frame.data;
  const guides = [];
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      // The matte shell has a cool blue cast. Only the baked cyan light has
      // both a strong green channel and this much separation from graphite.
      if (pixels[i + 3] < 12 || g < 58 || g - r < 14 || b < g) continue;
      const coverage = Math.min(1, (g - r - 10) / 42) * Math.min(1, (g - 52) / 150);
      const phase = guidePhase(x * 288 / canvas.width, y * 193 / canvas.height);
      guides.push({i, r, g, b, coverage, phase});
    }
  }

  let previous;
  return {
    at(seconds) {
      const phase = wavePhase(seconds);
      if (phase === previous) return canvas;
      previous = phase;
      for (const guide of guides) {
        const rgb = waveColor(guide.phase - phase);
        // Preserve edge coverage and the photographed light-pipe reflections
        // while replacing the emission of its cyan reference colour.
        const r = (rgb >> 16) * .69 + 60;
        const g = ((rgb >> 8) & 255) * .69 + 60;
        const b = (rgb & 255) * .69 + 60;
        pixels[guide.i] = guide.r + guide.coverage * (r - 129);
        pixels[guide.i + 1] = guide.g + guide.coverage * (g - 209);
        pixels[guide.i + 2] = guide.b + guide.coverage * (b - 222);
      }
      ctx.putImageData(frame, 0, 0);
      return canvas;
    }
  };
}
