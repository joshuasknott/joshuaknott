export function previewCards(grid) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const states = [...grid.querySelectorAll('.project-card video')].map(video => ({
    video, card: video.closest('.project-card'), visible: false, hovered: false, playing: false,
  }));
  let suspended = false;
  function update(state) {
    const {video, card} = state;
    const active = !suspended && !motion.matches && !document.hidden && state.visible &&
      (state.hovered || card.matches(':focus-within'));
    if (!active) {
      state.playing = false;
      video.pause();
      card.classList.remove('is-playing');
    } else if (!state.playing) {
      state.playing = true;
      if (!video.hasAttribute('src')) video.src = video.dataset.src;
      video.play().then(() => {
        if (state.playing) card.classList.add('is-playing');
        else video.pause();
      }).catch(() => { state.playing = false; card.classList.remove('is-playing'); });
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.find(state => state.card === entry.target);
      state.visible = entry.isIntersecting && entry.intersectionRatio > 0;
      update(state);
    }
  }, {threshold: [0, .1]});
  for (const state of states) {
    observer.observe(state.card);
    state.card.addEventListener('mouseenter', () => { suspended = false; state.hovered = true; update(state); });
    state.card.addEventListener('mouseleave', () => { state.hovered = false; update(state); });
    state.card.addEventListener('focusin', () => { suspended = false; update(state); });
    state.card.addEventListener('focusout', () => queueMicrotask(() => update(state)));
  }
  const refresh = () => states.forEach(update);
  motion.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  return {
    pause() { suspended = true; refresh(); },
    dispose() {
      suspended = true;
      refresh();
      observer.disconnect();
      motion.removeEventListener('change', refresh);
      document.removeEventListener('visibilitychange', refresh);
    },
  };
}
