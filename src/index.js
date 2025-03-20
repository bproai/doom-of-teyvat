// DOOM of Teyvat: Main Entry Point

console.log("Starting DOOM of Teyvat...");

// Import core engine components
import { Engine } from './engine/Engine.js';
import { GameWorld } from './game/GameWorld.js';
import { Player } from './game/Player.js';
import { ElementalSystem } from './game/ElementalSystem.js';

// Initialize the game
function initGame() {
  console.log("Initializing game...");
  
  // Create engine instance
  const engine = new Engine();
  
  // Create world
  const gameWorld = new GameWorld();
  
  // Initialize player
  const player = new Player();
  
  // Initialize elemental system
  const elementalSystem = new ElementalSystem();
  
  // Start game loop
  engine.start();
  
  console.log("Game initialized!");
}

// Call init function when window loads
window.onload = initGame;
