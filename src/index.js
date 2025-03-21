// DOOM of Teyvat: Main Entry Point
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { SoundManager } from './engine/SoundManager.js';

// Global variables
let camera, scene, renderer, controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let musicStarted = false;
let soundManager; 

let projectiles = [];
let enemies = [];
let currentWeapon;
let playerHealth = 100;
let elementalEnergy = 100;
let currentElement = 'Pyro';

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let isOnGround = false;
let groundHeight = playerHeight;
const groundOffset = 0.05; // Small offset to prevent z-fighting

// Player height
const playerHeight = 1.8;

function initSoundManager() {
  soundManager = new SoundManager();
  soundManager.initialize();
  return soundManager;
}

// Initialize the game
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, playerHeight, 5); // Start 5 units back to see what's in front
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Initialize sound manager
  initSoundManager();
  
  // Create weapon
  currentWeapon = createWeapon(currentElement);
    
  // Create HUD
  createHUD();
    
  // Create some enemies
  for (let i = 0; i < 10; i++) {
    const position = new THREE.Vector3(
      Math.random() * 40 - 20,
      playerHeight,
      Math.random() * 40 - 20
    );
    enemies.push(createEnemy(position));
  }
  
  // Create controls
  controls = new PointerLockControls(camera, document.body);
  
  // Add click event to start game and enable sound
  document.addEventListener('click', function() {
    // Resume audio context if suspended (browser requirement for audio)
    if (soundManager.audioContext && soundManager.audioContext.state === 'suspended') {
      soundManager.audioContext.resume().then(() => {
        console.log('AudioContext resumed');
      });
    }
    
    controls.lock();
    
    // Play background music when game starts
    if (controls.isLocked && !musicStarted) {
      soundManager.playMusic('main');
      musicStarted = true;
    }
  });
  
  controls.addEventListener('lock', function() {
    console.log('Controls locked');
  });
  
  controls.addEventListener('unlock', function() {
    console.log('Controls unlocked');
  });
  
  // Add key event listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  // Add mouse event listener for shooting
  document.addEventListener('mousedown', (event) => {
    if (event.button === 0 && controls.isLocked) { // Left click
      fireWeapon(currentWeapon);
    }
  });
  
  // Create lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increase ambient light
  scene.add(ambientLight);
  
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(10, 30, 10);
  sunLight.castShadow = true;
  scene.add(sunLight);
  
  // Create ground
  createGround();
  
  // Create some blocks
  createBlocks();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Log camera position to console
  console.log("Camera position:", camera.position);
  
  // Add sound test button for debugging
  const soundTestButton = document.createElement('button');
  soundTestButton.textContent = 'Test Sound';
  soundTestButton.style.position = 'absolute';
  soundTestButton.style.top = '10px';
  soundTestButton.style.right = '10px';
  soundTestButton.style.zIndex = '1000';
  soundTestButton.style.padding = '8px';
  soundTestButton.style.cursor = 'pointer';
  soundTestButton.addEventListener('click', () => {
    soundManager.playSound('jump');
    console.log('Playing test sound');
  });
  document.body.appendChild(soundTestButton);
}

function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x553300,
    roughness: 1.0
  });
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
}

function createBlocks() {
  // Create some sample blocks
  const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
  
  const dirtMaterial = new THREE.MeshStandardMaterial({ color: 0x553300 });
  const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x338833 });
  
  // Simple formation
  for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
      // Simple height calculation
      const height = Math.floor(Math.sin(x * 0.5) * 2 + Math.cos(z * 0.5) * 2);
      
      for (let y = 0; y <= height; y++) {
        let material;
        
        if (y === height) {
          material = grassMaterial;
        } else if (y === height - 1) {
          material = dirtMaterial;
        } else {
          material = stoneMaterial;
        }
        
        const block = new THREE.Mesh(blockGeometry, material);
        block.position.set(x, y + 0.5, z); // +0.5 to align with ground
        block.castShadow = true;
        block.receiveShadow = true;
        
        // Store block type in userData
        block.userData.type = y === height ? 'grass' : (y === height - 1 ? 'dirt' : 'stone');
        
        scene.add(block);
      }
    }
  }
}

