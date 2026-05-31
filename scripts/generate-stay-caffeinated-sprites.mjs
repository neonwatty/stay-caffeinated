#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'public', 'sprites');

const specs = [
  { name: 'under', frames: 4 },
  { name: 'optimal', frames: 6 },
  { name: 'over', frames: 8 },
];

const rendererSource = String.raw`
const FRAME_SIZE = 64;

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

function rect(ctx, x, y, w, h, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  ctx.restore();
}

function checker(ctx, width, height, tile = 8) {
  for (let y = 0; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      const even = ((x / tile) + (y / tile)) % 2 === 0;
      rect(ctx, x, y, tile, tile, even ? '#eef2f7' : '#d8dee9');
    }
  }
}

function drawDesk(ctx, ox, state, frame) {
  const wood = state === 'under' ? '#65545d' : state === 'over' ? '#7b4039' : '#7a5539';
  const edge = state === 'under' ? '#3d3542' : '#3f2a23';
  rect(ctx, ox + 9, 49, 47, 5, edge);
  rect(ctx, ox + 10, 47, 45, 4, wood);
  rect(ctx, ox + 12, 53, 41, 7, state === 'over' ? '#56302f' : '#5c3e2c');
  rect(ctx, ox + 16, 60, 4, 4, '#2d2630');
  rect(ctx, ox + 45, 60, 4, 4, '#2d2630');

  const screen = state === 'under' ? '#171d2c' : state === 'over' ? '#34171e' : '#14283b';
  rect(ctx, ox + 22, 29, 20, 17, '#23262f');
  rect(ctx, ox + 24, 31, 16, 13, screen);
  rect(ctx, ox + 21, 45, 23, 3, '#3c424d');
  const pulse = frame % 2;
  rect(ctx, ox + 26, 33, 7 + pulse, 1, state === 'over' ? '#ff6b4a' : '#75d2ff', state === 'under' ? 0.35 : 0.85);
  rect(ctx, ox + 26, 36, 11 - pulse, 1, state === 'over' ? '#ffd166' : '#b6f38b', state === 'under' ? 0.3 : 0.8);
  rect(ctx, ox + 26, 39, 5 + ((frame + 1) % 3), 1, state === 'over' ? '#ff4d6d' : '#f6c55b', state === 'under' ? 0.25 : 0.8);

  rect(ctx, ox + 42, 41, 7, 7, state === 'over' ? '#ffe3d5' : '#f6eadc');
  rect(ctx, ox + 49, 43, 4, 3, 'transparent');
  rect(ctx, ox + 43, 40, 5, 1, '#6f3f2a');
  if (state !== 'under') {
    const steamX = ox + 44 + (frame % 2);
    rect(ctx, steamX, 35 - (frame % 3), 1, 3, '#d9edf4', 0.45);
    rect(ctx, steamX + 3, 34 - ((frame + 1) % 3), 1, 3, '#d9edf4', 0.35);
  }
}

function drawChair(ctx, ox, state) {
  const back = state === 'under' ? '#2e3a56' : state === 'over' ? '#523044' : '#28475e';
  rect(ctx, ox + 23, 39, 18, 16, back);
  rect(ctx, ox + 25, 54, 14, 7, '#263442');
  rect(ctx, ox + 31, 60, 3, 4, '#222833');
}

function drawWorkerBase(ctx, ox, state, frame, offsetX = 0, offsetY = 0) {
  const skin = state === 'under' ? '#b8b9c5' : state === 'over' ? '#f0b09b' : '#e6b98f';
  const skinDark = state === 'under' ? '#8f93a0' : state === 'over' ? '#b46862' : '#a46f50';
  const shirt = state === 'under' ? '#425373' : state === 'over' ? '#b43743' : '#2d6f95';
  const shirtDark = state === 'under' ? '#2d384f' : state === 'over' ? '#762b35' : '#1f4f6d';
  const hair = '#34251f';
  const x = ox + offsetX;
  const y = offsetY;

  rect(ctx, x + 24, y + 31, 17, 16, shirtDark);
  rect(ctx, x + 25, y + 30, 15, 17, shirt);
  rect(ctx, x + 31, y + 31, 2, 15, '#e9eef4', 0.75);

  if (state === 'over') {
    rect(ctx, x + 26, y + 34, 13, 1, '#ffd166', 0.75);
    rect(ctx, x + 29, y + 31, 1, 15, '#1d3557', 0.9);
    rect(ctx, x + 35, y + 31, 1, 15, '#1d3557', 0.9);
  }

  const leftHandY = state === 'optimal' ? 47 + (frame % 2) : state === 'over' ? 46 + ((frame + 1) % 2) : 45;
  const rightHandY = state === 'optimal' ? 47 + ((frame + 1) % 2) : state === 'over' ? 46 + (frame % 2) : 46;
  if (state === 'under') {
    rect(ctx, x + 21, y + 33, 5, 12, skin);
    rect(ctx, x + 19, y + 30, 5, 5, skin);
    rect(ctx, x + 39, y + 36, 4, 11, skin);
  } else {
    rect(ctx, x + 18, y + 39, 10, 4, skin);
    rect(ctx, x + 20, y + leftHandY, 7, 3, skin);
    rect(ctx, x + 38, y + 38, 7, 5, skin);
    rect(ctx, x + 37, y + rightHandY, 7, 3, skin);
  }

  rect(ctx, x + 23, y + 14, 19, 17, skin);
  rect(ctx, x + 25, y + 11, 15, 6, hair);
  rect(ctx, x + 22, y + 17, 4, 7, hair);
  rect(ctx, x + 39, y + 17, 4, 6, hair);
  rect(ctx, x + 26, y + 29, 12, 2, skinDark, 0.45);

  if (state === 'under') {
    rect(ctx, x + 27, y + 21, 5, 2, '#2d3444');
    rect(ctx, x + 34, y + 21, 5, 2, '#2d3444');
    rect(ctx, x + 29, y + 26, 7, 1, '#5e4b53');
    rect(ctx, x + 27, y + 19, 5, 1, '#6f7789');
    rect(ctx, x + 34, y + 20, 5, 1, '#6f7789');
  } else if (state === 'over') {
    rect(ctx, x + 26, y + 19, 7, 6, '#fff7ed');
    rect(ctx, x + 34, y + 19, 7, 6, '#fff7ed');
    rect(ctx, x + 29, y + 21, 3, 3, '#172033');
    rect(ctx, x + 36, y + 22, 3, 3, '#172033');
    rect(ctx, x + 25, y + 18, 8, 1, '#172033');
    rect(ctx, x + 34, y + 18, 8, 1, '#172033');
    rect(ctx, x + 30, y + 27, 6, 3, '#41202a');
    rect(ctx, x + 43, y + 20 + (frame % 3), 2, 4, '#87d8ff', 0.8);
  } else {
    rect(ctx, x + 27, y + 20, 5, 4, '#172033');
    rect(ctx, x + 35, y + 20, 5, 4, '#172033');
    rect(ctx, x + 29, y + 21, 2, 2, '#ffffff');
    rect(ctx, x + 37, y + 21, 2, 2, '#ffffff');
    rect(ctx, x + 29, y + 27, 8, 2, '#70453b');
  }
}

function drawUnder(ctx, ox, frame) {
  const droop = [0, 2, 5, 3][frame];
  rect(ctx, ox + 18, 61, 29, 2, '#263141', 0.35);
  drawChair(ctx, ox, 'under');
  drawDesk(ctx, ox, 'under', frame);
  drawWorkerBase(ctx, ox, 'under', frame, -1, droop);
  rect(ctx, ox + 47 + frame, 16 - frame, 4, 1, '#aab6cf', 0.75);
  rect(ctx, ox + 48 + frame, 13 - frame, 5, 1, '#aab6cf', 0.6);
  rect(ctx, ox + 49 + frame, 10 - frame, 4, 1, '#aab6cf', 0.45);
}

function drawOptimal(ctx, ox, frame) {
  rect(ctx, ox + 18, 61, 29, 2, '#1c2d38', 0.35);
  drawChair(ctx, ox, 'optimal');
  drawDesk(ctx, ox, 'optimal', frame);
  drawWorkerBase(ctx, ox, 'optimal', frame, 0, [0, -1, 0, 1, 0, -1][frame]);
  if (frame % 3 === 0) rect(ctx, ox + 15, 20, 2, 2, '#f6d365');
  if (frame % 3 === 1) rect(ctx, ox + 47, 24, 2, 2, '#a7f3d0');
  if (frame % 3 === 2) rect(ctx, ox + 18, 33, 2, 2, '#93c5fd');
}

function drawOver(ctx, ox, frame) {
  const jitterX = [-2, 2, -1, 3, -3, 1, -2, 2][frame];
  const jitterY = [0, -1, 1, -1, 0, 1, -1, 0][frame];
  rect(ctx, ox + 4, 17 + (frame % 4), 9, 1, '#ffbe0b', 0.65);
  rect(ctx, ox + 50, 13 + ((frame + 2) % 5), 10, 1, '#fb7185', 0.65);
  rect(ctx, ox + 16, 61, 33, 2, '#4a1f2a', 0.4);
  drawChair(ctx, ox, 'over');
  drawDesk(ctx, ox, 'over', frame);
  if (frame > 1) rect(ctx, ox + 10, 43, 5, 5, '#ffe3d5');
  if (frame > 3) rect(ctx, ox + 14, 40, 5, 5, '#ffe3d5');
  drawWorkerBase(ctx, ox, 'over', frame, jitterX, jitterY);
  rect(ctx, ox + 16 + (frame % 2), 12, 3, 6, '#facc15');
  rect(ctx, ox + 18 + (frame % 2), 16, 4, 1, '#facc15');
  rect(ctx, ox + 47 - (frame % 2), 28, 3, 6, '#facc15');
  rect(ctx, ox + 45 - (frame % 2), 32, 4, 1, '#facc15');
}

function renderSheet(name, frames) {
  const { canvas, ctx } = createCanvas(frames * FRAME_SIZE, FRAME_SIZE);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let frame = 0; frame < frames; frame += 1) {
    const ox = frame * FRAME_SIZE;
    if (name === 'under') drawUnder(ctx, ox, frame);
    if (name === 'optimal') drawOptimal(ctx, ox, frame);
    if (name === 'over') drawOver(ctx, ox, frame);
  }
  return canvas.toDataURL('image/png');
}

function renderPreview(specs) {
  const scale = 2;
  const gap = 8;
  const labelWidth = 72;
  const width = labelWidth + Math.max(...specs.map((spec) => spec.frames)) * FRAME_SIZE * scale;
  const rowHeight = FRAME_SIZE * scale + gap;
  const height = specs.length * rowHeight + gap;
  const { canvas, ctx } = createCanvas(width, height);
  checker(ctx, width, height, 16);
  ctx.font = '14px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#243142';
  for (let row = 0; row < specs.length; row += 1) {
    const spec = specs[row];
    const y = gap + row * rowHeight;
    ctx.fillStyle = '#243142';
    ctx.fillText(spec.name, 12, y + FRAME_SIZE);
    ctx.save();
    ctx.translate(labelWidth, y);
    ctx.scale(scale, scale);
    for (let frame = 0; frame < spec.frames; frame += 1) {
      const ox = frame * FRAME_SIZE;
      if (spec.name === 'under') drawUnder(ctx, ox, frame);
      if (spec.name === 'optimal') drawOptimal(ctx, ox, frame);
      if (spec.name === 'over') drawOver(ctx, ox, frame);
    }
    ctx.restore();
  }
  return canvas.toDataURL('image/png');
}
`;

async function writeDataUrl(filePath, dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  await writeFile(filePath, Buffer.from(base64, 'base64'));
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1024, height: 512 },
    deviceScaleFactor: 1,
  });
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: rendererSource });

  for (const spec of specs) {
    const dataUrl = await page.evaluate(({ name, frames }) => renderSheet(name, frames), spec);
    await writeDataUrl(path.join(outputDir, `${spec.name}.png`), dataUrl);
  }

  const previewDataUrl = await page.evaluate((spriteSpecs) => renderPreview(spriteSpecs), specs);
  await writeDataUrl(path.join(outputDir, 'preview.png'), previewDataUrl);

  await browser.close();

  for (const spec of specs) {
    console.log(`wrote public/sprites/${spec.name}.png (${spec.frames} frames)`);
  }
  console.log('wrote public/sprites/preview.png');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
