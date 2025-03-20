// Elemental system for DOOM of Teyvat

export class ElementalSystem {
  constructor() {
    this.elements = [
      "Pyro",
      "Hydro",
      "Electro",
      "Anemo",
      "Geo",
      "Cryo",
      "Dendro"
    ];
    
    // Define elemental reactions
    this.reactions = {
      "Pyro+Hydro": this.triggerVaporize,
      "Hydro+Pyro": this.triggerVaporize,
      "Pyro+Cryo": this.triggerMelt,
      "Cryo+Pyro": this.triggerMelt,
      "Pyro+Electro": this.triggerOverload,
      "Electro+Pyro": this.triggerOverload,
      "Hydro+Cryo": this.triggerFreeze,
      "Cryo+Hydro": this.triggerFreeze,
      "Cryo+Electro": this.triggerSuperconduct,
      "Electro+Cryo": this.triggerSuperconduct,
      "Hydro+Electro": this.triggerElectroCharged,
      "Electro+Hydro": this.triggerElectroCharged,
      "Anemo+Pyro": this.triggerSwirl,
      "Anemo+Hydro": this.triggerSwirl,
      "Anemo+Electro": this.triggerSwirl,
      "Anemo+Cryo": this.triggerSwirl,
      "Geo+Pyro": this.triggerCrystallize,
      "Geo+Hydro": this.triggerCrystallize,
      "Geo+Electro": this.triggerCrystallize,
      "Geo+Cryo": this.triggerCrystallize,
      "Pyro+Dendro": this.triggerBurning,
      "Dendro+Pyro": this.triggerBurning,
      "Hydro+Dendro": this.triggerBloom,
      "Dendro+Hydro": this.triggerBloom
    };
  }
  
  triggerReaction(element1, element2, target) {
    const reactionKey = `${element1}+${element2}`;
    if (this.reactions[reactionKey]) {
      return this.reactions[reactionKey](target);
    }
    return null;
  }
  
  // Reaction implementations
  
  triggerVaporize(target) {
    console.log("Vaporize reaction triggered!");
    // Implement vaporize reaction (damage multiplier)
    return {
      type: "Vaporize",
      damageMultiplier: 2.0,
      visualEffect: "steam",
      soundEffect: "sizzle"
    };
  }
  
  triggerMelt(target) {
    console.log("Melt reaction triggered!");
    // Implement melt reaction (damage multiplier)
    return {
      type: "Melt",
      damageMultiplier: 1.5,
      visualEffect: "melting",
      soundEffect: "melt"
    };
  }
  
  triggerOverload(target) {
    console.log("Overload reaction triggered!");
    // Implement overload reaction (explosion)
    return {
      type: "Overload",
      explosionDamage: 40,
      radius: 5,
      knockback: true,
      visualEffect: "explosion",
      soundEffect: "boom"
    };
  }
  
  triggerFreeze(target) {
    console.log("Freeze reaction triggered!");
    // Implement freeze reaction (immobilize)
    return {
      type: "Freeze",
      duration: 5,
      visualEffect: "ice",
      soundEffect: "freeze"
    };
  }
  
  triggerSuperconduct(target) {
    console.log("Superconduct reaction triggered!");
    // Implement superconduct reaction (defense reduction)
    return {
      type: "Superconduct",
      defenseReduction: 0.5,
      duration: 8,
      areaDamage: 10,
      visualEffect: "electricIce",
      soundEffect: "crackle"
    };
  }
  
  triggerElectroCharged(target) {
    console.log("Electro-Charged reaction triggered!");
    // Implement electro-charged reaction (DoT + chain)
    return {
      type: "ElectroCharged",
      dotDamage: 5,
      ticks: 4,
      chainRange: 3,
      visualEffect: "lightning",
      soundEffect: "zap"
    };
  }
  
  triggerSwirl(target) {
    console.log("Swirl reaction triggered!");
    // Implement swirl reaction (spread element)
    return {
      type: "Swirl",
      spreadRadius: 8,
      spreadDamage: 15,
      visualEffect: "whirlwind",
      soundEffect: "whoosh"
    };
  }
  
  triggerCrystallize(target) {
    console.log("Crystallize reaction triggered!");
    // Implement crystallize reaction (create shield)
    return {
      type: "Crystallize",
      shieldHealth: 30,
      duration: 10,
      visualEffect: "crystal",
      soundEffect: "chime"
    };
  }
  
  triggerBurning(target) {
    console.log("Burning reaction triggered!");
    // Implement burning reaction (DoT)
    return {
      type: "Burning",
      dotDamage: 8,
      ticks: 6,
      visualEffect: "fire",
      soundEffect: "burn"
    };
  }
  
  triggerBloom(target) {
    console.log("Bloom reaction triggered!");
    // Implement bloom reaction (delayed explosion)
    return {
      type: "Bloom",
      seedDamage: 25,
      explosionDelay: 2,
      radius: 4,
      visualEffect: "sprouting",
      soundEffect: "pop"
    };
  }
}