function createWeapon(element) {
  const elements = {
    'Pyro': { color: 0xff3300, damage: 20, range: 15, fireRate: 0.5 },
    'Hydro': { color: 0x0088ff, damage: 15, range: 20, fireRate: 0.8 },
    'Electro': { color: 0xcc00ff, damage: 18, range: 25, fireRate: 0.6 },
  };
  
  const config = elements[element] || elements['Pyro'];
  
  // Create a weapon mesh
  const weaponGeometry = new THREE.BoxGeometry(0.2, 0.2, 1);
  const weaponMaterial = new THREE.MeshStandardMaterial({ 
    color: config.color, 
    emissive: config.color, 
    emissiveIntensity: 0.5 
  });
  const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
  
  // Position at bottom right of screen
  weapon.position.set(0.5, -0.3, -1);
  camera.add(weapon);
  
  return { mesh: weapon, config: config, element: element };
}

function fireWeapon(weapon) {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  
  // Create projectile
  const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const projectileMaterial = new THREE.MeshStandardMaterial({ 
    color: weapon.config.color,
    emissive: weapon.config.color,
    emissiveIntensity: 0.8
  });
  const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
  
  // Set position and add to scene
  projectile.position.copy(camera.position);
  projectile.position.y -= 0.2; // Adjust to weapon height
  scene.add(projectile);
  
  // Create a point light to make it glow
  const light = new THREE.PointLight(weapon.config.color, 1, 2);
  projectile.add(light);
  
  // Add to projectiles array to update in animation loop
  projectiles.push({
    mesh: projectile,
    velocity: direction.multiplyScalar(20),
    element: weapon.element,
    damage: weapon.config.damage,
    lifetime: 2
  });
  
  // Play sound
  if (soundManager.sounds['fire' + weapon.element]) {
    soundManager.playSound('fire' + weapon.element);
  } else {
    soundManager.playSound('jump'); // Fallback sound
  }
  
  // Add muzzle flash effect
  createMuzzleFlash(weapon.mesh.position, weapon.config.color);
}

function createMuzzleFlash(position, color) {
  const flashGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const flashMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });
  
  const flash = new THREE.Mesh(flashGeometry, flashMaterial);
  flash.position.copy(position);
  flash.position.z -= 0.5; // Position at end of weapon
  camera.add(flash);
  
  // Add light
  const light = new THREE.PointLight(color, 2, 3);
  light.position.copy(flash.position);
  camera.add(light);
  
  // Remove after short duration
  setTimeout(() => {
    camera.remove(flash);
    camera.remove(light);
  }, 100);
}

function createEnemy(position, type = 'slime') {
  const enemyGeometry = new THREE.SphereGeometry(0.5, 8, 8);
  const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
  
  enemy.position.copy(position);
  scene.add(enemy);
  
  return {
    mesh: enemy,
    health: 100,
    speed: 3,
    type: type,
    appliedElements: {}
  };
}

function createExplosion(position, color, size = 2) {
  // Create particle system for explosion
  const particleCount = 20;
  const particles = new THREE.BufferGeometry();
  
  const positions = [];
  for (let i = 0; i < particleCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5
    );
  }
  
  particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: color,
    size: 0.2,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  
  const particleSystem = new THREE.Points(particles, particleMaterial);
  particleSystem.position.copy(position);
  scene.add(particleSystem);
  
  // Add light for dramatic effect
  const light = new THREE.PointLight(color, 2, size * 2);
  light.position.copy(position);
  scene.add(light);
  
  // Remove after animation
  setTimeout(() => {
    scene.remove(particleSystem);
    scene.remove(light);
  }, 500);
  
  // Play explosion sound
  if (soundManager.sounds['explosion']) {
    soundManager.playSound('explosion');
  } else {
    soundManager.playSound('jump'); // Fallback sound
  }
}

