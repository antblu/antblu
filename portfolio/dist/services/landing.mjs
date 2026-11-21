document.querySelectorAll('[data-kinetic-text]').forEach(element => {
  const text = element.textContent;
  const accessible = document.createElement('span');
  accessible.className = 'svc-sr-only';
  accessible.textContent = text;
  const visual = document.createElement('span');
  visual.className = 'kinetic-text';
  visual.setAttribute('aria-hidden', 'true');
  for (const character of text) {
    const letter = document.createElement('span');
    letter.textContent = character;
    visual.append(letter);
  }
  element.replaceChildren(accessible, visual);
});

// Reuse the homepage's locally bundled React and Base UI primitives.
// Native details remain usable until the island has successfully mounted.
async function enhanceFaq() {
  const fallback = document.querySelector('[data-react-faq]');
  if (!fallback) return;
  try {
    const { createElement: h, createRoot, Accordion, Component, useEffect } = await import('../assets/vendor/emiliany-vendor.js');
    const entries = [...fallback.querySelectorAll('details')].map(item => ({
      icon: item.dataset.icon,
      open: item.open,
      question: item.querySelector('summary').textContent,
      answer: item.querySelector('p').textContent
    }));
    const defaultValue = entries.flatMap((entry, index) => entry.open ? [index] : []);
    const mount = document.createElement('div');
    mount.className = 'svc-faq svc-react-faq';
    fallback.after(mount);
    class Boundary extends Component {
      constructor(props) { super(props); this.state = { failed: false }; }
      static getDerivedStateFromError() { return { failed: true }; }
      componentDidCatch() { fallback.hidden = false; mount.hidden = true; }
      render() { return this.state.failed ? null : this.props.children; }
    }
    function Faq() {
      useEffect(() => { fallback.hidden = true; mount.hidden = false; }, []);
      return h(Accordion.Root, { defaultValue, 'data-slot': 'accordion' }, ...entries.map((entry, index) =>
        h(Accordion.Item, { key: index, value: index, className: 'svc-faq-item', 'data-slot': 'accordion-item' },
          h(Accordion.Header, { className: 'svc-faq-heading', render: h('h3') },
            h(Accordion.Trigger, { className: 'svc-faq-trigger', 'data-slot': 'accordion-trigger' },
              h('span', { className: 'svc-faq-icon', 'aria-hidden': true }, entry.icon),
              h('span', { className: 'svc-faq-label' }, entry.question),
              h('svg', {
                'aria-hidden': true,
                'data-slot': 'accordion-trigger-icon',
                className: 'svc-faq-chevron',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              }, h('path', { d: 'm6 9 6 6 6-6' })))),
          h(Accordion.Panel, { className: 'svc-faq-panel', 'data-slot': 'accordion-content' },
            h('div', { className: 'svc-faq-content' }, h('p', null, entry.answer))))
      ));
    }
    createRoot(mount).render(h(Boundary, null, h(Faq)));
  } catch {
    // Keep the native, keyboard-accessible disclosure fallback.
  }
}
enhanceFaq();

function enhanceSoftwareComparisons() {
  const track = document.querySelector('#software-comparisons');
  const controls = document.querySelector('.svc-map-controls');
  if (!track || !controls) return;

  const previous = controls.querySelector('[data-map-prev]');
  const next = controls.querySelector('[data-map-next]');
  const [firstCard, secondCard] = track.children;

  function updateControls() {
    previous.setAttribute('aria-disabled', track.scrollLeft <= 1);
    next.setAttribute('aria-disabled', track.scrollLeft >= track.scrollWidth - track.clientWidth - 1);
  }

  function move(direction) {
    const step = secondCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left;
    track.scrollBy({ left: direction * step });
  }

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.parentElement.addEventListener('keydown', event => {
    if (!track.contains(event.target) && !controls.contains(event.target)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (track.contains(event.target)) {
      const card = event.key === 'ArrowLeft' ? event.target.previousElementSibling : event.target.nextElementSibling;
      card?.focus();
    } else {
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  track.dataset.scrollSnap = '';
  track.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(track);
  updateControls();
  controls.hidden = false;
}
enhanceSoftwareComparisons();
