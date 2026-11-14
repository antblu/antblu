const themeButton = document.querySelector('.theme-toggle, [data-svc-theme]');
if (themeButton) initTheme(themeButton);

function initTheme(themeButton) {
  const lightColor = themeButton.hasAttribute('data-svc-theme') ? '#eef5fc' : '#dcecff';
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let savedTheme;
  try { savedTheme = localStorage.getItem('antblu-theme'); } catch {}
  let followsSystem = savedTheme !== 'light' && savedTheme !== 'dark';
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const dark = theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#070d16' : lightColor;
  }
  applyTheme(followsSystem ? (systemTheme.matches ? 'dark' : 'light') : savedTheme);
  if (themeButton.hasAttribute('data-svc-theme')) themeButton.hidden = false;
  const reducedThemeMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let themeTransition;
  themeButton.addEventListener('click', () => {
    const toggleTheme = () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      followsSystem = false;
      try { localStorage.setItem('antblu-theme', theme); } catch {}
      applyTheme(theme);
    };

    themeTransition?.skipTransition();
    if (!document.startViewTransition || reducedThemeMotion.matches) {
      toggleTheme();
      return;
    }

    // Match Magic UI's circular reveal from the center of the toggle.
    const { left, top, width, height } = themeButton.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(toggleTheme);
    themeTransition = transition;
    transition.ready.then(() => {
      document.documentElement.animate({
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]
      }, { duration: 400, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => transition.skipTransition());
    transition.finished.then(() => {
      if (themeTransition === transition) themeTransition = undefined;
    });
  });
  systemTheme.addEventListener('change', event => {
    if (followsSystem) applyTheme(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== 'antblu-theme' && event.key !== null) return;
    followsSystem = event.newValue !== 'light' && event.newValue !== 'dark';
    applyTheme(followsSystem ? (systemTheme.matches ? 'dark' : 'light') : event.newValue);
  });
}
