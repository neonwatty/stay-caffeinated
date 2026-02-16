'use client';

import { useEffect, useRef, useState } from 'react';
import type { CharacterState } from './svg/CharacterStates';
import type { Graphics } from 'pixi.js';

export type DetailedVariation = 'dev' | 'cat' | 'bean';

interface PixiDetailedProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  variation?: DetailedVariation;
  isActive?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

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

// ─── DEV Character (Developer at desk) ──────────────────────────────

function drawDev(g: Graphics, state: CharacterState, level: number, w: number, h: number, t: number) {
  const cx = w / 2;
  const overT = state === 'over' ? 1 : 0;
  const underT = state === 'under' ? 1 : 0;
  const optT = state === 'optimal' ? 1 : 0;

  const shake = overT * Math.sin(t * 25) * 2;
  const headBob = optT * Math.sin(t * 2) * 2;
  const slump = underT * 8;

  // ─── Desk ───
  const deskY = h * 0.68;
  const deskW = w * 0.85;
  // Desk top
  g.roundRect(cx - deskW / 2, deskY, deskW, 8, 3);
  g.fill(0x8B6E4E);
  g.roundRect(cx - deskW / 2, deskY, deskW, 8, 3);
  g.stroke({ color: 0x6B4E2E, width: 1.5 });
  // Desk front panel
  g.rect(cx - deskW / 2 + 5, deskY + 8, deskW - 10, 20);
  g.fill(0x7B5E3E);
  // Desk legs
  g.rect(cx - deskW / 2 + 8, deskY + 28, 6, 18);
  g.fill(0x6B4E2E);
  g.rect(cx + deskW / 2 - 14, deskY + 28, 6, 18);
  g.fill(0x6B4E2E);

  // ─── Laptop ───
  const laptopX = cx - 5 + shake;
  const laptopBaseY = deskY - 4;
  // Laptop base
  g.roundRect(laptopX - 28, laptopBaseY - 4, 56, 8, 2);
  g.fill(0xC0C0C0);
  g.roundRect(laptopX - 28, laptopBaseY - 4, 56, 8, 2);
  g.stroke({ color: 0x999999, width: 1 });
  // Laptop screen (tilted back)
  const screenTilt = state === 'under' ? 0.15 : 0;
  const screenH = 36;
  const screenW = 50;
  g.roundRect(laptopX - screenW / 2, laptopBaseY - screenH - 6 + slump * 0.3, screenW, screenH, 3);
  g.fill(0x333333);
  g.roundRect(laptopX - screenW / 2, laptopBaseY - screenH - 6 + slump * 0.3, screenW, screenH, 3);
  g.stroke({ color: 0x555555, width: 1 });
  // Screen content
  const scrInnerX = laptopX - screenW / 2 + 3;
  const scrInnerY = laptopBaseY - screenH - 3 + slump * 0.3;
  const scrInnerW = screenW - 6;
  const scrInnerH = screenH - 6;
  const screenBg = state === 'under' ? 0x0A0A1A
    : state === 'over' ? lerpColor(0x1A0A0A, 0x2A0A0A, Math.sin(t * 5) * 0.5 + 0.5)
    : 0x0A1A0A;
  g.roundRect(scrInnerX, scrInnerY, scrInnerW, scrInnerH, 2);
  g.fill(screenBg);

  // Code lines on screen
  if (state !== 'under') {
    const lineCount = state === 'over' ? 8 : 5;
    for (let i = 0; i < lineCount; i++) {
      const ly = scrInnerY + 4 + i * 3.5;
      const lw = 8 + Math.sin(i * 2.3 + t * (state === 'over' ? 4 : 0.3)) * 6;
      const indent = (i % 3 === 0) ? 0 : (i % 3 === 1) ? 4 : 8;
      const lineColor = state === 'over'
        ? lerpColor(0x44FF44, 0xFF4444, Math.sin(t * 3 + i) * 0.5 + 0.5)
        : 0x44BB44;
      g.rect(scrInnerX + 3 + indent, ly, clamp(lw, 3, scrInnerW - 10), 2);
      g.fill({ color: lineColor, alpha: 0.7 });
    }
  } else {
    // Screen saver / dim
    g.rect(scrInnerX + scrInnerW / 2 - 4, scrInnerY + scrInnerH / 2 - 1, 8, 2);
    g.fill({ color: 0x333366, alpha: 0.4 + Math.sin(t * 0.5) * 0.2 });
  }

  // ─── Chair ───
  const chairX = cx + shake;
  // Chair back
  g.roundRect(chairX - 22, deskY - 20 + slump, 44, 55, 5);
  g.fill(0x2C2C3E);
  g.roundRect(chairX - 22, deskY - 20 + slump, 44, 55, 5);
  g.stroke({ color: 0x1C1C2E, width: 1.5 });
  // Chair cushion detail
  g.roundRect(chairX - 18, deskY - 16 + slump, 36, 10, 3);
  g.fill({ color: 0x3C3C5E, alpha: 0.5 });

  // ─── Body / torso ───
  const bodyX = cx + shake;
  const bodyY = deskY - 30 + slump + headBob * 0.3;
  // Torso
  const shirtColor = state === 'under' ? 0x4455AA
    : state === 'over' ? lerpColor(0xAA4444, 0xCC5555, Math.sin(t * 4) * 0.5 + 0.5)
    : 0x44AA66;
  g.roundRect(bodyX - 16, bodyY - 5, 32, 30, 6);
  g.fill(shirtColor);
  g.roundRect(bodyX - 16, bodyY - 5, 32, 30, 6);
  g.stroke({ color: lerpColor(shirtColor, 0x000000, 0.2), width: 1 });

  // ─── Arms ───
  const armColor = 0xFFDDBB;
  if (state === 'under') {
    // Arms slumped on desk
    g.roundRect(bodyX - 30, deskY - 8, 20, 8, 3);
    g.fill(armColor);
    g.roundRect(bodyX + 10, deskY - 8, 20, 8, 3);
    g.fill(armColor);
  } else if (state === 'over') {
    // Arms typing frantically - fingers blurring
    const armWave = Math.sin(t * 15) * 4;
    // Left arm
    g.moveTo(bodyX - 16, bodyY + 10);
    g.quadraticCurveTo(bodyX - 28, bodyY + 20, laptopX - 18, laptopBaseY - 6);
    g.stroke({ color: armColor, width: 6 });
    // Right arm
    g.moveTo(bodyX + 16, bodyY + 10);
    g.quadraticCurveTo(bodyX + 28, bodyY + 20, laptopX + 18, laptopBaseY - 6 + armWave);
    g.stroke({ color: armColor, width: 6 });
    // Typing blur
    for (let i = 0; i < 4; i++) {
      const fx = laptopX - 15 + i * 10 + Math.sin(t * 20 + i * 2) * 3;
      const fy = laptopBaseY - 8 + Math.cos(t * 20 + i * 3) * 2;
      g.circle(fx, fy, 2);
      g.fill({ color: armColor, alpha: 0.5 });
    }
  } else {
    // Normal typing arms
    g.moveTo(bodyX - 16, bodyY + 10);
    g.quadraticCurveTo(bodyX - 25, bodyY + 22, laptopX - 15, laptopBaseY - 6);
    g.stroke({ color: armColor, width: 5 });
    g.moveTo(bodyX + 16, bodyY + 10);
    g.quadraticCurveTo(bodyX + 25, bodyY + 22, laptopX + 15, laptopBaseY - 6);
    g.stroke({ color: armColor, width: 5 });
    // Gentle typing animation
    const typing = Math.sin(t * 4);
    g.circle(laptopX - 12, laptopBaseY - 7 + typing, 3);
    g.fill(armColor);
    g.circle(laptopX + 12, laptopBaseY - 7 - typing, 3);
    g.fill(armColor);
  }

  // ─── Head ───
  const headX = bodyX;
  const headY = bodyY - 25 + headBob + slump * 0.5;
  const headR = 18;
  const skinColor = state === 'under' ? 0xE8D8C8
    : state === 'over' ? lerpColor(0xFFCCBB, 0xFFAAAA, Math.sin(t * 3) * 0.5 + 0.5)
    : 0xFFDDBB;

  // Neck
  g.rect(headX - 5, headY + headR - 4, 10, 10);
  g.fill(skinColor);

  // Head circle
  g.circle(headX, headY, headR);
  g.fill(skinColor);
  g.circle(headX, headY, headR);
  g.stroke({ color: lerpColor(skinColor, 0x000000, 0.15), width: 1.5 });

  // ─── Hair ───
  const hairColor = 0x443322;
  // Top hair
  g.ellipse(headX, headY - headR + 3, headR + 2, 8);
  g.fill(hairColor);
  // Side hair
  g.ellipse(headX - headR + 2, headY - 5, 5, 10);
  g.fill(hairColor);
  g.ellipse(headX + headR - 2, headY - 5, 5, 10);
  g.fill(hairColor);

  if (state === 'over') {
    // Wild messy hair spikes
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI * 0.8 + (i / 4) * Math.PI * 0.6;
      const spikeLen = 8 + Math.sin(t * 6 + i * 2) * 4;
      g.moveTo(
        headX + Math.cos(angle) * (headR - 2),
        headY + Math.sin(angle) * (headR - 2),
      );
      g.lineTo(
        headX + Math.cos(angle + 0.1) * (headR + spikeLen),
        headY + Math.sin(angle + 0.1) * (headR + spikeLen),
      );
      g.stroke({ color: hairColor, width: 3 });
    }
  }

  // ─── Glasses ───
  const glassY = headY - 2;
  // Bridge
  g.moveTo(headX - 4, glassY);
  g.lineTo(headX + 4, glassY);
  g.stroke({ color: 0x333333, width: 1.5 });
  // Left lens
  g.roundRect(headX - 14, glassY - 5, 11, 10, 3);
  g.stroke({ color: 0x333333, width: 1.5 });
  // Right lens
  g.roundRect(headX + 3, glassY - 5, 11, 10, 3);
  g.stroke({ color: 0x333333, width: 1.5 });
  // Lens shine
  g.rect(headX - 12, glassY - 3, 3, 2);
  g.fill({ color: 0xFFFFFF, alpha: 0.2 });
  g.rect(headX + 5, glassY - 3, 3, 2);
  g.fill({ color: 0xFFFFFF, alpha: 0.2 });

  // ─── Eyes (behind glasses) ───
  const eyeY = glassY;
  if (state === 'under') {
    // Closed/drooping
    g.moveTo(headX - 11, eyeY);
    g.lineTo(headX - 6, eyeY + 1);
    g.stroke({ color: 0x2C2C2C, width: 1.5 });
    g.moveTo(headX + 6, eyeY);
    g.lineTo(headX + 11, eyeY + 1);
    g.stroke({ color: 0x2C2C2C, width: 1.5 });
  } else if (state === 'over') {
    // Wide twitchy
    const tw = Math.sin(t * 15) * 1;
    g.circle(headX - 8.5 + tw, eyeY, 3.5);
    g.fill(0xFFFFFF);
    g.circle(headX - 8.5 + tw, eyeY, 1.5);
    g.fill(0x1A1A1A);
    g.circle(headX + 8.5 - tw, eyeY, 3.5);
    g.fill(0xFFFFFF);
    g.circle(headX + 8.5 - tw, eyeY, 1.5);
    g.fill(0x1A1A1A);
    // Bloodshot
    g.moveTo(headX - 11, eyeY - 2);
    g.lineTo(headX - 6, eyeY);
    g.stroke({ color: 0xFF4444, width: 0.5, alpha: 0.6 });
    g.moveTo(headX + 6, eyeY);
    g.lineTo(headX + 11, eyeY - 2);
    g.stroke({ color: 0xFF4444, width: 0.5, alpha: 0.6 });
  } else {
    // Normal alert eyes
    g.circle(headX - 8.5, eyeY, 3);
    g.fill(0x2C2C2C);
    g.circle(headX - 7.5, eyeY - 1, 1);
    g.fill(0xFFFFFF);
    g.circle(headX + 8.5, eyeY, 3);
    g.fill(0x2C2C2C);
    g.circle(headX + 9.5, eyeY - 1, 1);
    g.fill(0xFFFFFF);
  }

  // ─── Mouth ───
  const mouthY = headY + 7;
  if (state === 'under') {
    // Yawning
    g.ellipse(headX, mouthY + 2, 4, 3 + Math.sin(t * 0.8) * 2);
    g.fill(0x8B4513);
  } else if (state === 'over') {
    // Gritted/grimace
    g.roundRect(headX - 6, mouthY, 12, 5, 2);
    g.fill(0xFFFFFF);
    g.roundRect(headX - 6, mouthY, 12, 5, 2);
    g.stroke({ color: 0x888888, width: 1 });
  } else {
    // Smile
    g.moveTo(headX - 6, mouthY);
    g.quadraticCurveTo(headX, mouthY + 7, headX + 6, mouthY);
    g.stroke({ color: 0x8B5E3C, width: 1.5 });
  }

  // ─── Coffee mug on desk ───
  const mugX = cx + deskW / 2 - 25 + shake;
  const mugY = deskY - 14;
  // Mug body
  g.roundRect(mugX - 7, mugY, 14, 12, 2);
  g.fill(0xFFFFFF);
  g.roundRect(mugX - 7, mugY, 14, 12, 2);
  g.stroke({ color: 0xCCCCCC, width: 1 });
  // Mug handle
  g.moveTo(mugX + 7, mugY + 3);
  g.quadraticCurveTo(mugX + 14, mugY + 6, mugX + 7, mugY + 9);
  g.stroke({ color: 0xCCCCCC, width: 1.5 });
  // Coffee inside
  const coffeeFill = state === 'under' ? 0.2 : state === 'over' ? 0.1 : 0.7;
  const coffeeH = 10 * coffeeFill;
  g.rect(mugX - 5, mugY + 12 - coffeeH - 1, 10, coffeeH);
  g.fill(0x6F4E37);

  // Steam from mug
  if (state === 'optimal' || state === 'over') {
    for (let i = 0; i < (state === 'over' ? 1 : 3); i++) {
      const sp = (t * 0.8 + i * 0.5) % 2;
      const sx = mugX + Math.sin(t + i) * 4;
      const sy = mugY - 3 - sp * 15;
      g.circle(sx, sy, 2 + sp * 2);
      g.fill({ color: 0xDDDDDD, alpha: clamp01(1 - sp / 2) * 0.3 });
    }
  }

  // Extra mugs for over-caffeinated
  if (state === 'over') {
    for (let i = 0; i < 3; i++) {
      const emX = cx - deskW / 2 + 20 + i * 18 + shake;
      g.roundRect(emX - 5, mugY + 2, 10, 10, 2);
      g.fill(0xEEEEEE);
      g.roundRect(emX - 5, mugY + 2, 10, 10, 2);
      g.stroke({ color: 0xBBBBBB, width: 0.8 });
      // Empty stain
      g.ellipse(emX, mugY + 10, 3, 1);
      g.fill({ color: 0x6F4E37, alpha: 0.3 });
    }
  }

  // ─── Effects ───
  if (state === 'under') {
    // Zzz
    for (let i = 0; i < 3; i++) {
      const zp = (t * 0.4 + i * 0.7) % 3;
      const zx = headX + headR + 5 + i * 6;
      const zy = headY - headR - zp * 18;
      const za = clamp01(1 - zp / 3);
      const zs = 4 + i * 2;
      g.moveTo(zx - zs / 2, zy - zs / 2);
      g.lineTo(zx + zs / 2, zy - zs / 2);
      g.lineTo(zx - zs / 2, zy + zs / 2);
      g.lineTo(zx + zs / 2, zy + zs / 2);
      g.stroke({ color: 0x7777BB, width: 1.5, alpha: za });
    }
  }

  if (state === 'over') {
    // Sweat drops
    for (let i = 0; i < 3; i++) {
      const sp = (t * 1.5 + i * 0.8) % 1.5;
      const sx = headX + (i - 1) * 12 + shake;
      const sy = headY - headR + sp * 10;
      g.circle(sx, sy, 1.5);
      g.fill({ color: 0x88CCFF, alpha: clamp01(1 - sp / 1.5) * 0.6 });
    }
    // Screen glare pulsing
    const glareA = 0.05 + Math.sin(t * 4) * 0.03;
    g.roundRect(scrInnerX, scrInnerY, scrInnerW, scrInnerH, 2);
    g.fill({ color: 0xFF4444, alpha: glareA });
  }
}

