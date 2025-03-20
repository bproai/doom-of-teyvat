// Elemental system for DOOM of Teyvat

export class ElementalSystem {
  constructor() {
    // Available elements
    this.elements = [
      "Pyro",    // Fire
      "Hydro",   // Water
      "Electro", // Electricity
      "Anemo",   // Wind
      "Geo",     // Earth
      "Cryo",    // Ice
      "Dendro"   // Nature
    ];
    
    // Initialize reactions
    this.initializeReactions();
    
    // Element colors for visual effects
    this.elementColors = {
      "Pyro": 0xff3300,
      "Hydro": 0x0088ff,
      "Electro": 0xcc00ff,
      "Anemo": 0x33ffcc,
      "Geo": 0xffcc00,
      "Cryo": 0x99ffff,
      "Dendro": 0x33cc00
    };
    
    // Apply durations for each element
    this.elementDurations = {
      "Pyro": 10,     // 10 seconds
      "Hydro": 12,
      "Electro": 8,
      "Anemo": 6,
      "Geo": 15,
      "Cryo": 12,
      "Dendro": 10
    };
  }
  
  initializeReactions() {
    // Define elemental reactions
    this.reactions = {
      // Pyro + Hydro = Vaporize (2x damage multiplier)
      "Pyro+Hydro": this.triggerVaporize.bind(this),
      "Hydro+Pyro": this.triggerVaporize.bind(this),
      
      // Pyro + Cryo = Melt (1.5x damage multiplier)
      "Pyro+Cryo": this.triggerMelt.bind(this),
      "Cryo+Pyro": this.triggerMelt.bind(this),
      
      // Pyro + Electro = Overload (explosion)
      "Pyro+Electro": this.triggerOverload.bind(this),
      "Electro+Pyro": this.triggerOverload.bind(this),
      
      // Hydro + Cryo = Freeze (immobilize)
      "Hydro+Cryo": this.triggerFreeze.bind(this),
      "Cryo+Hydro": this.triggerFreeze.bind(this),
      
      // Cryo + Electro = Superconduct (defense reduction)
      "Cryo+Electro": this.triggerSuperconduct.bind(this),
      "Electro+Cryo": this.triggerSuperconduct.bind(this),
      
      // Hydro + Electro = Electro-Charged (DoT + chain)
      "Hydro+Electro": this.triggerElectroCharged.bind(this),
      "Electro+Hydro": this.triggerElectroCharged.bind(this),
      
      // Anemo + Any = Swirl (spread element)
      "Anemo+Pyro": this.triggerSwirl.bind(this),
      "Anemo+Hydro": this.triggerSwirl.bind(this),
      "Anemo+Electro": this.triggerSwirl.bind(this),
      "Anemo+Cryo": this.triggerSwirl.bind(this),
      
      // Geo + Any = Crystallize (create shield)
      "Geo+Pyro": this.triggerCrystallize.bind(this),
      "Geo+Hydro": this.triggerCrystallize.bind(this),
      "Geo+Electro": this.triggerCrystallize.bind(this),
      "Geo+Cryo": this.triggerCrystallize.bind(this),
      
      // Dendro + Pyro = Burning (DoT)
      "Dendro+Pyro": this.triggerBurning.bind(this),
      "Pyro+Dendro": this.triggerBurning.bind(this),
      
      // Dendro + Hydro = Bloom (creates explosive seed)
      "Dendro+Hydro": this.triggerBloom.bind(this),
      "Hydro+Dendro": this.triggerBloom.bind(this)
    };
  }
  
  triggerReaction(element1, element2, target) {
    const reactionKey = `${element1}+${element2}`;
    
    if (this.reactions[reactionKey]) {
      return this.reactions[reactionKey](target, element1, element2);
    }
    
    return null;
  }
  
  // Reaction implementations
  
  triggerVaporize(target, element1, element2) {
    console.log("Vaporize reaction triggered!");
    
    // Calculate damage multiplier based on order
    const multiplier = (element1 === "Pyro") ? 1.5 : 2.0;
    
    // Apply damage multiplier to last hit
    const damage = target.lastDamage * multiplier;
    target.takeDamage(damage);
    
    // Return reaction data
    return {
      type: "Vaporize",
      damageMultiplier: multiplier,
      damage: damage,
      elementConsumed: true,
      visualEffect: "steam",
      soundEffect: "sizzle"
    };
  }
  
