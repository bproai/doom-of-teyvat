import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class Renderer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.initialized = false;
    
    // Bind methods
    this.onWindowResize = this.onWindowResize.bind(this);
  }
  
  initialize() {
    if (this.initialized) return;
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.camera.position.set(0, 2, 0); // Player eye height
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    
    // Add canvas to DOM
    const container = document.getElementById('game-container');
    container.appendChild(this.renderer.domElement);
    
    // Add controls
    this.controls = new PointerLockControls(this.camera, document.body);
    
    // Add event to start game on click
    const startGame = () => {
      this.controls.lock();
    };
    
    document.addEventListener('click', startGame);
    
    // Events for pointer lock
    this.controls.addEventListener('lock', () => {
      console.log('Controls locked');
    });
    
    this.controls.addEventListener('unlock', () => {
      console.log('Controls unlocked');
    });
    
    // Add window resize event listener
    window.addEventListener('resize', this.onWindowResize);
    
    // Add basic lighting
    this.setupLighting();
    
    // Add a simple ground plane
    this.addGround();
    
    this.initialized = true;
    console.log('Renderer initialized');
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    
    // Configure shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    
    this.scene.add(sunLight);
  }
  
  addGround() {
    // Create a basic ground plane to represent the world
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    
    // Create a texture for the ground
    const texture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4zjOaXUAAAAF9JREFUOE9jGFygcNbz/1AmeSB35rP/Cd33yDckY8rT//P2//6f0HWHPEMSep78n73v1//OrX//u5VeJt2QyK5H/6ds+/W/ZOnf/wnT//63yT1LmiGBzQ//t659D9ZsHgAA6t/SF5wsOm4AAAAASUVORK5CYII=');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      map: texture,
      color: 0x553300,
      roughness: 1.0
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -0.5; // Slightly below the player
    ground.receiveShadow = true;
    
    this.scene.add(ground);
    
    // Add some basic cubes to represent Minecraft-style blocks
    this.addVoxelCubes();
  }
  
  addVoxelCubes() {
    // Create a few test blocks
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    // Different materials for different block types
    const dirtMaterial = new THREE.MeshStandardMaterial({ color: 0x553300 });
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x338833 });
    
    // Create a simple formation of blocks
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        // Calculate a simple height map
        const height = Math.floor(Math.sin(x * 0.5) * 2 + Math.cos(z * 0.5) * 2);
        
        for (let y = -1; y <= height; y++) {
          let material;
          
          if (y === height) {
            material = grassMaterial;
          } else if (y === height - 1) {
            material = dirtMaterial;
          } else {
            material = stoneMaterial;
          }
          
          const block = new THREE.Mesh(blockGeometry, material);
          block.position.set(x, y, z);
          block.castShadow = true;
          block.receiveShadow = true;
          
          this.scene.add(block);
        }
      }
    }
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  render() {
    if (!this.initialized) return;
    this.renderer.render(this.scene, this.camera);
  }
  
  addVoxelBlock(x, y, z, type = 'stone') {
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    let material;
    
    switch (type) {
      case 'dirt':
        material = new THREE.MeshStandardMaterial({ color: 0x553300 });
        break;
      case 'grass':
        material = new THREE.MeshStandardMaterial({ color: 0x338833 });
        break;
      case 'stone':
        material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        break;
      case 'wood':
        material = new THREE.MeshStandardMaterial({ color: 0x885522 });
        break;
      case 'leaves':
        material = new THREE.MeshStandardMaterial({ 
          color: 0x226622,
          transparent: true,
          opacity: 0.8
        });
        break;
      case 'water':
        material = new THREE.MeshStandardMaterial({ 
          color: 0x2233aa,
          transparent: true,
          opacity: 0.6
        });
        break;
      default:
        material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        break;
    }
    
    const block = new THREE.Mesh(blockGeometry, material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    block.userData.type = type;
    
    this.scene.add(block);
    return block;
  }
  
  removeVoxelBlock(block) {
    this.scene.remove(block);
  }
  
  movePlayer(x, y, z) {
    this.camera.position.set(x, y, z);
  }
  
  getPlayerPosition() {
    return this.camera.position.clone();
  }
  
  getPlayerDirection() {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);
    return direction;
  }
  
// Updated castRay method for Renderer.js
castRay() {
    // Make sure the scene and camera are initialized
    if (!this.initialized || !this.scene || !this.camera) {
      return null;
    }
  
    const raycaster = new THREE.Raycaster();
    const direction = this.getPlayerDirection();
    
    raycaster.set(this.camera.position, direction);
    
    // Filter out sprites and objects without proper matrix world
    const validObjects = this.scene.children.filter(obj => {
      // Skip objects that are sprites or don't have a valid matrixWorld
      if (obj instanceof THREE.Sprite) return false;
      if (!obj.matrixWorld || !obj.matrixWorld.elements) return false;
      return true;
    });
    
    try {
      const intersects = raycaster.intersectObjects(validObjects, true);
      
      if (intersects.length > 0) {
        return {
          position: intersects[0].point,
          normal: intersects[0].face ? intersects[0].face.normal : new THREE.Vector3(0, 1, 0),
          distance: intersects[0].distance,
          object: intersects[0].object
        };
      }
    } catch (error) {
      console.warn('Error during raycasting:', error);
    }
    
    return null;
  }
  
  // Create an element block effect (like fire, water splash, etc.)
  createElementalEffect(element, position) {
    // Make sure scene is initialized
    if (!this.initialized || !this.scene) {
      return;
    }
  
    // Create a particle system or sprite for the effect
    const spriteMaterial = new THREE.SpriteMaterial({
      color: this.getElementColor(element),
      transparent: true,
      opacity: 0.8
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Set position
    sprite.position.set(position.x, position.y, position.z);
    sprite.scale.set(0.5, 0.5, 0.5);
    
    // Update matrix world immediately to avoid null matrix errors
    sprite.updateMatrixWorld(true);
    
    // Add to scene
    this.scene.add(sprite);
    
    // Remove the effect after a short duration
    setTimeout(() => {
      if (this.scene && sprite.parent === this.scene) {
        this.scene.remove(sprite);
      }
    }, 1000);
  }
  
  getElementColor(element) {
    switch (element) {
      case 'Pyro': return 0xff3300;
      case 'Hydro': return 0x0088ff;
      case 'Electro': return 0xcc00ff;
      case 'Anemo': return 0x33ffcc;
      case 'Geo': return 0xffcc00;
      case 'Cryo': return 0x99ffff;
      case 'Dendro': return 0x33cc00;
      default: return 0xffffff;
    }
  }
}