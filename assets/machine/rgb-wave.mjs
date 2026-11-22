export const RGB_WAVE_PERIOD = 6;

// One continuous loop, in display-space sRGB. A diffuser samples a position
// on the loop and moves that position backwards to send light along its length.
const stops = [0x23ddeb, 0x3675fc, 0x9256fc, 0xee4dbe, 0xff655b, 0xffbd45, 0x4fdf86];

export function wavePhase(seconds) {
  const cycles = seconds / RGB_WAVE_PERIOD;
  return cycles - Math.floor(cycles);
}

export function waveColor(phase) {
  const position = (phase - Math.floor(phase)) * stops.length;
  const index = Math.floor(position);
  const mix = position - index;
  const start = stops[index];
  const end = stops[(index + 1) % stops.length];
  const r = Math.round((start >> 16) * (1 - mix) + (end >> 16) * mix);
  const g = Math.round(((start >> 8) & 255) * (1 - mix) + ((end >> 8) & 255) * mix);
  const b = Math.round((start & 255) * (1 - mix) + (end & 255) * mix);
  return (r << 16) | (g << 8) | b;
}