  triggerMelt(target, element1, element2) {
    console.log("Melt reaction triggered!");
    
    // Calculate damage multiplier based on order
    const multiplier = (element1 === "Pyro") ? 2.0 : 1.5;
    
    // Apply damage multiplier to last hit
    const damage = target.lastDamage * multiplier;
    target.takeDamage(damage);
    
    // Return reaction data
    return {
      type: "Melt",
      damageMultiplier: multiplier,
      damage: damage,
      elementConsumed: true,
      visualEffect: "melting",
      soundEffect: "melt"
    };
  }
  
  triggerOverload(target, element1, element2) {
    console.log("Overload reaction triggered!");
    
    // Create explosion damage
    const damage = 40;
    const radius = 5;
    
    // Apply area damage
    const world = target.world; // Assuming target has a reference to world
    if (world) {
      const entities = world.getEntitiesInRadius(target.position, radius);
      
      for (const entity of entities) {
        // Skip the original target
        if (entity === target) continue;
        
        // Apply damage
        entity.takeDamage(damage);
        
        // Calculate knockback direction
        if (entity.position) {
          const direction = {
            x: entity.position.x - target.position.x,
            y: entity.position.y - target.position.y,
            z: entity.position.z - target.position.z
          };
          
          // Normalize
          const length = Math.sqrt(
            direction.x * direction.x +
            direction.y * direction.y +
            direction.z * direction.z
          );
          
          if (length > 0) {
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
            
            // Apply knockback force
            if (entity.applyKnockback) {
              entity.applyKnockback(direction.x * 10, direction.y * 5, direction.z * 10);
            }
          }
        }
      }
    }
    
    // Return reaction data
    return {
      type: "Overload",
      explosionDamage: damage,
      radius: radius,
      knockback: true,
      elementConsumed: true,
      visualEffect: "explosion",
      soundEffect: "boom"
    };
  }
  
  triggerFreeze(target, element1, element2) {
    console.log("Freeze reaction triggered!");
    
    // Freeze the target
    if (target.applyStatus) {
      target.applyStatus("frozen", 5); // 5 seconds freeze
    }
    
    // Return reaction data
    return {
      type: "Freeze",
      duration: 5,
      elementConsumed: false, // Cryo remains for potential shatter
      visualEffect: "ice",
      soundEffect: "freeze"
    };
  }
  
  triggerSuperconduct(target, element1, element2) {
    console.log("Superconduct reaction triggered!");
    
    // Apply defense reduction
    if (target.applyStatus) {
      target.applyStatus("defenseDown", 8); // 8 seconds defense down
    }
    
    // Apply small area damage
    const damage = 10;
    const radius = 5;
    
    const world = target.world;
    if (world) {
      const entities = world.getEntitiesInRadius(target.position, radius);
      
      for (const entity of entities) {
        entity.takeDamage(damage);
      }
    }
    
    // Return reaction data
    return {
      type: "Superconduct",
      defenseReduction: 0.5, // 50% defense reduction
      duration: 8,
      areaDamage: damage,
      radius: radius,
      elementConsumed: true,
      visualEffect: "electricIce",
      soundEffect: "crackle"
    };
  }
  
  triggerElectroCharged(target, element1, element2) {
    console.log("Electro-Charged reaction triggered!");
    
    // Apply DoT status
    if (target.applyStatus) {
      target.applyStatus("electroCharged", 4); // 4 seconds of electro DoT
    }
    
    // Apply initial damage
    const damage = 5;
    target.takeDamage(damage);
    
    // Chain to nearby entities if they're wet
    const chainRange = 5;
    const world = target.world;
    
    if (world) {
      const entities = world.getEntitiesInRadius(target.position, chainRange);
      
      for (const entity of entities) {
        // Skip the original target
        if (entity === target) continue;
        
        // Check if entity has Hydro applied
        if (entity.hasElement && entity.hasElement("Hydro")) {
          // Apply electro-charged to them too
          if (entity.applyStatus) {
            entity.applyStatus("electroCharged", 4);
          }
          entity.takeDamage(damage);
        }
      }
    }
    
    // Return reaction data
    return {
      type: "ElectroCharged",
      dotDamage: damage,
      ticks: 4,
      tickInterval: 1, // 1 second per tick
      chainRange: chainRange,
      elementConsumed: false, // Both elements persist for a short time
      visualEffect: "lightning",
      soundEffect: "zap"
    };
  }
  
