(() => {
  const map = document.querySelector('#infrastructure-workflow');
  if (!map || !('IntersectionObserver' in window)) return;

  const controls = map.querySelector('.infrastructure-workflow-switch');
  const radios = [...controls.querySelectorAll('input')];
  const playback = map.querySelector('.infrastructure-workflow-play');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let cycling = true;
  let timer;

  function syncPlayback() {
    clearInterval(timer);
    playback.hidden = motion.matches;
    playback.textContent = cycling ? 'Pause cycle' : 'Play cycle';
    const visible = inView && !document.hidden && !motion.matches;
    map.classList.toggle('is-in-view', visible);

    if (visible && cycling) {
      timer = setInterval(() => {
        const current = radios.findIndex(radio => radio.checked);
        radios[(current + 1) % radios.length].checked = true;
      }, 4200);
    }
  }

  function pauseCycle() {
    cycling = false;
    syncPlayback();
  }

  controls.addEventListener('focusin', pauseCycle);
  controls.addEventListener('change', pauseCycle);
  playback.addEventListener('click', () => {
    cycling = !cycling;
    syncPlayback();
  });
  motion.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }, { threshold: .1 }).observe(map.querySelector('.infrastructure-workflow-scene'));

  syncPlayback();
})();
