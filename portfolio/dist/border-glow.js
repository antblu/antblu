/* Border Glow-inspired progressive enhancement: https://reactbits.dev/c/components/border-glow */
(() => {
  const selector = '.program-face, .project, .stack-card, .career-panel, .resume-entry-body, .resume-toolkit, .machine-panel, .chroma-card, .em-service, .em-steps > li, .blog-toc';
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const enhance = root => {
    const cards = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) cards.push(root);
    cards.forEach(card => {
      if (card.classList.contains('has-border-glow')) return;
      card.classList.add('has-border-glow');
      const edge = document.createElement('span');
      edge.className = 'card-border-glow';
      edge.setAttribute('aria-hidden', 'true');
      card.append(edge);
      card.addEventListener('pointermove', event => {
        if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        const proximity = Math.max(Math.abs(x) / (rect.width / 2 || 1), Math.abs(y) / (rect.height / 2 || 1));
        card.style.setProperty('--border-glow-strength', String(Math.min(1, Math.max(0, (proximity - .7) / .3))));
        card.style.setProperty('--border-glow-angle', `${Math.atan2(y, x) * 180 / Math.PI + 90}deg`);
      }, { passive: true });
      card.addEventListener('pointerleave', () => card.style.removeProperty('--border-glow-strength'));
    });
  };
  enhance(document);
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1 && !node.matches('.card-border-glow')) enhance(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
