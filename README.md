# Tower Defense 3D

[![CI](https://github.com/ethanpark0726/tower_defense/actions/workflows/ci.yml/badge.svg)](https://github.com/ethanpark0726/tower_defense/actions/workflows/ci.yml)

A browser-based 3D tower defense game built with React, Three.js, React Three Fiber, and Zustand. The project is being developed in small, reviewable phases toward a child-friendly tooth-defense theme.

## Current Status

- Phase 1: English UI and game-loop stabilization - complete
- Phase 2: visible route and tooth-defense map foundation - complete
- Phase 3: chocolate, candy, and jelly enemies - complete
- Phase 4: healthy-food defense towers - complete
- Phase 5: child-friendly HUD, tutorial, sound, and rewards - complete
- Phase 6: once-per-wave Brush Blast ability - complete
- Phase 7: data-driven next-wave snack preview - complete
- Phase 8: Tooth Guardians browser branding and metadata - complete
- Phase 9: selectable difficulty and rebalanced snack waves - complete

See [CHANGELOG.md](CHANGELOG.md) for the implementation history.

Repository-wide implementation and validation rules for coding agents are defined in [AGENTS.md](AGENTS.md).

## Requirements

- Node.js LTS
- npm
- A modern browser with WebGL support

## Local Development

```powershell
cd C:\Users\ethan\Downloads\tower_defense
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Production Build

```powershell
npm run build
npm run preview
```

The production files are generated in `dist/`, which is intentionally excluded from Git.

## Automated Checks

```powershell
npm run check:english
npm run build
```

GitHub Actions runs the English-only policy check, commit whitespace validation, and production build for every pull request targeting `main` and every push to `main`.

## Game Controls

- Select a tower from the bottom shop.
- Choose Easy, Normal, or Challenge patrol difficulty from the main menu.
- Click an empty grid tile to place it.
- Click a placed tower to inspect, upgrade, or sell it.
- Start the next wave from the top-right button.
- Review the snack counts and strategy tip in the next-wave preview before starting.
- Use the speaker button to turn game sounds on or off.
- Use Brush Blast once per wave to scrub every snack currently visible on the route.
- Drag to rotate the camera and scroll to zoom.

## Project Structure

```text
src/
  activeEnemyRegistry.js   Shared positions for snacks visible on the route
  components/
    EnemyManager.jsx       Enemy movement and rendering
    GameBoard.jsx          Board, path, placement, and objectives
    GameCanvas.jsx         Three.js canvas, lighting, and effects
    GameHUD.jsx            Menus, statistics, and tower controls
    ParticleSystem.jsx     Food-impact particle pool
    ProjectileSystem.jsx   Themed projectile pool and damage delivery
    SoundFeedback.jsx      Generated sound cues for player actions
    TowerManager.jsx       Healthy-food tower targeting and 3D models
  App.jsx                  Screen and overlay state
  gameStore.js             Game rules, entities, and Zustand state
  index.css                Global UI styles
scripts/
  check-english.mjs        English-only product and documentation check
.github/workflows/
  ci.yml                   Pull request and main-branch validation
```

`standalone_demo.html` is a legacy self-contained demo. The Vite/React application under `src/` is the primary implementation and receives new gameplay features first.

## Git Workflow

- `main` contains validated, deployable phases.
- Feature branches use `agent/<phase-or-feature>` names.
- Each phase is delivered through a focused pull request.
- Build and browser smoke tests are completed before merging.
- Visual features require direct screenshot or browser inspection; state changes alone are not sufficient evidence.
- User-facing changes are recorded in `CHANGELOG.md`.

## Technology

- React 18
- Three.js and React Three Fiber
- React Three Drei
- React Three Postprocessing
- Zustand
- Vite

## License

No license has been selected yet. All rights are reserved by the repository owner.