function createHUD() {
  const hudContainer = document.createElement('div');
  hudContainer.style.position = 'absolute';
  hudContainer.style.bottom = '20px';
  hudContainer.style.left = '20px';
  hudContainer.style.color = '#ffffff';
  hudContainer.style.fontFamily = 'monospace';
  hudContainer.style.fontSize = '24px';
  hudContainer.style.textShadow = '2px 2px 0px #000000';
  hudContainer.style.userSelect = 'none';
  
  // Health display
  const healthDisplay = document.createElement('div');
  healthDisplay.id = 'health-display';
  healthDisplay.innerHTML = 'HEALTH: 100';
  healthDisplay.style.color = '#ff0000';
  hudContainer.appendChild(healthDisplay);
  
  // Ammo display
  const ammoDisplay = document.createElement('div');
  ammoDisplay.id = 'ammo-display';
  ammoDisplay.innerHTML = 'ENERGY: 100';
  ammoDisplay.style.color = '#00ffff';
  hudContainer.appendChild(ammoDisplay);
  
  // Element display
  const elementDisplay = document.createElement('div');
  elementDisplay.id = 'element-display';
  elementDisplay.innerHTML = 'PYRO';
  elementDisplay.style.color = '#ff3300';
  hudContainer.appendChild(elementDisplay);
  
  document.body.appendChild(hudContainer);
  
  // Version display - Add this part
  const versionDisplay = document.createElement('div');
  versionDisplay.id = 'version-display';
  versionDisplay.innerHTML = 'v0.0.0';
  versionDisplay.style.position = 'absolute';
  versionDisplay.style.bottom = '5px';
  versionDisplay.style.right = '5px';
  versionDisplay.style.color = '#ffffff';
  versionDisplay.style.fontSize = '12px';
  document.body.appendChild(versionDisplay);
}

function onKeyDown(event) {
  // Prevent key repeat
  if (event.repeat) return;
  
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;
    case 'Space':
      if (canJump) {
        console.log("Jumping!");
        velocity.y = 10;
        canJump = false;
        isOnGround = false;
        soundManager.playSound('jump');
      } else {
        console.log("Can't jump - not on ground");
      }
      break;
    // Add element switching with number keys
    case 'Digit1':
      switchElement('Pyro');
      break;
    case 'Digit2':
      switchElement('Hydro');
      break;
    case 'Digit3':
      switchElement('Electro');
      break;
  }
}

function switchElement(element) {
  if (currentElement === element) return;
  
  currentElement = element;
  
  // Remove current weapon
  if (currentWeapon) {
    camera.remove(currentWeapon.mesh);
  }
  
  // Create new weapon
  currentWeapon = createWeapon(element);
  
  // Update HUD
  const elementDisplay = document.getElementById('element-display');
  if (elementDisplay) {
    elementDisplay.innerHTML = element.toUpperCase();
    
    // Update color based on element
    switch(element) {
      case 'Pyro':
        elementDisplay.style.color = '#ff3300';
        break;
      case 'Hydro':
        elementDisplay.style.color = '#0088ff';
        break;
      case 'Electro':
        elementDisplay.style.color = '#cc00ff';
        break;
    }
  }
  
  // Play sound
  soundManager.playSound('visionSwitch');
}

