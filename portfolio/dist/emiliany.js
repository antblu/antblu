// Enhance the case study; without JavaScript all three stories remain readable.
(() => {
  const root = document.querySelector('#emiliany');
  if (!root) return;
  const controls = root.querySelector('.em-story-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const stories = [...root.querySelectorAll('.em-story')];
  function selectStory(button) {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    stories.forEach(story => { story.hidden = story.id !== button.getAttribute('aria-controls'); });
  }
  buttons.forEach(button => button.addEventListener('click', () => selectStory(button)));
  selectStory(buttons[0]);
  controls.hidden = false;
})();
