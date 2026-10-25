(() => {
  const badge = document.querySelector('.circular-text');
  if (!badge) return;
  const ring = badge.querySelector('.circular-text-ring');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let drag = null;
  const animation = () => ring.getAnimations()[0];
  const speed = value => {
    const spin = animation();
    if (spin && !motion.matches) spin.updatePlaybackRate(value);
  };
  const angle = event => {
    const bounds = badge.getBoundingClientRect();
    return Math.atan2(event.clientY - bounds.top - bounds.height / 2, event.clientX - bounds.left - bounds.width / 2);
  };
  badge.addEventListener('pointerenter', () => speed(4));
  badge.addEventListener('pointerleave', () => { if (!drag) speed(1); });
  badge.addEventListener('pointerdown', event => {
    if (motion.matches || event.button !== 0) return;
    const spin = animation();
    if (!spin) return;
    drag = { id: event.pointerId, angle: angle(event), time: Number(spin.currentTime) || 0 };
    spin.pause();
    badge.setPointerCapture(event.pointerId);
    badge.classList.add('is-dragging');
  });
  badge.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const next = angle(event);
    const delta = Math.atan2(Math.sin(next - drag.angle), Math.cos(next - drag.angle));
    drag.time += delta / (2 * Math.PI) * 20000;
    drag.angle = next;
    const spin = animation();
    if (spin) spin.currentTime = drag.time;
  });
  const release = () => {
    if (!drag) return;
    drag = null;
    badge.classList.remove('is-dragging');
    const spin = animation();
    if (spin && !motion.matches) { spin.play(); speed(badge.matches(':hover') ? 4 : 1); }
  };
  badge.addEventListener('pointerup', release);
  badge.addEventListener('pointercancel', release);
  badge.addEventListener('lostpointercapture', release);
  motion.addEventListener('change', release);
})();
