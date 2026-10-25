// Buildless adaptation of React Bits Circular Carousel's cylinder interaction.
(() => {
  const stage = document.querySelector('#project-carousel');
  if (!stage) return;
  const cards = [...stage.querySelectorAll('.project')];
  const controls = document.querySelector('.carousel-controls');
  const position = controls.querySelector('.carousel-position');
  const pause = controls.querySelector('[data-carousel="pause"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = cards, angle = 0, target = null, velocity = 0, drag = null;
  let hovered = false, paused = false, last = 0, moved = false;
  stage.classList.add('circular-carousel');
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.setAttribute('aria-label', 'Portfolio projects');
  stage.tabIndex = 0;
  controls.hidden = false;
  function render() {
    const step = 360 / visible.length;
    const active = ((Math.round(-angle / step) % visible.length) + visible.length) % visible.length;
    const radius = visible.length === 1 ? 0 : Math.min(stage.clientWidth * .43, 330);
    visible.forEach((card, i) => {
      const degrees = ((angle + i * step + 180) % 360 + 360) % 360 - 180;
      const depth = (Math.cos(degrees * Math.PI / 180) + 1) / 2;
      card.style.transform = `translate(-50%, -50%) rotateX(-5deg) rotateY(${degrees}deg) translateZ(${radius}px)`;
      card.style.opacity = String(.45 + depth * .55);
      card.style.zIndex = String(Math.round(depth * 100));
      card.inert = i !== active;
      card.setAttribute('aria-label', `${i + 1} of ${visible.length}`);
      card.setAttribute('aria-roledescription', 'slide');
    });
    position.textContent = `${active + 1} / ${visible.length}`;
    controls.querySelectorAll('[data-carousel="prev"], [data-carousel="next"]').forEach(button => { button.disabled = visible.length < 2; });
  }
  function move(direction) {
    const step = 360 / visible.length;
    target = (Math.round(-angle / step) + direction) * -step;
    velocity = 0;
    if (reduced.matches) { angle = target; target = null; render(); }
  }
  controls.addEventListener('click', event => {
    const action = event.target.closest('[data-carousel]')?.dataset.carousel;
    if (action === 'prev') move(-1);
    if (action === 'next') move(1);
    if (action === 'pause') {
      paused = !paused;
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = paused ? 'Resume rotation' : 'Pause rotation';
    }
  });
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  stage.addEventListener('pointerenter', () => { hovered = true; });
  stage.addEventListener('pointerleave', () => { hovered = false; });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('a, button')) return;
    drag = { x: event.clientX, angle, id: event.pointerId };
    moved = false; target = null; velocity = 0;
  });
  stage.addEventListener('pointermove', event => {
    if (!drag) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 5) { moved = true; stage.setPointerCapture(drag.id); }
    const next = drag.angle + delta * .3;
    velocity = (next - angle) * .6;
    angle = next; render();
  });
  function release() {
    if (!drag) return;
    drag = null;
    const step = 360 / visible.length;
    target = Math.round((angle + velocity * 8) / step) * step;
    if (reduced.matches) { angle = target; target = null; render(); }
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', release);
  stage.addEventListener('click', event => {
    if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
  }, true);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    visible = cards.filter(card => !card.hidden);
    cards.forEach(card => { card.inert = card.hidden; });
    angle = 0; target = null; velocity = 0; render();
  }));
  new ResizeObserver(render).observe(stage);
  reduced.addEventListener('change', () => { move(0); });
  function frame(time) {
    const dt = Math.min((time - last) / 1000, .05); last = time;
    const bounds = stage.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < innerHeight && !document.hidden) {
      if (target !== null && !drag) {
        angle += (target - angle) * Math.min(1, dt * 9);
        if (Math.abs(target - angle) < .05) { angle = target; target = null; }
        render();
      } else if (!drag && !paused && !hovered && !stage.contains(document.activeElement) && !controls.contains(document.activeElement) && !reduced.matches && visible.length > 1) {
        angle -= 14 * dt; render();
      }
    }
    requestAnimationFrame(frame);
  }
  render(); requestAnimationFrame(frame);
})();
