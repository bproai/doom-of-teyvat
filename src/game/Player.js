// Player class for DOOM of Teyvat

export class Player {
  constructor() {
    // Basic player properties
    this.position = { x: 0, y: 2, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    
    // Player stats
    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.staminaRegenRate = 20; // Stamina points per second
    this.staminaSprintCost = 30; // Stamina points per second while sprinting
    
    // Player state
    this.isGrounded = true;
    this.isJumping = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.isDead = false;
    
    // Player dimensions
    this.height = 1.8;
    this.eyeHeight = 1.6;
    this.width = 0.6;
    
    // Movement settings
    this.walkSpeed = 5;
    this.sprintSpeed = 8;
    this.crouchSpeed = 2.5;
    this.jumpForce = 10;
    this.gravity = 20;
    
    // Combat properties
    this.attackCooldown = 0;
    this.attackRate = 0.5; // Attacks per second
    
    // Inventory
    this.inventory = {
      blocks: {
        dirt: 64,
        stone: 64,
        grass: 64,
        wood: 32,
        leaves: 32,
        water: 10
      },
      materials: {},
      visions: [],
      weapons: []
    };
    
    // Current equipment
    this.currentVision = null;
    this.currentWeapon = null;
    this.selectedBlockType = 'dirt';
    this.hotbarIndex = 0;
    
    // Elemental abilities cooldowns
    this.skillCooldown = 0;
    this.burstCooldown = 0;
    this.skillCooldownMax = 6; // seconds
    this.burstCooldownMax = 15; // seconds
    this.elementalEnergy = 0;
    this.elementalEnergyMax = 100;
  }
  
  update(deltaTime) {
    // Update player state
    this.updateMovement(deltaTime);
    this.updateCombat(deltaTime);
    this.updateCooldowns(deltaTime);
    
    // Regenerate stamina when not sprinting
    if (!this.isSprinting) {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * deltaTime);
    }
  }
  
  updateMovement(deltaTime) {
    // Apply gravity when not grounded
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime;
    }
    
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // Simple ground check (will be replaced with proper collision)
    if (this.position.y < this.eyeHeight) {
      this.position.y = this.eyeHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.isJumping = false;
    }
  }
  
  updateCombat(deltaTime) {
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
  }
  
  updateCooldowns(deltaTime) {
    // Update skill cooldown
    if (this.skillCooldown > 0) {
      this.skillCooldown -= deltaTime;
    }
    
    // Update burst cooldown
    if (this.burstCooldown > 0) {
      this.burstCooldown -= deltaTime;
    }
  }
  
  move(direction, isSprinting, isCrouching) {
    // Set movement flags
    this.isSprinting = isSprinting;
    this.isCrouching = isCrouching;
    
    // Calculate speed based on movement state
    let speed = this.walkSpeed;
    if (isSprinting && this.stamina > 0) {
      speed = this.sprintSpeed;
      this.stamina = Math.max(0, this.stamina - this.staminaSprintCost * 0.016); // Approximate for one frame
    } else if (isCrouching) {
      speed = this.crouchSpeed;
    }
    
    // Set velocity based on direction and speed
    this.velocity.x = direction.x * speed;
    this.velocity.z = direction.z * speed;
  }
  
  jump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
      return true;
    }
    return false;
  }
  
  attack() {
    if (this.attackCooldown <= 0) {
      this.attackCooldown = 1 / this.attackRate;
      return true;
    }
    return false;
  }
  
  useElementalSkill() {
    if (this.skillCooldown <= 0) {
      // Use skill
      const result = this.currentVision ? this.currentVision.useSkill() : false;
      
      if (result) {
        this.skillCooldown = this.skillCooldownMax;
        return true;
      }
    }
    return false;
  }
  
  useElementalBurst() {
    if (this.burstCooldown <= 0 && this.elementalEnergy >= this.elementalEnergyMax) {
      // Use burst
      const result = this.currentVision ? this.currentVision.useBurst() : false;
      
      if (result) {
        this.burstCooldown = this.burstCooldownMax;
        this.elementalEnergy = 0;
        return true;
      }
    }
    return false;
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.die();
    }
    
    return this.health;
  }
  
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health;
  }
  
  die() {
    this.isDead = true;
    // Handle death - will trigger game over screen
  }
  
  switchVision(visionIndex) {
    if (visionIndex < this.inventory.visions.length) {
      this.currentVision = this.inventory.visions[visionIndex];
      // Also switch weapon based on vision
      this.switchWeapon(this.currentVision.element);
      return true;
    }
    return false;
  }
  
  switchWeapon(elementType) {
    // Find a weapon matching the element type
    const weapon = this.inventory.weapons.find(w => w.element === elementType);
    if (weapon) {
      this.currentWeapon = weapon;
      return true;
    }
    return false;
  }
  
  selectBlock(blockType) {
    if (this.inventory.blocks[blockType] && this.inventory.blocks[blockType] > 0) {
      this.selectedBlockType = blockType;
      return true;
    }
    return false;
  }
  
  placeBlock() {
    if (this.inventory.blocks[this.selectedBlockType] > 0) {
      // Actual block placement is handled by the game world
      this.inventory.blocks[this.selectedBlockType]--;
      return true;
    }
    return false;
  }
  
  mineBlock(blockType) {
    // Add the mined block to inventory
    if (!this.inventory.blocks[blockType]) {
      this.inventory.blocks[blockType] = 0;
    }
    this.inventory.blocks[blockType]++;
    return true;
  }
  
  // Add an item to the inventory
  addItem(itemType, amount = 1) {
    if (!this.inventory.materials[itemType]) {
      this.inventory.materials[itemType] = 0;
    }
    this.inventory.materials[itemType] += amount;
  }
  
  // Remove an item from the inventory
  removeItem(itemType, amount = 1) {
    if (this.inventory.materials[itemType] && this.inventory.materials[itemType] >= amount) {
      this.inventory.materials[itemType] -= amount;
      return true;
    }
    return false;
  }
  
  // Get player's current state for UI updates
  getPlayerState() {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      position: this.position,
      currentVision: this.currentVision ? this.inventory.visions.indexOf(this.currentVision) + 1 : 1,
      skillCooldown: this.skillCooldown,
      skillCooldownMax: this.skillCooldownMax,
      burstCooldown: this.burstCooldown,
      burstCooldownMax: this.burstCooldownMax,
      elementalEnergy: this.elementalEnergy,
      elementalEnergyMax: this.elementalEnergyMax
    };
  }
}