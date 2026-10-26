// Buildless adaptation of the shadcn/ui Tabs interaction pattern.
(() => {
  const list = document.querySelector('.lab-tabs');
  if (!list) return;
  const tabs = [...list.querySelectorAll('button')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  list.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });
  select(0);
  list.hidden = false;
})();

// Buildless adaptation of React Bits Accordion Gallery by David Haz.
// https://reactbits.dev/c/components/accordion-gallery
(() => {
  const gallery = document.querySelector('.lab-hardware');
  if (!gallery) return;
  const panels = [...gallery.querySelectorAll('.machine-panel')];
  if (!panels.length) return;
  const buttons = panels.map((panel, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'machine-toggle';
    button.setAttribute('aria-controls', panel.querySelector('.machine-copy').id);
    button.setAttribute('aria-label', panel.querySelector('h4').textContent);
    const label = document.createElement('span');
    label.className = 'machine-title';
    label.textContent = panel.querySelector('h4').textContent;
    const number = document.createElement('span');
    number.className = 'machine-number';
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    button.append(label, number);
    panel.append(button);
    return button;
  });
  function activate(index, focus = false) {
    panels.forEach((panel, i) => {
      const active = i === index;
      panel.classList.toggle('is-active', active);
      panel.style.setProperty('--machine-tilt', active ? '0deg' : i < index ? '8deg' : '-8deg');
      panel.style.setProperty('--machine-drift', `${Math.max(-1.5, Math.min(1.5, index - i)) * 3}%`);
      panel.querySelector('.machine-copy').hidden = !active;
      buttons[i].setAttribute('aria-expanded', String(active));
    });
    if (focus) buttons[index].focus({ preventScroll: true });
  }
  panels.forEach((panel, index) => {
    panel.addEventListener('pointerenter', event => {
      // Keep the focused card visible while navigating with the keyboard.
      if (event.pointerType === 'mouse' && !gallery.querySelector('.machine-toggle:focus-visible')) activate(index);
    });
    buttons[index].addEventListener('focus', () => activate(index));
    buttons[index].addEventListener('click', () => activate(index));
    buttons[index].addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % panels.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + panels.length - 1) % panels.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = panels.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activate(next, true);
    });
  });
  activate(Math.min(2, panels.length - 1));
  gallery.classList.add('is-accordion');
})();

// React Bits Depth Carousel by David Haz, adapted for a buildless photo gallery.
// https://reactbits.dev/c/components/depth-carousel
// License: assets/react-bits-LICENSE.md
(() => {
  const gallery = document.querySelector('.lab-gallery');
  if (!gallery) return;
  const cards = [...gallery.querySelectorAll('figure')];
  if (cards.length < 2) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.createElement('div');
  stage.className = 'lab-depth-stage';
  stage.append(...cards);
  const controls = document.createElement('div');
  controls.className = 'lab-depth-controls';
  const makeButton = (label, content, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.textContent = content;
    button.addEventListener('click', action);
    return button;
  };
  let active = 0;
  let position = 0;
  let frame = 0;
  let drag = null;
  let suppressClick = false;
  const normalize = value => ((value % cards.length) + cards.length) % cards.length;
  const status = document.createElement('p');
  status.className = 'lab-depth-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-atomic', 'true');
  const dots = document.createElement('div');
  dots.className = 'lab-depth-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Choose a homelab photo');
  const selectors = cards.map((card, index) => {
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${index + 1} of ${cards.length}`);
    card.querySelector('img').draggable = false;
    const button = makeButton(`Show photo ${index + 1}: ${card.querySelector('figcaption').textContent}`, String(index + 1).padStart(2, '0'), () => select(index));
    dots.append(button);
    return button;
  });
  function layout(value) {
    const scale = Math.min(1, gallery.clientWidth / 520, (stage.clientHeight - 36) / 440);
    cards.forEach((card, index) => {
      let distance = normalize(index - value);
      if (distance > cards.length / 2) distance -= cards.length;
      const back = Math.max(0, distance);
      card.style.transform = `translate(-50%, -50%) scale(${scale}) translateX(${110 * distance}px) translateZ(${-220 * distance}px) rotateY(${22 * Math.max(0, Math.min(1, distance))}deg)`;
      card.style.opacity = String(distance < 0 ? Math.max(0, 1 + distance) : 1);
      card.style.filter = `brightness(${Math.max(.15, 1 - back * .2)}) blur(${back * 1.2}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
    });
  }
  function select(rawIndex, animate = true) {
    cancelAnimationFrame(frame);
    active = normalize(rawIndex);
    let delta = normalize(active - position);
    if (delta > cards.length / 2) delta -= cards.length;
    const start = position;
    const target = start + delta;
    const started = performance.now();
    cards.forEach((card, index) => {
      const current = index === active;
      // Only the front photo is exposed to keyboard and assistive technology.
      card.inert = !current;
      card.setAttribute('aria-hidden', String(!current));
      selectors[index].setAttribute('aria-pressed', String(current));
    });
    status.textContent = `${active + 1} / ${cards.length} · ${cards[active].querySelector('figcaption').textContent}`;
    function tick(now) {
      const progress = motion.matches || !animate ? 1 : Math.min(1, (now - started) / 700);
      position = start + (target - start) * (1 - Math.pow(1 - progress, 4));
      layout(position);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else position = active;
    }
    tick(started);
  }
  controls.append(makeButton('Previous homelab photo', '←', () => select(active - 1)), dots, makeButton('Next homelab photo', '→', () => select(active + 1)));
  gallery.append(stage, controls, status);
  gallery.classList.add('is-depth');
  gallery.setAttribute('role', 'group');
  gallery.setAttribute('aria-roledescription', 'carousel');
  stage.tabIndex = 0;
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-label', 'Homelab photos. Swipe or use Left and Right arrow keys.');
  gallery.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = active + 1;
    if (event.key === 'ArrowLeft') next = active - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = cards.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    // Keep focus outside a slide before it becomes inert.
    if (stage.contains(document.activeElement)) stage.focus({ preventScroll: true });
    select(next);
  });
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false };
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(event.clientY - drag.y)) {
      drag.moved = true;
      suppressClick = true;
      stage.setPointerCapture(event.pointerId);
      cancelAnimationFrame(frame);
    }
    if (drag.moved) {
      position = active - dx / Math.max(80, gallery.clientWidth * .35);
      layout(position);
    }
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (moved) select(event.type === 'pointercancel' ? active : Math.round(position));
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('lostpointercapture', event => {
    if (event.target === stage && drag) { drag = null; select(active); }
  });
  stage.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) { event.preventDefault(); suppressClick = false; }
  }, true);
  // Preserve vertical page scrolling; navigation is explicit, with no autoplay.
  new ResizeObserver(() => layout(position)).observe(gallery);
  motion.addEventListener('change', () => select(active, false));
  select(0, false);
})();

