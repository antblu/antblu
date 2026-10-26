// Adapted from React Bits CurvedInput by David Haz.
// https://reactbits.dev/c/components/curved-input
// License: assets/react-bits-LICENSE.md (MIT + Commons Clause).
(() => {
  if (!('ResizeObserver' in window)) return;
  const namespace = 'http://www.w3.org/2000/svg';
  const createSvg = (tag, attributes = {}) => {
    const node = document.createElementNS(namespace, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  };

  document.querySelectorAll('#contact-form input[name="name"], #contact-form input[name="email"]').forEach((input, index) => {
    const label = input.closest('label');
    const svg = createSvg('svg', { class: 'curved-input-art', 'aria-hidden': 'true', focusable: 'false' });
    const band = createSvg('path', { class: 'curved-input-band' });
    const guide = createSvg('path', { id: `contact-curve-${index}`, fill: 'none' });
    const text = createSvg('text', { class: 'curved-input-text', 'xml:space': 'preserve' });
    const textPath = createSvg('textPath', { href: `#contact-curve-${index}` });
    text.append(textPath);
    svg.append(band, guide, text);
    label.append(svg);
    let textWidth = 0;

    const updateText = () => {
      const value = input.value || input.placeholder;
      textPath.textContent = value;
      svg.classList.toggle('is-placeholder', !input.value);
      // Fit the decorative preview only; the complete native value is retained.
      if (textWidth > 0 && text.getComputedTextLength() > textWidth) {
        const characters = Array.from(value);
        let low = 0;
        let high = characters.length;
        while (low < high) {
          const mid = Math.ceil((low + high) / 2);
          textPath.textContent = `${characters.slice(0, mid).join('')}…`;
          if (text.getComputedTextLength() <= textWidth) low = mid;
          else high = mid - 1;
        }
        textPath.textContent = `${characters.slice(0, low).join('')}…`;
      }
    };

    const resize = () => {
      const width = label.clientWidth;
      if (width < 80) return;
      // Circular arc geometry from the original component (28px sagitta).
      const bend = Math.min(28, width * 0.08);
      const thickness = 58;
      const pad = 7;
      const span = width - 24;
      const radius = (span * span * 0.25 + bend * bend) / (2 * bend);
      const phi = Math.asin(span / (2 * radius));
      const point = (u, v) => {
        const angle = ((u - span / 2) / (span / 2)) * phi;
        return `${width / 2 + (radius - v) * Math.sin(angle)} ${pad + thickness / 2 + radius - (radius - v) * Math.cos(angle)}`;
      };
      const edge = (u, v, forward) => `A ${radius - v} ${radius - v} 0 0 ${forward ? 1 : 0} ${point(u, v)}`;
      const top = -thickness / 2;
      const bottom = thickness / 2;
      const corner = 15;
      band.setAttribute('d', [
        `M ${point(corner, top)}`, edge(span - corner, top, true),
        `Q ${point(span, top)} ${point(span, top + corner)}`,
        `L ${point(span, bottom - corner)}`,
        `Q ${point(span, bottom)} ${point(span - corner, bottom)}`,
        edge(corner, bottom, false),
        `Q ${point(0, bottom)} ${point(0, bottom - corner)}`,
        `L ${point(0, top + corner)}`,
        `Q ${point(0, top)} ${point(corner, top)} Z`
      ].join(' '));
      guide.setAttribute('d', `M ${point(24, 5)} ${edge(span - 24, 5, true)}`);
      svg.setAttribute('viewBox', `0 0 ${width} ${thickness + bend + pad * 2}`);
      textWidth = guide.getTotalLength();
      updateText();
      label.classList.add('curved-input');
    };

    new ResizeObserver(resize).observe(label);
    input.addEventListener('input', updateText);
    input.addEventListener('change', updateText);
    input.addEventListener('blur', updateText);
    // Reset fires before native values are restored; refresh on the next frame.
    input.form.addEventListener('reset', () => requestAnimationFrame(updateText));
    document.fonts?.ready.then(resize);
    resize();
  });
})();
