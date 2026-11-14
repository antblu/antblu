// Buildless adaptation of React Bits Circular Carousel's cylinder interaction.
document.querySelectorAll('[data-circular-carousel]').forEach(stage => {
  const cards = [...stage.querySelectorAll('[data-carousel-slide]')];
  const controls = stage.nextElementSibling;
  const position = controls.querySelector('.carousel-position');
  const pause = controls.querySelector('[data-carousel="pause"]');
  const buttons = controls.querySelectorAll('[data-carousel="prev"], [data-carousel="next"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = cards, angle = 0, target = null, velocity = 0, drag = null;
  let hovered = false, paused = false, last = 0, moved = false;
  let radius = 0;
  stage.classList.add('circular-carousel');
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.tabIndex = 0;
  controls.hidden = false;
  function render() {
    if (!visible.length) return;
    const step = 360 / visible.length;
    const active = ((Math.round(-angle / step) % visible.length) + visible.length) % visible.length;
    visible.forEach((card, i) => {
      const degrees = ((angle + i * step + 180) % 360 + 360) % 360 - 180;
      const depth = (Math.cos(degrees * Math.PI / 180) + 1) / 2;
      card.style.setProperty('--carousel-angle', `${degrees}deg`);
      card.style.transform = `rotateX(var(--carousel-tilt, -5deg)) rotateY(var(--carousel-angle)) translateZ(${visible.length === 1 ? 0 : radius}px) rotateY(var(--carousel-face-offset, 0deg))`;
      card.style.opacity = String(.45 + depth * .55);
      card.style.zIndex = String(Math.round(depth * 100));
      card.inert = i !== active;
      card.setAttribute('aria-label', `${i + 1} of ${visible.length}`);
      card.setAttribute('aria-roledescription', 'slide');
    });
    const label = `${active + 1} / ${visible.length}`;
    if (position.textContent !== label) position.textContent = label;
    buttons.forEach(button => { button.disabled = visible.length < 2; });
  }
  function move(direction) {
    if (visible.length < 2) return;
    const step = 360 / visible.length;
    target = (Math.round(-(target ?? angle) / step) + direction) * -step;
    velocity = 0;
    if (reduced.matches) { angle = target; target = null; render(); }
  }
  controls.addEventListener('click', event => {
    const action = event.target.closest('[data-carousel]')?.dataset.carousel;
    if (action === 'prev') move(-1);
    if (action === 'next') move(1);
    if (action === 'pause' && pause) {
      paused = !paused;
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = paused ? 'Resume rotation' : 'Pause rotation';
    }
  });
  stage.addEventListener('keydown', event => {
    if (event.target === stage && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  stage.addEventListener('pointerenter', () => { hovered = true; });
  stage.addEventListener('pointerleave', () => { hovered = false; });
  stage.addEventListener('pointerdown', event => {
    moved = false;
    if (event.button !== 0 || event.target.closest('a, button')) return;
    drag = { x: event.clientX, angle, id: event.pointerId };
    target = null; velocity = 0;
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const delta = event.clientX - drag.x;
    if (!moved && Math.abs(delta) > 5) {
      moved = true;
      stage.setPointerCapture(drag.id);
    }
    if (!moved) return;
    const next = drag.angle + delta * .3;
    velocity = (next - angle) * .6;
    angle = next; render();
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const start = drag.angle;
    drag = null;
    const step = 360 / visible.length;
    target = Math.round((angle + velocity * 8) / step) * step;
    if (!pause && moved && Math.abs(angle - start) >= 14 && target === Math.round(start / step) * step) {
      target += Math.sign(angle - start) * step;
    }
    if (reduced.matches) { angle = target; target = null; render(); }
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', event => {
    if (event.target === stage) release(event);
  });
  stage.addEventListener('click', event => {
    if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
  }, true);
  stage.closest('section')?.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    visible = cards.filter(card => !card.hidden);
    cards.forEach(card => { card.inert = card.hidden; });
    angle = 0; target = null; velocity = 0; render();
  }));
  function resize() {
    const maxRadius = Number(stage.dataset.carouselRadius ?? 330);
    radius = Math.min(stage.clientWidth * .43, maxRadius);
    render();
  }
  new ResizeObserver(resize).observe(stage);
  reduced.addEventListener('change', () => { move(0); });
  function frame(time) {
    const dt = Math.min((time - last) / 1000, .05); last = time;
    const bounds = stage.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < innerHeight && !document.hidden) {
      if (target !== null && !drag) {
        angle += (target - angle) * Math.min(1, dt * 9);
        if (Math.abs(target - angle) < .05) { angle = target; target = null; }
        render();
      } else if (pause && !drag && !paused && !hovered && !stage.contains(document.activeElement) && !controls.contains(document.activeElement) && !reduced.matches && visible.length > 1) {
        angle -= 14 * dt; render();
      }
    }
    requestAnimationFrame(frame);
  }
  resize(); requestAnimationFrame(frame);
});
