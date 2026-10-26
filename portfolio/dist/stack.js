// Original dependency-free interaction inspired by Aceternity Draggable Card.
(() => {
  const container = document.querySelector('#stack-cards');
  if (!container) return;
  const cards = [...container.querySelectorAll('.stack-card')];
  const search = document.querySelector('#stack-search');
  const category = document.querySelector('#stack-category');
  const count = document.querySelector('#stack-count');
  const desktop = matchMedia('(min-width: 701px)');
  const foilMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  function clearFoil(card) {
    ['--foil-x', '--foil-y', '--foil-rx', '--foil-ry'].forEach(name => card.style.removeProperty(name));
  }
  foilMotion.addEventListener('change', () => cards.forEach(clearFoil));
  const positions = new Map();
  let layer = 0;
  let drag = null;
  function place(card, x, y) {
    const bounds = container.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    const current = positions.get(card) || { x: 0, y: 0 };
    // Keep the entire card inside the explorer, including its rotated corners.
    x = Math.max(current.x + bounds.left - rect.left + 10, Math.min(x, current.x + bounds.right - rect.right - 10));
    y = Math.max(current.y + bounds.top - rect.top + 10, Math.min(y, current.y + bounds.bottom - rect.bottom - 10));
    positions.set(card, { x, y });
    card.style.setProperty('--card-x', `${x}px`);
    card.style.setProperty('--card-y', `${y}px`);
  }
  function reset() {
    drag = null;
    cards.forEach(card => {
      positions.delete(card);
      card.style.removeProperty('--card-x');
      card.style.removeProperty('--card-y');
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
      if (!desktop.matches || event.button !== 0 || drag) return;
      const position = positions.get(card) || { x: 0, y: 0 };
      drag = { card, id: event.pointerId, startX: event.clientX, startY: event.clientY, ...position };
      card.style.zIndex = String(++layer);
      card.classList.add('is-dragging');
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
      handle.focus({ preventScroll: true });
    });
    handle.addEventListener('pointermove', event => {
      if (!drag || drag.card !== card || drag.id !== event.pointerId) return;
      place(card, drag.x + event.clientX - drag.startX, drag.y + event.clientY - drag.startY);
    });
    const end = () => {
      if (!drag || drag.card !== card) return;
      drag = null;
      card.classList.remove('is-dragging');
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('lostpointercapture', end);
    handle.addEventListener('keydown', event => {
      if (!desktop.matches) return;
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (event.key === 'Home') {
        event.preventDefault();
        positions.delete(card);
        card.style.removeProperty('--card-x');
        card.style.removeProperty('--card-y');
      } else if (directions[event.key]) {
        event.preventDefault();
        const position = positions.get(card) || { x: 0, y: 0 };
        const [dx, dy] = directions[event.key];
        const step = event.shiftKey ? 50 : 16;
        card.style.zIndex = String(++layer);
        place(card, position.x + dx * step, position.y + dy * step);
      }
    });
  });
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  document.querySelector('#stack-reset').addEventListener('click', reset);
  window.addEventListener('resize', reset);
  filter();
})();
