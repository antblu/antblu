// Original, dependency-free adaptation of Magic UI's Text 3D Flip interaction.
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-text-3d-flip]').forEach((element) => {
    const text = element.textContent;
    const accessibleText = document.createElement('span');
    accessibleText.className = 'sr-only';
    accessibleText.textContent = text;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    let index = 0;
    text.split(' ').forEach((word, wordIndex) => {
      if (wordIndex) visual.append(' ');
      const group = document.createElement('span');
      group.className = 'text-flip-word';
      Array.from(word).forEach((character) => {
        const letter = document.createElement('span');
        letter.className = 'text-flip-letter';
        letter.style.setProperty('--flip-delay', `${index++ * 0.03}s`);
        for (const face of ['front', 'top']) {
          const span = document.createElement('span');
          span.className = `text-flip-${face}`;
          span.textContent = character;
          letter.append(span);
        }
        group.append(letter);
      });
      visual.append(group);
    });
    element.replaceChildren(accessibleText, visual);
    let timer;
    const reset = () => {
      clearTimeout(timer);
      element.classList.remove('text-flip-playing');
    };
    const play = () => {
      if (motion.matches || element.classList.contains('text-flip-playing')) return;
      element.classList.add('text-flip-playing');
      timer = setTimeout(reset, 800 + index * 30);
    };
    element.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') play();
    });
    element.addEventListener('click', play);
    element.closest('.hero-copy')?.addEventListener('focusin', play);
    motion.addEventListener('change', reset);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          observer.disconnect();
        }
      }, { threshold: 0.8 });
      observer.observe(element);
    }
  });
})();
