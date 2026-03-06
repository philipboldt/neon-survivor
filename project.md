# Neon Survivor

A functional game prototype where the player survives against waves of enemies in a neon-themed environment.

## Current Status
- [x] Initial Project Setup
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

## Tech Stack
- HTML5 Canvas
- Modern JavaScript (ES6+, Modules)
- Vanilla CSS

## Features
- **Player:** Blue glowing neon circle fixed at the center.
- **Enemies:** Red glowing neon squares that chase the player in the world space.
- **Movement:** The player controls the "camera" by moving through the world.
- **Mechanics:** Enemies accelerate as they approach the player.
