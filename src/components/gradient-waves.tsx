"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

type GradientWavesProps = {
  horizonColor?: string;
  waveColor?: string;
  crestColor?: string;
  className?: string;
};

const vertex = `attribute vec2 position; void main(){ gl_Position=vec4(position,0.0,1.0); }`;
const fragment = `precision highp float;
uniform vec2 iResolution; uniform float iTime; uniform vec3 horizon; uniform vec3 wave; uniform vec3 crest; uniform float motion;
float hash(vec2 p){return fract(sin(dot(p,vec2(91.7,47.3)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/iResolution.xy; vec2 p=uv-.5; p.x*=iResolution.x/iResolution.y;
  float t=iTime*0.18*motion; float curve=sin(p.x*3.4+t)+.5*sin(p.x*8.0-t*.7);
  float horizonLine=.24+curve*.065; float depth=smoothstep(horizonLine,-.62,p.y);
  float ripples=.5+.5*sin((p.x*14.0+p.y*5.0)+t*2.0);
  vec3 body=mix(wave,crest,ripples*.28+depth*.35);
  vec3 colour=mix(horizon,body,depth);
  float grain=(hash(gl_FragCoord.xy+floor(iTime*10.0))-.5)*.018;
  gl_FragColor=vec4(clamp(colour+grain,0.,1.),clamp(depth*.76,0.,.76));
}`;

function rgb(hex: string) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  return [parseInt(full.slice(0, 2), 16) / 255, parseInt(full.slice(2, 4), 16) / 255, parseInt(full.slice(4, 6), 16) / 255];
}

/** Decorative only: no input handling, paused while offscreen/hidden and static for reduced motion. */
export function GradientWaves({ horizonColor = "#eef0f7", waveColor = "#66719a", crestColor = "#ffffff", className = "" }: GradientWavesProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !window.WebGLRenderingContext) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    const renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.5) });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "width:100%;height:100%;display:block;pointer-events:none;";
    host.appendChild(canvas);
    const program = new Program(gl, { vertex, fragment, uniforms: {
      iResolution: { value: [1, 1] }, iTime: { value: 0 }, motion: { value: reduced ? 0 : 1 },
      horizon: { value: rgb(horizonColor) }, wave: { value: rgb(waveColor) }, crest: { value: rgb(crestColor) },
    }});
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resize = () => { const rect = host.getBoundingClientRect(); renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height)); program.uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight]; renderer.render({ scene: mesh }); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let frame = 0; let visible = true; let documentVisible = !document.hidden;
    const draw = (time: number) => { program.uniforms.iTime.value = time / 1000; renderer.render({ scene: mesh }); if (!reduced && visible && documentVisible) frame = requestAnimationFrame(draw); };
    const visibility = () => { documentVisible = !document.hidden; if (documentVisible && visible && !reduced && !frame) frame = requestAnimationFrame(draw); };
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; } if (visible && documentVisible && !reduced && !frame) frame = requestAnimationFrame(draw); });
    intersection.observe(host); document.addEventListener("visibilitychange", visibility); if (!reduced) frame = requestAnimationFrame(draw);
    return () => { if (frame) cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", visibility); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, [crestColor, horizonColor, waveColor]);
  return <div className={`gradient-waves ${className}`.trim()} ref={hostRef} aria-hidden="true" />;
}
