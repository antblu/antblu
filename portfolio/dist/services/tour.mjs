const video = document.querySelector('#app-tour > video');
const teaser = document.querySelector('.consult-tour-teaser');
const teaserVideo = teaser?.querySelector('video');
const motion = matchMedia('(prefers-reduced-motion: reduce)');

function applyMotionPreference() {
  video.autoplay = !motion.matches;
  if (motion.matches) video.pause();
}

applyMotionPreference();
motion.addEventListener('change', applyMotionPreference);

const controls = document.querySelector('.tour-playback');
const toggle = controls.querySelector('button');
const position = controls.querySelector('input');

function syncPlayback() {
  toggle.classList.toggle('is-playing', !video.paused);
  toggle.setAttribute('aria-label', video.paused ? 'Play tour' : 'Pause tour');
}

function syncPosition() {
  position.disabled = !Number.isFinite(video.duration);
  if (position.disabled) return;
  position.max = video.duration;
  position.value = video.currentTime;
  position.setAttribute('aria-valuetext', Math.floor(video.currentTime) + ' seconds');
}

toggle.addEventListener('click', () => {
  if (video.paused) video.play().catch(syncPlayback);
  else video.pause();
});
position.addEventListener('input', () => { video.currentTime = Number(position.value); });
teaser?.addEventListener('toggle', () => {
  if (teaser.open) video.pause();
  else teaserVideo.pause();
});
video.addEventListener('play', () => teaserVideo?.pause());
teaserVideo?.addEventListener('play', () => video.pause());
video.addEventListener('play', syncPlayback);
video.addEventListener('pause', syncPlayback);
video.addEventListener('durationchange', syncPosition);
video.addEventListener('timeupdate', syncPosition);
syncPlayback();
syncPosition();
controls.hidden = false;
video.controls = false;