// ─── CAT Character ──────────────────────────────────────────────────

function drawCat(g: Graphics, state: CharacterState, level: number, w: number, h: number, t: number) {
  const cx = w / 2;
  const overT = state === 'over' ? 1 : 0;
  const underT = state === 'under' ? 1 : 0;

  const shake = overT * Math.sin(t * 28) * 2;
  const purr = state === 'optimal' ? Math.sin(t * 3) * 2 : 0;
  const ox = cx + shake;

  // Base positions
  const bodyY = h * 0.58;
  const bodyW = 40;
  const bodyH = 35;

  // Shadow
  g.ellipse(cx, h * 0.88, 35, 5);
  g.fill({ color: 0x000000, alpha: 0.1 });

  // ─── Tail ───
  const tailBaseX = ox + bodyW / 2 - 5;
  const tailBaseY = bodyY + bodyH - 10;
  if (state === 'under') {
    // Tail curled around body (sleeping)
    g.moveTo(tailBaseX, tailBaseY);
    g.quadraticCurveTo(tailBaseX + 25, tailBaseY + 15, ox + 5, bodyY + bodyH + 5);
    g.quadraticCurveTo(ox - 20, bodyY + bodyH + 8, ox - 25, bodyY + bodyH);
    g.stroke({ color: 0xE8A050, width: 5 });
    g.circle(ox - 25, bodyY + bodyH - 1, 3);
    g.fill(0xE8A050);
  } else if (state === 'over') {
    // Tail straight up, puffed, twitching
    const tailTwitch = Math.sin(t * 12) * 8;
    g.moveTo(tailBaseX, tailBaseY);
    g.quadraticCurveTo(tailBaseX + 10, tailBaseY - 20, tailBaseX + 5 + tailTwitch, tailBaseY - 45);
    g.stroke({ color: 0xE8A050, width: 6 });
    // Puffed tip
    g.circle(tailBaseX + 5 + tailTwitch, tailBaseY - 47, 5);
    g.fill(0xE8A050);
  } else {
    // Gentle sway
    const sway = Math.sin(t * 1.5) * 10;
    g.moveTo(tailBaseX, tailBaseY);
    g.quadraticCurveTo(tailBaseX + 20, tailBaseY - 10 + sway, tailBaseX + 15, tailBaseY - 30);
    g.quadraticCurveTo(tailBaseX + 10, tailBaseY - 40, tailBaseX + 5 + sway * 0.3, tailBaseY - 35);
    g.stroke({ color: 0xE8A050, width: 5 });
  }

  // ─── Back legs (visible behind body) ───
  const legColor = 0xD89040;
  // Back left
  g.roundRect(ox - bodyW / 2 + 2, bodyY + bodyH - 8, 10, 20, 4);
  g.fill(legColor);
  // Back right
  g.roundRect(ox + bodyW / 2 - 12, bodyY + bodyH - 8, 10, 20, 4);
  g.fill(legColor);
  // Paws
  g.ellipse(ox - bodyW / 2 + 7, bodyY + bodyH + 12, 7, 4);
  g.fill(0xFFDDCC);
  g.ellipse(ox + bodyW / 2 - 7, bodyY + bodyH + 12, 7, 4);
  g.fill(0xFFDDCC);

  // ─── Body ───
  const furColor = 0xF0A050;
  const furDark = 0xD08030;
  // Main body (oval)
  g.ellipse(ox, bodyY + bodyH / 2 + purr * 0.2, bodyW / 2, bodyH / 2);
  g.fill(furColor);
  g.ellipse(ox, bodyY + bodyH / 2 + purr * 0.2, bodyW / 2, bodyH / 2);
  g.stroke({ color: furDark, width: 1.5 });
  // Belly lighter patch
  g.ellipse(ox, bodyY + bodyH / 2 + 3, bodyW / 3, bodyH / 3);
  g.fill({ color: 0xFFDDCC, alpha: 0.5 });

  // Stripe patterns
  for (let i = 0; i < 3; i++) {
    const sy = bodyY + 8 + i * 10;
    g.moveTo(ox - 10, sy);
    g.quadraticCurveTo(ox, sy - 3, ox + 10, sy);
    g.stroke({ color: furDark, width: 1.5, alpha: 0.4 });
  }

  // ─── Front legs / paws ───
  if (state === 'under') {
    // Tucked under (sleeping pose)
    g.ellipse(ox - 12, bodyY + bodyH - 2, 8, 5);
    g.fill(furColor);
    g.ellipse(ox + 12, bodyY + bodyH - 2, 8, 5);
    g.fill(furColor);
  } else if (state === 'over') {
    // Gripping coffee cup tightly
    g.moveTo(ox - bodyW / 2 + 5, bodyY + bodyH / 2);
    g.quadraticCurveTo(ox - bodyW / 2 - 5, bodyY + bodyH / 2 + 15, ox - 12, bodyY + bodyH - 5);
    g.stroke({ color: furColor, width: 6 });
    g.moveTo(ox + bodyW / 2 - 5, bodyY + bodyH / 2);
    g.quadraticCurveTo(ox + bodyW / 2 + 5, bodyY + bodyH / 2 + 15, ox + 12, bodyY + bodyH - 5);
    g.stroke({ color: furColor, width: 6 });
  } else {
    // Holding coffee cup
    g.moveTo(ox - bodyW / 2 + 5, bodyY + bodyH / 2);
    g.quadraticCurveTo(ox - bodyW / 2 - 8, bodyY + bodyH / 2 + 12, ox - 10, bodyY + bodyH);
    g.stroke({ color: furColor, width: 5 });
    g.moveTo(ox + bodyW / 2 - 5, bodyY + bodyH / 2);
    g.quadraticCurveTo(ox + bodyW / 2 + 8, bodyY + bodyH / 2 + 12, ox + 10, bodyY + bodyH);
    g.stroke({ color: furColor, width: 5 });
  }

  // ─── Head ───
  const headR = 22;
  const headY = bodyY - headR * 0.6 + (underT * 5) + purr * 0.3;
  const headX = ox;

  // Head shape
  g.circle(headX, headY, headR);
  g.fill(furColor);
  g.circle(headX, headY, headR);
  g.stroke({ color: furDark, width: 1.5 });

  // ─── Ears ───
  const earH = state === 'under' ? 12 : state === 'over' ? 18 : 15;
  const earW = 12;
  // Left ear
  g.moveTo(headX - headR + 5, headY - headR * 0.5);
  g.lineTo(headX - headR + 2, headY - headR * 0.5 - earH);
  g.lineTo(headX - headR + 5 + earW, headY - headR * 0.5);
  g.closePath();
  g.fill(furColor);
  g.moveTo(headX - headR + 5, headY - headR * 0.5);
  g.lineTo(headX - headR + 2, headY - headR * 0.5 - earH);
  g.lineTo(headX - headR + 5 + earW, headY - headR * 0.5);
  g.stroke({ color: furDark, width: 1.5 });
  // Inner ear
  g.moveTo(headX - headR + 7, headY - headR * 0.5 + 1);
  g.lineTo(headX - headR + 4, headY - headR * 0.5 - earH + 4);
  g.lineTo(headX - headR + 5 + earW - 3, headY - headR * 0.5 + 1);
  g.closePath();
  g.fill(0xFFBBCC);

  // Right ear
  g.moveTo(headX + headR - 5 - earW, headY - headR * 0.5);
  g.lineTo(headX + headR - 2, headY - headR * 0.5 - earH);
  g.lineTo(headX + headR - 5, headY - headR * 0.5);
  g.closePath();
  g.fill(furColor);
  g.moveTo(headX + headR - 5 - earW, headY - headR * 0.5);
  g.lineTo(headX + headR - 2, headY - headR * 0.5 - earH);
  g.lineTo(headX + headR - 5, headY - headR * 0.5);
  g.stroke({ color: furDark, width: 1.5 });
  // Inner ear
  g.moveTo(headX + headR - 5 - earW + 3, headY - headR * 0.5 + 1);
  g.lineTo(headX + headR - 4, headY - headR * 0.5 - earH + 4);
  g.lineTo(headX + headR - 7, headY - headR * 0.5 + 1);
  g.closePath();
  g.fill(0xFFBBCC);

  // Ear twitch for over
  if (state === 'over' && Math.sin(t * 8) > 0.7) {
    g.moveTo(headX - headR + 3, headY - headR * 0.5 - earH);
    g.lineTo(headX - headR, headY - headR * 0.5 - earH - 4);
    g.stroke({ color: furDark, width: 2 });
  }

  // ─── Face ───
  const faceY = headY + 1;
  // Muzzle bump
  g.ellipse(headX, faceY + 5, 10, 7);
  g.fill({ color: 0xFFEEDD, alpha: 0.6 });

  // Nose
  g.moveTo(headX, faceY + 2);
  g.lineTo(headX - 3, faceY + 5);
  g.lineTo(headX + 3, faceY + 5);
  g.closePath();
  g.fill(0xFF8899);

  // ─── Eyes ───
  const eyeSpacing = 10;
  const eyeY = faceY - 4;
  if (state === 'under') {
    // Closed sleepy eyes
    g.moveTo(headX - eyeSpacing - 5, eyeY);
    g.quadraticCurveTo(headX - eyeSpacing, eyeY + 2, headX - eyeSpacing + 5, eyeY);
    g.stroke({ color: 0x2C2C2C, width: 1.5 });
    g.moveTo(headX + eyeSpacing - 5, eyeY);
    g.quadraticCurveTo(headX + eyeSpacing, eyeY + 2, headX + eyeSpacing + 5, eyeY);
    g.stroke({ color: 0x2C2C2C, width: 1.5 });
  } else if (state === 'over') {
    // Huge dilated pupils
    const tw = Math.sin(t * 10) * 1;
    // Whites
    g.ellipse(headX - eyeSpacing + tw, eyeY, 7, 8);
    g.fill(0xFFFFEE);
    g.ellipse(headX + eyeSpacing - tw, eyeY, 7, 8);
    g.fill(0xFFFFEE);
    // Huge pupils
    g.ellipse(headX - eyeSpacing + tw, eyeY, 5, 6);
    g.fill(0x111111);
    g.ellipse(headX + eyeSpacing - tw, eyeY, 5, 6);
    g.fill(0x111111);
    // Tiny highlight
    g.circle(headX - eyeSpacing + tw + 2, eyeY - 2, 1.5);
    g.fill(0xFFFFFF);
    g.circle(headX + eyeSpacing - tw + 2, eyeY - 2, 1.5);
    g.fill(0xFFFFFF);
  } else {
    // Normal cat eyes with slit pupils
    g.ellipse(headX - eyeSpacing, eyeY, 6, 6);
    g.fill(0xBBDD44);
    g.ellipse(headX + eyeSpacing, eyeY, 6, 6);
    g.fill(0xBBDD44);
    // Slit pupils
    g.ellipse(headX - eyeSpacing, eyeY, 2, 5);
    g.fill(0x111111);
    g.ellipse(headX + eyeSpacing, eyeY, 2, 5);
    g.fill(0x111111);
    // Highlight
    g.circle(headX - eyeSpacing + 2, eyeY - 2, 1.5);
    g.fill({ color: 0xFFFFFF, alpha: 0.7 });
    g.circle(headX + eyeSpacing + 2, eyeY - 2, 1.5);
    g.fill({ color: 0xFFFFFF, alpha: 0.7 });
  }

  // ─── Whiskers ───
  const whiskerY = faceY + 4;
  const whiskerAlpha = state === 'under' ? 0.4 : 0.7;
  const whiskerDroop = state === 'under' ? 3 : state === 'over' ? -2 : 0;
  // Left whiskers
  g.moveTo(headX - 8, whiskerY);
  g.lineTo(headX - 28, whiskerY - 4 + whiskerDroop);
  g.stroke({ color: 0x666666, width: 0.8, alpha: whiskerAlpha });
  g.moveTo(headX - 8, whiskerY + 2);
  g.lineTo(headX - 27, whiskerY + 2 + whiskerDroop);
  g.stroke({ color: 0x666666, width: 0.8, alpha: whiskerAlpha });
  g.moveTo(headX - 8, whiskerY + 4);
  g.lineTo(headX - 26, whiskerY + 8 + whiskerDroop);
  g.stroke({ color: 0x666666, width: 0.8, alpha: whiskerAlpha });
  // Right whiskers
  g.moveTo(headX + 8, whiskerY);
  g.lineTo(headX + 28, whiskerY - 4 + whiskerDroop);
  g.stroke({ color: 0x666666, width: 0.8, alpha: whiskerAlpha });
  g.moveTo(headX + 8, whiskerY + 2);
  g.lineTo(headX + 27, whiskerY + 2 + whiskerDroop);
  g.stroke({ color: 0x666666, width: 0.8, alpha: whiskerAlpha });
  g.moveTo(headX + 8, whiskerY + 4);
  g.lineTo(headX + 26, whiskerY + 8 + whiskerDroop);
  g.stroke({ color: 0x666666, width: 0.8, alpha: whiskerAlpha });

  // ─── Mouth ───
  if (state === 'under') {
    // Tiny frown
    g.moveTo(headX - 4, faceY + 8);
    g.quadraticCurveTo(headX, faceY + 6, headX + 4, faceY + 8);
    g.stroke({ color: 0x5C3317, width: 1 });
  } else if (state === 'over') {
    // Wide anxious mouth
    g.moveTo(headX - 6, faceY + 7);
    g.quadraticCurveTo(headX, faceY + 12, headX + 6, faceY + 7);
    g.stroke({ color: 0x5C3317, width: 1.5 });
    g.fill({ color: 0x8B4513, alpha: 0.3 });
  } else {
    // Cat smile :3
    g.moveTo(headX - 5, faceY + 7);
    g.quadraticCurveTo(headX - 2, faceY + 9, headX, faceY + 7);
    g.stroke({ color: 0x5C3317, width: 1 });
    g.moveTo(headX, faceY + 7);
    g.quadraticCurveTo(headX + 2, faceY + 9, headX + 5, faceY + 7);
    g.stroke({ color: 0x5C3317, width: 1 });
  }

  // ─── Coffee cup (held or nearby) ───
  if (state !== 'under') {
    const cupX = ox;
    const cupY = bodyY + bodyH - 3;
    g.roundRect(cupX - 6, cupY, 12, 10, 2);
    g.fill(0xFFFFFF);
    g.roundRect(cupX - 6, cupY, 12, 10, 2);
    g.stroke({ color: 0xCCCCCC, width: 1 });
    g.rect(cupX - 4, cupY + 3, 8, 6);
    g.fill(0x6F4E37);
    // Steam
    for (let i = 0; i < 2; i++) {
      const sp = (t * 0.8 + i * 0.6) % 2;
      const sx = cupX + Math.sin(t + i) * 3;
      const sy = cupY - 2 - sp * 10;
      g.circle(sx, sy, 1.5 + sp * 1.5);
      g.fill({ color: 0xDDDDDD, alpha: clamp01(1 - sp / 2) * 0.3 });
    }
  }

  // ─── Purring effect (optimal) ───
  if (state === 'optimal') {
    const purrAlpha = 0.15 + Math.sin(t * 6) * 0.1;
    // Purr vibration lines
    for (let i = 0; i < 3; i++) {
      const py = bodyY + bodyH / 2 - 5 + i * 8;
      g.moveTo(ox - bodyW / 2 - 5, py);
      g.quadraticCurveTo(ox - bodyW / 2 - 10, py + Math.sin(t * 6 + i) * 2, ox - bodyW / 2 - 5, py + 3);
      g.stroke({ color: 0xFFCC44, width: 1, alpha: purrAlpha });
      g.moveTo(ox + bodyW / 2 + 5, py);
      g.quadraticCurveTo(ox + bodyW / 2 + 10, py + Math.sin(t * 6 + i) * 2, ox + bodyW / 2 + 5, py + 3);
      g.stroke({ color: 0xFFCC44, width: 1, alpha: purrAlpha });
    }
  }

  // ─── Over-caffeinated effects ───
  if (state === 'over') {
    // Fur puffed lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = bodyW / 2 + 3;
      const lx = ox + Math.cos(angle) * dist;
      const ly = bodyY + bodyH / 2 + Math.sin(angle) * (bodyH / 2 + 3);
      g.moveTo(lx, ly);
      g.lineTo(lx + Math.cos(angle) * (4 + Math.sin(t * 8 + i) * 3), ly + Math.sin(angle) * 4);
      g.stroke({ color: furDark, width: 1, alpha: 0.5 });
    }
    // Lightning
    if (Math.sin(t * 5) > 0.6) {
      const lx = headX + headR + 5;
      const ly = headY - headR;
      g.moveTo(lx, ly);
      g.lineTo(lx - 3, ly + 6);
      g.lineTo(lx + 1, ly + 6);
      g.lineTo(lx - 2, ly + 12);
      g.stroke({ color: 0xFFFF00, width: 1.5 });
    }
  }
}

