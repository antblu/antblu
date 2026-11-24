// Original dependency-free interaction inspired by Aceternity Draggable Card.
(() => {
  const container = document.querySelector('#stack-cards');
  if (!container) return;
  const cards = [...container.querySelectorAll('.stack-card')];
  const search = document.querySelector('#stack-search');
  const category = document.querySelector('#stack-category');
  const count = document.querySelector('#stack-count');
  const desktop = matchMedia('(min-width: 701px)');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const foilMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  function clearFoil(card) {
    ['--foil-x', '--foil-y', '--foil-rx', '--foil-ry'].forEach(name => card.style.removeProperty(name));
  }
  foilMotion.addEventListener('change', () => cards.forEach(clearFoil));
  const positions = new Map();
  const settling = new Map();
  let layer = 0;
  let drag = null;

  function positionCard(card, x, y) {
    positions.set(card, { x, y });
    card.style.translate = `${x}px ${y}px`;
  }
  function dragBounds(card, position) {
    const limit = container.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    return {
      left: position.x + limit.left - rect.left + 10,
      right: position.x + limit.right - rect.right - 10,
      top: position.y + limit.top - rect.top + 10,
      bottom: position.y + limit.bottom - rect.bottom - 10
    };
  }
  function constrain(value, min, max, elastic = false) {
    const edge = Math.max(min, Math.min(max, value));
    return elastic ? edge + 16 * Math.tanh((value - edge) / 64) : edge;
  }
  function stopSettle(card, catchAtCurrentPosition = false) {
    const animation = settling.get(card);
    if (!animation) return;
    if (catchAtCurrentPosition) {
      const [x, y] = getComputedStyle(card).translate.split(' ').map(parseFloat);
      if (Number.isFinite(x)) positionCard(card, x, y || 0);
    }
    settling.delete(card);
    animation.cancel();
  }
  function settle(card, bounds, speedX, speedY) {
    const start = positions.get(card);
    const x = constrain(start.x, bounds.left, bounds.right);
    const y = constrain(start.y, bounds.top, bounds.bottom);
    positionCard(card, x, y);
    const dx = start.x - x;
    const dy = start.y - y;
    if (!motion.matches || (!dx && !dy)) return;

    // Sample a damped spring so the compositor can run it without layout reads.
    function spring(delta, speed, time) {
      if (!delta) return 0;
      const velocity = Math.max(-240, Math.min(240, speed));
      return (delta + (velocity + 20 * delta) * time) * Math.exp(-20 * time);
    }
    const keyframes = Array.from({ length: 16 }, (_, index) => {
      const time = index * .02;
      return { translate: `${x + spring(dx, speedX, time)}px ${y + spring(dy, speedY, time)}px` };
    });
    keyframes.push({ translate: card.style.translate });
    const animation = card.animate(keyframes, { duration: 320 });
    settling.set(card, animation);
    animation.onfinish = () => {
      if (settling.get(card) === animation) settling.delete(card);
    };
  }
  function clearDrag() {
    if (!drag) return;
    const { card, handle, id } = drag;
    drag = null;
    card.classList.remove('is-dragging');
    if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
  }
  function reset() {
    clearDrag();
    cards.forEach(card => {
      stopSettle(card);
      positions.delete(card);
      card.style.removeProperty('translate');
      card.style.removeProperty('z-index');
      card.classList.remove('is-dragging');
      clearFoil(card);
    });
    layer = 0;
  }
  function filter() {
    reset();
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      card.hidden = !(card.textContent.toLowerCase().includes(query) && (category.value === 'all' || card.dataset.stackCategory === category.value));
      if (!card.hidden) visible++;
    });
    count.textContent = visible ? `${visible} of ${cards.length} services` : 'No services found. Try another search or category.';
  }
  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!foilMotion.matches || event.pointerType === 'touch' || drag) return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      card.style.setProperty('--foil-x', `${x * 100}%`);
      card.style.setProperty('--foil-y', `${y * 100}%`);
      card.style.setProperty('--foil-rx', `${(0.5 - y) * 14}deg`);
      card.style.setProperty('--foil-ry', `${(x - 0.5) * 14}deg`);
    });
    card.addEventListener('pointerleave', () => clearFoil(card));
    const handle = card.querySelector('.stack-handle');
    handle.addEventListener('pointerdown', event => {
      if (!desktop.matches || !event.isPrimary || event.button !== 0 || drag) return;
      stopSettle(card, true);
      const position = positions.get(card) || { x: 0, y: 0 };
      positionCard(card, position.x, position.y);
      drag = {
        card, handle, id: event.pointerId, startX: event.clientX, startY: event.clientY, ...position,
        bounds: dragBounds(card, position), time: event.timeStamp, speedX: 0, speedY: 0
      };
      card.style.zIndex = String(++layer);
      card.classList.add('is-dragging');
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
      handle.focus({ preventScroll: true });
    });
    handle.addEventListener('pointermove', event => {
      if (!drag || drag.card !== card || drag.id !== event.pointerId) return;
      const { bounds, time } = drag;
      const x = constrain(drag.x + event.clientX - drag.startX, bounds.left, bounds.right, motion.matches);
      const y = constrain(drag.y + event.clientY - drag.startY, bounds.top, bounds.bottom, motion.matches);
      const previous = positions.get(card);
      const elapsed = Math.max((event.timeStamp - time) / 1000, .008);
      drag.speedX = (x - previous.x) / elapsed;
      drag.speedY = (y - previous.y) / elapsed;
      drag.time = event.timeStamp;
      positionCard(card, x, y);
    });
    const end = event => {
      if (!drag || drag.card !== card || drag.id !== event.pointerId) return;
      const { bounds, speedX, speedY, time } = drag;
      const flung = event.type === 'pointerup' && event.timeStamp - time < 80;
      clearDrag();
      settle(card, bounds, flung ? speedX : 0, flung ? speedY : 0);
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('lostpointercapture', end);
    handle.addEventListener('keydown', event => {
      if (!desktop.matches || drag) return;
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (event.key === 'Home') {
        event.preventDefault();
        stopSettle(card);
        positions.delete(card);
        card.style.removeProperty('translate');
      } else if (directions[event.key]) {
        event.preventDefault();
        stopSettle(card, true);
        const position = positions.get(card) || { x: 0, y: 0 };
        const [dx, dy] = directions[event.key];
        const step = event.shiftKey ? 50 : 16;
        const bounds = dragBounds(card, position);
        card.style.zIndex = String(++layer);
        positionCard(card, constrain(position.x + dx * step, bounds.left, bounds.right),
          constrain(position.y + dy * step, bounds.top, bounds.bottom));
      }
    });
  });
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  document.querySelector('#stack-reset').addEventListener('click', event => {
    reset();
    if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      event.currentTarget.animate([{ opacity: 1 }, { opacity: .6 }, { opacity: 1 }], { duration: 220 });
    }
  });
  window.addEventListener('resize', reset);
  motion.addEventListener('change', () => {
    if (!motion.matches) settling.forEach((_, card) => stopSettle(card));
  });
  filter();
})();
