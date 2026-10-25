/* Canvas adaptation inspired by React Bits Electric Logo: https://reactbits.dev/animations/electric-logo */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  document.querySelectorAll('.wordmark, .footer-brand').forEach(host => {
    const img = host.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.className = 'electric-logo';
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let edges = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let last = 0;
    let pointer = null;
    const pad = 15;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; ctx.clearRect(0, 0, width + pad * 2, height + pad * 2); };
    const draw = now => {
      frame = 0;
      if (motion.matches || contrast.matches || !visible || document.hidden || !edges.length) return;
      frame = requestAnimationFrame(draw);
      if (now - last < 40) return;
      last = now;
      ctx.clearRect(0, 0, width + pad * 2, height + pad * 2);
      const time = now * 0.0025;
      ctx.strokeStyle = '#ecc7ff';
      ctx.shadowColor = '#ad6dff';
      ctx.shadowBlur = 7;
      ctx.lineWidth = 0.8;
      ctx.lineJoin = 'round';
      // Each strand follows a short run of neighbouring silhouette pixels.
      for (let strand = 0; strand < 4; strand++) {
        const start = Math.floor((time * 47 + strand * edges.length / 4) % edges.length);
        let point = edges[start];
        const near = pointer ? Math.max(0, 1 - Math.hypot(point[0] - pointer.x, point[1] - pointer.y) / 100) : 0;
        ctx.globalAlpha = 0.65 + 0.25 * Math.sin(time * 9 + strand);
        ctx.beginPath();
        ctx.moveTo(point[0] + pad, point[1] + pad);
        const used = new Set([start]);
        for (let step = 0; step < 24; step++) {
          let next = -1;
          let distance = 20;
          for (let i = 0; i < edges.length; i++) {
            if (used.has(i)) continue;
            const d = Math.hypot(edges[i][0] - point[0], edges[i][1] - point[1]);
            if (d < distance) { distance = d; next = i; }
          }
          if (next < 0 || distance > 5) break;
          used.add(next);
          point = edges[next];
          const jitter = Math.sin(step * 2.7 + time * 17 + strand) * (1.5 + near * 2);
          ctx.lineTo(point[0] + pad + jitter, point[1] + pad - jitter);
        }
        ctx.stroke();
        // A small branching arc leaps from the silhouette.
        if (strand === 0) {
          ctx.beginPath();
          ctx.moveTo(point[0] + pad, point[1] + pad);
          ctx.lineTo(point[0] + pad + 4, point[1] + pad - 5);
          ctx.lineTo(point[0] + pad + 1, point[1] + pad - 7);
          ctx.lineTo(point[0] + pad + 7 + near * 4, point[1] + pad - 11);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };
    const start = () => { stop(); if (!motion.matches && !contrast.matches && visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const resize = () => {
      width = img.clientWidth;
      height = img.clientHeight;
      if (!width || !height || !img.naturalWidth) return;
      const sample = document.createElement('canvas');
      sample.width = Math.ceil(width);
      sample.height = Math.ceil(height);
      const source = sample.getContext('2d', { willReadFrequently: true });
      if (!source) return;
      source.drawImage(img, 0, 0, sample.width, sample.height);
      try {
        const pixels = source.getImageData(0, 0, sample.width, sample.height).data;
        const solid = (x, y) => x >= 0 && y >= 0 && x < sample.width && y < sample.height && pixels[(y * sample.width + x) * 4 + 3] > 100;
        edges = [];
        for (let y = 0; y < sample.height; y++) {
          for (let x = 0; x < sample.width; x++) {
            if (solid(x, y) && (!solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1))) edges.push([x, y]);
          }
        }
      } catch { stop(); return; }
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.ceil((width + pad * 2) * ratio);
      canvas.height = Math.ceil((height + pad * 2) * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      start();
    };
    host.append(canvas);
    host.addEventListener('pointermove', event => {
      const rect = img.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    host.addEventListener('pointerleave', () => { pointer = null; });
    new ResizeObserver(resize).observe(img);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; start(); }).observe(host);
    motion.addEventListener('change', start);
    contrast.addEventListener('change', start);
    document.addEventListener('visibilitychange', start);
    img.addEventListener('load', resize);
    if (img.complete) resize();
  });
})();
