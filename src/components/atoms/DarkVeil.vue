<template>
  <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full block" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';

const props = withDefaults(defineProps<{
  speed?: number;
}>(), {
  speed: 0.2
});

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef');

const vertex = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  uniform vec2 uResolution;
  uniform float uTime;
  varying vec2 vUv;
  
  // Ethereal Kasane Fluid Shader
  void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      
      // Aspect ratio correction
      vec2 p = uv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;
      
      vec2 newp = p;
      float time = uTime * 0.8;
      
      // Fractal Brownian Motion (FBM) style domain warping
      for(int i = 1; i < 6; i++) {
          float fi = float(i);
          newp.x += 0.8 / fi * sin(fi * p.y + time + 0.3);
          newp.y += 0.8 / fi * cos(fi * p.x + time + 0.3);
          p = newp;
      }
      
      // Create glowing intensities
      float intensity = 0.5 * sin(3.0 * p.x) + 0.5;
      float intensity2 = 0.5 * sin(3.0 * p.y) + 0.5;
      
      // Kasane Color Palette
      vec3 bgDark = vec3(0.04, 0.06, 0.10); // Very dark blue/black
      vec3 kasaneEmerald = vec3(0.0, 1.0, 0.66); // Growth
      vec3 kasaneBlue = vec3(0.2, 0.4, 1.0); // Neutral
      vec3 kasanePurple = vec3(0.5, 0.1, 0.8);
      
      // Mix the colors based on the fluid domain warp
      vec3 mixedColor = mix(kasaneBlue, kasaneEmerald, intensity);
      mixedColor = mix(mixedColor, kasanePurple, intensity2 * 0.7);
      
      // Composite final color
      vec3 finalColor = mix(bgDark, mixedColor, intensity * intensity2 * 0.4);
      
      // Add subtle scanlines that are resolution independent
      float scanline = sin(uv.y * 800.0) * 0.04;
      finalColor -= scanline;
      
      // Vignette effect to focus perfectly in the center
      float dist = length(uv - 0.5);
      float vignette = smoothstep(0.8, 0.1, dist);
      finalColor *= vignette;

      gl_FragColor = vec4(finalColor, 1.0);
  }
`;

let renderer: Renderer | null = null;
let program: Program | null = null;
let mesh: Mesh | null = null;
let frame: number | null = null;
let start: number = 0;

const cleanup = () => {
  if (frame) cancelAnimationFrame(frame);
  frame = null;
  window.removeEventListener('resize', resize);
};

const resize = () => {
  if (!canvasRef.value || !renderer || !program) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Reduce pixel density to increase performace slightly and give it a dreamy look
  renderer.setSize(w, h);
  program.uniforms.uResolution.value.set(w, h);
};

const loop = () => {
  if (!program || !renderer || !mesh) return;
  program.uniforms.uTime.value = ((performance.now() - start) / 1000) * props.speed;
  renderer.render({ scene: mesh });
  frame = requestAnimationFrame(loop);
};

onMounted(() => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 1.5) });
  renderer.gl.clearColor(0.04, 0.055, 0.09, 1);
  const gl = renderer.gl;
  const geometry = new Triangle(gl);
  program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Vec2() }
    }
  });
  mesh = new Mesh(gl, { geometry, program });
  
  window.addEventListener('resize', resize);
  // Delay initial resize slightly to let CSS settle
  setTimeout(resize, 50);
  
  start = performance.now();
  loop();
});

onUnmounted(cleanup);
</script>
