# Acceptance Evidence

Acceptance criteria are user-facing claims. Treat every claim as unproven until
there is evidence that could have caught a realistic failure.

Tests are valuable, but they are not the whole burden of proof. For each
meaningful change, name the strongest realistic way the acceptance criteria
could still be false, then choose evidence that would expose that failure.

## Evidence Standard

For non-trivial work, the handoff or PR should include:

1. The acceptance criteria or user-facing claims being made.
2. The top realistic failure modes considered.
3. The strongest failure mode that was actively challenged.
4. Evidence from a command, test, trace, screenshot, browser run, audit record,
   diff, direct inspection, or deployed artifact.
5. Any assumption that remains unverified, recorded as a blocker or follow-up.

Do not use phrases like "done", "tests passed", "works locally", "worker
verified", or "looks good" as proof by themselves. They are summaries of a
claim. The proof is the artifact or observation that could have falsified it.

## Choosing Evidence

Use the narrowest evidence that can realistically disprove the claim.

| Change area | Evidence to prefer |
| --- | --- |
| Standard code changes | `npm run lint`, `npm run typecheck`, focused `npm test`, `npm run build`, and `git diff --check` when formatting or generated output might drift. |
| Game mechanics or balance | Focused Vitest coverage under `game/**`, deterministic state inspection, and a browser playthrough when the claim is about player decisions or feel. |
| Client workflow | Targeted Playwright specs, browser traces, screenshots, videos, console inspection, and route-level smoke checks. |
| Accessibility | Axe-backed Playwright tests, keyboard traversal, role/name assertions, focus order checks, and screen-reader-facing text inspection. |
| Visual or game-feel changes | Before/after screenshots, Playwright screenshots, sprite or state assertions, and a real browser run that exercises the visible state. |
| Performance | `e2e/tests/performance.spec.ts`, production build output, bundle or budget inspection, and runtime measurements where relevant. |
| Deployment | `npm run build`, local static serving, GitHub Actions logs, deployed URL checks, and artifact inspection. |
| Security or dependency changes | `npm audit --audit-level=moderate`, lockfile/config inspection, negative tests, and review of data or permission boundaries. |
| Storage and settings | Unit tests around `utils/storage`, direct localStorage inspection, reset-path checks, and reload persistence checks. |

## Browser Proof

Use browser proof when the acceptance criterion is about real gameplay,
navigation, visual feedback, accessibility, or end-to-end behavior.

Good browser proof records:

- The route and viewport used.
- The exact user action sequence.
- The visible result that maps back to the acceptance criterion.
- Any trace, screenshot, video, console output, or artifact path.
- What failure the run was meant to catch.

For game-feel goals, a passing unit test is usually supporting evidence. The
primary proof should show the player can actually observe or do the thing.

## Handoff Template

Use this shape in final handoffs and PR descriptions:

```markdown
## Acceptance Evidence

- Claim:
- Top failure modes considered:
- Strongest failure mode challenged:
- Evidence:
- Remaining assumptions or follow-ups:
```

If the change is tiny and self-evident, a shorter handoff is fine, but still
name the evidence that made the completion claim trustworthy.