  triggerSwirl(target, element1, element2) {
    console.log("Swirl reaction triggered!");
    
    // Get the non-Anemo element
    const swirledElement = (element1 === "Anemo") ? element2 : element1;
    
    // Apply Anemo damage
    const damage = 15;
    target.takeDamage(damage);
    
    // Spread the swirled element to nearby entities
    const spreadRadius = 8;
    const world = target.world;
    
    if (world) {
      const entities = world.getEntitiesInRadius(target.position, spreadRadius);
      
      for (const entity of entities) {
        // Skip the original target
        if (entity === target) continue;
        
        // Apply the swirled element
        if (entity.applyElement) {
          entity.applyElement(swirledElement, this.elementDurations[swirledElement]);
        }
        
        // Apply some damage
        entity.takeDamage(damage * 0.6); // Reduced damage for spread
      }
    }
    
    // Return reaction data
    return {
      type: "Swirl",
      element: swirledElement,
      spreadRadius: spreadRadius,
      spreadDamage: damage * 0.6,
      elementConsumed: true,
      visualEffect: "whirlwind" + swirledElement,
      soundEffect: "whoosh"
    };
  }
  
  triggerCrystallize(target, element1, element2) {
    console.log("Crystallize reaction triggered!");
    
    // Get the non-Geo element
    const crystallizedElement = (element1 === "Geo") ? element2 : element1;
    
    // Create a shield for the player
    // This would typically be implemented in the game as an item pickup
    // For now, we'll just return the reaction data
    
    // Return reaction data
    return {
      type: "Crystallize",
      element: crystallizedElement,
      shieldHealth: 30,
      duration: 10,
      elementConsumed: true,
      visualEffect: "crystal" + crystallizedElement,
      soundEffect: "chime"
    };
  }
  
  triggerBurning(target, element1, element2) {
    console.log("Burning reaction triggered!");
    
    // Apply burning status
    if (target.applyStatus) {
      target.applyStatus("burning", 6); // 6 seconds of burning
    }
    
    // Apply initial damage
    const damage = 8;
    target.takeDamage(damage);
    
    // Return reaction data
    return {
      type: "Burning",
      dotDamage: damage,
      ticks: 6,
      tickInterval: 1, // 1 second per tick
      elementConsumed: false, // Pyro persists, Dendro consumed
      visualEffect: "fire",
      soundEffect: "burn"
    };
  }
  
  triggerBloom(target, element1, element2) {
    console.log("Bloom reaction triggered!");
    
    // Create a seed that will explode after a delay
    const seedDamage = 25;
    const explosionDelay = 2; // 2 seconds
    const radius = 4;
    
    // Schedule the explosion
    setTimeout(() => {
      // Apply area damage
      const world = target.world;
      if (world) {
        const entities = world.getEntitiesInRadius(target.position, radius);
        
        for (const entity of entities) {
          entity.takeDamage(seedDamage);
        }
      }
      
      // Create explosion visual
      if (target.createVisualEffect) {
        target.createVisualEffect("bloomExplosion", radius);
      }
      
      // Play sound
      if (target.playSound) {
        target.playSound("pop");
      }
    }, explosionDelay * 1000);
    
    // Return reaction data
    return {
      type: "Bloom",
      seedDamage: seedDamage,
      explosionDelay: explosionDelay,
      radius: radius,
      elementConsumed: true,
      visualEffect: "sprouting",
      soundEffect: "sprout"
    };
  }
  
  // Vision class (element container)
  createVision(element, level = 1) {
    return new Vision(element, level, this);
  }
}

