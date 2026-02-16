'use client';

import { useEffect, useRef, useState } from 'react';
import type { CharacterState } from './svg/CharacterStates';
import type { Graphics } from 'pixi.js';

export type CharacterVariation = 'blob' | 'cup' | 'robot';

interface PixiCharacterProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  variation?: CharacterVariation;
  isActive?: boolean;
}

// ─── Math / Color Helpers ────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function clamp01(v: number) { return clamp(v, 0, 1); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * clamp01(t); }

function rgb(r: number, g: number, b: number): number {
  return (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g), 0, 255) << 8) | clamp(Math.round(b), 0, 255);
}

function lerpColor(a: number, b: number, t: number): number {
  const f = clamp01(t);
  return rgb(
    ((a >> 16) & 0xFF) + (((b >> 16) & 0xFF) - ((a >> 16) & 0xFF)) * f,
    ((a >> 8) & 0xFF) + (((b >> 8) & 0xFF) - ((a >> 8) & 0xFF)) * f,
    (a & 0xFF) + ((b & 0xFF) - (a & 0xFF)) * f,
  );
}

function getState(level: number): CharacterState {
  if (level < 30) return 'under';
  if (level > 70) return 'over';
  return 'optimal';
}

// ─── BLOB Character ──────────────────────────────────────────────────

