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
