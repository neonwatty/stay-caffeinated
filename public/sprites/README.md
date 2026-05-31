# Stay Caffeinated Sprites

Generated office-worker sprite strips for the CSS sprite-strip `SpriteCharacter`.

## Files

- `under.png`: 4-frame sleepy loop, 64x64 frames.
- `optimal.png`: 6-frame productive typing loop, 64x64 frames.
- `over.png`: 8-frame jittery over-caffeinated loop, 64x64 frames.
- `preview.png`: contact sheet for visual review only.

Regenerate the strips with:

```bash
npm run sprites:generate
```

The generator keeps every strip transparent, bottom-aligned, and sized for the
defaults in `components/game/sprites/config.ts`.
