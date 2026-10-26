import { createElement as h, useEffect, Component, createRoot, Tabs, Accordion } from './assets/vendor/emiliany-vendor.js';

// Gooey Nav adaptation: https://reactbits.dev/c/components/gooey-nav
// Upstream attribution: assets/react-bits-LICENSE.md. Keep Base UI tab semantics.
function enhanceGooeyNav(list) {
  if (!list) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const layer = document.createElement('div');
  layer.className = 'em-gooey-layer';
  layer.setAttribute('aria-hidden', 'true');
  const pill = document.createElement('i');
  pill.className = 'em-gooey-pill';
  layer.append(pill);
  list.prepend(layer);
  let previous = null;
  const animations = new Set();
  const clear = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
    layer.querySelectorAll('.em-gooey-drop').forEach(drop => drop.remove());
  };
  const place = () => {
    const active = list.querySelector('.em-tab[data-active]');
    if (!active) return;
    const outer = list.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const next = { x: rect.left - outer.left - list.clientLeft, y: rect.top - outer.top - list.clientTop, width: rect.width, height: rect.height };
    Object.assign(pill.style, { left: `${next.x}px`, top: `${next.y}px`, width: `${next.width}px`, height: `${next.height}px` });
    if (previous && previous.element !== active && !reduced.matches && !forced.matches) {
      clear();
      for (let index = 0; index < 15; index++) {
        const drop = document.createElement('i');
        drop.className = 'em-gooey-drop';
        layer.append(drop);
        const angle = Math.random() * Math.PI * 2;
        const radius = 28 + Math.random() * 28;
        const startX = previous.x + previous.width / 2;
        const startY = previous.y + previous.height / 2;
        const endX = next.x + next.width / 2;
        const endY = next.y + next.height / 2;
        const animation = drop.animate([
          { transform: `translate(${startX}px, ${startY}px) scale(.5)` },
          { transform: `translate(${(startX + endX) / 2 + Math.cos(angle) * radius}px, ${(startY + endY) / 2 + Math.sin(angle) * radius}px) scale(1)`, offset: .5 },
          { transform: `translate(${endX}px, ${endY}px) scale(0)` },
        ], { duration: 600 + (Math.random() - .5) * 300, easing: 'cubic-bezier(.45,0,.2,1)' });
        animations.add(animation);
        animation.onfinish = () => { animations.delete(animation); drop.remove(); };
      }
    }
    previous = { ...next, element: active };
  };
  const observer = new MutationObserver(place);
  observer.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-active'] });
  const resize = new ResizeObserver(() => { previous = null; clear(); place(); });
  resize.observe(list);
  const preferences = () => { clear(); previous = null; place(); };
  reduced.addEventListener('change', preferences);
  forced.addEventListener('change', preferences);
  place();
  return () => {
    clear(); observer.disconnect(); resize.disconnect(); layer.remove();
    reduced.removeEventListener('change', preferences);
    forced.removeEventListener('change', preferences);
  };
}

// Bounce Cards adaptation: https://reactbits.dev/c/components/bounce-cards
// Upstream attribution: assets/react-bits-LICENSE.md. Text replaces image faces.
function JourneyCards({ journey }) {
  useEffect(() => {
    const list = document.getElementById(`em-bounce-${journey.id}`);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const reveal = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        list.classList.add('em-bounce-visible');
        reveal.disconnect();
      }
    }, { threshold: .15 });
    reveal.observe(list);
    const select = index => {
      [...list.children].forEach((card, position) => {
        card.style.setProperty('--bounce-push', `${index < 0 || position === index ? 0 : Math.sign(position - index) * 36}px`);
        card.toggleAttribute('data-bounce-active', position === index);
      });
    };
    const move = event => {
      if (event.pointerType === 'touch' || reduced.matches) return;
      const rect = list.getBoundingClientRect();
      const fraction = (event.clientX - rect.left) / rect.width;
      select(Math.max(0, Math.min(journey.steps.length - 1, Math.floor(fraction * journey.steps.length))));
    };
    const reset = () => select(-1);
    const focus = event => select([...list.children].indexOf(event.target.closest('li')));
    list.addEventListener('pointermove', move);
    list.addEventListener('pointerleave', reset);
    list.addEventListener('focusin', focus);
    list.addEventListener('focusout', reset);
    reduced.addEventListener('change', reset);
    return () => {
      reveal.disconnect();
      list.removeEventListener('pointermove', move);
      list.removeEventListener('pointerleave', reset);
      list.removeEventListener('focusin', focus);
      list.removeEventListener('focusout', reset);
      reduced.removeEventListener('change', reset);
    };
  }, [journey.id]);
  return h('ol', { id: `em-bounce-${journey.id}`, className: 'em-steps em-bounce-cards' },
    journey.steps.map((step, index) => h('li', {
      key: step.title, tabIndex: 0,
      style: { '--bounce-rotation': `${[10, 5, -3][index]}deg`, '--bounce-delay': `${.5 + index * .06}s` },
    }, h('span', { className: 'em-step-number' }, `0${index + 1}`), h('h5', null, step.title), h('p', null, step.body))));
}

// Read the editorial content from HTML so the no-JavaScript experience stays complete.
const fallback = document.querySelector('#em-fallback');
const mount = document.querySelector('#em-interactive');
if (fallback && mount) {
  const journeys = [...fallback.querySelectorAll('.em-journey')].map(article => ({
    id: article.dataset.journey,
    label: article.dataset.label,
    title: article.querySelector('h4').textContent,
    lead: article.querySelector('.em-journey-intro p').textContent,
    steps: [...article.querySelectorAll('li')].map(step => ({
      title: step.querySelector('h5').textContent,
      body: step.querySelector('p').textContent,
    })),
    question: article.querySelector('summary').textContent,
    answer: article.querySelector('details p').textContent,
  }));

  class FallbackBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch() { fallback.hidden = false; }
    render() { return this.state.failed ? null : this.props.children; }
  }

  function JourneyExplorer() {
    useEffect(() => {
      fallback.hidden = true;
      const dispose = enhanceGooeyNav(mount.querySelector('.em-tab-list'));
      return () => { dispose(); fallback.hidden = false; };
    }, []);
    return h(Tabs.Root, { defaultValue: 'shop', className: 'em-tabs' },
      h(Tabs.List, { className: 'em-tab-list em-gooey-nav', 'aria-label': 'Customer journeys' },
        journeys.map((journey, index) => h(Tabs.Tab, { key: journey.id, value: journey.id, className: 'em-tab' },
          h('span', { 'aria-hidden': true }, `0${index + 1}`), journey.label)),
        h(Tabs.Indicator, { className: 'em-tab-indicator' })),
      journeys.map(journey => h(Tabs.Panel, { key: journey.id, value: journey.id, className: 'em-journey' },
        h('div', { className: 'em-journey-intro' }, h('h4', null, journey.title), h('p', null, journey.lead)),
        h(JourneyCards, { journey }),
        h(Accordion.Root, { className: 'em-accordion' },
          h(Accordion.Item, null,
            h(Accordion.Header, null, h(Accordion.Trigger, { className: 'em-accordion-trigger' }, journey.question, h('span', { 'aria-hidden': true }, '+'))),
            h(Accordion.Panel, { className: 'em-accordion-panel' }, h('p', null, journey.answer)))))));
  }

  createRoot(mount).render(h(FallbackBoundary, null, h(JourneyExplorer)));
}
