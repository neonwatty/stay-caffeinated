# Agent Instructions

Follow existing project docs and keep changes small, tested, and scoped.

## Burden Of Proof

Before declaring work complete, try to disprove the change. Identify the top
realistic failure modes for the acceptance criteria, verify the strongest one
with a command, test, trace, screenshot, audit record, diff, or direct
inspection, and include that evidence in the final handoff.

Treat `done`, `tests passed`, worker claims, passing happy-path tests, generated
summaries, and optimistic UI as claims, not proof. Treat unverified assumptions
as blockers or explicit follow-ups.

Use `docs/ACCEPTANCE_EVIDENCE.md` when choosing proof. Prefer evidence that
observes the user-visible behavior, deployed artifact, runtime state, or
negative case behind the acceptance criterion, not only the implementation path
that was easiest to test.
