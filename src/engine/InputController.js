// Input controller for keyboard and mouse

export class InputController {
    constructor() {
      // Movement keys
      this.keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        sprint: false,
        crouch: false
      };
      
      // Mouse interaction
      this.mouse = {
        leftButton: false,
        rightButton: false,
        middleButton: false
      };
      
      // Action keys
      this.actions = {
        elementalSkill: false,
        elementalBurst: false,
        interact: false,
        inventory: false,
        map: false,
        pause: false
      };
      
      // Vision selection (1-7 for different elements)
      this.visionSelect = {
        1: false, // Pyro
        2: false, // Hydro
        3: false, // Electro
        4: false, // Anemo
        5: false, // Geo
        6: false, // Cryo
        7: false  // Dendro
      };
      
      // Block selection (hotbar)
      this.blockSelect = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false
      };
      
      // Mouse position and movement
      this.mouseX = 0;
      this.mouseY = 0;
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
      
      // Scroll wheel
      this.scrollDelta = 0;
      
      // Bind event handlers
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onWheel = this.onWheel.bind(this);
      
      // Initialize input event listeners
      this.initialize();
    }
    
    initialize() {
      // Add event listeners
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mousedown', this.onMouseDown);
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('wheel', this.onWheel);
      
      console.log('Input controller initialized');
    }
    
    shutdown() {
      // Remove event listeners
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mousedown', this.onMouseDown);
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('wheel', this.onWheel);
    }
    
    onKeyDown(event) {
      this.updateKeyState(event.code, true);
    }
    
    onKeyUp(event) {
      this.updateKeyState(event.code, false);
    }
    
    updateKeyState(code, pressed) {
      // Movement keys
      switch (code) {
        case 'KeyW':
          this.keys.forward = pressed;
          break;
        case 'KeyS':
          this.keys.backward = pressed;
          break;
        case 'KeyA':
          this.keys.left = pressed;
          break;
        case 'KeyD':
          this.keys.right = pressed;
          break;
        case 'Space':
          this.keys.jump = pressed;
          break;
        case 'ShiftLeft':
          this.keys.sprint = pressed;
          break;
        case 'ControlLeft':
          this.keys.crouch = pressed;
          break;
        
        // Action keys
        case 'KeyE':
          this.actions.elementalSkill = pressed;
          break;
        case 'KeyQ':
          this.actions.elementalBurst = pressed;
          break;
        case 'KeyF':
          this.actions.interact = pressed;
          break;
        case 'KeyI':
          this.actions.inventory = pressed;
          break;
        case 'KeyM':
          this.actions.map = pressed;
          break;
        case 'Escape':
          this.actions.pause = pressed;
          break;
        
        // Vision selection (1-7)
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
          const visionNumber = parseInt(code.slice(-1));
          for (let i = 1; i <= 7; i++) {
            this.visionSelect[i] = (i === visionNumber && pressed);
          }
          break;
      }
    }
    
    onMouseMove(event) {
      this.mouseDeltaX = event.movementX || 0;
      this.mouseDeltaY = event.movementY || 0;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }
    
    onMouseDown(event) {
      switch (event.button) {
        case 0: // Left button
          this.mouse.leftButton = true;
          break;
        case 1: // Middle button
          this.mouse.middleButton = true;
          break;
        case 2: // Right button
          this.mouse.rightButton = true;
          break;
      }
    }
    
    onMouseUp(event) {
      switch (event.button) {
        case 0: // Left button
          this.mouse.leftButton = false;
          break;
        case 1: // Middle button
          this.mouse.middleButton = false;
          break;
        case 2: // Right button
          this.mouse.rightButton = false;
          break;
      }
    }
    
    onWheel(event) {
      this.scrollDelta = Math.sign(event.deltaY);
    }
    
    // Reset mouse delta after reading
    resetMouseDelta() {
      this.mouseDeltaX = 0;
      this.mouseDeltaY = 0;
    }
    
    // Reset scroll delta after reading
    resetScrollDelta() {
      this.scrollDelta = 0;
    }
    
    // Get movement vector based on current key state
    getMovementVector() {
      const movement = { x: 0, z: 0 };
      
      if (this.keys.forward) movement.z -= 1;
      if (this.keys.backward) movement.z += 1;
      if (this.keys.left) movement.x -= 1;
      if (this.keys.right) movement.x += 1;
      
      // Normalize vector if moving diagonally
      const length = Math.sqrt(movement.x * movement.x + movement.z * movement.z);
      if (length > 0) {
        movement.x /= length;
        movement.z /= length;
      }
      
      return movement;
    }
    
    // Get the currently selected vision (1-7)
    getSelectedVision() {
      for (let i = 1; i <= 7; i++) {
        if (this.visionSelect[i]) {
          return i;
        }
      }
      return null;
    }
  }