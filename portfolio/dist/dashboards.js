(() => {
  const cards = [...document.querySelectorAll('.dashboard-card')];
  if (!cards.length || !window.HTMLDialogElement) return;

  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const viewer = document.createElement('dialog');
  viewer.className = 'dashboard-viewer';
  viewer.setAttribute('aria-labelledby', 'dashboard-viewer-title');
  viewer.innerHTML = '<header><strong id="dashboard-viewer-title"></strong><button type="button" aria-label="Close details" autofocus>×</button></header><a aria-label="Open original size screenshot"><img alt=""></a>';
  document.body.append(viewer);
  const detail = document.createElement('p');
  viewer.append(detail);
  const title = viewer.querySelector('strong');
  const original = viewer.querySelector('a');
  const image = viewer.querySelector('img');
  const animations = new Set();
  let lastCard;
  let duration;
  let closing = false;
  let hasOpened = false;

  function animate(element, frames, options) {
    if (!motion.matches || !element.animate) return;
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }

  function stopMotion() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }

  motion.addEventListener('change', stopMotion);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      cards.forEach((card, index) => animate(card.querySelector('.dashboard-frame, .dashboard-caption'), [
        { transform: 'translateY(8px)', opacity: .84 }, { transform: 'none', opacity: 1 }
      ], { duration: 260, delay: index * 30, easing: 'ease-out' }));
      observer.disconnect();
    });
    observer.observe(cards[0].parentElement);
  }

  cards.forEach((card, index) => { card.dataset.layoutId = 'dashboard-' + index; });
  cards.forEach(card => card.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    stopMotion();
    const preview = card.querySelector('img');
    const source = card.getBoundingClientRect();
    title.textContent = card.querySelector('strong').textContent;
    detail.hidden = Boolean(preview);
    detail.textContent = card.dataset.detail || '';
    original.hidden = !preview;
    if (preview) {
      original.href = card.href;
      image.width = Number(preview.getAttribute('width'));
      image.height = Number(preview.getAttribute('height'));
      image.alt = preview.alt;
      image.src = card.href;
    }
    lastCard = card;
    viewer.dataset.layoutId = card.dataset.layoutId;
    duration = hasOpened ? 160 : 240;
    viewer.showModal();
    const target = viewer.getBoundingClientRect();
    const x = source.left + source.width / 2 - target.left - target.width / 2;
    const y = source.top + source.height / 2 - target.top - target.height / 2;
    animate(viewer, [
      { transform: 'translate(' + x + 'px,' + y + 'px) scale(.95)', opacity: .65 },
      { transform: 'translate(' + x * .42 + 'px,' + (y * .42 - 12) + 'px) scale(.975)', offset: .47 },
      { transform: 'none', opacity: 1 }
    ], { duration, easing: 'ease-out' });
    animate(preview ? original : detail, [{ opacity: .3 }, { opacity: 1 }], { duration: duration - 30, delay: 30, easing: 'ease-out', fill: 'backwards' });
    hasOpened = true;
  }));

  function closeViewer() {
    if (closing) return;
    closing = true;
    const start = getComputedStyle(viewer).transform;
    stopMotion();
    const target = viewer.getBoundingClientRect();
    const card = lastCard.getBoundingClientRect();
    const x = card.left + card.width / 2 - target.left - target.width / 2;
    const y = card.top + card.height / 2 - target.top - target.height / 2;
    const exit = animate(viewer, [
      { transform: start, opacity: 1 },
      { transform: 'translate(' + x + 'px,' + y + 'px) scale(.95)', opacity: 0 }
    ], { duration: duration * .8, easing: 'ease-in-out' });
    const finish = () => { closing = false; viewer.close(); };
    if (exit) exit.finished.then(finish, finish);
    else finish();
  }
  viewer.querySelector('button').addEventListener('click', closeViewer);
  viewer.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
  viewer.addEventListener('close', () => {
    if (viewer.open) return;
    stopMotion();
    if (!lastCard) return;
    lastCard.focus({ preventScroll: true });
    animate(lastCard.querySelector('.dashboard-expand'), [
      { opacity: .55 },
      { transform: 'none' }
    ], { duration: 190, easing: 'ease-out' });
  });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeViewer();
  });
})();
