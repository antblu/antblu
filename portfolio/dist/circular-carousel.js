// Buildless adaptation of React Bits Circular Carousel's cylinder interaction.
document.querySelectorAll('[data-circular-carousel]').forEach(stage => {
  const cards = [...stage.querySelectorAll('[data-carousel-slide]')];
  const controls = stage.nextElementSibling;
  const position = controls.querySelector('.carousel-position');
  const pause = controls.querySelector('[data-carousel="pause"]');
  const buttons = controls.querySelectorAll('[data-carousel="prev"], [data-carousel="next"]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = cards, angle = 0, target = null, velocity = 0, drag = null;
  let hovered = false, paused = false, last = 0, suppressClick = false;
  let inView = false, frameId = 0;
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
    clearDrag();
    const step = 360 / visible.length;
    target = (Math.round(-(target ?? angle) / step) + direction) * -step;
    velocity = 0;
    if (reduced.matches) { angle = target; target = null; render(); }
    syncAnimation();
  }
  controls.addEventListener('click', event => {
    const action = event.target.closest('[data-carousel]')?.dataset.carousel;
    if (action === 'prev') move(-1);
    if (action === 'next') move(1);
    if (action === 'pause' && pause) {
      paused = !paused;
      pause.setAttribute('aria-pressed', String(paused));
      pause.textContent = paused ? 'Resume rotation' : 'Pause rotation';
      syncAnimation();
    }
  });
  stage.addEventListener('keydown', event => {
    if (event.target === stage && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  for (const region of [stage, controls]) {
    region.addEventListener('focusin', syncAnimation);
    region.addEventListener('focusout', () => queueMicrotask(syncAnimation));
  }
  stage.addEventListener('pointerenter', () => { hovered = true; syncAnimation(); });
  stage.addEventListener('dragstart', event => {
    if (drag) event.preventDefault();
  });
  stage.addEventListener('pointerleave', event => {
    hovered = false;
    if (!drag?.active) endDrag(event);
    syncAnimation();
  });
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    suppressClick = false;
    if (visible.length < 2 || event.target.closest('a, button')) return;
    const step = 360 / visible.length;
    drag = {
      x: event.clientX, y: event.clientY, angle, id: event.pointerId,
      scale: step / Math.min(300, stage.clientWidth * .7),
      time: event.timeStamp, speed: 0, active: false, interruptedTarget: target
    };
    target = null; velocity = 0;
    syncAnimation();
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    if (!drag.active) {
      const dy = event.clientY - drag.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        endDrag(event);
        return;
      }
      drag.active = true;
      stage.classList.add('is-swiping');
      stage.setPointerCapture(drag.id);
    }
    const next = drag.angle + dx * drag.scale;
    const elapsed = Math.max((event.timeStamp - drag.time) / 1000, .008);
    const speed = (next - angle) / elapsed;
    drag.speed += (speed - drag.speed) * (1 - Math.exp(-elapsed * 35));
    drag.time = event.timeStamp;
    angle = next;
    render();
  });
  function clearDrag() {
    const id = drag?.id;
    drag = null;
    stage.classList.remove('is-swiping');
    if (id !== undefined && stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
  }
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const { active, speed, time, interruptedTarget } = drag;
    clearDrag();
    const released = event.type === 'pointerup';
    suppressClick = active && released;
    const step = 360 / visible.length;
    if (active) {
      velocity = released && event.timeStamp - time < 80
        ? Math.max(-step * 8, Math.min(step * 8, speed)) : 0;
      target = Math.round((angle + velocity * .12) / step) * step;
    } else {
      target = interruptedTarget;
    }
    if (reduced.matches && target !== null) { angle = target; target = null; render(); }
    syncAnimation();
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', event => {
    if (event.target === stage) endDrag(event);
  });
  stage.addEventListener('click', event => {
    if (suppressClick && event.detail) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }
  }, true);
  stage.closest('section')?.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    clearDrag();
    suppressClick = false;
    visible = cards.filter(card => !card.hidden);
    cards.forEach(card => { card.inert = card.hidden; });
    angle = 0; target = null; velocity = 0; render();
    syncAnimation();
  }));
  function resize() {
    const maxRadius = Number(stage.dataset.carouselRadius ?? 330);
    radius = Math.min(stage.clientWidth * .43, maxRadius);
    render();
  }
  new ResizeObserver(resize).observe(stage);
  reduced.addEventListener('change', () => { move(0); });
  document.addEventListener('visibilitychange', syncAnimation);

  function syncAnimation() {
    const rotating = pause && !paused && !hovered && !reduced.matches && visible.length > 1 &&
      !stage.contains(document.activeElement) && !controls.contains(document.activeElement);
    if (inView && !document.hidden && !drag && (target !== null || rotating)) {
      if (!frameId) frameId = requestAnimationFrame(frame);
    } else {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      last = 0;
    }
  }

  function frame(time) {
    frameId = 0;
    const dt = last ? Math.min((time - last) / 1000, .05) : 0;
    last = time;
    if (target !== null) {
      const offset = angle - target;
      const impulse = velocity + 18 * offset;
      const decay = Math.exp(-18 * dt);
      angle = target + (offset + impulse * dt) * decay;
      velocity = (velocity - 18 * impulse * dt) * decay;
      if (Math.abs(target - angle) < .05 && Math.abs(velocity) < 1) {
        angle = target;
        target = null;
      }
    } else {
      angle -= 14 * dt;
    }
    render();
    syncAnimation();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAnimation();
    }).observe(stage);
  } else {
    const checkViewport = () => {
      const { top, bottom } = stage.getBoundingClientRect();
      inView = bottom > 0 && top < innerHeight;
      syncAnimation();
    };
    addEventListener('scroll', checkViewport, { passive: true });
    addEventListener('resize', checkViewport);
    checkViewport();
  }
  resize();
});
