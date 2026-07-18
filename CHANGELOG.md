# Changelog

All notable changes to this project are recorded in this file.

## [Unreleased]

### Added

- Added repository-level `AGENTS.md` instructions with layered implementation, mandatory visual validation, regression checks, and completion criteria.
- Added GitHub Actions validation for pull requests and `main` pushes.
- Added a reusable English-only product and documentation check.

## [1.10.0] - 2026-07-17

### Added

- Added generated child-friendly background music using Web Audio oscillators instead of external audio files.
- Added a soft looping melody, bass pulse, and sparkle layer that changes pace during active snack waves.
- Added a short confirmation tone when music and sounds are turned back on.

### Changed

- Updated the speaker button labels to control both music and game sounds.
- Muted the background music automatically outside active gameplay screens.

## [1.9.0] - 2026-07-15

### Added

- Added rotating mouth-zone map themes for Gum Garden, Calcium Cove, and Plaque Patrol.
- Added wave-aware board colors for the background, fog, tongue, route, route glow, and direction markers.
- Added themed 3D decorations such as veggie sprouts, calcium bubbles, and plaque cleanup sparkles.
- Added the current mouth-zone name to the in-game wave card.

### Changed

- Replaced decorative middle-dot menu separators with ASCII slashes for more robust English-only text rendering.

## [1.8.1] - 2026-07-15

### Fixed

- Removed the remote HDR environment dependency that could leave the 3D game blank after starting a patrol on slow or restricted networks.

## [1.8.0] - 2026-07-15

### Added

- Added a rounded 3D mouth environment with lips, gums, a tongue playfield, and upper and lower tooth rows.
- Added a warm mouth-themed background while preserving the high-contrast snack route and placement grid.

### Changed

- Updated the placement tutorial to refer to tongue tiles instead of mint tiles.
- Replaced far-away hidden enemy instance transforms with zero-scale transforms to prevent post-processing artifacts after wave completion.
- Recreated the post-processing composer when performance mode changes for more reliable rendering transitions.

## [1.7.0] - 2026-07-15

### Added

- Added Easy, Normal, and Challenge patrol choices to the main menu.
- Added difficulty-specific starting coins, Tooth Health, enemy health, speed, rewards, spawn timing, and wave bonuses.
- Added the active difficulty name to the in-game wave card.

### Changed

- Renamed the browser tab to Tooth Guardians and added English page metadata.
- Made Normal patrol tougher than the previous default while keeping Easy welcoming for new players.
- Increased the strategic pressure of Challenge patrol with fewer supplies, tougher snacks, and shorter spawn gaps.

## [1.6.0] - 2026-07-15

### Added

- Added a next-wave preview with Chocolate Block, Wrapped Candy, and Jelly King counts.
- Added contextual preparation tips and a distinct Jelly King warning style.

### Changed

- Centralized wave composition and total-wave rules so the preview and enemy spawning always use the same data.
- Hid the preview during active waves to keep the route and combat view clear.

## [1.5.0] - 2026-07-15

### Added

- Added Brush Blast, a once-per-wave ability that damages every snack currently visible on the route.
- Added clear charged, used, and next-wave recharge states to the Brush Blast control.
- Added brushing bubbles, mint cleaning particles, a sweeping status card, and generated sound feedback.
- Added a non-consuming message when Brush Blast is used before a snack appears.

### Changed

- Moved the active enemy position registry into a shared module so towers, projectiles, and player abilities use the same visible targets.
- Reset Brush Blast state on new games, retries, and every wave start.

## [1.4.0] - 2026-07-15

### Added

- Added a four-step guided tutorial covering defender selection, placement, wave start, and automatic attacks.
- Added generated Web Audio cues for placement, upgrades, sales, waves, tooth damage, victory, and game over.
- Added an accessible sound toggle that keeps the player in control of audio feedback.
- Added one-time wave-clear bonuses, a readable reward banner, and colorful confetti celebrations.

### Changed

- Replaced the remaining cyber-defense menu and HUD language with the Tooth Guardians theme.
- Renamed the main counters to Smile Coins, Tooth Health, and Snack Patrol.
- Updated the menu and game-over messages with friendly, encouraging language for younger players.
- Converted defender shop choices to semantic buttons with selected and disabled states.
- Moved the low-performance notice away from the primary wave controls.

## [1.3.0] - 2026-07-14

### Added

- Added Carrot Shooter, Broccoli Bomber, and Milk Beam character models built from lightweight Three.js primitives.
- Added distinct carrot, broccoli, and milk shop icons, attack colors, and food-impact particle palettes.
- Added visible level decorations to communicate tower upgrades on the board.

### Changed

- Replaced the cyber-turret names and descriptions with healthy-food defender roles while preserving their established balance and attack behavior.
- Updated placement tutorial text to introduce healthy defenders.
- Disabled frustum culling for dynamically pooled projectiles and particles so active effects remain visible after hidden instances are reused.

## [1.2.0] - 2026-07-14

### Added

- Added instanced chocolate-block enemies with segmented faces and a walking wobble.
- Added wrapped-candy enemies with colorful wrappers, stripes, faces, and a bouncing movement style.
- Added translucent Jelly King bosses with crowns, faces, and a squash animation.
- Added chocolate crumb, candy sparkle, and jelly burst palettes when food enemies are defeated.

### Changed

- Renamed the enemy archetypes to Chocolate Block, Wrapped Candy, and Jelly King.
- Replaced the metallic enemy health colors with a softer slate and mint palette.
- Kept composite enemy characters on pooled instanced meshes to preserve wave performance.

## [1.1.0] - 2026-07-14

### Added

- Added a continuous high-contrast route generated from the gameplay waypoints.
- Added directional markers that make enemy movement easy to understand.
- Added a candy-bag entrance and a friendly tooth objective.
- Added `README.md` with setup, controls, project structure, and Git workflow.
- Added this changelog for phase-by-phase history.

### Changed

- Replaced the dark metallic board with a bright mint playfield.
- Updated lighting, environment reflections, and post-processing for a softer child-friendly scene.
- Increased the route contrast in both high- and low-performance modes.

### Fixed

- Hid unused enemy and health-bar instances before a wave begins.

## [1.0.0] - 2026-07-14

### Added

- Imported the original React and Three.js tower defense project.
- Added data-driven enemy definitions and tower attack-style metadata.

### Changed

- Converted all Korean UI text to English in the React app and standalone demo.
- Standardized enemy, projectile, and particle updates on frame delta.

### Fixed

- Added missing maximum health values used by enemy health bars.
- Fixed wave spawn timing and enemy movement resets after taking damage.
- Enabled the normal pass required by SSAO in high-performance mode.
