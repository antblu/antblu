import { createElement as h, useEffect, Component, createRoot, Tabs, Accordion } from './assets/vendor/emiliany-vendor.js';

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
      style: { '--bounce-rotation': `${[10, 5, -3][index]}deg`, '--bounce-delay': `${index * 30}ms` },
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
      return () => { fallback.hidden = false; };
    }, []);
    return h(Tabs.Root, { defaultValue: 'shop', className: 'em-tabs' },
      h(Tabs.List, { className: 'em-tab-list', 'aria-label': 'Customer journeys' },
        journeys.map(journey => h(Tabs.Tab, { key: journey.id, value: journey.id, className: 'em-tab' }, journey.label)),
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