function drawBlob(g: Graphics, state: CharacterState, level: number, w: number, h: number, t: number) {
  const cx = w / 2;
  const cy = h / 2 + 8;
  const baseR = Math.min(w, h) * 0.27;

  // State interpolation
  const underT = state === 'under' ? 1 : 0;
  const overT = state === 'over' ? 1 : 0;
  const optimalT = state === 'optimal' ? 1 : 0;

  // Shake for over-caffeinated
  const shakeX = overT * Math.sin(t * 35) * 3;
  const shakeY = overT * Math.cos(t * 28) * 2;

  // Breathing
  const breathAmt = lerp(0.025, 0.01, overT);
  const breathSpeed = lerp(1.5, 6, overT);
  const breath = 1 + Math.sin(t * breathSpeed) * breathAmt;

  // Bounce for optimal
  const bounce = optimalT * Math.sin(t * 3) * 4;

  const bx = cx + shakeX;
  const by = cy + shakeY - bounce;

  // Shadow
  g.ellipse(cx, h * 0.82, baseR * 0.7, baseR * 0.12);
  g.fill({ color: 0x000000, alpha: 0.15 });

  // Body glow for optimal
  if (optimalT > 0) {
    const glowAlpha = 0.08 + Math.sin(t * 2) * 0.04;
    g.circle(bx, by, baseR * 1.4);
    g.fill({ color: 0xFFD700, alpha: glowAlpha * optimalT });
  }

  // Over-caffeinated red pulse
  if (overT > 0) {
    const pulseAlpha = 0.1 + Math.sin(t * 5) * 0.06;
    g.circle(bx, by, baseR * 1.3);
    g.fill({ color: 0xFF3333, alpha: pulseAlpha * overT });
  }

  // Body color
  const bodyColor = state === 'under' ? 0xC8B8E0
    : state === 'over' ? lerpColor(0xFFCCCC, 0xFF9999, Math.sin(t * 4) * 0.5 + 0.5)
    : 0xFFE0B2;

  // Body
  const bodyRx = baseR * breath;
  const bodyRy = baseR * breath * lerp(1, 0.9, underT);
  g.ellipse(bx, by, bodyRx, bodyRy);
  g.fill(bodyColor);
  g.ellipse(bx, by, bodyRx, bodyRy);
  g.stroke({ color: lerpColor(bodyColor, 0x000000, 0.2), width: 2.5 });

  // Cheek blush for optimal
  if (optimalT > 0) {
    const blushAlpha = 0.35 + Math.sin(t * 1.5) * 0.1;
    g.circle(bx - baseR * 0.5, by + baseR * 0.2, baseR * 0.18);
    g.fill({ color: 0xFFB6C1, alpha: blushAlpha * optimalT });
    g.circle(bx + baseR * 0.5, by + baseR * 0.2, baseR * 0.18);
    g.fill({ color: 0xFFB6C1, alpha: blushAlpha * optimalT });
  }

  // ─── Eyes ───
  const eyeSpacing = baseR * 0.4;
  const eyeY = by - baseR * 0.15;

  if (state === 'under') {
    // Sleepy half-closed eyes
    const blink = Math.sin(t * 0.8);
    const eyeH = lerp(2, 5, clamp01(blink));
    g.ellipse(bx - eyeSpacing, eyeY, 7, eyeH);
    g.fill(0x2C3E50);
    g.ellipse(bx + eyeSpacing, eyeY, 7, eyeH);
    g.fill(0x2C3E50);
    // Droopy eyelids
    g.ellipse(bx - eyeSpacing, eyeY - 3, 9, 5);
    g.fill({ color: bodyColor, alpha: 0.8 });
    g.ellipse(bx + eyeSpacing, eyeY - 3, 9, 5);
    g.fill({ color: bodyColor, alpha: 0.8 });
  } else if (state === 'over') {
    // Wide twitchy eyes
    const twitch = Math.sin(t * 12) * 1.5;
    const eyeSize = 10 + Math.sin(t * 6) * 2;
    // Whites with bloodshot
    g.circle(bx - eyeSpacing + twitch, eyeY, eyeSize + 2);
    g.fill(0xFFEEEE);
    g.circle(bx + eyeSpacing - twitch, eyeY, eyeSize + 2);
    g.fill(0xFFEEEE);
    // Bloodshot lines
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + t * 2;
      g.moveTo(bx - eyeSpacing, eyeY);
      g.lineTo(
        bx - eyeSpacing + Math.cos(angle) * (eyeSize + 2),
        eyeY + Math.sin(angle) * (eyeSize + 2),
      );
      g.stroke({ color: 0xFF4444, width: 1, alpha: 0.5 });
      g.moveTo(bx + eyeSpacing, eyeY);
      g.lineTo(
        bx + eyeSpacing + Math.cos(angle + 1) * (eyeSize + 2),
        eyeY + Math.sin(angle + 1) * (eyeSize + 2),
      );
      g.stroke({ color: 0xFF4444, width: 1, alpha: 0.5 });
    }
    // Pupils - tiny and dilated
    g.circle(bx - eyeSpacing + twitch, eyeY, 4);
    g.fill(0x1A1A2E);
    g.circle(bx + eyeSpacing - twitch, eyeY, 4);
    g.fill(0x1A1A2E);
    // Highlight
    g.circle(bx - eyeSpacing + twitch + 1.5, eyeY - 1.5, 1.5);
    g.fill(0xFFFFFF);
    g.circle(bx + eyeSpacing - twitch + 1.5, eyeY - 1.5, 1.5);
    g.fill(0xFFFFFF);
  } else {
    // Normal bright eyes
    g.circle(bx - eyeSpacing, eyeY, 8);
    g.fill(0x2C3E50);
    g.circle(bx + eyeSpacing, eyeY, 8);
    g.fill(0x2C3E50);
    // Highlight
    g.circle(bx - eyeSpacing + 2, eyeY - 2, 3);
    g.fill(0xFFFFFF);
    g.circle(bx + eyeSpacing + 2, eyeY - 2, 3);
    g.fill(0xFFFFFF);
    // Tiny sparkle
    g.circle(bx - eyeSpacing - 1, eyeY + 1, 1.5);
    g.fill({ color: 0xFFFFFF, alpha: 0.5 });
    g.circle(bx + eyeSpacing - 1, eyeY + 1, 1.5);
    g.fill({ color: 0xFFFFFF, alpha: 0.5 });
  }

  // ─── Mouth ───
  const mouthY = by + baseR * 0.3;
  if (state === 'under') {
    // Yawning O
    const yawnSize = 5 + Math.sin(t * 1.2) * 3;
    g.ellipse(bx, mouthY + 2, 6, yawnSize);
    g.fill(0x8B4513);
    g.ellipse(bx, mouthY + 2, 6, yawnSize);
    g.stroke({ color: 0x5C3317, width: 1.5 });
  } else if (state === 'over') {
    // Gritted teeth / stressed grin
    g.roundRect(bx - 12, mouthY - 3, 24, 10, 3);
    g.fill(0xFFFFFF);
    g.roundRect(bx - 12, mouthY - 3, 24, 10, 3);
    g.stroke({ color: 0x666666, width: 1.5 });
    // Teeth lines
    for (let i = -8; i <= 8; i += 4) {
      g.moveTo(bx + i, mouthY - 3);
      g.lineTo(bx + i, mouthY + 7);
      g.stroke({ color: 0xCCCCCC, width: 0.8 });
    }
  } else {
    // Happy smile
    g.moveTo(bx - 12, mouthY);
    g.quadraticCurveTo(bx, mouthY + 14, bx + 12, mouthY);
    g.stroke({ color: 0x5C3317, width: 2.5 });
  }

  // ─── Effects ───
  // Zzz for under
  if (state === 'under') {
    for (let i = 0; i < 3; i++) {
      const zTime = (t * 0.5 + i * 0.8) % 3;
      const zy = by - baseR - 10 - zTime * 25;
      const zx = bx + baseR * 0.5 + i * 8;
      const zAlpha = clamp01(1 - zTime / 3);
      const zSize = 6 + i * 3;
      // Draw Z shape
      g.moveTo(zx - zSize / 2, zy - zSize / 2);
      g.lineTo(zx + zSize / 2, zy - zSize / 2);
      g.lineTo(zx - zSize / 2, zy + zSize / 2);
      g.lineTo(zx + zSize / 2, zy + zSize / 2);
      g.stroke({ color: 0x7777AA, width: 2, alpha: zAlpha });
    }
  }

  // Sparkles for optimal
  if (state === 'optimal') {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + t * 0.8;
      const dist = baseR * 1.2 + Math.sin(t * 2 + i) * 10;
      const sx = bx + Math.cos(angle) * dist;
      const sy = by + Math.sin(angle) * dist;
      const sparkleAlpha = 0.4 + Math.sin(t * 3 + i * 1.5) * 0.4;
      const ss = 3 + Math.sin(t * 2.5 + i) * 1.5;
      // Diamond sparkle
      g.moveTo(sx, sy - ss);
      g.lineTo(sx + ss * 0.6, sy);
      g.lineTo(sx, sy + ss);
      g.lineTo(sx - ss * 0.6, sy);
      g.closePath();
      g.fill({ color: 0xFFD700, alpha: sparkleAlpha });
    }
  }

  // Lightning & steam for over
  if (state === 'over') {
    // Lightning bolts
    for (let i = 0; i < 3; i++) {
      const lPhase = (t * 4 + i * 2.1) % 3;
      if (lPhase < 0.3) {
        const lx = bx + (i - 1) * baseR * 0.8;
        const ly = by - baseR * 1.1;
        g.moveTo(lx, ly);
        g.lineTo(lx - 4, ly + 10);
        g.lineTo(lx + 2, ly + 10);
        g.lineTo(lx - 2, ly + 20);
        g.stroke({ color: 0xFFFF00, width: 2, alpha: 0.9 });
      }
    }
    // Steam puffs
    for (let i = 0; i < 4; i++) {
      const sPhase = (t * 1.2 + i * 0.7) % 2;
      const sy = by - baseR - sPhase * 30;
      const sx = bx + Math.sin(t * 3 + i) * 15;
      const sAlpha = clamp01(1 - sPhase / 2) * 0.3;
      const sSize = 5 + sPhase * 8;
      g.circle(sx, sy, sSize);
      g.fill({ color: 0xDDDDDD, alpha: sAlpha });
    }
  }

  // ─── Small arms ───
  const armY = by + baseR * 0.1;
  const armEdge = baseR * breath; // same as bodyRx
  const armColor = lerpColor(bodyColor, 0x000000, 0.15);
  if (state === 'under') {
    // Arms hanging down
    g.moveTo(bx - armEdge - 2, armY);
    g.quadraticCurveTo(bx - armEdge - 12, armY + 15, bx - armEdge - 8, armY + 25);
    g.stroke({ color: armColor, width: 4 });
    g.moveTo(bx + armEdge + 2, armY);
    g.quadraticCurveTo(bx + armEdge + 12, armY + 15, bx + armEdge + 8, armY + 25);
    g.stroke({ color: armColor, width: 4 });
  } else if (state === 'over') {
    // Arms flailing
    g.moveTo(bx - armEdge - 2, armY);
    g.quadraticCurveTo(
      bx - armEdge - 18, armY - 10 + Math.sin(t * 12) * 15,
      bx - armEdge - 15, armY - 20 + Math.sin(t * 12) * 10,
    );
    g.stroke({ color: armColor, width: 4 });
    g.moveTo(bx + armEdge + 2, armY);
    g.quadraticCurveTo(
      bx + armEdge + 18, armY - 10 + Math.cos(t * 12) * 15,
      bx + armEdge + 15, armY - 20 + Math.cos(t * 12) * 10,
    );
    g.stroke({ color: armColor, width: 4 });
  } else {
    // Cheerful wave
    const wave = Math.sin(t * 3) * 0.3;
    g.moveTo(bx - armEdge - 2, armY);
    g.quadraticCurveTo(bx - armEdge - 15, armY - 5, bx - armEdge - 12, armY - 18);
    g.stroke({ color: armColor, width: 4 });
    g.moveTo(bx + armEdge + 2, armY);
    g.quadraticCurveTo(bx + armEdge + 15, armY - 15 + wave * 10, bx + armEdge + 20, armY - 25);
    g.stroke({ color: armColor, width: 4 });
  }
}

