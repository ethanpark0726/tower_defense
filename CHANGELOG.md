# Changelog

All notable changes to this project are recorded in this file.

## [Unreleased]

### Added

- Added repository-level `AGENTS.md` instructions with layered implementation, mandatory visual validation, regression checks, and completion criteria.

### Planned

- Replace cyber turrets with healthy-food defenders.
- Redesign the HUD and tutorials for younger players.

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
