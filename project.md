# Neon Survivor

A functional game prototype where the player survives against waves of enemies in a neon-themed environment.

## Current Status
- [x] Initial Project Setup
- [x] Code Refactoring & Modularization
  - [x] Extracted classes (`Player`, `Enemy`, `Projectile`)
  - [x] Centralized constants (`constants.js`)
  - [x] Game Engine for state and loop management
- [x] Fullscreen Canvas & Rendering
  - [x] Fixed 1000x1000 game unit viewport scaling (Strict Letterboxing)
  - [x] Square view area centered on screen with black bars
- [x] Player Movement & World Shift
  - [x] Player fixed in center of the screen
  - [x] WASD / Arrow Key input for movement
  - [x] World (enemies, grid) moves relative to the player
- [x] Enemy Spawning & AI
  - [x] Spawn only in non-visible parts of the map (outside screen)
  - [x] Move towards player's world position
  - [x] Collision resolution (Enemy vs Enemy, Enemy vs Player)
- [x] Visuals
  - [x] Neon Aesthetics (Glow effects)
  - [x] Infinite Starfield (Background dots) for movement reference
  - [x] Spacey font ('Orbitron')
- [x] Weapon System
  - [x] Player Range (visualized with dashed circle)
  - [x] Automatic targeting of nearest enemy
  - [x] Projectiles (Blue glowing circles)
  - [x] Enemy Health and Damage mechanics
- [x] World Boundaries
  - [x] Strict 4000x4000 world limits
  - [x] Player and Enemy movement clamped to world size
  - [x] Visual border rendering
- [x] Player Health & Damage
  - [x] 15 HP for player
  - [x] Neon green health bar (top center)
  - [x] Melee damage from enemies (1 damage per second)
- [x] Experience & Leveling
  - [x] Enemies drop neon blue experience dots on death
  - [x] 5% chance for enemies to drop a neon green heal dot (heals player fully)
  - [x] Player has a collection range (visualized with dark blue circle)
  - [x] Experience/Heal dots fly to player when in range
  - [x] Neon blue experience bar (bottom center)
  - [x] Level up mechanic with increasing requirements
  - [x] Choice-based upgrade system (+1 Attack, +1 Damage)
- [x] Game Flow & UI
  - [x] Start Screen with Highscores
  - [x] Pause functionality (SPACE key)
  - [x] Game Over screen with stats and restart
  - [x] Highscore logic (Local Storage) with 3-letter name entry
  - [x] Arcade-style character selection UI for highscores
- [x] Performance Optimizations
  - [x] Sprite Pre-rendering (offscreen canvases for neon glow)
  - [x] Squared Distance calculations (avoiding `Math.sqrt`)
  - [x] Spatial Partitioning (Grid system for O(n) collisions)
  - [x] Frustum Culling (skip drawing off-screen entities)

## Tech Stack
- HTML5 Canvas
- Modern JavaScript (ES6+, Modules)
- Vanilla CSS

## Features
- **Player:** Blue glowing neon circle fixed at the center. Equipped with a range-based auto-attack.
- **Enemies:** Red glowing neon squares with 1 HP. They are destroyed upon being hit.
- **Weapon:** Shoots blue projectiles at enemies in range. Shots are destroyed after traveling a distance equal to the player's range.
- **Movement:** The player controls the "camera" by moving through the world.
- **Mechanics:** Enemies accelerate as they approach the player. Projectiles deal 1 damage.