function onKeyUp(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (controls.isLocked === true) {
    const time = performance.now();
    const delta = (time - prevTime) / 1000; // Convert to seconds
    
    // Apply gravity only when not on ground
    if (!isOnGround) {
      velocity.y -= 9.8 * delta;
      
      // Apply vertical velocity (jumping/falling)
      camera.position.y += velocity.y * delta;
    } else {
      velocity.y = 0; // Reset vertical velocity when on ground
    }
    
    // Reset horizontal velocity each frame 
    velocity.x = 0;
    velocity.z = 0;
    
    // Get movement direction
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    
    // Apply movement - FIXED direction
    const moveSpeed = 10.0;
    if (moveForward || moveBackward) velocity.z = direction.z * moveSpeed;
    if (moveLeft || moveRight) velocity.x = direction.x * moveSpeed;
    
    // Update horizontal position
    controls.moveRight(velocity.x * delta);
    controls.moveForward(velocity.z * delta);
    
    // Ground detection with raycasting
    const playerPosition = camera.position.clone();
    
    // Create ray starting from player position
    const raycaster = new THREE.Raycaster(
      playerPosition,
      new THREE.Vector3(0, -1, 0),
      0,
      playerHeight + 0.2 // Check slightly below feet
    );
    
    // Filter out non-mesh objects for raycasting
    const meshes = scene.children.filter(obj => obj.isMesh);
    
    const intersects = raycaster.intersectObjects(meshes, true);
    
    // Previous ground state
    const wasOnGround = isOnGround;
    
    if (intersects.length > 0) {
      const distance = intersects[0].distance;
      
      // If we're close enough to the ground (within a small threshold)
      if (distance <= playerHeight + 0.1) {
        // Only snap to ground if we're falling (not jumping)
        if (velocity.y <= 0) {
          // We hit ground
          isOnGround = true;
          canJump = true; // Always enable jump when on ground
          
          // Set player to correct height above ground
          const groundPoint = intersects[0].point;
          camera.position.y = groundPoint.y + playerHeight;
        }
      } else {
        // We're above ground
        isOnGround = false;
      }
    } else {
      // No ground detected below
      isOnGround = false;
      
      // Basic ground check as fallback
      if (camera.position.y < playerHeight) {
        isOnGround = true;
        canJump = true;
        camera.position.y = playerHeight;
        velocity.y = 0;
      }
    }
    
    // Update projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      
      // Move projectile
      projectile.mesh.position.add(
        projectile.velocity.clone().multiplyScalar(delta)
      );
      
      // Decrease lifetime
      projectile.lifetime -= delta;
      
      // Remove if lifetime expired
      if (projectile.lifetime <= 0) {
        scene.remove(projectile.mesh);
        projectiles.splice(i, 1);
        continue;
      }
      
      // Check for collisions with enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const distance = projectile.mesh.position.distanceTo(enemy.mesh.position);
        
        if (distance < 1) {  // Hit enemy
          // Apply damage
          enemy.health -= projectile.damage;
          
          // Create explosion
          createExplosion(
            projectile.mesh.position.clone(), 
            projectile.mesh.material.color
          );
          
          // Remove projectile
          scene.remove(projectile.mesh);
          projectiles.splice(i, 1);
          
          // Check if enemy defeated
          if (enemy.health <= 0) {
            scene.remove(enemy.mesh);
            enemies.splice(j, 1);
            
            // Update HUD
            const elementalDisplay = document.getElementById('ammo-display');
            if (elementalDisplay) {
              elementalEnergy = Math.min(100, elementalEnergy + 10);
              elementalDisplay.innerHTML = `ENERGY: ${Math.floor(elementalEnergy)}`;
            }
          }
          
          break;
        }
      }
    }
    
    // Update enemies
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      
      // Simple AI - move toward player
      const enemyDirection = new THREE.Vector3()
        .subVectors(camera.position, enemy.mesh.position)
        .normalize();
      
      // Move at appropriate speed
      enemy.mesh.position.add(
        enemyDirection.multiplyScalar(enemy.speed * delta)
      );
      
      // Check if enemy reached player
      const distanceToPlayer = enemy.mesh.position.distanceTo(camera.position);
      if (distanceToPlayer < 1.5) {
        // Player takes damage
        playerHealth -= 10 * delta;
        
        // Update HUD
        const healthDisplay = document.getElementById('health-display');
        if (healthDisplay) {
          healthDisplay.innerHTML = `HEALTH: ${Math.floor(playerHealth)}`;
        }
        
        // Game over if health depleted
        if (playerHealth <= 0) {
          controls.unlock();
          alert("Game Over!");
        }
      }
    }
    
    prevTime = time;
  }
  
  renderer.render(scene, camera);
}

// Initialize and start animation loop
init();
animate();

// Log to console that game is ready
console.log('DOOM of Teyvat initialized');