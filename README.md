# Tower Defense 3D

A browser-based 3D tower defense game built with React, Three.js, React Three Fiber, and Zustand. The project is being developed in small, reviewable phases toward a child-friendly tooth-defense theme.

## Current Status

- Phase 1: English UI and game-loop stabilization — complete
- Phase 2: visible route and tooth-defense map foundation — complete
- Phase 3: candy, chocolate, and jelly enemies — planned
- Phase 4: healthy-food defense towers — planned
- Phase 5: child-friendly HUD, tutorial, sound, and rewards — planned

See [CHANGELOG.md](CHANGELOG.md) for the implementation history.

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

## Game Controls

- Select a tower from the bottom shop.
- Click an empty grid tile to place it.
- Click a placed tower to inspect, upgrade, or sell it.
- Start the next wave from the top-right button.
- Drag to rotate the camera and scroll to zoom.

## Project Structure

```text
src/
  components/
    EnemyManager.jsx       Enemy movement and rendering
    GameBoard.jsx          Board, path, placement, and objectives
    GameCanvas.jsx         Three.js canvas, lighting, and effects
    GameHUD.jsx            Menus, statistics, and tower controls
    ParticleSystem.jsx     Impact particle pool
    ProjectileSystem.jsx   Projectile pool and damage delivery
    TowerManager.jsx       Tower targeting and 3D models
  App.jsx                  Screen and overlay state
  gameStore.js             Game rules, entities, and Zustand state
  index.css                Global UI styles
```

`standalone_demo.html` is a legacy self-contained demo. The Vite/React application under `src/` is the primary implementation and receives new gameplay features first.

## Git Workflow

- `main` contains validated, deployable phases.
- Feature branches use `agent/<phase-or-feature>` names.
- Each phase is delivered through a focused pull request.
- Build and browser smoke tests are completed before merging.
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
