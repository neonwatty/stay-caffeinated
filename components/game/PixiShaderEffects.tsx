'use client';

import { useEffect, useRef, useState } from 'react';
import type { CharacterState } from './svg/CharacterStates';
import type { Graphics } from 'pixi.js';

export type ShaderDemo = 'chromatic' | 'heatwave' | 'dreamy';

interface PixiShaderProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  demo?: ShaderDemo;
  isActive?: boolean;
}

function getState(level: number): CharacterState {
  if (level < 30) return 'under';
  if (level > 70) return 'over';
  return 'optimal';
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function clamp01(v: number) { return clamp(v, 0, 1); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * clamp01(t); }

// ─── Draw a simple coffee bean character to apply shaders to ─────────

function drawDemoCharacter(g: Graphics, w: number, h: number, t: number, state: CharacterState) {
  const cx = w / 2;
  const cy = h / 2;

  // Body - coffee cup
  const cupW = 50;
  const cupH = 60;
  const cupTop = cy - cupH / 2 + 5;

  // Shadow
  g.ellipse(cx, cy + cupH / 2 + 10, 35, 6);
  g.fill({ color: 0x000000, alpha: 0.15 });

  // Cup body
  g.roundRect(cx - cupW / 2, cupTop, cupW, cupH, 6);
  g.fill(0xFFFFFF);
  g.roundRect(cx - cupW / 2, cupTop, cupW, cupH, 6);
  g.stroke({ color: 0xCCCCCC, width: 2 });

  // Handle
  g.moveTo(cx + cupW / 2, cupTop + 15);
  g.quadraticCurveTo(cx + cupW / 2 + 18, cy, cx + cupW / 2, cupTop + cupH - 15);
  g.stroke({ color: 0xCCCCCC, width: 3 });

  // Coffee inside
  const fillLevel = state === 'under' ? 0.3 : state === 'over' ? 1.0 : 0.7;
  const coffeeH = (cupH - 10) * fillLevel;
  const coffeeColor = state === 'under' ? 0x8B6E4E
    : state === 'over' ? 0x4A1A00
    : 0x6F4E37;
  g.roundRect(cx - cupW / 2 + 4, cupTop + cupH - coffeeH - 4, cupW - 8, coffeeH, 4);
  g.fill(coffeeColor);

  // Cream swirl on top
  if (state === 'optimal') {
    const swirl = t * 0.5;
    g.ellipse(cx + Math.cos(swirl) * 8, cupTop + cupH - coffeeH - 2, 12, 3);
    g.fill({ color: 0xDDCC99, alpha: 0.7 });
  }

  // Face
  const faceY = cy + 5;
  const eyeSpacing = 12;

  if (state === 'under') {
    // Closed sleepy eyes
    g.moveTo(cx - eyeSpacing - 5, faceY - 5);
    g.quadraticCurveTo(cx - eyeSpacing, faceY - 2, cx - eyeSpacing + 5, faceY - 5);
    g.stroke({ color: 0x4A3520, width: 2 });
    g.moveTo(cx + eyeSpacing - 5, faceY - 5);
    g.quadraticCurveTo(cx + eyeSpacing, faceY - 2, cx + eyeSpacing + 5, faceY - 5);
    g.stroke({ color: 0x4A3520, width: 2 });
    // Sleepy mouth
    g.ellipse(cx, faceY + 8, 4, 3 + Math.sin(t * 0.8) * 1);
    g.fill(0x4A3520);
  } else if (state === 'over') {
    // Wide twitchy eyes
    const tw = Math.sin(t * 15) * 1;
    g.circle(cx - eyeSpacing + tw, faceY - 5, 6);
    g.fill(0xFFFFFF);
    g.circle(cx - eyeSpacing + tw, faceY - 5, 3);
    g.fill(0x1A1A1A);
    g.circle(cx + eyeSpacing - tw, faceY - 5, 6);
    g.fill(0xFFFFFF);
    g.circle(cx + eyeSpacing - tw, faceY - 5, 3);
    g.fill(0x1A1A1A);
    // Grimace mouth
    g.roundRect(cx - 8, faceY + 5, 16, 6, 2);
    g.fill(0xFFFFFF);
    g.roundRect(cx - 8, faceY + 5, 16, 6, 2);
    g.stroke({ color: 0x4A3520, width: 1 });
  } else {
    // Happy eyes
    g.circle(cx - eyeSpacing, faceY - 5, 4);
    g.fill(0x4A3520);
    g.circle(cx - eyeSpacing + 1.5, faceY - 6.5, 1.5);
    g.fill(0xFFFFFF);
    g.circle(cx + eyeSpacing, faceY - 5, 4);
    g.fill(0x4A3520);
    g.circle(cx + eyeSpacing + 1.5, faceY - 6.5, 1.5);
    g.fill(0xFFFFFF);
    // Smile
    g.moveTo(cx - 8, faceY + 5);
    g.quadraticCurveTo(cx, faceY + 14, cx + 8, faceY + 5);
    g.stroke({ color: 0x4A3520, width: 2 });
  }

  // Steam
  if (state !== 'under') {
    const steamCount = state === 'over' ? 5 : 3;
    for (let i = 0; i < steamCount; i++) {
      const sp = (t * 0.8 + i * 0.5) % 2;
      const sx = cx - 15 + i * 8 + Math.sin(t + i) * 5;
      const sy = cupTop - 5 - sp * 20;
      g.circle(sx, sy, 3 + sp * 3);
      g.fill({ color: 0xDDDDDD, alpha: clamp01(1 - sp / 2) * 0.4 });
    }
  }
}

// ─── GLSL Shader Sources ─────────────────────────────────────────────

const chromaticAbFrag = `
  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vec2 uv = vTextureCoord;
    float offset = uIntensity * 0.01 * (1.0 + sin(uTime * 3.0) * 0.5);

    float r = texture(uTexture, vec2(uv.x + offset, uv.y)).r;
    float g = texture(uTexture, uv).g;
    float b = texture(uTexture, vec2(uv.x - offset, uv.y)).b;
    float a = texture(uTexture, uv).a;

    finalColor = vec4(r, g, b, a);
  }
`;

const heatwaveFrag = `
  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vec2 uv = vTextureCoord;

    // Heat distortion
    float wave = sin(uv.y * 20.0 + uTime * 5.0) * uIntensity * 0.005;
    float wave2 = cos(uv.y * 15.0 + uTime * 3.0) * uIntensity * 0.003;
    uv.x += wave + wave2;

    vec4 color = texture(uTexture, uv);

    // Heat tint
    float heat = uIntensity * 0.15;
    color.r += heat * 0.3;
    color.g -= heat * 0.1;
    color.b -= heat * 0.2;

    finalColor = color;
  }
`;

const dreamyFrag = `
  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vec2 uv = vTextureCoord;

    // Dreamy blur using 5-tap average
    float blur = uIntensity * 0.003;
    vec4 color = texture(uTexture, uv) * 0.4;
    color += texture(uTexture, uv + vec2(blur, 0.0)) * 0.15;
    color += texture(uTexture, uv - vec2(blur, 0.0)) * 0.15;
    color += texture(uTexture, uv + vec2(0.0, blur)) * 0.15;
    color += texture(uTexture, uv - vec2(0.0, blur)) * 0.15;

    // Desaturation
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float desat = uIntensity * 0.4;
    color.rgb = mix(color.rgb, vec3(gray), desat);

    // Blue tint for sleepy
    color.b += uIntensity * 0.06;
    color.r -= uIntensity * 0.03;

    // Vignette
    vec2 center = uv - 0.5;
    float vignette = 1.0 - dot(center, center) * uIntensity * 1.2;
    color.rgb *= vignette;

    // Pulsing darkness (like nodding off)
    float pulse = sin(uTime * 0.8) * 0.5 + 0.5;
    float dark = uIntensity * 0.15 * pulse;
    color.rgb -= dark;

    finalColor = color;
  }
`;

// ─── React Component ─────────────────────────────────────────────────

export function PixiShaderCanvas({
  caffeineLevel,
  width = 220,
  height = 220,
  demo = 'chromatic',
  isActive = true,
}: PixiShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<{ destroy: (removeView?: boolean, options?: { children?: boolean }) => void } | null>(null);
  const propsRef = useRef({ caffeineLevel, demo, isActive });
  const timeRef = useRef(0);
  const [error, setError] = useState<string | null>(null);

  propsRef.current = { caffeineLevel, demo, isActive };

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    import('pixi.js').then(async (PIXI) => {
      if (!mounted || !containerRef.current) return;
      try {
        const app = new PIXI.Application();
        await app.init({
          width, height, backgroundAlpha: 0, antialias: true,
          resolution: window.devicePixelRatio || 1, autoDensity: true,
        });
        if (!mounted) { app.destroy(true); return; }

        containerRef.current!.appendChild(app.canvas);
        appRef.current = app;

        // Container for the character - filters apply to this
        const charContainer = new PIXI.Container();
        app.stage.addChild(charContainer);
        const graphics = new PIXI.Graphics();
        charContainer.addChild(graphics);

        // Create shader filters
        const shaderSources: Record<ShaderDemo, string> = {
          chromatic: chromaticAbFrag,
          heatwave: heatwaveFrag,
          dreamy: dreamyFrag,
        };

        // Build all three filters
        const filters: Record<ShaderDemo, InstanceType<typeof PIXI.Filter>> = {} as any;
        for (const key of Object.keys(shaderSources) as ShaderDemo[]) {
          filters[key] = new PIXI.Filter({
            glProgram: new PIXI.GlProgram({
              fragment: shaderSources[key],
              vertex: `
                in vec2 aPosition;
                out vec2 vTextureCoord;
                uniform vec4 uInputSize;
                uniform vec4 uOutputFrame;
                uniform vec4 uOutputTexture;

                vec4 filterVertexPosition(void) {
                  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
                  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
                  position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
                  return vec4(position, 0.0, 1.0);
                }

                vec2 filterTextureCoord(void) {
                  return aPosition * (uOutputFrame.zw * uInputSize.zw);
                }

                void main(void) {
                  gl_Position = filterVertexPosition();
                  vTextureCoord = filterTextureCoord();
                }
              `,
            }),
            resources: {
              uniforms: {
                uTime: { value: 0, type: 'f32' },
                uIntensity: { value: 0, type: 'f32' },
              },
            },
          });
        }

        app.ticker.add((ticker) => {
          const { caffeineLevel: lvl, demo: d, isActive: active } = propsRef.current;
          if (!active) return;
          timeRef.current += ticker.deltaTime / 60;
          const state = getState(lvl);
          const t = timeRef.current;

          // Draw the base character
          graphics.clear();
          drawDemoCharacter(graphics, width, height, t, state);

          // Calculate shader intensity based on caffeine state
          let intensity = 0;
          if (d === 'dreamy') {
            // Dreamy is stronger when under-caffeinated
            intensity = state === 'under' ? lerp(0.5, 1.0, (30 - lvl) / 30) : 0;
          } else if (d === 'chromatic') {
            // Chromatic ab is stronger when over-caffeinated
            intensity = state === 'over' ? lerp(0.5, 1.5, (lvl - 70) / 30) : 0;
          } else if (d === 'heatwave') {
            // Heat distortion for over-caffeinated
            intensity = state === 'over' ? lerp(0.3, 1.2, (lvl - 70) / 30) : 0;
          }

          // Also add mild effect for non-matching states to show something
          if (d === 'dreamy' && state !== 'under') {
            intensity = 0.08; // very subtle
          }
          if (d === 'chromatic' && state !== 'over') {
            intensity = 0.05;
          }
          if (d === 'heatwave' && state !== 'over') {
            intensity = 0.05;
          }

          // Apply the selected filter
          const filter = filters[d];
          if (filter.resources.uniforms) {
            (filter.resources.uniforms as any).uniforms.uTime = t;
            (filter.resources.uniforms as any).uniforms.uIntensity = intensity;
          }
          charContainer.filters = [filter];
        });
      } catch (err) {
        if (mounted) setError(String(err));
      }
    }).catch((err) => {
      if (mounted) setError(String(err));
    });

    return () => { mounted = false; appRef.current?.destroy(true, { children: true }); appRef.current = null; };
  }, [width, height]);

  if (error) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-700 rounded-lg text-xs text-red-400 p-2 text-center">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} style={{ width, height }} />;
}