// ─── COFFEE CUP Character ───────────────────────────────────────────

function drawCoffeeCup(g: Graphics, state: CharacterState, level: number, w: number, h: number, t: number) {
  const cx = w / 2;
  const baseY = h * 0.85;
  const cupW = w * 0.35;
  const cupH = h * 0.45;
  const cupTop = baseY - cupH;

  const overT = state === 'over' ? 1 : 0;
  const underT = state === 'under' ? 1 : 0;
  const shakeX = overT * Math.sin(t * 30) * 3;
  const shakeY = overT * Math.cos(t * 25) * 1.5;
  const ox = cx + shakeX;
  const oy = 0 + shakeY;

  // Shadow
  g.ellipse(cx, baseY + 5, cupW * 0.7, 6);
  g.fill({ color: 0x000000, alpha: 0.12 });

  // Saucer
  g.ellipse(ox, baseY + oy, cupW * 0.85, 8);
  g.fill(0xEEE8DC);
  g.ellipse(ox, baseY + oy, cupW * 0.85, 8);
  g.stroke({ color: 0xCCC0B0, width: 2 });

  // Cup body (trapezoid-ish with roundRect)
  const cupLeft = ox - cupW / 2;
  const cupTopY = cupTop + oy;
  const cupBotY = baseY + oy - 4;
  // Wider at top, narrower at bottom
  const topW = cupW;
  const botW = cupW * 0.8;

  // Cup shape - approximate with polygon
  g.moveTo(ox - topW / 2, cupTopY);
  g.lineTo(ox + topW / 2, cupTopY);
  g.lineTo(ox + botW / 2, cupBotY);
  g.lineTo(ox - botW / 2, cupBotY);
  g.closePath();
  g.fill(0xFFF8F0);
  g.moveTo(ox - topW / 2, cupTopY);
  g.lineTo(ox + topW / 2, cupTopY);
  g.lineTo(ox + botW / 2, cupBotY);
  g.lineTo(ox - botW / 2, cupBotY);
  g.closePath();
  g.stroke({ color: 0xCCC0B0, width: 2.5 });

  // Coffee liquid fill
  const fillPct = state === 'under' ? 0.15 + Math.sin(t) * 0.03
    : state === 'over' ? 1.0
    : 0.6 + Math.sin(t * 0.8) * 0.05;
  const fillTop = lerp(cupBotY, cupTopY, fillPct);
  const fillTopW = lerp(botW, topW, fillPct);
  const fillBotW = botW;

  const coffeeColor = state === 'under' ? 0x8B7355 : state === 'over' ? 0x4A1F0A : 0x6F4E37;

  // Clip to cup shape (approximate)
  g.moveTo(ox - fillTopW / 2, fillTop);
  g.lineTo(ox + fillTopW / 2, fillTop);
  g.lineTo(ox + botW / 2, cupBotY);
  g.lineTo(ox - botW / 2, cupBotY);
  g.closePath();
  g.fill(coffeeColor);

  // Coffee surface highlight
  g.ellipse(ox, fillTop, fillTopW / 2 - 2, 3);
  g.fill({ color: lerpColor(coffeeColor, 0xFFFFFF, 0.15), alpha: 0.7 });

  // Overflow for over-caffeinated
  if (state === 'over') {
    // Drips down sides
    for (let i = 0; i < 4; i++) {
      const dripX = ox + (i - 1.5) * (topW * 0.25);
      const dripPhase = (t * 1.5 + i * 0.8) % 2;
      const dripY = cupTopY + dripPhase * 15;
      const dripAlpha = clamp01(1 - dripPhase / 2);
      g.circle(dripX, dripY, 3);
      g.fill({ color: coffeeColor, alpha: dripAlpha });
    }
    // Splash drops at top
    for (let i = 0; i < 3; i++) {
      const splashPhase = (t * 2 + i * 1.1) % 1.5;
      const sx = ox + Math.sin(t * 5 + i * 2) * topW * 0.4;
      const sy = cupTopY - splashPhase * 20;
      const sAlpha = clamp01(1 - splashPhase / 1.5) * 0.7;
      g.circle(sx, sy, 2 + Math.random());
      g.fill({ color: coffeeColor, alpha: sAlpha });
    }
  }

  // Handle
  const handleX = ox + topW / 2 + 2;
  const handleTopY = cupTopY + cupH * 0.2;
  const handleBotY = cupTopY + cupH * 0.65;
  g.moveTo(handleX, handleTopY + oy * 0);
  g.quadraticCurveTo(handleX + 18, (handleTopY + handleBotY) / 2, handleX, handleBotY);
  g.stroke({ color: 0xCCC0B0, width: 3 });

  // ─── Face on the cup ───
  const faceY = lerp(cupBotY, cupTopY, 0.55);
  const eyeSpacing = topW * 0.2;

  if (state === 'under') {
    // Sleepy eyes - just lines
    g.moveTo(ox - eyeSpacing - 5, faceY - 5);
    g.lineTo(ox - eyeSpacing + 5, faceY - 5);
    g.stroke({ color: 0x5C3317, width: 2.5 });
    g.moveTo(ox + eyeSpacing - 5, faceY - 5);
    g.lineTo(ox + eyeSpacing + 5, faceY - 5);
    g.stroke({ color: 0x5C3317, width: 2.5 });
    // Sad mouth
    g.moveTo(ox - 8, faceY + 8);
    g.quadraticCurveTo(ox, faceY + 2, ox + 8, faceY + 8);
    g.stroke({ color: 0x5C3317, width: 2 });
  } else if (state === 'over') {
    // Panicked wide eyes
    const twitch = Math.sin(t * 15) * 1;
    g.circle(ox - eyeSpacing + twitch, faceY - 5, 6);
    g.fill(0xFFFFFF);
    g.circle(ox - eyeSpacing + twitch, faceY - 5, 6);
    g.stroke({ color: 0x333333, width: 1.5 });
    g.circle(ox - eyeSpacing + twitch, faceY - 5, 2.5);
    g.fill(0x1A1A1A);
    g.circle(ox + eyeSpacing - twitch, faceY - 5, 6);
    g.fill(0xFFFFFF);
    g.circle(ox + eyeSpacing - twitch, faceY - 5, 6);
    g.stroke({ color: 0x333333, width: 1.5 });
    g.circle(ox + eyeSpacing - twitch, faceY - 5, 2.5);
    g.fill(0x1A1A1A);
    // Wavy stressed mouth
    g.moveTo(ox - 10, faceY + 7);
    g.lineTo(ox - 5, faceY + 5);
    g.lineTo(ox, faceY + 8);
    g.lineTo(ox + 5, faceY + 5);
    g.lineTo(ox + 10, faceY + 7);
    g.stroke({ color: 0x5C3317, width: 2 });
  } else {
    // Happy face
    g.circle(ox - eyeSpacing, faceY - 5, 4);
    g.fill(0x3E2723);
    g.circle(ox - eyeSpacing + 1, faceY - 6, 1.5);
    g.fill(0xFFFFFF);
    g.circle(ox + eyeSpacing, faceY - 5, 4);
    g.fill(0x3E2723);
    g.circle(ox + eyeSpacing + 1, faceY - 6, 1.5);
    g.fill(0xFFFFFF);
    // Rosy cheeks
    g.circle(ox - eyeSpacing - 6, faceY, 4);
    g.fill({ color: 0xFFB6C1, alpha: 0.4 });
    g.circle(ox + eyeSpacing + 6, faceY, 4);
    g.fill({ color: 0xFFB6C1, alpha: 0.4 });
    // Happy smile
    g.moveTo(ox - 8, faceY + 5);
    g.quadraticCurveTo(ox, faceY + 14, ox + 8, faceY + 5);
    g.stroke({ color: 0x5C3317, width: 2 });
  }

  // ─── Steam ───
  if (state !== 'under') {
    const steamCount = state === 'over' ? 6 : 3;
    const steamSpeed = state === 'over' ? 2 : 0.8;
    for (let i = 0; i < steamCount; i++) {
      const sPhase = (t * steamSpeed + i * 0.6) % 2.5;
      const sy = cupTopY - 5 - sPhase * 35 + oy;
      const sx = ox + Math.sin(t * 1.5 + i * 1.2) * 12 + (i - steamCount / 2) * 8;
      const sAlpha = clamp01(1 - sPhase / 2.5) * (state === 'over' ? 0.4 : 0.25);
      const sSize = 4 + sPhase * 6;
      g.circle(sx, sy, sSize);
      g.fill({ color: 0xDDDDDD, alpha: sAlpha });
    }
  }

  // Cracks for over-caffeinated
  if (state === 'over') {
    const crackAlpha = 0.3 + Math.sin(t * 3) * 0.2;
    // Crack 1
    g.moveTo(ox - 8, cupTopY + cupH * 0.3);
    g.lineTo(ox - 3, cupTopY + cupH * 0.45);
    g.lineTo(ox - 10, cupTopY + cupH * 0.6);
    g.stroke({ color: 0x666666, width: 1.5, alpha: crackAlpha });
    // Crack 2
    g.moveTo(ox + 5, cupTopY + cupH * 0.5);
    g.lineTo(ox + 10, cupTopY + cupH * 0.65);
    g.stroke({ color: 0x666666, width: 1.5, alpha: crackAlpha });
  }
}

