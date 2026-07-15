# Changelog

All notable changes to this project are recorded in this file.

## [Unreleased]

### Planned

- Replace space enemies with chocolate, candy, and jelly characters.
- Replace cyber turrets with healthy-food defenders.
- Redesign the HUD and tutorials for younger players.

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
