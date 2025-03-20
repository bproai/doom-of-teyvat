// DOOM of Teyvat: Main Entry Point
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Global variables
let camera, scene, renderer, controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Player height
const playerHeight = 1.8;

// Initialize the game
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, playerHeight, 0);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  document.getElementById('game-container').appendChild(renderer.domElement);
  
  // Create controls
  controls = new PointerLockControls(camera, document.body);
  
  // Add click event to start game
  document.addEventListener('click', function() {
    controls.lock();
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
  
  // Create lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  scene.add(sunLight);
  
  // Create ground
  createGround();
  
  // Create some blocks
  createBlocks();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
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

function onKeyDown(event) {
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
        velocity.y += 10;
        canJump = false;
      }
      break;
  }
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
    
    // Apply gravity
    velocity.y -= 9.8 * delta;
    
    // Get movement direction
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    
    // Apply movement
    if (moveForward || moveBackward) velocity.z -= direction.z * 10.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 10.0 * delta;
    
    // Update position
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    
    // Update height
    camera.position.y += velocity.y * delta;
    
    // Simple collision with ground
    if (camera.position.y < playerHeight) {
      velocity.y = 0;
      camera.position.y = playerHeight;
      canJump = true;
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