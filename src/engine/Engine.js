// Updated Engine class with THREE import

import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { InputController } from './InputController.js';
import { SoundManager } from './SoundManager.js';
import { UIManager } from './UIManager.js';

export class Engine {
  constructor() {
    this.entities = [];
    this.lastTimestamp = 0;
    this.isRunning = false;
    this.deltaTime = 0;
    
    // Core engine systems
    this.renderer = new Renderer();
    this.input = new InputController();
    this.soundManager = new SoundManager();
    this.uiManager = new UIManager();
    
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
      this.handleRightClick();
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
    // Place block/use item action
    const hitResult = this.renderer.castRay();
    
    if (hitResult && hitResult.distance < 5) {
      // Calculate position for new block based on face normal
      const blockPosition = {
        x: Math.floor(hitResult.position.x + hitResult.normal.x * 0.5),
        y: Math.floor(hitResult.position.y + hitResult.normal.y * 0.5),
        z: Math.floor(hitResult.position.z + hitResult.normal.z * 0.5)
      };
      
      // Place a block (use appropriate type based on selected block)
      const blockTypes = ['dirt', 'stone', 'grass', 'wood', 'leaves'];
      const selectedType = blockTypes[this.gameState.selectedBlock % blockTypes.length];
      
      console.log(`Placing block of type: ${selectedType}`);
      this.renderer.addVoxelBlock(blockPosition.x, blockPosition.y, blockPosition.z, selectedType);
      this.soundManager.playSound('blockPlace');
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