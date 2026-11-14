import { applications } from './applications.mjs';
import { comparisons } from './comparisons.mjs';

document.querySelector('[data-app-count]').textContent = applications.length;
document.querySelector('[data-category-count]').textContent = new Set(comparisons.map(plan => plan.category)).size;

const menu = document.querySelector('.svc-menu-toggle');
const navigation = document.querySelector('#landing-nav');
const narrow = matchMedia('(max-width: 1000px)');
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('svc-nav-open', open);
}
menu.hidden = false;
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
narrow.addEventListener('change', () => setMenu(false));
navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || !narrow.matches) return;
  setMenu(false);
  if (link.hash && link.pathname === location.pathname) {
    document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  }
});
document.querySelector('.svc-landing-header').addEventListener('keydown', event => {
  if (event.key !== 'Escape' || menu.getAttribute('aria-expanded') !== 'true') return;
  setMenu(false);
  menu.focus();
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
