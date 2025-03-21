# DOOM of Teyvat

A parody game combining elements from Genshin Impact, Minecraft, and DOOM. Experience first-person combat with elemental powers in a blocky, destructible world.

## Features
- First-person exploration in a voxel world
- Minecraft-style block building and destruction
- Genshin Impact-inspired elemental combat system with multiple elements
- DOOM-style weapons and fast-paced gameplay
- Elemental projectiles with visual effects
- Enemy AI that hunts the player
- Health and energy system
- Dynamic sound effects and background music
- Element switching (Pyro, Hydro, Electro)

## How to Run
1. Clone the repository
   ```bash
   git clone https://github.com/bproai/doom-of-teyvat.git
   cd doom-of-teyvat
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```
4. Open your browser to http://localhost:8080

## Controls
- **WASD**: Move (forward, left, backward, right)
- **Mouse**: Look around
- **Space**: Jump
- **Left Click**: Shoot elemental projectiles
- **1-3 Keys**: Switch between elements (1: Pyro, 2: Hydro, 3: Electro)
- **Right Click**: Place blocks (not yet implemented)

## Combat System
- Shoot elemental projectiles at enemies
- Enemies will chase you and cause damage when close
- Each element has different properties:
  - **Pyro (Fire)**: High damage, medium range
  - **Hydro (Water)**: Medium damage, long range
  - **Electro (Lightning)**: Medium-high damage, very long range
- Defeating enemies grants elemental energy

## Tips for Playing
- Keep moving to avoid enemies getting too close
- Use your jump ability to reach higher ground
- Switch elements based on the situation
- Aim for headshots for maximum damage
- Watch your health - when it reaches zero, it's game over!

## Technology
- **Three.js**: 3D rendering engine
- **Webpack**: Build system and development server
- **JavaScript ES6+**: Modern JavaScript features

## Development Roadmap
- [ ] Enhanced terrain generation with biomes
- [ ] More enemy types with different behaviors
- [ ] More block types and materials
- [ ] Elemental reactions between different elements
- [ ] In-game crafting system
- [ ] Procedural dungeons (domains)
- [ ] Save/load game progress

## Credits
This is a fan project created for educational purposes. It draws inspiration from:
- Genshin Impact (miHoYo/HoYoverse)
- Minecraft (Mojang Studios)
- DOOM (id Software)

## License
This project is licensed under the MIT License - see the LICENSE file for details.