// ─── ROBOT Character ─────────────────────────────────────────────────

function drawRobot(g: Graphics, state: CharacterState, level: number, w: number, h: number, t: number) {
  const cx = w / 2;
  const overT = state === 'over' ? 1 : 0;
  const underT = state === 'under' ? 1 : 0;

  const shakeX = overT * Math.sin(t * 32) * 2.5;
  const shakeY = overT * Math.cos(t * 26) * 1.5;
  const ox = cx + shakeX;

  // Dimensions
  const headW = w * 0.38;
  const headH = h * 0.28;
  const headY = h * 0.22 + shakeY;
  const bodyW = w * 0.3;
  const bodyH = h * 0.28;
  const bodyY = headY + headH + 6;
  const screenPad = 5;

  // Shadow
  g.ellipse(cx, h * 0.88, bodyW * 0.7, 5);
  g.fill({ color: 0x000000, alpha: 0.12 });

  // ─── Antenna ───
  const antennaBase = headY - 2;
  const antennaTip = antennaBase - 20;
  const antennaTilt = state === 'under' ? 15 : state === 'over' ? Math.sin(t * 8) * 8 : 0;

  g.moveTo(ox, antennaBase);
  g.lineTo(ox + antennaTilt, antennaTip);
  g.stroke({ color: 0x888888, width: 3 });

  // Antenna ball
  const antColor = state === 'under' ? 0x555577
    : state === 'over' ? (Math.sin(t * 6) > 0 ? 0xFF3333 : 0xFF8800)
    : 0x33CC55;
  g.circle(ox + antennaTilt, antennaTip, 5);
  g.fill(antColor);
  // Antenna glow
  if (state !== 'under') {
    g.circle(ox + antennaTilt, antennaTip, 10);
    g.fill({ color: antColor, alpha: 0.15 + Math.sin(t * 3) * 0.08 });
  }

  // Sparks for over-caffeinated antenna
  if (state === 'over') {
    for (let i = 0; i < 3; i++) {
      const sparkPhase = (t * 3 + i * 1) % 1;
      if (sparkPhase < 0.4) {
        const sx = ox + antennaTilt + Math.sin(t * 10 + i * 3) * 12;
        const sy = antennaTip + Math.cos(t * 10 + i * 3) * 12;
        g.moveTo(sx - 3, sy);
        g.lineTo(sx + 3, sy);
        g.stroke({ color: 0xFFFF00, width: 1.5, alpha: 0.8 });
        g.moveTo(sx, sy - 3);
        g.lineTo(sx, sy + 3);
        g.stroke({ color: 0xFFFF00, width: 1.5, alpha: 0.8 });
      }
    }
  }

  // ─── Legs ───
  const legY = bodyY + bodyH;
  const legW = 8;
  const legH = h * 0.15;
  // Left leg
  g.roundRect(ox - bodyW * 0.3 - legW / 2, legY, legW, legH, 3);
  g.fill(0x777788);
  // Right leg
  g.roundRect(ox + bodyW * 0.3 - legW / 2, legY, legW, legH, 3);
  g.fill(0x777788);
  // Feet
  g.roundRect(ox - bodyW * 0.3 - legW / 2 - 3, legY + legH - 4, legW + 6, 8, 3);
  g.fill(0x555566);
  g.roundRect(ox + bodyW * 0.3 - legW / 2 - 3, legY + legH - 4, legW + 6, 8, 3);
  g.fill(0x555566);

  // ─── Arms ───
  const armY = bodyY + bodyH * 0.2;
  if (state === 'under') {
    // Arms drooping
    g.roundRect(ox - bodyW / 2 - 10, armY + 10, 8, 25, 3);
    g.fill(0x777788);
    g.roundRect(ox + bodyW / 2 + 2, armY + 10, 8, 25, 3);
    g.fill(0x777788);
  } else if (state === 'over') {
    // Arms raised in panic
    const armWave = Math.sin(t * 10) * 15;
    g.moveTo(ox - bodyW / 2 - 2, armY + 5);
    g.lineTo(ox - bodyW / 2 - 18, armY - 15 + armWave);
    g.stroke({ color: 0x777788, width: 8 });
    g.circle(ox - bodyW / 2 - 18, armY - 15 + armWave, 5);
    g.fill(0x888899);
    g.moveTo(ox + bodyW / 2 + 2, armY + 5);
    g.lineTo(ox + bodyW / 2 + 18, armY - 15 - armWave);
    g.stroke({ color: 0x777788, width: 8 });
    g.circle(ox + bodyW / 2 + 18, armY - 15 - armWave, 5);
    g.fill(0x888899);
  } else {
    // Relaxed arms
    g.roundRect(ox - bodyW / 2 - 10, armY, 8, 22, 3);
    g.fill(0x777788);
    g.roundRect(ox + bodyW / 2 + 2, armY, 8, 22, 3);
    g.fill(0x777788);
    // Hands
    g.circle(ox - bodyW / 2 - 6, armY + 22, 5);
    g.fill(0x888899);
    g.circle(ox + bodyW / 2 + 6, armY + 22, 5);
    g.fill(0x888899);
  }

  // ─── Body ───
  const bodyColor = state === 'under' ? 0x8888AA
    : state === 'over' ? lerpColor(0xAA8888, 0xCC6666, Math.sin(t * 4) * 0.5 + 0.5)
    : 0x88AAAA;
  g.roundRect(ox - bodyW / 2, bodyY, bodyW, bodyH, 8);
  g.fill(bodyColor);
  g.roundRect(ox - bodyW / 2, bodyY, bodyW, bodyH, 8);
  g.stroke({ color: lerpColor(bodyColor, 0x000000, 0.2), width: 2 });

  // Chest panel / battery indicator
  const battY = bodyY + bodyH * 0.3;
  const battW = bodyW * 0.4;
  const battH = bodyH * 0.35;
  g.roundRect(ox - battW / 2, battY, battW, battH, 3);
  g.fill(0x333344);
  // Battery fill
  const battFill = state === 'under' ? 0.15 + Math.sin(t) * 0.05
    : state === 'over' ? 1
    : 0.65 + Math.sin(t * 0.5) * 0.05;
  const battFillColor = state === 'under' ? 0xFF4444 : state === 'over' ? 0xFF6600 : 0x33CC55;
  const fillH = battH * battFill - 4;
  if (fillH > 0) {
    g.roundRect(ox - battW / 2 + 2, battY + battH - fillH - 2, battW - 4, fillH, 2);
    g.fill(battFillColor);
  }

  // ─── Head ───
  const headColor = state === 'under' ? 0x9999BB
    : state === 'over' ? lerpColor(0xBB9999, 0xDD7777, Math.sin(t * 5) * 0.5 + 0.5)
    : 0x99BBBB;
  g.roundRect(ox - headW / 2, headY, headW, headH, 10);
  g.fill(headColor);
  g.roundRect(ox - headW / 2, headY, headW, headH, 10);
  g.stroke({ color: lerpColor(headColor, 0x000000, 0.2), width: 2 });

  // Screen face
  const screenX = ox - headW / 2 + screenPad;
  const screenY = headY + screenPad;
  const screenW = headW - screenPad * 2;
  const screenH = headH - screenPad * 2;
  const screenColor = state === 'under' ? 0x1A1A2E
    : state === 'over' ? 0x2E1A1A
    : 0x1A2E1A;
  g.roundRect(screenX, screenY, screenW, screenH, 5);
  g.fill(screenColor);

  // Screen scan line effect
  const scanY = screenY + ((t * 30) % screenH);
  g.rect(screenX, scanY, screenW, 1);
  g.fill({ color: 0xFFFFFF, alpha: 0.03 });

  // ─── Screen face expressions ───
  const faceX = ox;
  const faceY = screenY + screenH / 2;
  const eyeSpace = screenW * 0.22;

  if (state === 'under') {
    // Low-power face: dim, half-line eyes, flat mouth
    const eyeColor = 0x4444AA;
    const dim = 0.4 + Math.sin(t * 0.5) * 0.15;
    // Eyes as horizontal lines (sleepy)
    g.moveTo(faceX - eyeSpace - 6, faceY - 4);
    g.lineTo(faceX - eyeSpace + 6, faceY - 4);
    g.stroke({ color: eyeColor, width: 2.5, alpha: dim });
    g.moveTo(faceX + eyeSpace - 6, faceY - 4);
    g.lineTo(faceX + eyeSpace + 6, faceY - 4);
    g.stroke({ color: eyeColor, width: 2.5, alpha: dim });
    // Flat mouth
    g.moveTo(faceX - 8, faceY + 7);
    g.lineTo(faceX + 8, faceY + 7);
    g.stroke({ color: eyeColor, width: 2, alpha: dim });
    // "LOW BATT" flicker
    if (Math.sin(t * 2) > 0.3) {
      // Simple low battery icon
      g.rect(faceX - 6, faceY + 13, 12, 6);
      g.stroke({ color: 0xFF4444, width: 1, alpha: dim });
      g.rect(faceX - 4, faceY + 15, 3, 2);
      g.fill({ color: 0xFF4444, alpha: dim });
    }
  } else if (state === 'over') {
    // Glitching face: spiral eyes, error symbols
    const glitchOffset = Math.sin(t * 20) * 2;

    // Spiral/spinning eyes
    for (let eye = -1; eye <= 1; eye += 2) {
      const ex = faceX + eye * eyeSpace + glitchOffset;
      const ey = faceY - 4;
      // Spiral
      for (let j = 0; j < 12; j++) {
        const angle = j * 0.5 + t * 8;
        const r = j * 0.8;
        const px = ex + Math.cos(angle) * r;
        const py = ey + Math.sin(angle) * r;
        if (j === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke({ color: 0xFF4444, width: 1.5 });
    }

    // Zigzag mouth
    g.moveTo(faceX - 10 + glitchOffset, faceY + 7);
    for (let i = 0; i < 5; i++) {
      g.lineTo(faceX - 10 + i * 5 + glitchOffset, faceY + 7 + (i % 2 ? -3 : 3));
    }
    g.stroke({ color: 0xFF6644, width: 2 });

    // Glitch bars
    if (Math.sin(t * 7) > 0.7) {
      const barY = screenY + Math.random() * screenH;
      g.rect(screenX, barY, screenW, 3);
      g.fill({ color: 0xFF0000, alpha: 0.15 });
    }

    // "!!" warning
    if (Math.sin(t * 4) > 0) {
      g.moveTo(faceX - 3, faceY + 13);
      g.lineTo(faceX - 3, faceY + 18);
      g.stroke({ color: 0xFF4444, width: 2 });
      g.circle(faceX - 3, faceY + 20, 1);
      g.fill(0xFF4444);
      g.moveTo(faceX + 3, faceY + 13);
      g.lineTo(faceX + 3, faceY + 18);
      g.stroke({ color: 0xFF4444, width: 2 });
      g.circle(faceX + 3, faceY + 20, 1);
      g.fill(0xFF4444);
    }
  } else {
    // Happy screen face
    const eyeColor = 0x33FF55;
    // Eyes - bright dots
    g.circle(faceX - eyeSpace, faceY - 4, 4);
    g.fill(eyeColor);
    g.circle(faceX - eyeSpace, faceY - 5, 1.5);
    g.fill({ color: 0xFFFFFF, alpha: 0.6 });
    g.circle(faceX + eyeSpace, faceY - 4, 4);
    g.fill(eyeColor);
    g.circle(faceX + eyeSpace, faceY - 5, 1.5);
    g.fill({ color: 0xFFFFFF, alpha: 0.6 });
    // Happy arc mouth
    g.moveTo(faceX - 8, faceY + 5);
    g.quadraticCurveTo(faceX, faceY + 13, faceX + 8, faceY + 5);
    g.stroke({ color: eyeColor, width: 2 });
  }

  // ─── Steam / smoke for over ───
  if (state === 'over') {
    for (let i = 0; i < 4; i++) {
      const sPhase = (t * 1.5 + i * 0.6) % 2;
      const sy = headY - 5 - sPhase * 25;
      const sx = ox + (i - 1.5) * 12 + Math.sin(t * 2 + i) * 5;
      const sAlpha = clamp01(1 - sPhase / 2) * 0.25;
      g.circle(sx, sy, 4 + sPhase * 5);
      g.fill({ color: 0xBBBBBB, alpha: sAlpha });
    }
  }
}

// ─── Main dispatch ───────────────────────────────────────────────────

function drawCharacter(
  g: Graphics,
  variation: CharacterVariation,
  state: CharacterState,
  level: number,
  w: number,
  h: number,
  t: number,
) {
  switch (variation) {
    case 'blob':
      drawBlob(g, state, level, w, h, t);
      break;
    case 'cup':
      drawCoffeeCup(g, state, level, w, h, t);
      break;
    case 'robot':
      drawRobot(g, state, level, w, h, t);
      break;
  }
}

// ─── React Component ─────────────────────────────────────────────────

export function PixiCharacterCanvas({
  caffeineLevel,
  width = 220,
  height = 220,
  variation = 'blob',
  isActive = true,
}: PixiCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<{ destroy: (removeView?: boolean, options?: { children?: boolean }) => void } | null>(null);
  const propsRef = useRef({ caffeineLevel, variation, isActive });
  const timeRef = useRef(0);
  const [error, setError] = useState<string | null>(null);

  // Keep props ref in sync (avoids recreating the Pixi app)
  propsRef.current = { caffeineLevel, variation, isActive };

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    // Dynamically import pixi.js to avoid SSR issues
    import('pixi.js').then(async (PIXI) => {
      if (!mounted || !containerRef.current) return;

      try {
        const app = new PIXI.Application();
        await app.init({
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!mounted) {
          app.destroy(true);
          return;
        }

        containerRef.current!.appendChild(app.canvas);
        appRef.current = app;

        const graphics = new PIXI.Graphics();
        app.stage.addChild(graphics);

        app.ticker.add((ticker) => {
          const { caffeineLevel: lvl, variation: v, isActive: active } = propsRef.current;
          if (!active) return;

          timeRef.current += ticker.deltaTime / 60;
          const state = getState(lvl);

          graphics.clear();
          drawCharacter(graphics, v, state, lvl, width, height, timeRef.current);
        });
      } catch (err) {
        console.error('Pixi init failed:', err);
        if (mounted) setError(String(err));
      }
    }).catch((err) => {
      console.error('Pixi import failed:', err);
      if (mounted) setError(String(err));
    });

    return () => {
      mounted = false;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, [width, height]);

  if (error) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-700 rounded-lg text-xs text-red-400 p-2 text-center">
        Pixi error: {error}
      </div>
    );
  }

  return <div ref={containerRef} style={{ width, height }} />;
}
