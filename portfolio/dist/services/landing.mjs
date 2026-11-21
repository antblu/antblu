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
      question: item.querySelector('summary').textContent,
      answer: item.querySelector('p').textContent
    }));
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
      return h(Accordion.Root, { multiple: true }, ...entries.map((entry, index) =>
        h(Accordion.Item, { key: index, value: index, className: 'svc-faq-item' },
          h(Accordion.Header, { className: 'svc-faq-heading' },
            h(Accordion.Trigger, { className: 'svc-faq-trigger' }, entry.question,
              h('span', { 'aria-hidden': true, className: 'svc-faq-plus' }, '+'))),
          h(Accordion.Panel, { className: 'svc-faq-panel' }, h('p', null, entry.answer)))
      ));
    }
    createRoot(mount).render(h(Boundary, null, h(Faq)));
  } catch {
    // Keep the native, keyboard-accessible disclosure fallback.
  }
}
enhanceFaq();
