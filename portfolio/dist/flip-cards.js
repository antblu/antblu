(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.program-card').forEach(card => {
    const button = card.querySelector('.program-toggle');
    const front = card.querySelector('.program-front');
    const back = card.querySelector('.program-back');
    const name = card.getAttribute('aria-label');
    let flipped = false;
    let drag = null;
    let dragged = false;
    const flip = () => {
      flipped = !flipped;
      card.classList.toggle('is-flipped', flipped);
      button.setAttribute('aria-pressed', String(flipped));
      button.setAttribute('aria-label', `Show ${name} ${flipped ? 'overview' : 'implementation'}`);
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
    };
    card.classList.add('flip-ready');
    button.hidden = false;
    back.setAttribute('aria-hidden', 'true');
    button.addEventListener('click', () => {
      if (!dragged) flip();
      dragged = false;
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'Escape' && flipped) flip();
    });
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragged = false;
      drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      if (!reduced.matches && event.pointerType !== 'touch') {
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 24}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 24}deg`);
        card.style.setProperty('--glare-x', `${x * 100}%`);
        card.style.setProperty('--glare-y', `${y * 100}%`);
      }
    });
    button.addEventListener('pointerup', event => {
      if (drag && event.pointerId === drag.id && Math.abs(event.clientX - drag.x) > 35 && Math.abs(event.clientX - drag.x) > Math.abs(event.clientY - drag.y)) {
        dragged = true;
        flip();
      }
      drag = null;
    });
    const reset = () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    };
    button.addEventListener('pointerleave', reset);
    button.addEventListener('pointercancel', () => { drag = null; reset(); });
    reduced.addEventListener('change', reset);
  });
})();
