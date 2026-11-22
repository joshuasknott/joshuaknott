import {waveColor, wavePhase} from './rgb-wave.mjs';

// The mask is the difference between white LEDs and unpowered keys, rendered
// through the desk camera. It includes the glyphs, diffuser edges and plate spill.
const frame = {width: 1200, height: 710};
const mask = {x: 250, y: 575, width: 648, height: 118};

export function createKeyboardGlow(surface, map) {
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  const maskUrl = new URL('./keyboard-light-mask.webp', import.meta.url).href;
  Object.assign(layer.style, {
    position: 'absolute', overflow: 'hidden', pointerEvents: 'none',
    maskImage: 'url("' + maskUrl + '")', maskSize: '100% 100%', maskRepeat: 'no-repeat',
    mixBlendMode: 'screen',
  });
  const band = document.createElement('div');
  const stops = Array.from({length: 29}, (_, i) => {
    const position = i / 28;
    return '#' + waveColor(position).toString(16).padStart(6, '0') + ' ' + (position * 100) + '%';
  });
  Object.assign(band.style, {
    width: '200%', height: '100%', backgroundImage: 'linear-gradient(to right,' + stops.join(',') + ')',
    backgroundSize: '50% 100%', backgroundRepeat: 'repeat-x', willChange: 'transform',
  });
  layer.appendChild(band);
  surface.insertBefore(layer, surface.querySelector('canvas'));
  const positions = new Map(map.keys.map(({code, poly}) => {
    const x = poly.reduce((sum, point) => sum + point[0], 0) / poly.length;
    return [code, (x * frame.width / 100 - mask.x) / mask.width];
  }));
  let phase = 0;
  function updateLighting(seconds) {
    phase = wavePhase(seconds);
    band.style.transform = 'translateX(' + (phase - 1) * 50 + '%)';
  }
  function resize() {
    Object.assign(layer.style, {
      left: mask.x * 100 / frame.width + '%', top: mask.y * 100 / frame.height + '%',
      width: mask.width * 100 / frame.width + '%', height: mask.height * 100 / frame.height + '%',
    });
  }
  resize();
  updateLighting(0);
  return {
    resize, updateLighting,
    colorForKey(code) { return waveColor((positions.get(code) ?? 0.5) - phase); },
    setPower(on) { layer.hidden = !on; },
    stop() { layer.remove(); },
  };
}
