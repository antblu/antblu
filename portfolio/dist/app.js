const scrollProgress = document.querySelector('.scroll-progress');
const scrollProgressLabel = scrollProgress.querySelector('span');
const pageScroller = document.scrollingElement;
let scrollProgressFrame = 0;
function updateScrollProgress() {
  scrollProgressFrame = 0;
  const scrollRange = pageScroller.scrollHeight - pageScroller.clientHeight;
  scrollProgress.hidden = scrollRange <= 0;
  if (scrollProgress.hidden) return;

  const percent = Math.min(100, Math.max(0, 100 * pageScroller.scrollTop / scrollRange));
  const label = Math.round(percent);
  scrollProgress.style.setProperty('--scroll-progress-offset', 100 - percent);
  scrollProgress.setAttribute('aria-valuenow', String(label));
  scrollProgressLabel.textContent = `${label}%`;
}
function scheduleScrollProgress() {
  if (!scrollProgressFrame) scrollProgressFrame = requestAnimationFrame(updateScrollProgress);
}
window.addEventListener('scroll', scheduleScrollProgress, { passive: true });
window.addEventListener('resize', scheduleScrollProgress);
window.addEventListener('pageshow', scheduleScrollProgress);
new ResizeObserver(scheduleScrollProgress).observe(document.body);
scheduleScrollProgress();

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  document.querySelectorAll('.project').forEach(project => { project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter; });
  const count = document.querySelectorAll('.project:not([hidden])').length;
  document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
}));
const projectDetails = {
  antalos: { title: 'antalos.', category: 'Infrastructure & self-hosting', description: 'I built and operate Antalos, a self-hosted infrastructure platform on three Proxmox hosts and five Talos Kubernetes nodes. I define VMs with OpenTofu, configure Debian services with Ansible, and use Argo CD to deploy from Git. I review changes in Git and reuse the configuration to set up services again. The repository includes deployment, troubleshooting, and recovery instructions.', topics: ['Kubernetes', 'Proxmox', 'OpenTofu', 'Ansible', 'Argo CD'], url: 'https://github.com/antblu/antalos' },
  cal: { title: 'cal.diy-OIDC.', category: 'Self-hosted applications', description: 'I keep a copy of Cal.diy, an open-source scheduling project. The repository includes the source, setup instructions, project history, and credit to the upstream project.', topics: ['Scheduling', 'Self-hosting', 'Next.js', 'Community project'], url: 'https://github.com/antblu/cal.diy-OIDC' },
  jev: { title: 'jev-ultrafast.', category: 'Browser agents & automation', description: 'I explored how Jev Ultrafast uses what it sees on a page to choose an action and the element to interact with. The repository documents the implementation and credits the upstream project.', topics: ['Python', 'Browser automation', 'Agents', 'Community project'], url: 'https://github.com/antblu/jev-ultrafast' }
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projectDetails[button.dataset.project];
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-category').textContent = project.category;
  document.querySelector('#dialog-description').textContent = project.description;
  document.querySelector('#dialog-link').href = project.url;
  document.querySelector('#dialog-topics').textContent = project.topics.join(', ');
  dialog.dataset.layoutId = button.dataset.project;
  button.dataset.layoutId = button.dataset.project;
  const source = button.getBoundingClientRect();
  dialog.style.setProperty('--trigger-x', (source.left + source.width / 2 - window.innerWidth / 2) + 'px');
  dialog.style.setProperty('--trigger-y', (source.top + source.height / 2 - window.innerHeight / 2) + 'px');
  dialog.showModal();
}));
document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });

// Progressive enhancement of the three About tiles; content stays visible without JS.
(() => {
  const list = document.querySelector('#about .services');
  if (!list) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  list.querySelectorAll('article').forEach((tile, index) => {
    tile.style.setProperty('--about-index', index);
  });
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    list.classList.remove('is-waiting');
    list.classList.add('is-revealing');
    observer.disconnect();
  }, { threshold: .15 });
  list.classList.add('is-waiting');
  observer.observe(list);
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    list.classList.remove('is-waiting', 'is-revealing');
  });
})();

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
  document.querySelectorAll('#hero-title, #home .role').forEach((element, index) => {
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

// Buildless ClickSpark-inspired feedback for deliberate control activations.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  const bursts = new Set();
  const clearBursts = () => {
    bursts.forEach(burst => burst.remove());
    bursts.clear();
  };
  reducedMotion.addEventListener('change', clearBursts);
  forcedColors.addEventListener('change', clearBursts);
  document.addEventListener('visibilitychange', clearBursts);
  window.addEventListener('scroll', clearBursts, { passive: true });

  document.addEventListener('click', event => {
    if (reducedMotion.matches || forcedColors.matches || event.button !== 0) return;
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest('a[href], button, summary, [role="button"]');
    if (!control?.closest('#home') || control.matches(':disabled, [aria-disabled="true"], .stack-handle') ||
        control.closest('[inert], [data-click-spark="off"]')) return;

    const rect = control.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const burst = document.createElement('span');
    burst.className = 'click-spark';
    burst.setAttribute('aria-hidden', 'true');
    // Keyboard and assistive activation use the control's center.
    burst.style.setProperty('--spark-x', `${event.detail === 0 ? rect.left + rect.width / 2 : event.clientX}px`);
    burst.style.setProperty('--spark-y', `${event.detail === 0 ? rect.top + rect.height / 2 : event.clientY}px`);
    for (let index = 0; index < 8; index++) {
      const ray = document.createElement('span');
      ray.style.setProperty('--spark-angle', `${index * 45}deg`);
      burst.append(ray);
    }
    document.body.append(burst);
    bursts.add(burst);
    if (bursts.size > 16) {
      const oldest = bursts.values().next().value;
      oldest.remove();
      bursts.delete(oldest);
    }
    setTimeout(() => {
      burst.remove();
      bursts.delete(burst);
    }, 500);
  }, { capture: true });
})();

// TypingAnimatedText adaptation: https://www.reactcomponents.com/block/1059
(() => {
  const greeting = document.querySelector('[data-typing-text]');
  if (!greeting) return;
  const value = greeting.querySelector('.typing-value');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const words = ['Hi, I’m', 'Hello, I’m', 'Welcome, I’m'];
  let wordIndex = 0;
  let deleting = false;
  let timer;
  function tick() {
    const word = words[wordIndex];
    if (deleting) {
      value.textContent = value.textContent.slice(0, -1);
      if (!value.textContent) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    } else {
      value.textContent = word.slice(0, value.textContent.length + 1);
      if (value.textContent === word) {
        deleting = true;
        timer = setTimeout(tick, 2200);
        return;
      }
    }
    timer = setTimeout(tick, deleting ? 100 : 150);
  }
  function reset() {
    clearTimeout(timer);
    wordIndex = 0;
    deleting = true;
    value.textContent = words[0];
    const active = !reducedMotion.matches && !document.hidden;
    greeting.classList.toggle('is-typing', active);
    if (active) timer = setTimeout(tick, 2200);
  }
  reducedMotion.addEventListener('change', reset);
  document.addEventListener('visibilitychange', reset);
  reset();
})();