// Adapted from React Bits Chroma Grid by David Haz.
// https://reactbits.dev/c/components/chroma-grid — assets/react-bits-LICENSE.md.
(() => {
  const root = document.querySelector('.lab-vlans.chroma-grid');
  if (!root || !CSS.supports('mask-image', 'radial-gradient(black, transparent)')) return;
  const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const areas = [...root.querySelectorAll('[data-chroma-area]')];
  const stops = [];
  // A 60% soft edge with the source component's smootherstep falloff.
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const u = Math.min(1, Math.max(0, (t - .4) / .6));
    const alpha = 1 - u * u * u * (u * (u * 6 - 15) + 10);
    stops.push(`rgba(0, 0, 0, ${alpha.toFixed(3)}) ${(t * 100).toFixed(1)}%`);
  }
  root.style.setProperty('--chroma-stops', stops.join(', '));
  root.classList.add('is-chroma');
  const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0 };
  let raf = 0;
  let last = 0;

  function place() {
    const box = root.getBoundingClientRect();
    areas.forEach(area => {
      const rect = area.getBoundingClientRect();
      area.style.setProperty('--chroma-ox', `${rect.left - box.left}px`);
      area.style.setProperty('--chroma-oy', `${rect.top - box.top}px`);
    });
  }

  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const follow = 1 - Math.exp(-dt / (.45 * .32));
    state.x += (state.tx - state.x) * follow;
    state.y += (state.ty - state.y) * follow;
    const span = state.target > state.power ? .1 : .6 * .35;
    state.power += (state.target - state.power) * (1 - Math.exp(-dt / span));
    const settled = Math.abs(state.tx - state.x) < .1 && Math.abs(state.ty - state.y) < .1 && Math.abs(state.target - state.power) < .002;
    if (settled) state.power = state.target;
    root.style.setProperty('--chroma-x', `${state.x.toFixed(2)}px`);
    root.style.setProperty('--chroma-y', `${state.y.toFixed(2)}px`);
    root.style.setProperty('--chroma-power', state.power.toFixed(4));
    if (settled) last = 0;
    else raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function move(event) {
    if (!motion.matches || event.pointerType === 'touch') return;
    const box = root.getBoundingClientRect();
    state.tx = event.clientX - box.left;
    state.ty = event.clientY - box.top;
    if (state.power < .02) {
      place();
      state.x = state.tx;
      state.y = state.ty;
    }
    state.target = 1;
    wake();
  }

  function leave() {
    state.target = 0;
    wake();
  }

  function reset() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    state.power = state.target = 0;
    root.style.setProperty('--chroma-power', '0');
  }

  new ResizeObserver(place).observe(root);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', leave);
  root.addEventListener('pointercancel', leave);
  motion.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
})();
