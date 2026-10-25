/* Buildless procedural cloud background inspired by Aceternity Cloud Shader.
   https://ui.aceternity.com/components/cloud-shader */
(() => {
  const canvas = document.querySelector('.cloud-shader');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
  if (!gl) return; // The CSS cloud field remains visible without WebGL.
  const vertex = 'attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}';
  const fragment = `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;
    uniform float dark;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
    }
    float field(vec2 p){
      float sum=0.,amplitude=.5;
      for(int i=0;i<5;i++){sum+=amplitude*noise(p);p=p*2.03+vec2(3.7,8.2);amplitude*=.5;}
      return sum;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;
      vec2 p=vec2(uv.x*resolution.x/resolution.y,uv.y)*3.;
      p+=vec2(time*.022,time*.005);
      float cloud=smoothstep(.43,.76,field(p+field(p*.6)));
      vec3 sky=mix(vec3(.55,.75,.91),vec3(.22,.46,.73),uv.y);
      sky=mix(sky,mix(vec3(.065,.13,.23),vec3(.025,.06,.12),uv.y),dark);
      vec3 tint=mix(vec3(.985,.975,.95),vec3(.24,.36,.51),dark);
      gl_FragColor=vec4(mix(sky,tint,cloud*.88),1.);
    }`;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  };
  const shaders = [compile(gl.VERTEX_SHADER, vertex), compile(gl.FRAGMENT_SHADER, fragment)];
  if (shaders.some(shader => !shader)) return;
  const program = gl.createProgram();
  shaders.forEach(shader => gl.attachShader(program, shader));
  gl.linkProgram(program);
  shaders.forEach(shader => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const dark = gl.getUniformLocation(program, 'dark');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = matchMedia('(forced-colors: active)');
  let visible = true;
  let frame = 0;
  let elapsed = 0;
  let last = 0;
  let lost = false;
  const render = now => {
    frame = 0;
    if (lost || document.hidden || !visible || forcedColors.matches) { last = 0; return; }
    if (last && !motion.matches) elapsed += Math.min(now - last, 100);
    last = now;
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(time, elapsed / 1000);
    gl.uniform1f(dark, document.documentElement.dataset.theme === 'dark' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    canvas.classList.add('is-ready');
    if (!motion.matches) frame = requestAnimationFrame(render);
  };
  const refresh = () => { cancelAnimationFrame(frame); last = 0; frame = requestAnimationFrame(render); };
  const resize = () => {
    // Cap rendering resolution to keep the decorative effect inexpensive.
    const scale = Math.min(1, 1000 / canvas.clientWidth);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    refresh();
  };
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', refresh);
  motion.addEventListener('change', refresh);
  forcedColors.addEventListener('change', refresh);
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; refresh(); }).observe(canvas.parentElement);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); canvas.classList.remove('is-ready'); });
  resize();
})();
