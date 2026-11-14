const header = document.querySelector('.svc-header');
const menu = header.querySelector('.svc-menu-toggle');
const navigation = document.getElementById(menu.getAttribute('aria-controls'));
const narrow = matchMedia('(max-width: 700px)');

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
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (narrow.matches) setMenu(false);
});

document.addEventListener('click', event => {
  if (!header.contains(event.target)) setMenu(false);
});

header.addEventListener('focusout', event => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
});

header.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || menu.getAttribute('aria-expanded') !== 'true') return;
  setMenu(false);
  menu.focus();
});
