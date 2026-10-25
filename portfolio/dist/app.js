const themeButton = document.querySelector('.theme-toggle');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let savedTheme;
try { savedTheme = localStorage.getItem('antblu-theme'); } catch {}
let followsSystem = savedTheme !== 'light' && savedTheme !== 'dark';
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  document.querySelector('meta[name="theme-color"]').content = dark ? '#070d16' : '#dcecff';
}
applyTheme(document.documentElement.dataset.theme);
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  followsSystem = false;
  try { localStorage.setItem('antblu-theme', theme); } catch {}
  applyTheme(theme);
});
systemTheme.addEventListener('change', event => {
  if (followsSystem) applyTheme(event.matches ? 'dark' : 'light');
});
window.addEventListener('storage', event => {
  if (event.key !== 'antblu-theme' && event.key !== null) return;
  followsSystem = event.newValue !== 'light' && event.newValue !== 'dark';
  applyTheme(followsSystem ? (systemTheme.matches ? 'dark' : 'light') : event.newValue);
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; navigation.classList.toggle('open', open); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
matchMedia('(min-width:701px)').addEventListener('change', closeMenu);
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  document.querySelectorAll('.project').forEach(project => { project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter; });
  const count = document.querySelectorAll('.project:not([hidden])').length;
  document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
}));
const projectDetails = {
  antalos: { title: 'antalos.', category: 'Infrastructure & self-hosting', description: 'A reusable template for hosting an application stack and virtual machines. The reference configuration combines Talos Kubernetes on Proxmox with Debian application VMs. OpenTofu provisions machines, Argo CD reconciles Kubernetes applications, and Ansible configures Debian workloads. The repository includes an operating handbook covering deployment, troubleshooting, and recovery.', tags: ['Kubernetes', 'Proxmox', 'OpenTofu', 'Ansible', 'Argo CD'], url: 'https://github.com/antblu/antalos' },
  cal: { title: 'cal.diy-OIDC.', category: 'Self-hosted applications', description: 'My public repository based on Cal.diy, the community-driven, open-source scheduling platform. Explore the repository for its source, setup instructions, and project history. Cal.diy is an upstream community project; this portfolio links to my copy of that work.', tags: ['Scheduling', 'Self-hosting', 'Next.js', 'Community project'], url: 'https://github.com/antblu/cal.diy-OIDC' },
  jev: { title: 'jev-ultrafast.', category: 'Browser agents & automation', description: 'My public repository exploring Jev Ultrafast, a browser agent with a dynamic, indexed action space. The project translates browser observations into operations and element targets. See the repository for implementation details and upstream attribution.', tags: ['Python', 'Browser automation', 'Agents', 'Community project'], url: 'https://github.com/antblu/jev-ultrafast' }
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projectDetails[button.dataset.project];
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-category').textContent = project.category;
  document.querySelector('#dialog-description').textContent = project.description;
  document.querySelector('#dialog-link').href = project.url;
  document.querySelector('#dialog-tags').replaceChildren(...project.tags.map(tag => { const item = document.createElement('span'); item.textContent = tag; return item; }));
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  for (const name of ['name', 'message']) { const field = form.elements.namedItem(name); field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.'); if (!field.reportValidity()) return; }
  const data = new FormData(form);
  const body = `Hi Anthony,\n\n${data.get('message').trim()}\n\nFrom: ${data.get('name').trim()}\nEmail: ${data.get('email')}${data.get('phone').trim() ? `\nPhone: ${data.get('phone').trim()}` : ''}`;
  window.location.href = `mailto:antblu@antblu.net?subject=${encodeURIComponent(`Portfolio inquiry from ${data.get('name').trim()}`)}&body=${encodeURIComponent(body)}`;
  document.querySelector('#form-status').textContent = 'Your email draft is ready to open. If no email app opens, email antblu@antblu.net directly.';
});
document.querySelectorAll('#contact-form input, #contact-form textarea').forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));

document.addEventListener('click', event => {
  if (navigation.classList.contains('open') && !navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
document.querySelector('#copy-message').addEventListener('click', async () => {
  const form = document.querySelector('#contact-form');
  for (const name of ['name', 'message']) {
    const field = form.elements.namedItem(name);
    field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.');
  }
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = `To: antblu@antblu.net\nSubject: Portfolio inquiry from ${data.get('name').trim()}\n\nHi Anthony,\n\n${data.get('message').trim()}\n\nFrom: ${data.get('name').trim()}\nEmail: ${data.get('email')}${data.get('phone').trim() ? `\nPhone: ${data.get('phone').trim()}` : ''}`;
  const status = document.querySelector('#form-status');
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = 'Message copied. Paste it into your email service and send it to antblu@antblu.net.';
  } catch {
    status.textContent = 'Clipboard access is unavailable. Select and copy your message below, then email antblu@antblu.net.';
    const field = form.elements.namedItem('message');
    field.focus(); field.select();
  }
});

// Cult UI-inspired text entrances, preserving the original semantic text and markup.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  if (reducedMotion.matches || forcedColors.matches || !('IntersectionObserver' in window)) return;
  const presets = ['roll', 'whip', 'fade', 'pop', 'fade-up', 'shift-up', 'whip-up', 'calm-up'];
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      observer.unobserve(element);
      active.add(element);
      element.classList.add('text-entering');
      // Remove animation styles after the longest stagger, including when a tab is backgrounded.
      setTimeout(() => {
        element.classList.remove('text-entering');
        active.delete(element);
      }, 1500);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('#hero-title, #intro-title, .boxed-title, .greeting, .role, .section-lead, .em-intro h2').forEach((element, index) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement.closest('[aria-hidden="true"]') || !node.textContent.trim()
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let wordIndex = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part.trim()) { fragment.append(document.createTextNode(part)); return; }
        const word = document.createElement('span');
        word.className = 'text-enter-word';
        word.dataset.entrance = presets[(index + wordIndex) % presets.length];
        word.style.setProperty('--enter-delay', `${Math.min(wordIndex * 45, 450)}ms`);
        word.textContent = part;
        fragment.append(word);
        wordIndex++;
      });
      node.replaceWith(fragment);
    });
    observer.observe(element);
  });
  function stopMotion() {
    if (!reducedMotion.matches && !forcedColors.matches) return;
    observer.disconnect();
    active.forEach(element => element.classList.remove('text-entering'));
    active.clear();
  }
  reducedMotion.addEventListener('change', stopMotion);
  forcedColors.addEventListener('change', stopMotion);
})();

// Article navigation works as ordinary anchor links without JavaScript.
(() => {
  const toc = document.querySelector('.blog-toc');
  const links = [...toc.querySelectorAll('a')];
  const mobile = matchMedia('(max-width:700px)');
  function updateToc() { toc.open = !mobile.matches; }
  updateToc();
  mobile.addEventListener('change', updateToc);
  links.forEach(link => link.addEventListener('click', () => {
    links.forEach(item => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'location');
    if (mobile.matches) {
      toc.open = false;
      const heading = document.querySelector(link.hash);
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }));
  toc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && toc.open) {
      toc.open = false;
      toc.querySelector('summary').focus();
    }
  });
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    const entry = entries.filter(item => item.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!entry) return;
    links.forEach(link => {
      if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -45% 0px' });
  links.forEach(link => observer.observe(document.querySelector(link.hash)));
})();
