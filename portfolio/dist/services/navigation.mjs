const header = document.querySelector('.svc-header');
const menu = header.querySelector('.svc-menu-toggle');
const navigation = document.getElementById(menu.getAttribute('aria-controls'));
const narrow = matchMedia('(max-width: 1080px)');

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
}

menu.hidden = false;
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
narrow.addEventListener('change', event => {
  if (!event.matches) setMenu(false);
});
navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || !narrow.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  setMenu(false);
  if (link.hash && link.pathname === location.pathname) {
    document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  }
});

header.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || menu.getAttribute('aria-expanded') !== 'true') return;
  setMenu(false);
  menu.focus();
});
