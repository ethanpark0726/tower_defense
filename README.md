# Tower Defense 3D

[![CI](https://github.com/ethanpark0726/tower_defense/actions/workflows/ci.yml/badge.svg)](https://github.com/ethanpark0726/tower_defense/actions/workflows/ci.yml)
![Version](https://img.shields.io/badge/version-1.14.0-7bdff2)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-React%20Three%20Fiber-111111?logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/status-phase%2016%20in%20review-f59e0b)
![License](https://img.shields.io/badge/license-all%20rights%20reserved-6b7280)

A browser-based 3D tower defense game built with React, Three.js, React Three Fiber, and Zustand. The project is being developed in small, reviewable phases toward a child-friendly tooth-defense theme.

## Feature Highlights

- Tooth-defense theme with chocolate, candy, and jelly snacks attacking a friendly tooth.
- Friendly lion-mouth board with a warm mane, muzzle, fangs, and rounded teeth.
- Healthy-food defenders including a slowing Tomato Ketchup sprayer.
- Rotating mouth-zone maps for Gum Garden, Calcium Cove, and Plaque Patrol.
- One route for Waves 1-10 and a second route for Waves 11-20.
- Easy, Normal, and Challenge patrol difficulty choices.
- Extended 20-wave patrols with tougher Challenge scaling.
- Generated Web Audio effects and background music with no external audio files.
- Brush Blast, a once-per-wave ability that scrubs visible snacks on the route.

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
- Phase 10: 3D mouth, gum, tongue, lip, and tooth playfield - complete
- Phase 11: rotating mouth-zone map themes and route variety - complete
- Phase 12: generated child-friendly background music - complete
- Phase 13: extended waves and tougher Challenge patrol - complete
- Phase 14: two-route stage variety for early and late waves - complete
- Phase 15: Tomato Splash defender - complete
- Phase 16: friendly lion-mouth board and Tomato Ketchup slow - in review

See [CHANGELOG.md](CHANGELOG.md) for the implementation history.

Repository-wide implementation and validation rules for coding agents are defined in [AGENTS.md](AGENTS.md).

Project-scoped agent skills are tracked in [skills-lock.json](skills-lock.json), installed under `.agents/skills/`, and grounded by [CONTEXT.md](CONTEXT.md).

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
npm run check:rules
npm run build
```

GitHub Actions runs the English-only policy check, commit whitespace validation, and production build for every pull request targeting `main` and every push to `main`.

## Game Controls

- Select a tower from the bottom shop.
- Choose Easy, Normal, or Challenge patrol difficulty from the main menu.
- Click an empty grid tile to place it.
- Build defenders on the tongue grid while keeping the snack route clear.
- Click a placed tower to inspect, upgrade, or sell it.
- Start the next wave from the top-right button.
- Watch the current mouth zone change between Gum Garden, Calcium Cove, and Plaque Patrol.
- Review the snack counts and strategy tip in the next-wave preview before starting.
- Use the speaker button to turn music and game sounds on or off.
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
- Agent-assisted work uses the repository-local skills, `CONTEXT.md`, and the Ponytail bias in `AGENTS.md` without replacing required visual validation.

## Technology

- React 18
- Three.js and React Three Fiber
- React Three Drei
- React Three Postprocessing
- Zustand
- Vite

## License

No license has been selected yet. All rights are reserved by the repository owner.
