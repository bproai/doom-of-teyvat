// Basic game engine

export class Engine {
  constructor() {
    this.entities = [];
    this.lastTimestamp = 0;
    this.isRunning = false;
    
    // Bind the gameLoop method to this instance
    this.gameLoop = this.gameLoop.bind(this);
  }
  
  start() {
    console.log("Engine starting...");
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.gameLoop);
  }
  
  stop() {
    console.log("Engine stopping...");
    this.isRunning = false;
  }
  
  gameLoop(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
    this.lastTimestamp = timestamp;
    
    // Update all entities
    this.update(deltaTime);
    
    // Render the scene
    this.render();
    
    // Continue the loop
    requestAnimationFrame(this.gameLoop);
  }
  
  update(deltaTime) {
    // Update all entities
    for (const entity of this.entities) {
      if (entity.update) {
        entity.update(deltaTime);
      }
    }
  }
  
  render() {
    // Render code will go here
    // For now it's just a placeholder
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
