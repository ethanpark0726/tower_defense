# Repository Instructions for Coding Agents

These instructions apply to the entire repository.

## Product Rules

- Keep all product-facing UI text and repository documentation in English.
- Preserve the child-friendly tooth-defense theme.
- Treat the Vite/React application under `src/` as the primary product.
- Do not add new gameplay features only to `standalone_demo.html`.

## Project-Scoped Skills

- Repository-local engineering skills live under `.agents/skills/` and are tracked by `skills-lock.json`.
- Use `CONTEXT.md` for shared product language before planning or implementing agent-assisted work.
- These repository instructions take precedence over any imported skill when there is a conflict.
- Use `diagnosing-bugs` before editing regressions or browser-visible failures.
- Use `implement` only after the phase goal, scope, exclusions, risks, and acceptance criteria are clear.
- Use `tdd` for pure game logic such as wave data, difficulty math, rewards, path rules, and store transitions; do not use tests as visual proof.
- Use `codebase-design` for changes that would alter architecture, state ownership, rendering pools, or cross-component data flow.
- Use `code-review` before publishing a pull request.

## Ponytail Bias

- Prefer the smallest working change that satisfies the accepted scope.
- Reuse existing helpers, data shapes, components, native browser APIs, CSS, and installed dependencies before adding new code or packages.
- Do not add speculative abstractions, optional configuration, or asset pipelines for future phases.
- This bias must not remove required validation, accessibility basics, error handling, or child-friendly visual and audio polish.

## Phase Workflow

Before implementing a phase:

1. Define the player-facing goal, scope, exclusions, risks, and observable acceptance criteria.
2. Create or use an `agent/phase-<number>-<feature>` branch.
3. Identify unrelated working-tree changes and do not stage or overwrite them.

Implement gameplay features in small layers:

1. Data definitions
2. Simplest visible model or UI
3. Early browser visibility check
4. Behavior and interactions
5. Animation, particles, sound, and polish
6. Final browser and regression validation

## Mandatory Visual Validation

- Never treat a state change as proof that a visual feature works.
- Verify every visual feature directly in the browser from the default player camera.
- Inspect or capture the initial, active, and completion or reset states.
- Confirm recognizable shape, color, scale, orientation, placement, and HUD separation.
- Check browser console errors after triggering the feature through the normal UI.
- Do not report a visual task as complete using only DOM text, counters, logs, store values, or barrier changes.
- Clearly label any visual state that was not verified.

## Three.js and Instanced Meshes

- Call `setMatrixAt` for every active instance.
- Set `instanceMatrix.needsUpdate = true` after changing matrices.
- Keep pool capacity above the maximum active instance count.
- Test the first spawn after an empty scene and later reused slots.
- Ensure hidden instances do not invalidate the bounding volume of visible instances.
- Use `frustumCulled={false}` for small dynamic pools when bounds are not recomputed reliably; otherwise recompute bounds after large matrix changes.
- Verify bodies, decorative parts, health bars, shadows, and effects independently.
- If state changes but an entity is invisible, inspect bounds, matrices, scale, opacity, lighting, camera position, and spawn coordinates before changing gameplay logic.

## Required Checks

Run all applicable checks before publishing a phase:

- `git diff --check`
- English-only scan of product files and documentation
- `npm run build`
- Browser test through the normal player flow
- Browser console error check
- Visual inspection of every changed visual feature
- Regression check for tower placement, targeting, damage, enemy leaking, wave completion, and reset behavior when relevant

Warnings must be reported. Errors must be fixed before publishing.

## Definition of Done

A phase is complete only when:

- Acceptance criteria are implemented and independently verified.
- Visual rendering and game-state behavior are both confirmed.
- No new browser console errors appear.
- The production build succeeds.
- Relevant regressions pass.
- README and CHANGELOG are current.
- Only intended files are committed.
- The Draft Pull Request records the change, user impact, root cause of fixes, validation evidence, warnings, and unverified cases.

Wait for user testing before merging a phase into `main`.

## Reporting

Use precise evidence-based statements. For example:

- `Wave 1 reduced the barrier from 20 HP to 13 HP` verifies movement and leaking.
- `Three Chocolate Blocks were visible on the route` verifies rendering.
- `The production build succeeded with the existing chunk-size warning` verifies build output and records the warning.

Do not combine these into a broader completion claim unless each part was independently checked.