// Vision class - represents an elemental power
export class Vision {
  constructor(element, level = 1, elementalSystem) {
    this.element = element;
    this.level = level;
    this.elementalSystem = elementalSystem;
    
    // Energy state
    this.energy = 0;
    this.burstEnergyCost = 80;
    
    // Cooldowns
    this.skillCooldown = 0;
    this.skillMaxCooldown = 15;
    this.burstCooldown = 0;
    this.burstMaxCooldown = 20;
    
    // Element application duration
    this.elementalApplicationDuration = elementalSystem.elementDurations[element] || 10;
    
    // Weapon type associated with this vision (initialized below)
    this.weaponType = this.getWeaponTypeForElement();
  }
  
  getWeaponTypeForElement() {
    // Each element has a corresponding DOOM-style weapon
    switch (this.element) {
      case "Pyro":
        return "Shotgun";
      case "Hydro":
        return "PulseRifle";
      case "Electro":
        return "BFG";
      case "Anemo":
        return "RocketLauncher";
      case "Geo":
        return "Chainsaw";
      case "Cryo":
        return "PlasmaRifle";
      case "Dendro":
        return "SeedLauncher";
      default:
        return "Pistol";
    }
  }
  
  update(deltaTime) {
    // Update cooldowns
    if (this.skillCooldown > 0) {
      this.skillCooldown -= deltaTime;
    }
    
    if (this.burstCooldown > 0) {
      this.burstCooldown -= deltaTime;
    }
  }
  
  useSkill(world, player) {
    if (this.skillCooldown <= 0) {
      console.log(`Using ${this.element} Elemental Skill`);
      
      // Start cooldown
      this.skillCooldown = this.skillMaxCooldown;
      
      // Generate some energy
      this.addEnergy(10);
      
      // Implement element-specific skill behavior
      switch (this.element) {
        case "Pyro":
          return this.usePyroSkill(world, player);
        case "Hydro":
          return this.useHydroSkill(world, player);
        case "Electro":
          return this.useElectroSkill(world, player);
        case "Anemo":
          return this.useAnemoSkill(world, player);
        case "Geo":
          return this.useGeoSkill(world, player);
        case "Cryo":
          return this.useCryoSkill(world, player);
        case "Dendro":
          return this.useDendroSkill(world, player);
        default:
          return false;
      }
    }
    
    return false;
  }
  
  useBurst(world, player) {
    if (this.burstCooldown <= 0 && this.energy >= this.burstEnergyCost) {
      console.log(`Using ${this.element} Elemental Burst`);
      
      // Start cooldown and consume energy
      this.burstCooldown = this.burstMaxCooldown;
      this.energy = 0;
      
      // Implement element-specific burst behavior
      switch (this.element) {
        case "Pyro":
          return this.usePyroBurst(world, player);
        case "Hydro":
          return this.useHydroBurst(world, player);
        case "Electro":
          return this.useElectroBurst(world, player);
        case "Anemo":
          return this.useAnemoBurst(world, player);
        case "Geo":
          return this.useGeoBurst(world, player);
        case "Cryo":
          return this.useCryoBurst(world, player);
        case "Dendro":
          return this.useDendroBurst(world, player);
        default:
          return false;
      }
    }
    
    return false;
  }
  
  addEnergy(amount) {
    this.energy = Math.min(this.burstEnergyCost, this.energy + amount);
    return this.energy;
  }
  
  // Element-specific skill implementations
  
