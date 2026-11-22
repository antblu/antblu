const video = document.querySelector('#app-tour video');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

function applyMotionPreference() {
  video.autoplay = !motion.matches;
  if (motion.matches) video.pause();
}

applyMotionPreference();
motion.addEventListener('change', applyMotionPreference);
