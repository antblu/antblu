/* Pointer-driven chromatic photos, inspired by Aceternity Chromatic Image.
   The semantic image remains the fallback when WebGL or motion is unavailable. */
document.querySelectorAll('[data-chromatic]').forEach(frame => {
  const photo = frame.querySelector('img');
  const surface = frame.closest('.photo-surface') || frame;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return;
  const shader = (type, source) => {
    const value = gl.createShader(type);
    gl.shaderSource(value, source);
    gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error('Chromatic shader compilation failed');
    return value;
  };
  try {
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5; gl_Position=vec4(position,0.,1.);}'));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D photo;
      uniform vec2 size, imageSize, pointer;
      uniform float strength;
      void main(){
        vec2 cover=vec2(min(size.x/size.y/(imageSize.x/imageSize.y),1.),min((imageSize.x/imageSize.y)/(size.x/size.y),1.));
        vec2 p=(uv-.5)*cover/(1.+strength*.12)+.5;
        float wave=sin(uv.y*9.+pointer.y*2.)*.018*strength;
        p.x+=wave*pointer.x;
        vec2 shift=pointer*.012*strength;
        gl_FragColor=vec4(texture2D(photo,p+shift).r,texture2D(photo,p).g,texture2D(photo,p-shift).b,1.);
      }`));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['size', 'imageSize', 'pointer', 'strength'].map(name => [name, gl.getUniformLocation(program, name)]));
    let ready = false;
    let raf = 0;
    let x = 0, y = 0, amount = 0, targetX = 0, targetY = 0, targetAmount = 0;
    const draw = () => {
      raf = 0;
      if (!ready || motion.matches || document.hidden) return;
      x += (targetX - x) * .12;
      y += (targetY - y) * .12;
      amount += (targetAmount - amount) * .12;
      gl.uniform2f(uniforms.pointer, x, y);
      gl.uniform1f(uniforms.strength, amount);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      // Full-bleed backgrounds stay flush with the section edges.
      if (Math.abs(targetX-x) + Math.abs(targetY-y) + Math.abs(targetAmount-amount) > .001) raf = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const resize = () => {
      const rect = frame.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 2, 1600 / Math.max(rect.width, rect.height));
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.size, canvas.width, canvas.height);
      schedule();
    };
    const reset = () => { targetX = targetY = targetAmount = 0; schedule(); };
    const applyMotion = () => {
      frame.classList.toggle('chromatic-ready', ready && !motion.matches);
      reset();
    };
    const load = () => {
      if (ready || !photo.naturalWidth) return;
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
      gl.uniform2f(uniforms.imageSize, photo.naturalWidth, photo.naturalHeight);
      ready = true;
      frame.append(canvas);
      resize();
      applyMotion();
    };
    surface.addEventListener('pointermove', event => {
      if (motion.matches || event.pointerType === 'touch') return;
      const rect = frame.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
      targetY = 1 - (event.clientY - rect.top) / rect.height * 2;
      targetAmount = 1;
      schedule();
    });
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('pointercancel', reset);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      ready = false;
      frame.classList.remove('chromatic-ready');
      cancelAnimationFrame(raf);
    });
    motion.addEventListener('change', applyMotion);
    document.addEventListener('visibilitychange', reset);
    new ResizeObserver(resize).observe(frame);
    if (photo.complete) load();
    else photo.addEventListener('load', load, { once: true });
  } catch (_) {
    frame.classList.remove('chromatic-ready');
  }
});
