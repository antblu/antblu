const header = document.querySelector('.svc-header');
const menu = header.querySelector('.svc-menu-toggle');
const navigation = document.getElementById(menu.getAttribute('aria-controls'));
const narrow = matchMedia('(max-width: 700px)');
navigation.querySelectorAll('a').forEach((link, index) => link.style.setProperty('--row-delay', `${index * 30}ms`));

function setMenu(open) {
  if (open) {
    const trigger = menu.getBoundingClientRect();
    const headerLeft = header.getBoundingClientRect().left;
    navigation.style.setProperty('--menu-origin', (trigger.left + trigger.width / 2 - headerLeft) + 'px');
  }
  navigation.inert = narrow.matches && !open;
  menu.setAttribute('aria-expanded', String(open));
}

menu.hidden = false;
setMenu(false);
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
narrow.addEventListener('change', () => {
  setMenu(false);
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
