# Phase Implementation Guide

This guide defines the required workflow for implementing, validating, and publishing every future phase of Tower Defense 3D.

## Core Rule

Never treat a state change as proof that a visual feature works.

For example, a reduced barrier value proves that an enemy reached the objective. It does not prove that the enemy model was visible, correctly animated, or following the visible route. Visual features must be verified visually.

## 1. Define the Phase Before Coding

Create a short phase specification containing:

- Player-facing goal
- Features included in the phase
- Features explicitly excluded from the phase
- Files and systems likely to change
- Expected behavior for the first, middle, and final states
- Acceptance criteria that can be observed in the browser
- Known technical risks

Each acceptance criterion must be testable. Prefer `A carrot tower is visible after placement` over `Add carrot towers`.

## 2. Map the Risk Areas

Review the systems touched by the phase and record likely failure modes.

| Area | Common risk | Required check |
| --- | --- | --- |
| Zustand state | State updates but the scene does not reflect it | Compare store behavior with the rendered result |
| React lifecycle | State or refs reset at the wrong time | Start, finish, and restart a wave |
| Three.js instances | Stale matrices, bounds, or hidden instances | Visually inspect the first active instance |
| Camera and lighting | Model exists but cannot be recognized | Inspect from the default player camera |
| Animation | Frame-rate-dependent speed or frozen motion | Observe movement over several seconds |
| Performance mode | High and low modes render differently | Test the active mode and one fallback mode when relevant |
| HUD | Text updates but controls become blocked | Click every modified control |
| Build output | Development works but production fails | Run the production build |

## 3. Implement in Small Layers

Use this order for gameplay features:

1. Add or update data definitions.
2. Implement the simplest visible model.
3. Verify that one instance is visible in the browser.
4. Add movement and interaction behavior.
5. Verify the complete gameplay loop.
6. Add animation, particles, sound, and polish.
7. Verify again after every rendering optimization.

Do not implement all visual complexity before confirming that the basic object appears on screen.

## 4. Three.js and Instanced-Mesh Rules

When using `InstancedMesh`:

- Set every active instance matrix with `setMatrixAt`.
- Set `instanceMatrix.needsUpdate = true` after matrix changes.
- Keep the instance capacity greater than the maximum expected active count.
- Hide unused instances without allowing their hidden positions to invalidate the visible bounding volume.
- Use `frustumCulled={false}` for small dynamic pools when bounds are not recomputed reliably.
- Otherwise recompute the instanced mesh bounding box and bounding sphere after large matrix changes.
- Verify body parts, health bars, shadows, and effects independently.
- Test the first spawn after an empty scene because initial bounds are a common failure point.
- Test later spawns to confirm that reused instance slots remain visible.

If an entity affects game state but is not visible, inspect rendering bounds, scale, material opacity, camera position, lighting, matrix updates, and spawn coordinates before changing gameplay logic.

## 5. Required Validation Layers

Every phase must pass all applicable layers.

### A. Static checks

- Run `git diff --check`.
- Confirm that only intended files changed.
- Search product files for Korean text unless a phase explicitly allows localization.
- Review constants, capacities, and data mappings.

### B. Build check

```powershell
npm run build
```

Warnings must be recorded. Build errors must be fixed before publishing.

### C. Browser behavior check

- Start a new game.
- Trigger the changed feature through the normal UI.
- Verify the initial state.
- Verify the active or moving state.
- Verify completion, removal, defeat, or restart behavior.
- Inspect browser console errors.
- Confirm that HUD state agrees with scene behavior.

### D. Visual check

For every visual feature:

- Capture or inspect a screenshot while the feature is visible.
- Confirm recognizable shape, color, scale, orientation, and placement.
- Confirm that the feature is visible from the default camera.
- Confirm that it does not overlap critical HUD elements.
- Confirm that the route, target, and active entities can be distinguished.

A visual task cannot be marked complete using DOM text, counters, logs, or store values alone.

### E. Regression check

- Place at least one tower.
- Start and complete at least one wave.
- Confirm enemy targeting and damage.
- Confirm barrier damage when an enemy leaks.
- Confirm pause, restart, or next-wave behavior when touched by the phase.

## 6. Phase-Specific Test Matrix

Create a compact test matrix before implementation.

| Scenario | Expected visual result | Expected state result | Evidence |
| --- | --- | --- | --- |
| First spawn | Entity appears at the entrance | Wave remains active | Screenshot and HUD state |
| Movement | Entity follows the visible route | Distance increases | Visual observation |
| Interaction | Attack or effect is visible | Health decreases | Screenshot and HUD/store state |
| Completion | Entity disappears correctly | Reward, leak, or wave state updates | Final state check |
| Restart | Scene returns to a clean state | Timers and entities reset | Second-run check |

Add rows for every new enemy, tower, effect, screen, or control introduced by the phase.

## 7. Definition of Done

A phase is complete only when:

- All acceptance criteria are implemented.
- The feature is visibly confirmed in the browser.
- Behavior and state changes are confirmed separately.
- No new browser console errors appear.
- The production build succeeds.
- Relevant regression checks pass.
- README and CHANGELOG are updated.
- Product-facing text remains English.
- The branch contains only intended files.
- The pull request describes the change, root cause of any fixes, user impact, and validation evidence.

If any item is unverified, label it clearly instead of reporting the phase as complete.

## 8. Pull Request Checklist

Use this checklist in every phase pull request:

```markdown
## Implementation

- [ ] Phase scope and exclusions are documented
- [ ] Data, visuals, behavior, and polish were implemented in layers
- [ ] Rendering risks were reviewed

## Validation

- [ ] `git diff --check` passed
- [ ] English-only product text check passed
- [ ] `npm run build` passed
- [ ] Initial visual state was inspected
- [ ] Active or moving visual state was inspected
- [ ] Completion or reset state was inspected
- [ ] Browser console contains no new errors
- [ ] Relevant regression checks passed
- [ ] Visual evidence is attached or described

## Documentation

- [ ] README status is current
- [ ] CHANGELOG entry is current
- [ ] Known warnings or unverified cases are recorded
```

## 9. Reporting Rules

Use precise language when reporting results:

- `Wave 1 reduced the barrier from 20 HP to 13 HP` verifies movement and leaking.
- `Three Chocolate Blocks were visible on the route in a browser screenshot` verifies rendering.
- `The production build completed with the existing chunk-size warning` verifies build output and records the warning.

Do not combine these into a broader claim unless each part was independently checked.

## 10. Recommended Workflow for Phase 4 and Later

1. Write acceptance criteria and the test matrix.
2. Create an `agent/phase-<number>-<feature>` branch.
3. Implement one visible prototype.
4. Perform an early browser screenshot check.
5. Complete behavior and polish.
6. Run static, build, browser, visual, and regression checks.
7. Update documentation and version history.
8. Commit only intended files.
9. Push and open or update a Draft Pull Request.
10. Wait for user testing before merging into `main`.
