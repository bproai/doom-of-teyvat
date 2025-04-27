// Updated Engine class with THREE import

import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { InputController } from './InputController.js';
import { SoundManager } from './SoundManager.js';
import { UIManager } from './UIManager.js';
import { Player } from './game/Player.js';


export class Engine {
  constructor() {
    // Make this instance globally accessible for diagnostics
    window.engine = this;
    
    this.entities = [];
    this.lastTimestamp = 0;
    this.isRunning = false;
    this.deltaTime = 0;
    
    // Core engine systems
    this.renderer = new Renderer();
    this.input = new InputController();
    this.soundManager = new SoundManager();
    this.uiManager = new UIManager();

    this.player = new Player(); 
    
    // Player movement settings
    this.playerSettings = {
      moveSpeed: 5,
      jumpForce: 10,
      gravity: 20,
      playerHeight: 1.8,
      eyeHeight: 1.6,
      playerWidth: 0.6
    };
    
    // Player state
    this.playerState = {
      position: { x: 0, y: 2, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      onGround: false,
      jumping: false,
      sprinting: false
    };
    
    // Game state
    this.gameState = {
      paused: false,
      inventoryOpen: false,
      mapOpen: false,
      selectedVision: 1, // Default to Pyro
      selectedBlock: 1
    };
    
    // Bind the gameLoop method to this instance
    this.gameLoop = this.gameLoop.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.updatePlayer = this.updatePlayer.bind(this);
    
    // Listen for diagnostic commands
    document.addEventListener('placeTestBlock', () => {
      this.testPlaceBlockDirectly();
    });
    
    // Set up direct mouse handling
    document.addEventListener('mousedown', (event) => {
      if (event.button === 2) { // Right mouse button
        console.log("Right click detected directly");
        if (document.pointerLockElement) { // Only if pointer is locked (game is active)
          this.handleRightClick();
        }
      }
    });
    
    // Listen for B key to test block placement
    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyB') {
        console.log("B key pressed directly");
        this.testPlaceBlockDirectly();
      }
    });
  }
  
  initialize() {
    console.log("Initializing engine...");
    
    // Initialize renderer
    this.renderer.initialize();
    
    // Initialize sound manager
    this.soundManager.initialize();
    
    // Initialize UI
    this.uiManager.initialize();
    
    // Play background music
    this.soundManager.playMusic('main');
    
    // Add event listener for pointer lock exit (pause game)
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === null) {
        this.pauseGame();
      }
    });
    
    // Add event listener for context menu (prevent it)
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
    
    console.log("Engine initialized successfully!");
  }
  
  start() {
    console.log("Engine starting...");
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.gameLoop);
    
    // Start in a paused state (need to click to start)
    this.gameState.paused = true;
    this.uiManager.showStartScreen();
  }
  
  stop() {
    console.log("Engine stopping...");
    this.isRunning = false;
  }
  
  pauseGame() {
    if (!this.gameState.paused) {
      this.gameState.paused = true;
      this.uiManager.showPauseMenu();
    }
  }
  
  resumeGame() {
    if (this.gameState.paused) {
      this.gameState.paused = false;
      this.uiManager.hidePauseMenu();
      this.renderer.controls.lock();
    }
  }
  
  gameLoop(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    this.deltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
    this.lastTimestamp = timestamp;
    
    // Limit delta time to prevent large jumps
    if (this.deltaTime > 0.1) this.deltaTime = 0.1;
    
    // Only update game logic if not paused
    if (!this.gameState.paused) {
      // Handle user input
      this.handleInput();
      
      // Update player
      this.updatePlayer(this.deltaTime);
      
      // Update all entities
      this.update(this.deltaTime);
      
      // Update UI
      this.uiManager.update(this.deltaTime, {
        health: 100, // Replace with actual player health
        stamina: 100, // Replace with actual player stamina
        currentVision: this.gameState.selectedVision,
        position: this.playerState.position
      });
    }
    
    // Always render
    this.renderer.render();
    
    // Continue the loop
    requestAnimationFrame(this.gameLoop);
  }
  
  handleInput() {
    // Check for pause toggle
    if (this.input.actions.pause) {
      this.input.actions.pause = false; // Reset to avoid multiple toggles
      this.pauseGame();
      return;
    }
    
    // Handle vision selection (1-7 keys)
    const selectedVision = this.input.getSelectedVision();
    if (selectedVision !== null) {
      this.gameState.selectedVision = selectedVision;
      this.soundManager.playSound('visionSwitch');
      console.log(`Switched to vision: ${selectedVision}`);
    }
    
    // Handle movement input (applied in updatePlayer)
    
    // Handle mouse actions
    if (this.input.mouse.leftButton) {
      this.handleLeftClick();
    }
    
    if (this.input.mouse.rightButton) {
      console.log("Right click detected in handleInput");
      this.handleRightClick();
      this.input.mouse.rightButton = false;
    }
    
    // Test block placement with B key
    if (this.input.keys.b) {
      console.log("B key detected in handleInput");
      this.input.keys.b = false; // Reset to avoid multiple placements
      this.testPlaceBlockDirectly();
    }
    
    // Handle action keys
    if (this.input.actions.elementalSkill) {
      this.input.actions.elementalSkill = false; // Reset to avoid multiple activations
      this.useElementalSkill();
    }
    
    if (this.input.actions.elementalBurst) {
      this.input.actions.elementalBurst = false; // Reset to avoid multiple activations
      this.useElementalBurst();
    }
    
    if (this.input.actions.interact) {
      this.input.actions.interact = false; // Reset to avoid multiple activations
      this.interactWithWorld();
    }
    
    if (this.input.actions.inventory) {
      this.input.actions.inventory = false; // Reset to avoid multiple activations
      this.toggleInventory();
    }
    
    if (this.input.actions.map) {
      this.input.actions.map = false; // Reset to avoid multiple activations
      this.toggleMap();
    }
    
    // Reset mouse and scroll deltas
    this.input.resetMouseDelta();
    this.input.resetScrollDelta();
  }
  
  updatePlayer(deltaTime) {
    // Get movement input
    const movement = this.input.getMovementVector();
    
    // Apply movement based on camera direction
    const playerDirection = this.renderer.getPlayerDirection();
    const speed = this.input.keys.sprint ? this.playerSettings.moveSpeed * 1.5 : this.playerSettings.moveSpeed;
    
    // Remove vertical component for movement direction
    playerDirection.y = 0;
    playerDirection.normalize();
    
    // Create movement vector
    const right = new THREE.Vector3();
    right.crossVectors(new THREE.Vector3(0, 1, 0), playerDirection).normalize();
    
    // Calculate velocity
    this.playerState.velocity.x = (movement.x * right.x + movement.z * playerDirection.x) * speed;
    this.playerState.velocity.z = (movement.x * right.z + movement.z * playerDirection.z) * speed;
    
    // Handle jumping
    if (this.input.keys.jump && this.playerState.onGround) {
      this.playerState.velocity.y = this.playerSettings.jumpForce;
      this.playerState.onGround = false;
      this.playerState.jumping = true;
      this.soundManager.playSound('jump');
    }
    
    // Apply gravity
    if (!this.playerState.onGround) {
      this.playerState.velocity.y -= this.playerSettings.gravity * deltaTime;
    }
    
    // Move player
    this.playerState.position.x += this.playerState.velocity.x * deltaTime;
    this.playerState.position.y += this.playerState.velocity.y * deltaTime;
    this.playerState.position.z += this.playerState.velocity.z * deltaTime;
    
    // Simple ground check (replace with proper collision detection)
    if (this.playerState.position.y < this.playerSettings.eyeHeight) {
      this.playerState.position.y = this.playerSettings.eyeHeight;
      this.playerState.velocity.y = 0;
      this.playerState.onGround = true;
      this.playerState.jumping = false;
    }
    
    // Update camera position
    this.renderer.movePlayer(
      this.playerState.position.x,
      this.playerState.position.y,
      this.playerState.position.z
    );
  }
  
  update(deltaTime) {
    // Update all entities
    for (const entity of this.entities) {
      if (entity.update) {
        entity.update(deltaTime);
      }
    }
  }
  
  handleLeftClick() {
    // Mine/attack action
    const hitResult = this.renderer.castRay();
    
    if (hitResult && hitResult.distance < 5) {
      // If we hit a block, mine it
      if (hitResult.object.userData.type) {
        console.log(`Mining block of type: ${hitResult.object.userData.type}`);
        this.soundManager.playSound('blockBreak');
        this.renderer.removeVoxelBlock(hitResult.object);
      }
    } else {
      // Fire weapon if nothing was hit or too far
      this.fireWeapon();
    }
  }
  
  handleRightClick() {
    console.log("handleRightClick called");
    console.log("Pointer locked:", document.pointerLockElement !== null);

    // Use the renderer's raycast to get the hit information
    const raycastResult = this.renderer.castRay();
    console.log("Raycast result:", raycastResult);  
    
    if (!raycastResult) {
      console.log("No raycast result");
      return;
    }
    
    console.log("Raycast hit at distance:", raycastResult.distance);
    
    if (raycastResult.distance < 5) {
      // Get the normal vector from the raycast
      const normal = raycastResult.normal || new THREE.Vector3(0, 1, 0);
      
      // Compute the position to place the block by adding the normal
      const blockX = Math.floor(raycastResult.position.x + normal.x * 0.5);
      const blockY = Math.floor(raycastResult.position.y + normal.y * 0.5);
      const blockZ = Math.floor(raycastResult.position.z + normal.z * 0.5);
      
      console.log(`Placing block at: ${blockX}, ${blockY}, ${blockZ}`);
      
      // Explicitly check for collision with player
      const playerPos = this.playerState.position;
      const playerMinX = Math.floor(playerPos.x - this.playerSettings.playerWidth/2);
      const playerMaxX = Math.floor(playerPos.x + this.playerSettings.playerWidth/2);
      const playerMinY = Math.floor(playerPos.y - this.playerSettings.eyeHeight);
      const playerMaxY = Math.floor(playerPos.y);
      const playerMinZ = Math.floor(playerPos.z - this.playerSettings.playerWidth/2);
      const playerMaxZ = Math.floor(playerPos.z + this.playerSettings.playerWidth/2);
      
      // Don't place block if it would overlap with the player
      if (blockX >= playerMinX && blockX <= playerMaxX &&
          blockY >= playerMinY && blockY <= playerMaxY &&
          blockZ >= playerMinZ && blockZ <= playerMaxZ) {
        console.log("Can't place block - would overlap with player");
        return;
      }
      
      // Get block type and try to place
      const blockType = this.player.selectedBlockType || 'dirt';
      console.log(`Using block type: ${blockType}`);
      
      // Try to place the block
      if (this.player.placeBlock()) {
        const newBlock = this.renderer.addVoxelBlock(blockX, blockY, blockZ, blockType);
        console.log("Block placed successfully:", newBlock);
        
        // Play sound effect
        this.soundManager.playSound('blockPlace');
      } else {
        console.log("No more blocks of type", blockType, "available");
      }
    } else {
      console.log("Raycast hit too far away");
    }
  }
  
  // Guaranteed to work direct block placement for testing
  testPlaceBlockDirectly() {
    console.log("DIRECT TEST: Placing block directly");
    
    // Get player position
    const pos = this.renderer.getPlayerPosition();
    console.log("Player position:", pos);
    
    // Place block right below the player
    const blockX = Math.floor(pos.x);
    const blockY = Math.floor(pos.y) - 2; // Place below player
    const blockZ = Math.floor(pos.z);
    
    console.log(`Placing block at ${blockX}, ${blockY}, ${blockZ}`);
    
    // Always use dirt
    const blockType = 'dirt';
    
    // Create the block directly (skip all checks)
    const newBlock = this.renderer.addVoxelBlock(blockX, blockY, blockZ, blockType);
    
    if (newBlock) {
      console.log("Block placement successful!");
      this.soundManager.playSound('blockPlace');
      return true;
    } else {
      console.log("Block placement failed");
      return false;
    }
  }
  
  fireWeapon() {
    // Get element based on selected vision
    const elements = ['Pyro', 'Hydro', 'Electro', 'Anemo', 'Geo', 'Cryo', 'Dendro'];
    const selectedElement = elements[this.gameState.selectedVision - 1];
    
    console.log(`Firing weapon with element: ${selectedElement}`);
    
    // Create a projectile (simplified)
    const position = this.renderer.getPlayerPosition();
    const direction = this.renderer.getPlayerDirection();
    
    // Spawn effect at a distance in front of the player
    const effectPosition = {
      x: position.x + direction.x * 2,
      y: position.y + direction.y * 2,
      z: position.z + direction.z * 2
    };
    
    // Create elemental effect
    this.renderer.createElementalEffect(selectedElement, effectPosition);
    
    // Play sound based on element
    this.soundManager.playSound(`fire${selectedElement}`);
  }
  
  useElementalSkill() {
    const elements = ['Pyro', 'Hydro', 'Electro', 'Anemo', 'Geo', 'Cryo', 'Dendro'];
    const selectedElement = elements[this.gameState.selectedVision - 1];
    
    console.log(`Using elemental skill: ${selectedElement}`);
    
    // Create elemental effect around player
    const position = this.renderer.getPlayerPosition();
    this.renderer.createElementalEffect(selectedElement, position);
    
    // Play sound
    this.soundManager.playSound(`skill${selectedElement}`);
  }
  
  useElementalBurst() {
    const elements = ['Pyro', 'Hydro', 'Electro', 'Anemo', 'Geo', 'Cryo', 'Dendro'];
    const selectedElement = elements[this.gameState.selectedVision - 1];
    
    console.log(`Using elemental burst: ${selectedElement}`);
    
    // Create larger elemental effect
    const position = this.renderer.getPlayerPosition();
    
    // Create multiple effects around the player
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      const effectPosition = {
        x: position.x + Math.cos(angle) * 3,
        y: position.y,
        z: position.z + Math.sin(angle) * 3
      };
      
      this.renderer.createElementalEffect(selectedElement, effectPosition);
    }
    
    // Play sound
    this.soundManager.playSound(`burst${selectedElement}`);
  }
  
  interactWithWorld() {
    console.log('Interacting with world');
    // Implement interaction with objects, NPCs, etc.
  }
  
  toggleInventory() {
    this.gameState.inventoryOpen = !this.gameState.inventoryOpen;
    
    if (this.gameState.inventoryOpen) {
      this.pauseGame();
      this.uiManager.showInventory();
    } else {
      this.uiManager.hideInventory();
      this.resumeGame();
    }
  }
  
  toggleMap() {
    this.gameState.mapOpen = !this.gameState.mapOpen;
    
    if (this.gameState.mapOpen) {
      this.pauseGame();
      this.uiManager.showMap();
    } else {
      this.uiManager.hideMap();
      this.resumeGame();
    }
  }
  
  addEntity(entity) {
    this.entities.push(entity);
  }
  
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }
}

// Test function to directly place a block
setTimeout(() => {
  console.log("Running direct block placement test in 5 seconds...");
  setTimeout(() => {
    if (window.engine) {
      console.log("Automatic test: Attempting direct block placement");
      window.engine.testPlaceBlockDirectly();
    } else {
      console.error("Engine not found in global scope!");
    }
  }, 5000);
}, 100);