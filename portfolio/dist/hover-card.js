(() => {
  const triggers = document.querySelectorAll('[data-hover-description], [data-tooltip]');
  const card = document.createElement('div');
  if (!triggers.length || typeof card.showPopover !== 'function') return;

  const title = document.createElement('strong');
  const description = document.createElement('p');
  card.className = 'hover-card';
  card.popover = 'manual';
  card.setAttribute('aria-hidden', 'true');
  card.append(title, description);
  document.body.append(card);

  const gap = 6;
  const gutter = 12;
  let activeTrigger = null;
  let timer;

  function close() {
    clearTimeout(timer);
    card.hidePopover();
    activeTrigger = null;
  }

  function position() {
    if (!card.matches(':popover-open')) return;
    const anchor = activeTrigger.getBoundingClientRect();
    const { clientWidth: width, clientHeight: height } = document.documentElement;
    if (anchor.bottom <= 0 || anchor.top >= height) {
      if (activeTrigger.matches(':focus-visible')) {
        card.style.visibility = 'hidden';
      } else {
        close();
      }
      return;
    }

    card.style.visibility = '';
    const { offsetWidth, offsetHeight } = card;
    const centered = anchor.left + (anchor.width - offsetWidth) / 2;
    const below = anchor.bottom + gap;
    const above = anchor.top - offsetHeight - gap;
    const fitsAbove = above >= gutter;
    const fitsBelow = below + offsetHeight <= height - gutter;
    const placeAbove = card.classList.contains('site-tooltip')
      ? fitsAbove || !fitsBelow
      : !fitsBelow;
    const left = Math.max(gutter, Math.min(centered, width - offsetWidth - gutter));
    card.dataset.side = placeAbove ? 'top' : 'bottom';
    card.style.setProperty('--arrow-x', Math.min(offsetWidth - 8, Math.max(8, anchor.left + anchor.width / 2 - left)) + 'px');
    card.style.left = left + 'px';
    card.style.top = Math.max(gutter, placeAbove ? above : below) + 'px';
  }

  function open(trigger, delay) {
    if (activeTrigger === trigger && card.matches(':popover-open')) {
      clearTimeout(timer);
      return;
    }
    close();
    activeTrigger = trigger;
    timer = setTimeout(() => {
      const isTooltip = trigger.hasAttribute('data-tooltip');
      card.classList.toggle('site-tooltip', isTooltip);
      title.textContent = trigger.dataset.hoverTitle || '';
      description.textContent = isTooltip
        ? trigger.dataset.tooltip || trigger.getAttribute('aria-label')
        : trigger.dataset.hoverDescription;
      card.showPopover();
      position();
    }, delay);
  }

  function scheduleClose() {
    clearTimeout(timer);
    timer = setTimeout(close, 160);
  }

  triggers.forEach(trigger => {
    const description = trigger.dataset.tooltip || trigger.dataset.hoverDescription;
    if (description) trigger.setAttribute('aria-description', description);
    trigger.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') open(trigger, trigger.hasAttribute('data-tooltip') ? 0 : 220);
    });
    trigger.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch' && activeTrigger === trigger && !trigger.matches(':focus-visible')) scheduleClose();
    });
    trigger.addEventListener('focus', () => {
      if (trigger.matches(':focus-visible')) open(trigger, 0);
    });
    trigger.addEventListener('blur', () => {
      if (activeTrigger === trigger && !trigger.matches(':hover') && !card.matches(':hover')) scheduleClose();
    });
    trigger.addEventListener('click', close);
  });

  card.addEventListener('pointerenter', () => clearTimeout(timer));
  card.addEventListener('pointerleave', () => {
    if (!activeTrigger?.matches(':focus-visible')) scheduleClose();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
  window.addEventListener('scroll', position, { passive: true });
  window.addEventListener('resize', position);
})();
