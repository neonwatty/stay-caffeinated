'use client';

import { useEffect, useRef, useState } from 'react';
import type { CharacterState } from './svg/CharacterStates';

export type RetroVariation = 'mug' | 'wizard' | 'slime';

interface PixiRetroProps {
  caffeineLevel: number;
  width?: number;
  height?: number;
  variation?: RetroVariation;
  isActive?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getState(level: number): CharacterState {
  if (level < 30) return 'under';
  if (level > 70) return 'over';
  return 'optimal';
}

// Grid size: each character is drawn on a 24x24 pixel grid, upscaled
const GRID = 24;

type PixelRow = (number | null)[];  // null = transparent

// ─── Color Palettes ──────────────────────────────────────────────────

const PAL = {
  // Shared
  black: 0x1A1A2E,
  white: 0xF0F0F0,
  skin: 0xFFDDBB,
  skinDark: 0xDDBB99,
  eye: 0x222244,
  // Coffee
  coffeeDark: 0x4A2C17,
  coffeeMed: 0x6B3E1E,
  coffeeLight: 0x8B5E3C,
  coffeeCream: 0xDDCC99,
  // Mug
  mugWhite: 0xEEEEEE,
  mugGray: 0xCCCCCC,
  mugDark: 0xAAAAAA,
  // Wizard
  robeBlue: 0x3355AA,
  robeDark: 0x223377,
  hatBlue: 0x4466CC,
  hatStar: 0xFFDD44,
  staffBrown: 0x8B6E4E,
  staffGlow: 0x44DDFF,
  // Slime
  slimeGreen: 0x66BB44,
  slimeDark: 0x448822,
  slimeLight: 0x88DD66,
  slimeHighlight: 0xAAFF88,
  // States
  red: 0xFF4444,
  orange: 0xFF8844,
  yellow: 0xFFDD44,
  blue: 0x4488FF,
  green: 0x44DD66,
  purple: 0x8844CC,
  pink: 0xFF88AA,
  gray: 0x888888,
  darkGray: 0x444444,
  steam: 0xDDDDDD,
  zzz: 0x7777BB,
  lightning: 0xFFFF44,
};

// ─── MUG Character Sprites ──────────────────────────────────────────
// A coffee mug with legs and face

const _ = null;
const W = PAL.mugWhite;
const G = PAL.mugGray;
const D = PAL.mugDark;
const C = PAL.coffeeMed;
const K = PAL.coffeeDark;
const E = PAL.eye;
const B = PAL.black;

function getMugSprite(state: CharacterState, frame: number): PixelRow[] {
  const f = frame % 2;

  if (state === 'under') {
    return [
      // Row 0-3: empty top
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      // Row 3: Zzz
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PAL.zzz,PAL.zzz,PAL.zzz,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PAL.zzz,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PAL.zzz,PAL.zzz,PAL.zzz,_,_,_,_,_],
      // Row 6-7: mug rim
      [_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_],
      [_,_,_,_,_,G,W,W,W,W,W,W,W,W,W,W,W,W,G,_,_,_,_,_],
      // Row 8-9: face (sleepy closed eyes)
      [_,_,_,_,_,G,W,W,W,E,E,W,W,E,E,W,W,W,G,G,_,_,_,_],
      [_,_,_,_,_,G,W,W,W,W,W,W,W,W,W,W,W,W,G,W,G,_,_,_],
      // Row 10: mouth (frown)
      [_,_,_,_,_,G,W,W,W,W,W,E,E,W,W,W,W,W,G,W,G,_,_,_],
      [_,_,_,_,_,G,W,W,W,W,E,W,W,E,W,W,W,W,G,G,_,_,_,_],
      // Row 12-15: coffee body
      [_,_,_,_,_,G,W,W,C,C,C,C,C,C,C,C,W,W,G,_,_,_,_,_],
      [_,_,_,_,_,G,W,C,C,C,C,C,C,C,C,C,C,W,G,_,_,_,_,_],
      [_,_,_,_,_,G,W,C,C,K,C,C,C,C,K,C,C,W,G,_,_,_,_,_],
      [_,_,_,_,_,_,G,C,C,C,C,C,C,C,C,C,C,G,_,_,_,_,_,_],
      // Row 16-17: mug bottom
      [_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_,_],
      // Row 18-19: legs (droopy)
      [_,_,_,_,_,_,_,_,_,G,G,_,_,G,G,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,G,G,_,_,G,G,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,G,G,_,_,_,_,G,G,_,_,_,_,_,_,_,_],
      // Row 21-23: feet
      [_,_,_,_,_,_,_,G,G,G,_,_,_,G,G,G,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  }

  if (state === 'over') {
    const s = f === 0 ? 0 : 1; // shake offset
    return [
      // Row 0-2: steam/sparks
      [_,_,_,_,_,_,_,_,PAL.steam,_,_,_,_,PAL.steam,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,PAL.steam,_,_,PAL.lightning,_,_,_,PAL.steam,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,PAL.lightning,PAL.lightning,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,PAL.lightning,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      // Row 6-7: mug rim (shaking)
      [_,_,_,_,_,s,PAL.red,G,G,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_],
      [_,_,_,_,_,G+s,W,W,W,W,W,W,W,W,W,W,W,W,G,_,_,_,_,_],
      // Row 8-9: face (wide panicked eyes)
      [_,_,_,_,_,G,W,W,E,E,E,W,W,E,E,E,W,W,G,G,_,_,_,_],
      [_,_,_,_,_,G,W,W,E,PAL.red,E,W,W,E,PAL.red,E,W,W,G,W,G,_,_,_],
      // Row 10-11: mouth (grimace)
      [_,_,_,_,_,G,W,W,W,E,E,E,E,E,E,W,W,W,G,W,G,_,_,_],
      [_,_,_,_,_,G,W,W,W,W,W,W,W,W,W,W,W,W,G,G,_,_,_,_],
      // Row 12-15: coffee body (overflowing)
      [_,_,_,_,C,G,C,C,C,C,C,C,C,C,C,C,C,C,G,C,_,_,_,_],
      [_,_,_,_,_,G,C,C,C,C,C,C,C,C,C,C,C,C,G,_,_,_,_,_],
      [_,_,_,_,_,G,C,C,PAL.orange,C,C,C,C,PAL.orange,C,C,C,C,G,_,_,_,_,_],
      [_,_,_,_,_,_,G,C,C,C,C,C,C,C,C,C,C,G,_,_,_,_,_,_],
      // Row 16-17: mug bottom
      [_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_,_],
      // Row 18-20: legs (fast walk)
      [_,_,_,_,_,_,_,_,f===0?_:G,G,G,_,_,G,G,f===0?G:_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,f===0?G:_,G,_,_,_,_,G,f===0?_:G,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,f===0?G:_,G,_,_,_,_,_,_,G,f===0?_:G,_,_,_,_,_,_,_],
      // Row 21-23: feet
      [_,_,_,_,_,_,f===0?G:_,G,G,_,_,_,_,_,G,G,f===0?_:G,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  }

  // Optimal: happy, steam rising gently
  return [
    // Row 0-2: gentle steam
    [_,_,_,_,_,_,_,_,_,PAL.steam,_,_,_,_,PAL.steam,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,PAL.steam,_,_,_,_,PAL.steam,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PAL.yellow,_,_,_,_,_,_,_],
    // Row 6-7: mug rim
    [_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_],
    [_,_,_,_,_,G,W,W,W,W,W,W,W,W,W,W,W,W,G,_,_,_,_,_],
    // Row 8-9: face (happy eyes)
    [_,_,_,_,_,G,W,W,W,E,E,W,W,E,E,W,W,W,G,G,_,_,_,_],
    [_,_,_,_,_,G,W,W,E,W,W,E,E,W,W,E,W,W,G,W,G,_,_,_],
    // Row 10-11: mouth (smile)
    [_,_,_,_,_,G,W,W,W,W,E,W,W,E,W,W,W,W,G,W,G,_,_,_],
    [_,_,_,_,_,G,W,W,W,W,W,E,E,W,W,W,W,W,G,G,_,_,_,_],
    // Row 12-15: coffee body
    [_,_,_,_,_,G,W,W,C,C,C,C,C,C,C,C,W,W,G,_,_,_,_,_],
    [_,_,_,_,_,G,W,C,C,PAL.coffeeCream,C,C,C,C,PAL.coffeeCream,C,C,W,G,_,_,_,_,_],
    [_,_,_,_,_,G,W,C,C,C,C,C,C,C,C,C,C,W,G,_,_,_,_,_],
    [_,_,_,_,_,_,G,C,C,C,C,C,C,C,C,C,C,G,_,_,_,_,_,_],
    // Row 16-17: mug bottom
    [_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,G,G,G,G,G,G,G,G,G,G,_,_,_,_,_,_,_],
    // Row 18-20: legs (bouncy walk)
    [_,_,_,_,_,_,_,_,_,G,G,_,_,G,G,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,G,G,_,_,G,G,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,G,_,_,_,_,G,_,_,_,_,_,_,_,_,_],
    // Row 21-23: feet
    [_,_,_,_,_,_,_,_,G,G,G,_,_,G,G,G,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];
}

// ─── WIZARD Character Sprites ────────────────────────────────────────
// A wizard with a coffee-powered staff

const RB = PAL.robeBlue;
const RD = PAL.robeDark;
const HB = PAL.hatBlue;
const HS = PAL.hatStar;
const SB = PAL.staffBrown;
const SG = PAL.staffGlow;
const SK = PAL.skin;
const SD = PAL.skinDark;

function getWizardSprite(state: CharacterState, frame: number): PixelRow[] {
  const f = frame % 2;

  if (state === 'under') {
    return [
      [_,_,_,_,_,_,_,_,_,_,HB,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,HB,HB,HB,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,HB,HB,HS,HB,HB,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,HB,HB,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_,_,_],
      // Hat brim
      [_,_,_,_,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_],
      // Face
      [_,_,_,_,_,_,_,SK,SK,SK,SK,SK,SK,SK,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,SK,E,E,SK,SK,E,SK,_,_,_,_,_,PAL.zzz,PAL.zzz,_,_,_],
      [_,_,_,_,_,_,_,SK,SK,SK,SK,SK,SK,SK,_,_,_,_,_,_,PAL.zzz,_,_,_],
      [_,_,_,_,_,_,_,SK,SK,SD,SD,SD,SK,SK,_,_,_,_,_,PAL.zzz,PAL.zzz,_,_,_],
      // Beard
      [_,_,_,_,_,_,_,_,PAL.gray,PAL.gray,PAL.gray,PAL.gray,PAL.gray,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,PAL.gray,PAL.gray,PAL.gray,_,_,_,_,_,_,_,_,_,_,_,_],
      // Body/robe
      [_,_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RD,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,_,_,_,_,_,_,_,_],
      // Arms drooping, no staff glow
      [_,_,_,_,SK,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,SK,_,_,_,_,_,_,_],
      [_,_,_,SK,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,_,SB,_,_,_,_,_,_],
      [_,_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RD,_,_,SB,_,_,_,_,_,_],
      // Robe bottom
      [_,_,_,_,_,_,RD,RD,RB,RB,RB,RB,RB,RD,RD,_,_,SB,_,_,_,_,_,_],
      [_,_,_,_,_,RD,RD,RD,RD,RB,RB,RB,RD,RD,RD,RD,_,SB,_,_,_,_,_,_],
      [_,_,_,_,RD,RD,RD,RD,RD,RD,RB,RD,RD,RD,RD,RD,RD,SB,_,_,_,_,_,_],
      // Feet
      [_,_,_,_,_,_,_,B,B,B,_,_,B,B,B,_,_,PAL.darkGray,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  }

  if (state === 'over') {
    return [
      // Hat sparking
      [_,_,_,_,_,_,_,_,_,_,HB,_,_,PAL.lightning,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,HB,HB,HB,PAL.lightning,PAL.lightning,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,HB,HB,HS,HB,HB,_,PAL.lightning,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,HB,HB,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_],
      // Face (panicked)
      [_,_,_,_,_,_,_,SK,SK,SK,SK,SK,SK,SK,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,SK,E,PAL.red,SK,SK,E,PAL.red,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,SK,E,E,SK,SK,E,E,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,SK,SK,SK,E,E,SK,SK,_,_,_,_,_,_,_,_,_,_],
      // Beard
      [_,_,_,_,_,_,_,_,PAL.gray,PAL.gray,PAL.gray,PAL.gray,PAL.gray,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,PAL.gray,PAL.gray,PAL.gray,_,_,_,_,_,_,_,_,_,_,_,_],
      // Body (red robe, frantic)
      [_,_,_,_,_,_,PAL.red,RB,RB,RB,RB,RB,RB,RB,PAL.red,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,PAL.red,RB,RB,RB,RB,RB,RB,RB,RB,RB,PAL.red,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,_,_,_,_,_,_,_,_],
      // Arms raised, staff glowing intensely
      [_,_,SK,SK,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,_,SG,SG,_,_,_,_,_],
      [_,SK,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,SK,SB,SG,SG,_,_,_,_],
      [_,_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RD,_,_,SB,SG,_,_,_,_,_],
      // Robe bottom (billowing)
      [_,_,_,_,_,_,RD,RD,RB,RB,RB,RB,RB,RD,RD,_,_,SB,_,_,_,_,_,_],
      [_,_,_,_,RD,RD,RD,RD,RD,RB,RB,RB,RD,RD,RD,RD,RD,SB,_,_,_,_,_,_],
      [_,_,_,RD,RD,RD,RD,RD,RD,RD,RB,RD,RD,RD,RD,RD,RD,SB,_,_,_,_,_,_],
      // Feet
      [_,_,_,_,_,_,f===0?B:_,B,B,B,_,_,B,B,B,f===0?_:B,_,PAL.darkGray,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  }

  // Optimal: confident pose, staff glowing softly
  return [
    [_,_,_,_,_,_,_,_,_,_,HB,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,HB,HB,HB,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,HB,HB,HS,HB,HB,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,HB,HB,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,HB,_,_,_,_,_,_,_],
    // Face (happy)
    [_,_,_,_,_,_,_,SK,SK,SK,SK,SK,SK,SK,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,SK,E,E,SK,SK,E,E,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,SK,SK,SK,SK,SK,SK,SK,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,SK,SK,SK,E,E,SK,SK,_,_,_,_,_,_,_,_,_,_],
    // Beard
    [_,_,_,_,_,_,_,_,PAL.gray,PAL.gray,PAL.gray,PAL.gray,PAL.gray,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,PAL.gray,PAL.gray,PAL.gray,_,_,_,_,_,_,_,_,_,_,_,_],
    // Body
    [_,_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RD,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,RD,RB,RB,RB,HS,RB,RB,HS,RB,RB,RD,_,_,_,_,_,_,_,_],
    // Arms out, holding staff
    [_,_,_,_,SK,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,SK,SG,_,_,_,_,_,_],
    [_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RB,RB,RD,_,SB,_,_,_,_,_,_],
    [_,_,_,_,_,_,RD,RB,RB,RB,RB,RB,RB,RB,RD,_,_,SB,_,_,_,_,_,_],
    // Robe bottom
    [_,_,_,_,_,_,RD,RD,RB,RB,RB,RB,RB,RD,RD,_,_,SB,_,_,_,_,_,_],
    [_,_,_,_,_,RD,RD,RD,RD,RB,RB,RB,RD,RD,RD,RD,_,SB,_,_,_,_,_,_],
    [_,_,_,_,RD,RD,RD,RD,RD,RD,RB,RD,RD,RD,RD,RD,RD,SB,_,_,_,_,_,_],
    // Feet
    [_,_,_,_,_,_,_,B,B,B,_,_,B,B,B,_,_,PAL.darkGray,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];
}

// ─── SLIME Character Sprites ─────────────────────────────────────────
// A coffee slime blob

const SL = PAL.slimeGreen;
const SLD = PAL.slimeDark;
const SLL = PAL.slimeLight;
const SLH = PAL.slimeHighlight;

function getSlimeSprite(state: CharacterState, frame: number): PixelRow[] {
  const f = frame % 2;

  // Use coffee colors for the slime - it's a coffee slime!
  const body = state === 'under' ? PAL.coffeeDark
    : state === 'over' ? PAL.orange
    : PAL.coffeeMed;
  const bodyL = state === 'under' ? PAL.coffeeMed
    : state === 'over' ? PAL.yellow
    : PAL.coffeeLight;
  const bodyD = state === 'under' ? 0x2A1A0A
    : state === 'over' ? PAL.red
    : PAL.coffeeDark;
  const bodyH = state === 'under' ? PAL.coffeeLight
    : state === 'over' ? 0xFFFFAA
    : PAL.coffeeCream;

  if (state === 'under') {
    // Flat, melted slime
    return [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PAL.zzz,PAL.zzz,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PAL.zzz,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,body,body,_,_,_,_,_,_,PAL.zzz,PAL.zzz,_,_,_],
      [_,_,_,_,_,_,_,_,_,body,body,body,body,body,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,body,bodyL,bodyH,body,body,bodyH,body,body,body,_,_,_,_,_,_,_,_],
      // Eyes (closed)
      [_,_,_,_,_,_,body,body,body,E,E,body,body,E,E,body,body,_,_,_,_,_,_,_],
      [_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_],
      // Mouth
      [_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_],
      [_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_],
      [_,_,_,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_],
      [_,_,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_],
      [_,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_],
      [bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,bodyD,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  }

  if (state === 'over') {
    // Tall, bubbling, agitated
    return [
      // Bubbles
      [_,_,_,_,_,_,_,_,_,_,body,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,body,body,body,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,body,_,_,PAL.lightning,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,body,body,body,PAL.lightning,PAL.lightning,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,body,body,bodyL,body,body,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,body,body,bodyL,bodyH,body,body,body,bodyH,body,body,body,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_],
      // Eyes (huge, panicked)
      [_,_,_,_,body,body,body,E,E,E,body,body,E,E,E,body,body,_,_,_,_,_,_,_],
      [_,_,_,_,body,body,body,E,PAL.red,E,body,body,E,PAL.red,E,body,body,_,_,_,_,_,_,_],
      [_,_,_,_,body,body,body,E,E,E,body,body,E,E,E,body,body,_,_,_,_,_,_,_],
      // Mouth (screaming)
      [_,_,_,_,body,body,body,body,body,E,E,E,E,body,body,body,body,_,_,_,_,_,_,_],
      [_,_,_,_,_,body,body,body,E,bodyD,bodyD,bodyD,bodyD,E,body,body,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,body,body,body,body,E,E,E,E,body,body,body,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_,_],
      // Dripping tentacle legs
      [_,_,_,_,_,_,_,body,body,_,_,_,_,body,body,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,body,_,_,_,_,_,_,body,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,body,body,_,_,body,body,_,_,body,body,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,body,_,_,_,body,_,_,_,_,body,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,bodyD,bodyD,_,_,bodyD,bodyD,_,_,_,bodyD,bodyD,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
  }

  // Optimal: round, bouncy, happy
  return [
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,PAL.yellow,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,body,body,body,_,_,_,_,_,PAL.yellow,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,body,body,bodyL,bodyH,body,body,body,bodyH,body,body,body,_,_,_,_,_,_,_],
    [_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_],
    [_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_],
    // Eyes (happy)
    [_,_,_,_,_,body,body,body,E,E,body,body,body,E,E,body,body,body,_,_,_,_,_,_],
    [_,_,_,_,_,body,body,E,B,B,E,body,body,E,B,B,E,body,_,_,_,_,_,_],
    [_,_,_,_,_,body,body,body,E,E,body,body,body,E,E,body,body,body,_,_,_,_,_,_],
    // Mouth (smile)
    [_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_],
    [_,_,_,_,_,body,body,body,body,E,body,body,E,body,body,body,body,body,_,_,_,_,_,_],
    [_,_,_,_,_,body,body,body,body,body,E,E,body,body,body,body,body,body,_,_,_,_,_,_],
    [_,_,_,_,_,_,body,body,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,body,body,body,body,body,body,body,body,body,_,_,_,_,_,_,_,_],
    // Little legs
    [_,_,_,_,_,_,_,_,body,body,_,_,_,body,body,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,body,_,_,_,_,_,body,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,bodyD,bodyD,_,_,_,bodyD,bodyD,bodyD,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  ];
}

// ─── Dispatch ────────────────────────────────────────────────────────

function getSpriteData(variation: RetroVariation, state: CharacterState, frame: number): PixelRow[] {
  switch (variation) {
    case 'mug': return getMugSprite(state, frame);
    case 'wizard': return getWizardSprite(state, frame);
    case 'slime': return getSlimeSprite(state, frame);
  }
}

// ─── React Component ─────────────────────────────────────────────────

export function PixiRetroCanvas({
  caffeineLevel,
  width = 220,
  height = 220,
  variation = 'mug',
  isActive = true,
}: PixiRetroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<{ destroy: (removeView?: boolean, options?: { children?: boolean }) => void } | null>(null);
  const propsRef = useRef({ caffeineLevel, variation, isActive });
  const timeRef = useRef(0);
  const frameRef = useRef(0);
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
          width, height, backgroundAlpha: 0, antialias: false,
          resolution: window.devicePixelRatio || 1, autoDensity: true,
        });
        if (!mounted) { app.destroy(true); return; }

        containerRef.current!.appendChild(app.canvas);
        appRef.current = app;
        const graphics = new PIXI.Graphics();
        app.stage.addChild(graphics);

        const pixelSize = Math.floor(Math.min(width, height) / GRID);
        const offsetX = Math.floor((width - pixelSize * GRID) / 2);
        const offsetY = Math.floor((height - pixelSize * GRID) / 2);

        // Frame counter for animation
        let lastFrame = 0;
        const FRAME_DURATION = 0.3; // seconds per animation frame

        app.ticker.add((ticker) => {
          const { caffeineLevel: lvl, variation: v, isActive: active } = propsRef.current;
          if (!active) return;
          timeRef.current += ticker.deltaTime / 60;

          // Calculate animation frame
          const state = getState(lvl);
          const frameSpeed = state === 'over' ? 0.12 : state === 'under' ? 0.5 : FRAME_DURATION;
          const newFrame = Math.floor(timeRef.current / frameSpeed);
          if (newFrame === lastFrame) return; // only redraw on frame change
          lastFrame = newFrame;

          const spriteData = getSpriteData(v, state, newFrame);
          graphics.clear();

          // Draw each pixel
          for (let row = 0; row < spriteData.length; row++) {
            for (let col = 0; col < spriteData[row].length; col++) {
              const color = spriteData[row][col];
              if (color === null) continue;

              // Shake effect for over-caffeinated
              let sx = 0, sy = 0;
              if (state === 'over') {
                sx = Math.round(Math.sin(timeRef.current * 30 + row * 0.5) * 1.5);
                sy = Math.round(Math.cos(timeRef.current * 25 + col * 0.5) * 0.5);
              }

              graphics.rect(
                offsetX + col * pixelSize + sx,
                offsetY + row * pixelSize + sy,
                pixelSize,
                pixelSize,
              );
              graphics.fill(color);
            }
          }
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

  return <div ref={containerRef} style={{ width, height, imageRendering: 'pixelated' }} />;
}
