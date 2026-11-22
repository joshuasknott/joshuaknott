import {fitQuad} from './projection.mjs';

export function fitDisplay(screen, corners) {
  if (screen.dataset.state === 'entered') {
    // Draw live text at the glass's actual pixel size. A matrix3d on the
    // scroller can cause browsers to rasterize its text at a lower resolution.
    const xs = corners.map(point => point.x);
    const ys = corners.map(point => point.y);
    const left = Math.min(...xs), top = Math.min(...ys);
    const width = Math.max(...xs) - left, height = Math.max(...ys) - top;
    if (!width || !height) return;
    const outline = corners.map(point => (point.x - left) + 'px ' + (point.y - top) + 'px');
    Object.assign(screen.style, {
      left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px',
      transform: 'none', clipPath: 'polygon(' + outline.join(',') + ')',
    });
    return;
  }
  fitQuad(screen, corners, screen.offsetWidth || 1000, screen.offsetHeight || 500);
}

export function createWelcome(screen, {pressKey, moveMouse, pressMouse, mousePosition, onEntered}) {
  const welcome = screen.querySelector('.welcome');
  const title = screen.querySelector('.greeting').getAttribute('aria-label');
  const typed = screen.querySelector('.typed');
  const button = screen.querySelector('.enter');
  const cursor = screen.querySelector('.screen-pointer');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const punctuation = {' ': 'Space', ',': 'Comma', '’': 'Quote'};
  let index = 0;
  let active = false;
  let timer = 0;
  let frame = 0;
  let keys = [];
  let path;
  screen.dataset.state = 'typing';

  function releaseKeys() {
    for (const code of keys) pressKey(code, false);
    keys = [];
  }

  function stopMotion() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    releaseKeys();
    if (screen.dataset.state === 'clicking') pressMouse(false);
  }

  function enter() {
    if (!active || button.hidden) return;
    stopMotion();
    screen.dataset.state = 'entered';
    button.hidden = true;
    welcome.hidden = true;
    screen.setAttribute('aria-label', 'Joshua Knott’s portfolio desktop');
    onEntered();
  }
  button.addEventListener('click', enter);

  function pointAt(x, y) {
    cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  function glide() {
    screen.dataset.state = 'moving';
    const startTime = performance.now();
    // Aim a little inside the button, away from its text.
    const endX = button.offsetLeft + button.offsetWidth * .24;
    const endY = button.offsetTop + button.offsetHeight * .17;
    function advance(now) {
      const t = reduced.matches ? 1 : Math.min(1, (now - startTime) / 650);
      const ease = t * t * (3 - 2 * t);
      const x = path.startX + (endX - path.startX) * ease;
      const y = path.startY + (endY - path.startY) * ease - Math.sin(Math.PI * t) * 17;
      pointAt(x, y);
      moveMouse(path.physical.x + (x - path.startX) / 350, path.physical.y + (y - path.startY) / 260);
      if (t < 1) {
        frame = requestAnimationFrame(advance);
        return;
      }
      button.classList.add('is-hovered');
      screen.dataset.state = 'hovering';
      timer = setTimeout(() => {
        screen.dataset.state = 'clicking';
        pressMouse(true);
        timer = setTimeout(() => button.click(), 150);
      }, 320);
    }
    frame = requestAnimationFrame(advance);
  }

  function showButton() {
    screen.dataset.state = 'ready';
    button.hidden = false;
    button.classList.remove('is-hovered');
    cursor.removeAttribute('hidden');
    const physical = mousePosition();
    path = {
      physical,
      startX: screen.clientWidth * (physical.x > .15 ? .77 : .23),
      startY: screen.clientHeight * (physical.y > .15 ? .84 : .30),
    };
    pointAt(path.startX, path.startY);
    timer = setTimeout(glide, 620);
  }

  function typeNext() {
    if (reduced.matches) {
      index = title.length;
      typed.textContent = title;
    }
    if (index === title.length) {
      showButton();
      return;
    }
    const char = title[index++];
    const code = punctuation[char] || 'Key' + char.toUpperCase();
    keys = /[A-Z]/.test(char) ? ['ShiftLeft', code] : [code];
    for (const key of keys) pressKey(key, true);
    typed.textContent = title.slice(0, index);
    timer = setTimeout(() => {
      releaseKeys();
      timer = setTimeout(typeNext, char === ',' ? 85 : 31);
    }, 45);
  }

  return {
    setActive(on, visible = on) {
      screen.hidden = !visible;
      if (active === on) return;
      active = on;
      if (!on) {
        stopMotion();
        return;
      }
      if (screen.dataset.state === 'entered') return;
      if (index === title.length) showButton();
      else typeNext();
    },
    get steeringMouse() {
      return active && ['moving', 'hovering', 'clicking'].includes(screen.dataset.state);
    },
    tryEnter() {
      if (!active || button.hidden) return false;
      button.click();
      return true;
    },
  };
}
