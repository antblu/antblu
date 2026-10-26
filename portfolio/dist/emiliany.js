import { createElement as h, useEffect, Component, createRoot, Tabs, Accordion } from './assets/vendor/emiliany-vendor.js';

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
        journeys.map((journey, index) => h(Tabs.Tab, { key: journey.id, value: journey.id, className: 'em-tab' },
          h('span', { 'aria-hidden': true }, `0${index + 1}`), journey.label)),
        h(Tabs.Indicator, { className: 'em-tab-indicator' })),
      journeys.map(journey => h(Tabs.Panel, { key: journey.id, value: journey.id, className: 'em-journey' },
        h('div', { className: 'em-journey-intro' }, h('h4', null, journey.title), h('p', null, journey.lead)),
        h('ol', { className: 'em-steps' }, journey.steps.map((step, index) => h('li', { key: step.title },
          h('span', { className: 'em-step-number' }, `0${index + 1}`), h('h5', null, step.title), h('p', null, step.body)))),
        h(Accordion.Root, { className: 'em-accordion' },
          h(Accordion.Item, null,
            h(Accordion.Header, null, h(Accordion.Trigger, { className: 'em-accordion-trigger' }, journey.question, h('span', { 'aria-hidden': true }, '+'))),
            h(Accordion.Panel, { className: 'em-accordion-panel' }, h('p', null, journey.answer)))))));
  }

  createRoot(mount).render(h(FallbackBoundary, null, h(JourneyExplorer)));
}
