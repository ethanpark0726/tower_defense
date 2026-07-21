# Tower Defense Agent Context

This file defines shared project language for coding agents and repository-local skills.

## Product Intent

Tower Defense 3D is a browser-based, child-friendly tooth-defense game. Players protect Tooth Health by placing healthy-food defenders on a mouth-themed board while snack enemies travel along a visible route.

## Domain Terms

- Tooth Health: the player's remaining base health.
- Smile Coins: the resource used to place and upgrade defenders.
- Snack Enemy: an enemy represented by a sweet food, such as Chocolate Block, Wrapped Candy, or Jelly King.
- Healthy-Food Defender: a tower represented by tooth-friendly food, such as Carrot Shooter, Broccoli Bomber, or Milk Beam.
- Mouth Zone: the active board theme, such as Gum Garden, Calcium Cove, or Plaque Patrol.
- Route: the path snacks follow across the tongue grid toward the tooth objective.
- Brush Blast: the once-per-wave ability that damages every visible snack on the route.
- Patrol Difficulty: the selected Easy, Normal, or Challenge ruleset.
- Visual Validation: direct browser inspection from the default player camera, including visible models, route clarity, HUD separation, console errors, and normal gameplay flow.
- Instanced Mesh Pool: the reusable Three.js rendering pool used for snacks, projectiles, particles, and other repeated dynamic objects.

## Product Language

- Use Tooth Guardians, tooth-defense, snacks, defenders, route, wave, patrol, and mouth-zone language.
- Avoid cyber-defense, turret-defense, monster, and generic combat language in player-facing text.
- Keep product-facing UI text and repository documentation in English.

## Engineering Bias

- Preserve the existing Vite, React, Three.js, React Three Fiber, and Zustand architecture.
- Prefer small data-driven changes over new abstractions.
- Prefer native browser APIs, existing dependencies, CSS, and simple Three.js primitives before adding new packages or asset pipelines.
- Use tests for pure game logic when useful, but never treat tests as proof that a visual feature works.
