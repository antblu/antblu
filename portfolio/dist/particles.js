/* Dependency-free canvas particle field inspired by React Bits Particles.
   https://reactbits.dev/backgrounds/particles */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  document.querySelectorAll('.hero, .intro, footer:not(.blog-author)').forEach(surface => {
    const canvas = document.createElement('canvas');
    canvas.className = 'particles-background';
    canvas.setAttribute('aria-hidden', 'true');
    surface.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const points = Array.from({ length: 65 }, () => ({
      x: Math.random(), y: Math.random(), z: .3 + Math.random() * .7,
      phase: Math.random() * Math.PI * 2
    }));
    let width = 1;
    let height = 1;
    let visible = true;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    const pointer = { x: 0, y: 0 };
    const draw = now => {
      raf = 0;
      if (!visible || document.hidden || forced.matches) { last = 0; return; }
      if (last && !motion.matches) elapsed += Math.min(now - last, 50) / 1000;
      last = now;
      ctx.clearRect(0, 0, width, height);
      const dark = surface.matches('.intro, footer') || document.documentElement.dataset.theme === 'dark';
      ctx.fillStyle = dark ? '#b9caff' : '#4d6bff';
      points.forEach(point => {
        const x = ((point.x + elapsed * .008 * point.z) % 1) * width + pointer.x * point.z * 16;
        const y = ((point.y + elapsed * .012 * point.z) % 1) * height + pointer.y * point.z * 16;
        const pulse = motion.matches ? .7 : .65 + .2 * Math.sin(elapsed * .8 + point.phase);
        ctx.globalAlpha = pulse * point.z;
        ctx.shadowColor = dark ? '#9dafff' : '#4d6bff';
        ctx.shadowBlur = point.z * 8;
        ctx.beginPath();
        ctx.arc(x, y, .7 + point.z * 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!motion.matches) raf = requestAnimationFrame(draw);
    };
    const refresh = () => { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(draw); };
    new ResizeObserver(() => {
      width = Math.max(1, surface.clientWidth);
      height = Math.max(1, surface.clientHeight);
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      refresh();
    }).observe(surface);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; refresh(); }).observe(surface);
    surface.addEventListener('pointermove', event => {
      if (motion.matches) return;
      const rect = surface.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / width - .5;
      pointer.y = (event.clientY - rect.top) / height - .5;
    }, { passive: true });
    surface.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
    motion.addEventListener('change', () => { pointer.x = pointer.y = 0; refresh(); });
    forced.addEventListener('change', refresh);
    document.addEventListener('visibilitychange', refresh);
    new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  });
})();
