import {fitDisplay} from './welcome.mjs';

const dayMs = 86_400_000;
const colors = ['#cbd3c7', '#98c777', '#63a665', '#318058', '#16583f'];
const dateLabel = new Intl.DateTimeFormat('en-GB', {month:'short', year:'2-digit', timeZone:'UTC'});
let artwork;

function paintCalendar(stats, mark) {
  const days = stats.days.filter(day => Number.isFinite(day.count) && Number.isFinite(Date.parse(day.date)));
  if (!days.length) throw new Error('The contribution calendar is empty.');
  const dates = days.map(day => Date.parse(day.date));
  const first = Math.min(...dates);
  const last = Math.max(...dates);
  const sunday = first - new Date(first).getUTCDay() * dayMs;
  const weekMs = 7 * dayMs;
  const weeks = Math.floor((last - sunday) / weekMs) + 1;
  const columns = Math.ceil(weeks / 3);
  const counts = new Map(days.map((day, index) => [dates[index], day.count]));
  const active = days.map(day => day.count).filter(n => n > 0).sort((a,b) => a-b);
  const bands = [.25, .5, .75].map(q => active[Math.floor((active.length-1)*q)]);
  const total = new Intl.NumberFormat('en-GB').format(stats.totalContributions);

  const canvas = document.createElement('canvas');
  canvas.width = 540;
  canvas.height = 780;
  canvas.setAttribute('aria-label', 'GitHub activity: ' + total + ' contributions from ' +
    dateLabel.format(first) + ' to ' + dateLabel.format(last) + '.');
  const ctx = canvas.getContext('2d');
  const paper = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  paper.addColorStop(0,'#eeeae0');
  paper.addColorStop(1,'#dbded0');
  ctx.fillStyle = paper;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  const left = 24;
  const right = canvas.width - left;
  ctx.fillStyle = '#20322c';
  if (mark) ctx.drawImage(mark,left,21,61,61);
  ctx.font = 'bold 65px Arial, sans-serif';
  ctx.fillText('GitHub',mark ? left+74 : left,76);
  ctx.font = '500 30px Arial, sans-serif';
  ctx.fillText(total + ' contributions',left,120);

  // Wrap the calendar into three consecutive bands to fit the portrait frame.
  // Every column still starts on Sunday, including partial first/last weeks.
  const stepX = (right-left)/columns;
  const stepY = 23;
  for (let band = 0; band < 3; band++) {
    const startWeek = band * columns;
    if (startWeek >= weeks) break;
    const bandStart = sunday + startWeek * weekMs;
    const bandEnd = Math.min(last, bandStart + columns * weekMs - dayMs);
    const top = 169 + band*203;
    ctx.fillStyle = '#44564d';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText((dateLabel.format(Math.max(first,bandStart)) + ' – ' + dateLabel.format(bandEnd)).toUpperCase(),left,top-10);
    for (let col=0; col<columns && startWeek+col<weeks; col++) {
      for (let row=0; row<7; row++) {
        const value = counts.get(bandStart + col*weekMs + row*dayMs);
        if (value === undefined) continue;
        const intensity = value ? 1 + bands.filter(limit => value > limit).length : 0;
        ctx.fillStyle = colors[intensity];
        ctx.fillRect(left + col*stepX, top + row*stepY, stepX-3.5, stepY-3.5);
      }
    }
  }
  return canvas;
}

export function loadActivityArtwork() {
  if (!artwork) {
    const stats = fetch(new URL('../../data/stats.json', import.meta.url)).then(response => {
      if (!response.ok) throw new Error('The contribution calendar could not load.');
      return response.json();
    });
    const mark = new Image();
    mark.src = new URL('../icons/github.svg', import.meta.url).href;
    artwork = Promise.all([stats, mark.decode().then(() => mark).catch(() => null)])
      .then(([data, logo]) => paintCalendar(data,logo));
  }
  return artwork;
}

export function mountActivityPrint(print, corners) {
  let canvas;
  let removed = false;
  function resize() {
    if (!canvas) return;
    const {width, height} = print.getBoundingClientRect();
    fitDisplay(canvas, corners.map(([x,y]) => ({x:x*width/100, y:y*height/100})));
  }
  if (corners) loadActivityArtwork().then(art => {
    if (removed) return;
    canvas = document.createElement('canvas');
    canvas.width = art.width;
    canvas.height = art.height;
    canvas.getContext('2d').drawImage(art,0,0);
    canvas.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none';
    print.appendChild(canvas);
    resize();
  }).catch(() => {});
  return {resize, remove() { removed=true; canvas?.remove(); }};
}