  usePyroSkill(world, player) {
    // Create a flame wave in front of the player
    const radius = 5;
    const damage = 25 * this.level;
    
    // Get facing direction
    const direction = player.rotation;
    
    // Get entities in front of player
    const entitiesInFront = world.getEntitiesInFrontOf(player, radius);
    
    // Apply damage and Pyro element
    for (const entity of entitiesInFront) {
      entity.takeDamage(damage);
      entity.applyElement("Pyro", this.elementalApplicationDuration);
      
      // Check for elemental reactions
      if (entity.hasElement && entity.hasElement("Hydro")) {
        world.triggerElementalReaction("Vaporize", entity, "Pyro", "Hydro");
      }
      if (entity.hasElement && entity.hasElement("Cryo")) {
        world.triggerElementalReaction("Melt", entity, "Pyro", "Cryo");
      }
      if (entity.hasElement && entity.hasElement("Electro")) {
        world.triggerElementalReaction("Overload", entity, "Pyro", "Electro");
      }
      if (entity.hasElement && entity.hasElement("Dendro")) {
        world.triggerElementalReaction("Burning", entity, "Pyro", "Dendro");
      }
    }
    
    // Set nearby wooden blocks on fire
    const playerPos = player.position;
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          const blockX = Math.floor(playerPos.x) + x;
          const blockY = Math.floor(playerPos.y) + y;
          const blockZ = Math.floor(playerPos.z) + z;
          
          const blockType = world.getBlock(blockX, blockY, blockZ);
          if (blockType === "wood" || blockType === "leaves") {
            world.setBlockOnFire(blockX, blockY, blockZ);
          }
        }
      }
    }
    
    return {
      success: true,
      element: this.element,
      type: "skill",
      damage: damage,
      radius: radius
    };
  }
  
  useHydroSkill(world, player) {
    // Create a water bubble trap
    const radius = 4;
    const damage = 15 * this.level;
    
    // Get entities around player
    const entitiesAround = world.getEntitiesInRadius(player.position, radius);
    
    // Apply damage and Hydro element, slow movement
    for (const entity of entitiesAround) {
      entity.takeDamage(damage);
      entity.applyElement("Hydro", this.elementalApplicationDuration);
      
      // Apply slow effect
      if (entity.applyStatus) {
        entity.applyStatus("slow", 5);
      }
      
      // Check for elemental reactions
      if (entity.hasElement && entity.hasElement("Pyro")) {
        world.triggerElementalReaction("Vaporize", entity, "Hydro", "Pyro");
      }
      if (entity.hasElement && entity.hasElement("Cryo")) {
        world.triggerElementalReaction("Freeze", entity, "Hydro", "Cryo");
      }
      if (entity.hasElement && entity.hasElement("Electro")) {
        world.triggerElementalReaction("ElectroCharged", entity, "Hydro", "Electro");
      }
      if (entity.hasElement && entity.hasElement("Dendro")) {
        world.triggerElementalReaction("Bloom", entity, "Hydro", "Dendro");
      }
    }
    
    return {
      success: true,
      element: this.element,
      type: "skill",
      damage: damage,
      radius: radius
    };
  }
  
  useElectroSkill(world, player) {
    // Create a chain lightning effect
    const damage = 20 * this.level;
    const chainRange = 8;
    const chainCount = 3;
    
    // Get facing direction
    const direction = player.rotation;
    
    // Find an initial target
    const ray = world.raycast(player.position, direction, 20);
    if (ray.hit && ray.entity) {
      let currentTarget = ray.entity;
      let chainedTargets = [currentTarget];
      
      // Apply damage and Electro element to first target
      currentTarget.takeDamage(damage);
      currentTarget.applyElement("Electro", this.elementalApplicationDuration);
      
      // Check for elemental reactions on first target
      if (currentTarget.hasElement && currentTarget.hasElement("Pyro")) {
        world.triggerElementalReaction("Overload", currentTarget, "Electro", "Pyro");
      }
      if (currentTarget.hasElement && currentTarget.hasElement("Hydro")) {
        world.triggerElementalReaction("ElectroCharged", currentTarget, "Electro", "Hydro");
      }
      if (currentTarget.hasElement && currentTarget.hasElement("Cryo")) {
        world.triggerElementalReaction("Superconduct", currentTarget, "Electro", "Cryo");
      }
      
      // Chain to nearby targets
      for (let i = 0; i < chainCount && chainedTargets.length < chainCount + 1; i++) {
        // Find nearby entities
        const nearbyEntities = world.getEntitiesInRadius(currentTarget.position, chainRange);
        
        // Filter out already chained targets
        const availableTargets = nearbyEntities.filter(entity => !chainedTargets.includes(entity));
        
        if (availableTargets.length > 0) {
          // Find closest target
          availableTargets.sort((a, b) => {
            const distA = Math.pow(a.position.x - currentTarget.position.x, 2) +
                          Math.pow(a.position.y - currentTarget.position.y, 2) +
                          Math.pow(a.position.z - currentTarget.position.z, 2);
            const distB = Math.pow(b.position.x - currentTarget.position.x, 2) +
                          Math.pow(b.position.y - currentTarget.position.y, 2) +
                          Math.pow(b.position.z - currentTarget.position.z, 2);
            return distA - distB;
          });
          
          // Chain to next target
          const nextTarget = availableTargets[0];
          chainedTargets.push(nextTarget);
          
          // Apply damage and Electro element
          nextTarget.takeDamage(damage * 0.7); // Reduced damage for chain targets
          nextTarget.applyElement("Electro", this.elementalApplicationDuration);
          
          // Check for elemental reactions
          if (nextTarget.hasElement && nextTarget.hasElement("Pyro")) {
            world.triggerElementalReaction("Overload", nextTarget, "Electro", "Pyro");
          }
          if (nextTarget.hasElement && nextTarget.hasElement("Hydro")) {
            world.triggerElementalReaction("ElectroCharged", nextTarget, "Electro", "Hydro");
          }
          if (nextTarget.hasElement && nextTarget.hasElement("Cryo")) {
            world.triggerElementalReaction("Superconduct", nextTarget, "Electro", "Cryo");
          }
          
          // Update current target for next chain
          currentTarget = nextTarget;
        } else {
          // No more targets to chain to
          break;
        }
      }
      
      return {
        success: true,
        element: this.element,
        type: "skill",
        damage: damage,
        chainRange: chainRange,
        chainCount: chainedTargets.length - 1 // Exclude first target
      };
    }
    
    return {
      success: false,
      reason: "No target hit"
    };
  }
  
  useAnemoSkill(world, player) {
    // Create a vacuum pull effect
    const radius = 10;
    const damage = 15 * this.level;
    const pullForce = 5;
    
    // Get entities around player
    const entitiesAround = world.getEntitiesInRadius(player.position, radius);
    
    // Apply damage and pull entities toward player
    for (const entity of entitiesAround) {
      entity.takeDamage(damage);
      
      // Calculate pull direction
      const direction = {
        x: player.position.x - entity.position.x,
        y: player.position.y - entity.position.y,
        z: player.position.z - entity.position.z
      };
      
      // Normalize
      const length = Math.sqrt(
        direction.x * direction.x +
        direction.y * direction.y +
        direction.z * direction.z
      );
      
      if (length > 0) {
        direction.x /= length;
        direction.y /= length;
        direction.z /= length;
        
        // Apply pull force
        if (entity.applyKnockback) {
          entity.applyKnockback(
            direction.x * pullForce,
            direction.y * pullForce,
            direction.z * pullForce
          );
        }
      }
      
      // Check for Swirl reactions
      if (entity.hasElement) {
        if (entity.hasElement("Pyro")) {
          world.triggerElementalReaction("Swirl", entity, "Anemo", "Pyro");
        }
        if (entity.hasElement("Hydro")) {
          world.triggerElementalReaction("Swirl", entity, "Anemo", "Hydro");
        }
        if (entity.hasElement("Electro")) {
          world.triggerElementalReaction("Swirl", entity, "Anemo", "Electro");
        }
        if (entity.hasElement("Cryo")) {
          world.triggerElementalReaction("Swirl", entity, "Anemo", "Cryo");
        }
      }
    }
    
    return {
      success: true,
      element: this.element,
      type: "skill",
      damage: damage,
      radius: radius,
      pullForce: pullForce
    };
  }
  
  useGeoSkill(world, player) {
    // Create a stone shield and ground spike attack
    const radius = 6;
    const damage = 25 * this.level;
    
    // Apply shield to player
    if (player.applyShield) {
      player.applyShield("geo", 50 * this.level, 15); // shield strength, duration in seconds
    }
    
    // Create ground spikes around player
    const playerPos = player.position;
    for (let angle = 0; angle < 360; angle += 30) {
      const radians = angle * Math.PI / 180;
      const distance = 3;
      
      const x = Math.floor(playerPos.x + Math.cos(radians) * distance);
      const y = Math.floor(playerPos.y);
      const z = Math.floor(playerPos.z + Math.sin(radians) * distance);
      
      // Create spike block (temporary)
      world.setBlock(x, y, z, "stone");
      world.setBlock(x, y + 1, z, "stone");
      
      // Schedule removal after 5 seconds
      setTimeout(() => {
        world.setBlock(x, y, z, "air");
        world.setBlock(x, y + 1, z, "air");
      }, 5000);
    }
    
    // Apply damage to entities around player
    const entitiesAround = world.getEntitiesInRadius(player.position, radius);
    
    for (const entity of entitiesAround) {
      entity.takeDamage(damage);
      
      // Check for Crystallize reactions
      if (entity.hasElement) {
        if (entity.hasElement("Pyro")) {
          world.triggerElementalReaction("Crystallize", entity, "Geo", "Pyro");
        }
        if (entity.hasElement("Hydro")) {
          world.triggerElementalReaction("Crystallize", entity, "Geo", "Hydro");
        }
        if (entity.hasElement("Electro")) {
          world.triggerElementalReaction("Crystallize", entity, "Geo", "Electro");
        }
        if (entity.hasElement("Cryo")) {
          world.triggerElementalReaction("Crystallize", entity, "Geo", "Cryo");
        }
      }
    }
    
    return {
      success: true,
      element: this.element,
      type: "skill",
      damage: damage,
      radius: radius,
      shieldStrength: 50 * this.level
    };
  }
  
  useCryoSkill(world, player) {
    // Create an ice mine that freezes enemies
    const radius = 5;
    const damage = 20 * this.level;
    
    // Get facing direction and position in front of player
    const direction = player.rotation;
    const distance = 5;
    
    const targetPos = {
      x: player.position.x + direction.x * distance,
      y: player.position.y,
      z: player.position.z + direction.z * distance
    };
    
    // Create ice block at target position
    const blockX = Math.floor(targetPos.x);
    const blockY = Math.floor(targetPos.y);
    const blockZ = Math.floor(targetPos.z);
    
    // Create ice mine (temporary ice block)
    world.setBlock(blockX, blockY, blockZ, "ice");
    
    // Schedule explosion after 2 seconds
    setTimeout(() => {
      // Remove ice block
      world.setBlock(blockX, blockY, blockZ, "air");
      
      // Apply damage and freeze in radius
      const entitiesInRadius = world.getEntitiesInRadius(targetPos, radius);
      
      for (const entity of entitiesInRadius) {
        entity.takeDamage(damage);
        entity.applyElement("Cryo", this.elementalApplicationDuration);
        
        // Apply slow effect
        if (entity.applyStatus) {
          entity.applyStatus("slow", 5);
        }
        
        // Check for elemental reactions
        if (entity.hasElement && entity.hasElement("Pyro")) {
          world.triggerElementalReaction("Melt", entity, "Cryo", "Pyro");
        }
        if (entity.hasElement && entity.hasElement("Hydro")) {
          world.triggerElementalReaction("Freeze", entity, "Cryo", "Hydro");
        }
        if (entity.hasElement && entity.hasElement("Electro")) {
          world.triggerElementalReaction("Superconduct", entity, "Cryo", "Electro");
        }
      }
      
      // Create ice effect on nearby water blocks
      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          for (let z = -radius; z <= radius; z++) {
            const bx = blockX + x;
            const by = blockY + y;
            const bz = blockZ + z;
            
            if (world.getBlock(bx, by, bz) === "water") {
              world.setBlock(bx, by, bz, "ice");
              
              // Schedule thaw after 10 seconds
              setTimeout(() => {
                if (world.getBlock(bx, by, bz) === "ice") {
                  world.setBlock(bx, by, bz, "water");
                }
              }, 10000);
            }
          }
        }
      }
    }, 2000);
    
    return {
      success: true,
      element: this.element,
      type: "skill",
      damage: damage,
      radius: radius,
      delayTime: 2
    };
  }
  
  useDendroSkill(world, player) {
    // Create a vine trap that entangles enemies
    const radius = 6;
    const damage = 15 * this.level;
    const duration = 5;
    
    // Get facing direction and position in front of player
    const direction = player.rotation;
    const distance = 5;
    
    const targetPos = {
      x: player.position.x + direction.x * distance,
      y: player.position.y,
      z: player.position.z + direction.z * distance
    };
    
    // Create temporary plant blocks in a circular pattern
    const tempBlocks = [];
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        // Skip corners for a more circular shape
        if (Math.abs(x) === 2 && Math.abs(z) === 2) continue;
        
        const blockX = Math.floor(targetPos.x) + x;
        const blockY = Math.floor(targetPos.y);
        const blockZ = Math.floor(targetPos.z) + z;
        
        // Store original block type
        const originalType = world.getBlock(blockX, blockY, blockZ);
        if (originalType === "air" || originalType === "water") {
          world.setBlock(blockX, blockY, blockZ, "leaves");
          tempBlocks.push({ x: blockX, y: blockY, z: blockZ, type: originalType });
        }
      }
    }
    
    // Apply damage and entangle effect to entities in radius
    const entitiesInRadius = world.getEntitiesInRadius(targetPos, radius);
    
    for (const entity of entitiesInRadius) {
      entity.takeDamage(damage);
      entity.applyElement("Dendro", this.elementalApplicationDuration);
      
      // Apply root/entangle effect
      if (entity.applyStatus) {
        entity.applyStatus("root", duration);
      }
      
      // Check for elemental reactions
      if (entity.hasElement && entity.hasElement("Pyro")) {
        world.triggerElementalReaction("Burning", entity, "Dendro", "Pyro");
      }
      if (entity.hasElement && entity.hasElement("Hydro")) {
        world.triggerElementalReaction("Bloom", entity, "Dendro", "Hydro");
      }
    }
    
    // Schedule removal of temporary blocks
    setTimeout(() => {
      for (const block of tempBlocks) {
        world.setBlock(block.x, block.y, block.z, block.type);
      }
    }, duration * 1000);
    
    return {
      success: true,
      element: this.element,
      type: "skill",
      damage: damage,
      radius: radius,
      duration: duration
    };
  }
  
  // Element-specific burst implementations
  // These would be similar to skills but more powerful
  usePyroBurst(world, player) {
    // Create a massive explosion
    const radius = 15;
    const damage = 100 * this.level;
    
    // Apply damage and Pyro element to all entities in radius
    const entitiesAround = world.getEntitiesInRadius(player.position, radius);
    
    for (const entity of entitiesAround) {
      entity.takeDamage(damage);
      entity.applyElement("Pyro", this.elementalApplicationDuration * 2);
      
      // Check for elemental reactions
      if (entity.hasElement) {
        if (entity.hasElement("Hydro")) {
          world.triggerElementalReaction("Vaporize", entity, "Pyro", "Hydro");
        }
        if (entity.hasElement("Cryo")) {
          world.triggerElementalReaction("Melt", entity, "Pyro", "Cryo");
        }
        if (entity.hasElement("Electro")) {
          world.triggerElementalReaction("Overload", entity, "Pyro", "Electro");
        }
        if (entity.hasElement("Dendro")) {
          world.triggerElementalReaction("Burning", entity, "Pyro", "Dendro");
        }
      }
    }
    
    // Set many blocks on fire
    const playerPos = player.position;
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius/2; y <= radius/2; y++) {
        for (let z = -radius; z <= radius; z++) {
          // Skip blocks that are too far (create a sphere)
          const distSq = x*x + y*y*4 + z*z;
          if (distSq > radius*radius) continue;
          
          const blockX = Math.floor(playerPos.x) + x;
          const blockY = Math.floor(playerPos.y) + y;
          const blockZ = Math.floor(playerPos.z) + z;
          
          const blockType = world.getBlock(blockX, blockY, blockZ);
          if (blockType === "wood" || blockType === "leaves") {
            world.setBlockOnFire(blockX, blockY, blockZ);
          }
        }
      }
    }
    
    return {
      success: true,
      element: this.element,
      type: "burst",
      damage: damage,
      radius: radius
    };
  }
  
  // Other burst implementations would follow a similar pattern
  // Not implementing all for brevity, but would include:
  // useHydroBurst, useElectroBurst, useAnemoBurst, useGeoBurst, useCryoBurst, useDendroBurst
}