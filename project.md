# Neon Survivor

A functional game prototype where the player survives against waves of enemies in a neon-themed environment.

## Current Status
- [x] Initial Project Setup
- [x] Code Refactoring & Modularization
  - [x] Extracted classes (`Player`, `Enemy`, `Projectile`)
  - [x] Centralized constants (`constants.js`)
  - [x] Game Engine for state and loop management
- [x] Fullscreen Canvas & Rendering
- [x] Player Movement & World Shift
  - [x] Player fixed in center of the screen
  - [x] WASD / Arrow Key input for movement
  - [x] World (enemies, grid) moves relative to the player
- [x] Enemy Spawning & AI
  - [x] Spawn outside current view
  - [x] Move towards player's world position
  - [x] Collision resolution (Enemy vs Enemy, Enemy vs Player)
- [x] Visuals
  - [x] Neon Aesthetics (Glow effects)
  - [x] Infinite Starfield (Background dots) for movement reference

- [x] Weapon System
  - [x] Player Range (visualized with dashed circle)
  - [x] Automatic targeting of nearest enemy
  - [x] Projectiles (Blue glowing circles)
  - [x] Enemy Health and Damage mechanics

## Tech Stack
- HTML5 Canvas
- Modern JavaScript (ES6+, Modules)
- Vanilla CSS

## Features
- **Player:** Blue glowing neon circle fixed at the center. Equipped with a range-based auto-attack.
- **Enemies:** Red glowing neon squares with 1 HP. They are destroyed upon being hit.
- **Weapon:** Shoots a blue projectile every second at the nearest enemy in range.
- **Movement:** The player controls the "camera" by moving through the world.
- **Mechanics:** Enemies accelerate as they approach the player. Projectiles deal 1 damage.