// ─── BEAN Character (Coffee Bean) ───────────────────────────────────

function drawBean(g: Graphics, state: CharacterState, level: number, w: number, h: number, t: number) {
  const cx = w / 2;
  const overT = state === 'over' ? 1 : 0;
  const underT = state === 'under' ? 1 : 0;

  const shake = overT * Math.sin(t * 30) * 3;
  const breathe = 1 + Math.sin(t * (state === 'over' ? 5 : state === 'under' ? 1 : 2)) * 0.02;
  const ox = cx + shake;
  const bodyY = h * 0.42;

  // Shadow
  g.ellipse(cx, h * 0.87, 30 + overT * 5, 5);
  g.fill({ color: 0x000000, alpha: 0.12 });

  // ─── Legs ───
  const legY = bodyY + 38;
  const legColor = state === 'under' ? 0x8B6E4E : state === 'over' ? 0x6B3E1E : 0x7B5E3E;
  // Left leg
  g.roundRect(ox - 14, legY, 8, 22, 3);
  g.fill(legColor);
  // Right leg
  g.roundRect(ox + 6, legY, 8, 22, 3);
  g.fill(legColor);
  // Shoes
  g.roundRect(ox - 16, legY + 18, 12, 6, 3);
  g.fill(0x3D2B1F);
  g.roundRect(ox + 4, legY + 18, 12, 6, 3);
  g.fill(0x3D2B1F);
  // Walk animation for optimal
  if (state === 'optimal') {
    const step = Math.sin(t * 3) * 3;
    g.roundRect(ox - 14, legY + step, 8, 22, 3);
    g.fill(legColor);
    g.roundRect(ox + 6, legY - step, 8, 22, 3);
    g.fill(legColor);
  }

  // ─── Arms ───
  const armY = bodyY + 10;
  const armCol = legColor;
  if (state === 'under') {
    // Drooping arms
    g.moveTo(ox - 25, armY + 5);
    g.quadraticCurveTo(ox - 30, armY + 20, ox - 25, armY + 30);
    g.stroke({ color: armCol, width: 5 });
    g.moveTo(ox + 25, armY + 5);
    g.quadraticCurveTo(ox + 30, armY + 20, ox + 25, armY + 30);
    g.stroke({ color: armCol, width: 5 });
  } else if (state === 'over') {
    // Flailing arms
    const la = Math.sin(t * 10) * 20;
    const ra = Math.cos(t * 10) * 20;
    g.moveTo(ox - 25, armY + 5);
    g.quadraticCurveTo(ox - 35, armY - 10 + la, ox - 30, armY - 25 + la);
    g.stroke({ color: armCol, width: 5 });
    g.circle(ox - 30, armY - 25 + la, 4);
    g.fill(armCol);
    g.moveTo(ox + 25, armY + 5);
    g.quadraticCurveTo(ox + 35, armY - 10 + ra, ox + 30, armY - 25 + ra);
    g.stroke({ color: armCol, width: 5 });
    g.circle(ox + 30, armY - 25 + ra, 4);
    g.fill(armCol);
  } else {
    // Confident pose - hands on hips
    g.moveTo(ox - 25, armY + 5);
    g.quadraticCurveTo(ox - 32, armY + 15, ox - 20, armY + 25);
    g.stroke({ color: armCol, width: 5 });
    g.moveTo(ox + 25, armY + 5);
    g.quadraticCurveTo(ox + 32, armY + 15, ox + 20, armY + 25);
    g.stroke({ color: armCol, width: 5 });
  }

  // ─── Bean Body ───
  const beanColor = state === 'under' ? 0xA08060
    : state === 'over' ? lerpColor(0x8B3A00, 0xBB4400, Math.sin(t * 4) * 0.5 + 0.5)
    : 0x8B5E3C;
  const beanDark = lerpColor(beanColor, 0x000000, 0.25);
  const beanH = 45 * breathe;
  const beanW = 25 * breathe;

  // Main bean shape (two overlapping ellipses)
  g.ellipse(ox - 3, bodyY, beanW * 0.85, beanH * 0.95);
  g.fill(beanColor);
  g.ellipse(ox + 3, bodyY, beanW * 0.85, beanH * 0.95);
  g.fill(beanColor);
  // Outer stroke
  g.ellipse(ox - 3, bodyY, beanW * 0.85, beanH * 0.95);
  g.stroke({ color: beanDark, width: 1.5 });
  g.ellipse(ox + 3, bodyY, beanW * 0.85, beanH * 0.95);
  g.stroke({ color: beanDark, width: 1.5 });

  // Center crease (characteristic coffee bean line)
  g.moveTo(ox, bodyY - beanH * 0.7);
  g.quadraticCurveTo(ox - 6, bodyY - beanH * 0.2, ox + 2, bodyY);
  g.quadraticCurveTo(ox + 6, bodyY + beanH * 0.2, ox, bodyY + beanH * 0.7);
  g.stroke({ color: beanDark, width: 2 });

  // Highlight/sheen
  g.ellipse(ox - 8, bodyY - 10, 6, 12);
  g.fill({ color: 0xFFFFFF, alpha: 0.08 });

  // ─── Face ───
  const faceY = bodyY - 8;

  // Eyes
  const eyeSpacing = 9;
  const eyeY = faceY;
  if (state === 'under') {
    // Droopy half-closed
    const blink = Math.sin(t * 0.6);
    g.ellipse(ox - eyeSpacing, eyeY, 4, lerp(1, 3, clamp01(blink)));
    g.fill(0x1A1A1A);
    g.ellipse(ox + eyeSpacing, eyeY, 4, lerp(1, 3, clamp01(blink)));
    g.fill(0x1A1A1A);
    // Tired bags under eyes
    g.moveTo(ox - eyeSpacing - 4, eyeY + 3);
    g.quadraticCurveTo(ox - eyeSpacing, eyeY + 5, ox - eyeSpacing + 4, eyeY + 3);
    g.stroke({ color: 0x6B4E2E, width: 1, alpha: 0.5 });
    g.moveTo(ox + eyeSpacing - 4, eyeY + 3);
    g.quadraticCurveTo(ox + eyeSpacing, eyeY + 5, ox + eyeSpacing + 4, eyeY + 3);
    g.stroke({ color: 0x6B4E2E, width: 1, alpha: 0.5 });
  } else if (state === 'over') {
    // Huge spinning/spiral eyes
    const tw = Math.sin(t * 12) * 1.5;
    g.circle(ox - eyeSpacing + tw, eyeY, 6);
    g.fill(0xFFFFFF);
    g.circle(ox + eyeSpacing - tw, eyeY, 6);
    g.fill(0xFFFFFF);
    // Spiral pupils
    for (let eye = -1; eye <= 1; eye += 2) {
      const ex = ox + eye * eyeSpacing + (eye === -1 ? tw : -tw);
      for (let j = 0; j < 10; j++) {
        const a = j * 0.6 + t * 8;
        const r = j * 0.4;
        const px = ex + Math.cos(a) * r;
        const py = eyeY + Math.sin(a) * r;
        if (j === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke({ color: 0xFF2222, width: 1.5 });
    }
  } else {
    // Bright confident eyes
    g.circle(ox - eyeSpacing, eyeY, 5);
    g.fill(0x1A1A1A);
    g.circle(ox - eyeSpacing + 1.5, eyeY - 1.5, 2);
    g.fill(0xFFFFFF);
    g.circle(ox + eyeSpacing, eyeY, 5);
    g.fill(0x1A1A1A);
    g.circle(ox + eyeSpacing + 1.5, eyeY - 1.5, 2);
    g.fill(0xFFFFFF);
    // Eyebrow raise
    g.moveTo(ox - eyeSpacing - 4, eyeY - 7);
    g.quadraticCurveTo(ox - eyeSpacing, eyeY - 9, ox - eyeSpacing + 4, eyeY - 7);
    g.stroke({ color: beanDark, width: 1.5 });
    g.moveTo(ox + eyeSpacing - 4, eyeY - 7);
    g.quadraticCurveTo(ox + eyeSpacing, eyeY - 9, ox + eyeSpacing + 4, eyeY - 7);
    g.stroke({ color: beanDark, width: 1.5 });
  }

  // Mouth
  const mouthY = faceY + 10;
  if (state === 'under') {
    g.moveTo(ox - 5, mouthY);
    g.quadraticCurveTo(ox, mouthY - 3, ox + 5, mouthY);
    g.stroke({ color: 0x3D2B1F, width: 1.5 });
  } else if (state === 'over') {
    // Screaming
    g.ellipse(ox, mouthY + 2, 7, 5 + Math.sin(t * 8) * 2);
    g.fill(0x3D1A00);
    g.ellipse(ox, mouthY + 2, 7, 5 + Math.sin(t * 8) * 2);
    g.stroke({ color: 0x2D0A00, width: 1 });
  } else {
    // Big grin
    g.moveTo(ox - 8, mouthY);
    g.quadraticCurveTo(ox, mouthY + 8, ox + 8, mouthY);
    g.stroke({ color: 0x3D2B1F, width: 2 });
  }

  // ─── Effects ───
  // Aroma/glow for optimal
  if (state === 'optimal') {
    for (let i = 0; i < 4; i++) {
      const sp = (t * 0.6 + i * 0.5) % 2.5;
      const sx = ox + Math.sin(t * 0.8 + i * 1.5) * 15;
      const sy = bodyY - beanH - sp * 20;
      const sa = clamp01(1 - sp / 2.5) * 0.2;
      g.circle(sx, sy, 3 + sp * 3);
      g.fill({ color: 0xDDCC88, alpha: sa });
    }
    // Golden sparkles
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + t * 0.6;
      const dist = beanW + 12 + Math.sin(t * 2 + i) * 5;
      const sx = ox + Math.cos(angle) * dist;
      const sy = bodyY + Math.sin(angle) * (beanH * 0.8);
      const sa = 0.3 + Math.sin(t * 3 + i * 1.5) * 0.3;
      const ss = 2 + Math.sin(t * 2 + i) * 1;
      g.moveTo(sx, sy - ss);
      g.lineTo(sx + ss * 0.5, sy);
      g.lineTo(sx, sy + ss);
      g.lineTo(sx - ss * 0.5, sy);
      g.closePath();
      g.fill({ color: 0xFFDD44, alpha: sa });
    }
  }

  // Cracks and heat for over
  if (state === 'over') {
    // Cracks
    const crackA = 0.4 + Math.sin(t * 3) * 0.2;
    g.moveTo(ox - 12, bodyY - 15);
    g.lineTo(ox - 8, bodyY - 5);
    g.lineTo(ox - 14, bodyY + 5);
    g.stroke({ color: 0xFF4400, width: 1.5, alpha: crackA });
    g.moveTo(ox + 10, bodyY - 10);
    g.lineTo(ox + 6, bodyY);
    g.lineTo(ox + 12, bodyY + 10);
    g.stroke({ color: 0xFF4400, width: 1.5, alpha: crackA });
    // Inner glow through cracks
    g.moveTo(ox - 10, bodyY - 10);
    g.lineTo(ox - 8, bodyY - 5);
    g.stroke({ color: 0xFF8800, width: 1, alpha: crackA * 0.5 });

    // Steam shooting out
    for (let i = 0; i < 6; i++) {
      const sp = (t * 2 + i * 0.4) % 2;
      const angle = (i / 6) * Math.PI * 2 + Math.sin(t * 3) * 0.3;
      const dist = beanW + sp * 20;
      const sx = ox + Math.cos(angle) * dist;
      const sy = bodyY + Math.sin(angle) * (beanH * 0.5) - sp * 10;
      const sa = clamp01(1 - sp / 2) * 0.3;
      g.circle(sx, sy, 2 + sp * 4);
      g.fill({ color: 0xEEDDCC, alpha: sa });
    }

    // Heat shimmer
    const heatA = 0.06 + Math.sin(t * 5) * 0.04;
    g.ellipse(ox, bodyY, beanW + 8, beanH + 5);
    g.fill({ color: 0xFF4400, alpha: heatA });
  }

  // Sleepy effects for under
  if (state === 'under') {
    // Zzz
    for (let i = 0; i < 3; i++) {
      const zp = (t * 0.35 + i * 0.7) % 3;
      const zx = ox + beanW + 3 + i * 7;
      const zy = bodyY - beanH * 0.5 - zp * 18;
      const za = clamp01(1 - zp / 3);
      const zs = 4 + i * 2;
      g.moveTo(zx - zs / 2, zy - zs / 2);
      g.lineTo(zx + zs / 2, zy - zs / 2);
      g.lineTo(zx - zs / 2, zy + zs / 2);
      g.lineTo(zx + zs / 2, zy + zs / 2);
      g.stroke({ color: 0x8888AA, width: 1.5, alpha: za });
    }
    // Wilting droop effect
    g.ellipse(ox, bodyY + beanH * 0.6, beanW * 0.4, 3);
    g.fill({ color: 0x000000, alpha: 0.05 });
  }
}

// ─── Dispatch ────────────────────────────────────────────────────────

function drawDetailedCharacter(
  g: Graphics, variation: DetailedVariation, state: CharacterState,
  level: number, w: number, h: number, t: number,
) {
  switch (variation) {
    case 'dev': drawDev(g, state, level, w, h, t); break;
    case 'cat': drawCat(g, state, level, w, h, t); break;
    case 'bean': drawBean(g, state, level, w, h, t); break;
  }
}

// ─── React Component ─────────────────────────────────────────────────

export function PixiDetailedCanvas({
  caffeineLevel,
  width = 220,
  height = 220,
  variation = 'dev',
  isActive = true,
}: PixiDetailedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<{ destroy: (removeView?: boolean, options?: { children?: boolean }) => void } | null>(null);
  const propsRef = useRef({ caffeineLevel, variation, isActive });
  const timeRef = useRef(0);
  const [error, setError] = useState<string | null>(null);

  propsRef.current = { caffeineLevel, variation, isActive };

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
        const graphics = new PIXI.Graphics();
        app.stage.addChild(graphics);

        app.ticker.add((ticker) => {
          const { caffeineLevel: lvl, variation: v, isActive: active } = propsRef.current;
          if (!active) return;
          timeRef.current += ticker.deltaTime / 60;
          graphics.clear();
          drawDetailedCharacter(graphics, v, getState(lvl), lvl, width, height, timeRef.current);
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
