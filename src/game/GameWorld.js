// Game world for DOOM of Teyvat

export class GameWorld {
  constructor() {
    // Core world properties
    this.chunks = {};
    this.entities = [];
    this.projectiles = [];
    this.seed = Math.floor(Math.random() * 1000000);
    this.chunkSize = 16; // 16x16x16 blocks per chunk
    this.worldHeight = 256;
    
    // World generation settings
    this.seaLevel = 64;
    this.mountainScale = 100;
    this.noiseScale = 0.01;
    
    // Active blocks that need updating
    this.activeBlocks = new Map(); // Map of positions to block data that needs updating
    
    // Block types and properties
    this.blockProperties = {
      'air': { solid: false, transparent: true, gravity: false },
      'dirt': { solid: true, transparent: false, gravity: false },
      'grass': { solid: true, transparent: false, gravity: false },
      'stone': { solid: true, transparent: false, gravity: false },
      'wood': { solid: true, transparent: false, gravity: false, flammable: true },
      'leaves': { solid: true, transparent: true, gravity: false, flammable: true },
      'water': { solid: false, transparent: true, gravity: true, liquid: true },
      'lava': { solid: false, transparent: true, gravity: true, liquid: true, damaging: true },
      'fire': { solid: false, transparent: true, gravity: false, light: 15, damaging: true }
    };
    
    // Loaded chunks for rendering
    this.loadedChunks = new Set();
    
    // Block updates queue
    this.blockUpdateQueue = [];
    
    // Constants
    this.RENDER_DISTANCE = 8; // Chunks
    this.GRAVITY = 9.8;
    this.TICK_RATE = 20; // Ticks per second
  }
  
  initialize() {
    console.log("Initializing game world with seed:", this.seed);
    this.generateTerrain();
  }
  
  update(deltaTime) {
    // Update all entities
    for (const entity of this.entities) {
      if (entity.update) {
        entity.update(deltaTime);
      }
    }
    
    // Update all projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);
      
      // Check if projectile has expired
      if (projectile.lifetime <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check for collisions
      const hit = this.checkProjectileCollision(projectile);
      if (hit) {
        if (hit.entity) {
          // Hit an entity
          hit.entity.takeDamage(projectile.damage, projectile.element);
        } else if (hit.position) {
          // Hit a block
          this.handleProjectileBlockImpact(projectile, hit.position, hit.normal);
        }
        
        // Remove the projectile
        this.projectiles.splice(i, 1);
      }
    }
    
    // Process blocks that need updating (like liquids, fire)
    this.updateBlockPhysics(deltaTime);
    
    // Process block update queue
    this.processBlockUpdateQueue();
  }
  
  generateTerrain() {
    console.log("Generating terrain...");
    
    // In a real implementation, this would create actual terrain
    // For now, we'll just create a flat world with some random hills
    
    // Generate chunks around spawn
    for (let x = -this.RENDER_DISTANCE; x <= this.RENDER_DISTANCE; x++) {
      for (let z = -this.RENDER_DISTANCE; z <= this.RENDER_DISTANCE; z++) {
        this.generateChunk(x, 0, z);
      }
    }
  }
  
  generateChunk(chunkX, chunkY, chunkZ) {
    const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
    
    // Don't regenerate existing chunks
    if (this.chunks[chunkKey]) {
      return;
    }
    
    // Create new chunk
    const chunk = {
      x: chunkX,
      y: chunkY,
      z: chunkZ,
      blocks: this.createEmptyChunkBlocks()
    };
    
    // Fill chunk with blocks based on noise
    this.fillChunkTerrain(chunk);
    
    // Store chunk
    this.chunks[chunkKey] = chunk;
    this.loadedChunks.add(chunkKey);
    
    // Return the generated chunk
    return chunk;
  }
  
  createEmptyChunkBlocks() {
    const blocks = Array(this.chunkSize);
    
    for (let x = 0; x < this.chunkSize; x++) {
      blocks[x] = Array(this.chunkSize);
      for (let y = 0; y < this.chunkSize; y++) {
        blocks[x][y] = Array(this.chunkSize).fill('air');
      }
    }
    
    return blocks;
  }
  
  fillChunkTerrain(chunk) {
    // In a real implementation, we would use noise functions
    // For the prototype, we'll create a simple flat terrain with some random hills
    
    for (let x = 0; x < this.chunkSize; x++) {
      for (let z = 0; z < this.chunkSize; z++) {
        // Calculate world coordinates
        const worldX = chunk.x * this.chunkSize + x;
        const worldZ = chunk.z * this.chunkSize + z;
        
        // Generate a simple height using sine waves
        const height = Math.floor(
          this.seaLevel + 
          Math.sin(worldX * 0.1) * 5 + 
          Math.cos(worldZ * 0.1) * 5 +
          Math.sin(worldX * 0.05 + worldZ * 0.05) * 10
        );
        
        // Ensure height is within chunk
        const localHeight = Math.min(height - chunk.y * this.chunkSize, this.chunkSize);
        
        // Fill blocks in the chunk
        for (let y = 0; y < this.chunkSize; y++) {
          const worldY = chunk.y * this.chunkSize + y;
          
          if (worldY < height) {
            if (worldY === height - 1) {
              // Top layer is grass
              chunk.blocks[x][y][z] = 'grass';
            } else if (worldY > height - 5) {
              // A few layers of dirt
              chunk.blocks[x][y][z] = 'dirt';
            } else {
              // Everything else is stone
              chunk.blocks[x][y][z] = 'stone';
            }
          } else if (worldY < this.seaLevel) {
            // Water up to sea level
            chunk.blocks[x][y][z] = 'water';
          } else {
            // Air above
            chunk.blocks[x][y][z] = 'air';
          }
        }
      }
    }
    
    // Add some trees
    this.addTreesToChunk(chunk);
  }
  
  addTreesToChunk(chunk) {
    const treeChance = 0.01;
    const treeHeight = 5;
    
    for (let x = 2; x < this.chunkSize - 2; x++) {
      for (let z = 2; z < this.chunkSize - 2; z++) {
        // Only place trees on grass blocks
        for (let y = 0; y < this.chunkSize; y++) {
          if (chunk.blocks[x][y][z] === 'grass' && Math.random() < treeChance) {
            // Check if there's enough space above for tree
            let hasSpace = true;
            for (let i = 1; i <= treeHeight; i++) {
              if (y + i >= this.chunkSize) {
                hasSpace = false;
                break;
              }
            }
            
            if (hasSpace) {
              // Create trunk
              for (let i = 1; i <= treeHeight - 2; i++) {
                chunk.blocks[x][y + i][z] = 'wood';
              }
              
              // Create leaves
              for (let lx = -2; lx <= 2; lx++) {
                for (let ly = treeHeight - 2; ly <= treeHeight; ly++) {
                  for (let lz = -2; lz <= 2; lz++) {
                    // Skip corners for a more rounded look
                    if (Math.abs(lx) === 2 && Math.abs(lz) === 2) continue;
                    
                    // Skip trunk positions
                    if (lx === 0 && lz === 0 && ly < treeHeight) continue;
                    
                    // Place leaf if within chunk bounds
                    const nx = x + lx;
                    const ny = y + ly;
                    const nz = z + lz;
                    
                    if (nx >= 0 && nx < this.chunkSize && 
                        ny >= 0 && ny < this.chunkSize && 
                        nz >= 0 && nz < this.chunkSize) {
                      chunk.blocks[nx][ny][nz] = 'leaves';
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  updateBlockPhysics(deltaTime) {
    // Process active blocks (like liquids and fire)
    for (const [posKey, blockData] of this.activeBlocks.entries()) {
      const [x, y, z] = posKey.split(',').map(Number);
      const blockType = blockData.type;
      
      if (blockType === 'water' || blockType === 'lava') {
        this.updateLiquid(x, y, z, blockType);
      } else if (blockType === 'fire') {
        this.updateFire(x, y, z, deltaTime);
      }
    }
  }
  
  updateLiquid(x, y, z, liquidType) {
    // Check block below
    if (this.getBlock(x, y - 1, z) === 'air') {
      // Flow downward
      this.setBlock(x, y - 1, z, liquidType);
      this.queueBlockUpdate(x, y - 1, z);
    } else {
      // Try to flow horizontally
      const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1]
      ];
      
      for (const [dx, dz] of directions) {
        if (this.getBlock(x + dx, y, z + dz) === 'air') {
          this.setBlock(x + dx, y, z + dz, liquidType);
          this.queueBlockUpdate(x + dx, y, z + dz);
        }
      }
    }
  }
  
  updateFire(x, y, z, deltaTime) {
    // Decrease lifetime
    const blockData = this.activeBlocks.get(`${x},${y},${z}`);
    blockData.lifetime -= deltaTime;
    
    // Extinguish if lifetime is up
    if (blockData.lifetime <= 0) {
      this.setBlock(x, y, z, 'air');
      this.activeBlocks.delete(`${x},${y},${z}`);
      return;
    }
    
    // Chance to spread fire
    if (Math.random() < 0.1 * deltaTime) {
      const directions = [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
      ];
      
      for (const [dx, dy, dz] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;
        
        const neighborBlock = this.getBlock(nx, ny, nz);
        const properties = this.blockProperties[neighborBlock];
        
        if (properties && properties.flammable) {
          // Set the block on fire
          this.setBlockOnFire(nx, ny, nz);
        }
      }
    }
  }
  
  setBlockOnFire(x, y, z) {
    const blockType = this.getBlock(x, y, z);
    const properties = this.blockProperties[blockType];
    
    if (properties && properties.flammable) {
      // Replace the block with fire
      this.setBlock(x, y, z, 'fire');
      
      // Add to active blocks with a lifetime
      this.activeBlocks.set(`${x},${y},${z}`, {
        type: 'fire',
        lifetime: 30 + Math.random() * 30 // 30-60 seconds
      });
    }
  }
  
  processBlockUpdateQueue() {
    // Process up to 100 block updates per frame to avoid performance issues
    const processCount = Math.min(this.blockUpdateQueue.length, 100);
    
    for (let i = 0; i < processCount; i++) {
      const update = this.blockUpdateQueue.shift();
      const [x, y, z] = update;
      
      const blockType = this.getBlock(x, y, z);
      const properties = this.blockProperties[blockType];
      
      if (properties) {
        if (properties.liquid) {
          // Mark as active block for continuous updates
          this.activeBlocks.set(`${x},${y},${z}`, { type: blockType });
        }
        
        if (properties.gravity) {
          // Check if block can fall
          if (this.getBlock(x, y - 1, z) === 'air') {
            this.setBlock(x, y, z, 'air');
            this.setBlock(x, y - 1, z, blockType);
            this.queueBlockUpdate(x, y - 1, z);
          }
        }
      }
    }
  }
  
  queueBlockUpdate(x, y, z) {
    this.blockUpdateQueue.push([x, y, z]);
  }
  
  setBlock(x, y, z, blockType) {
    // Calculate chunk coordinates
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkY = Math.floor(y / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    
    // Calculate local coordinates within chunk
    const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
    const localY = ((y % this.chunkSize) + this.chunkSize) % this.chunkSize;
    const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;
    
    // Get or create chunk
    const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
    let chunk = this.chunks[chunkKey];
    
    if (!chunk) {
      chunk = this.generateChunk(chunkX, chunkY, chunkZ);
    }
    
    // Set block in chunk
    chunk.blocks[localX][localY][localZ] = blockType;
    
    // If the block has physics properties, add it to active blocks
    const properties = this.blockProperties[blockType];
    if (properties) {
      if (properties.liquid || blockType === 'fire') {
        this.activeBlocks.set(`${x},${y},${z}`, { 
          type: blockType,
          lifetime: blockType === 'fire' ? 30 : null
        });
      }
    } else {
      // If replacing an active block with something inactive, remove from active blocks
      this.activeBlocks.delete(`${x},${y},${z}`);
    }
    
    // Queue updates for adjacent blocks
    this.queueBlockUpdate(x, y - 1, z); // Below
    this.queueBlockUpdate(x, y + 1, z); // Above
    this.queueBlockUpdate(x - 1, y, z); // West
    this.queueBlockUpdate(x + 1, y, z); // East
    this.queueBlockUpdate(x, y, z - 1); // North
    this.queueBlockUpdate(x, y, z + 1); // South
    
    return true;
  }
  
  getBlock(x, y, z) {
    // Calculate chunk coordinates
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkY = Math.floor(y / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    
    // Calculate local coordinates within chunk
    const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
    const localY = ((y % this.chunkSize) + this.chunkSize) % this.chunkSize;
    const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;
    
    // Get chunk
    const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
    const chunk = this.chunks[chunkKey];
    
    // Return block type or 'air' if chunk doesn't exist
    return chunk ? chunk.blocks[localX][localY][localZ] : 'air';
  }
  
  getBlockProperties(x, y, z) {
    const blockType = this.getBlock(x, y, z);
    return this.blockProperties[blockType] || this.blockProperties['air'];
  }
  
  raycast(origin, direction, maxDistance = 100) {
    // Implement simple raycast for block selection
    let position = { ...origin };
    const step = 0.1;
    
    for (let distance = 0; distance < maxDistance; distance += step) {
      position.x = origin.x + direction.x * distance;
      position.y = origin.y + direction.y * distance;
      position.z = origin.z + direction.z * distance;
      
      const blockX = Math.floor(position.x);
      const blockY = Math.floor(position.y);
      const blockZ = Math.floor(position.z);
      
      const blockType = this.getBlock(blockX, blockY, blockZ);
      const properties = this.blockProperties[blockType];
      
      if (properties && properties.solid) {
        // Calculate hit normal (which face was hit)
        const normal = this.calculateHitNormal(position);
        
        return {
          hit: true,
          position: { x: blockX, y: blockY, z: blockZ },
          distance,
          normal,
          blockType
        };
      }
    }
    
    return { hit: false };
  }
  
  calculateHitNormal(position) {
    // Figure out which face of the block was hit by finding closest plane
    const blockX = Math.floor(position.x);
    const blockY = Math.floor(position.y);
    const blockZ = Math.floor(position.z);
    
    const distToXPlane = Math.min(position.x - blockX, blockX + 1 - position.x);
    const distToYPlane = Math.min(position.y - blockY, blockY + 1 - position.y);
    const distToZPlane = Math.min(position.z - blockZ, blockZ + 1 - position.z);
    
    if (distToXPlane <= distToYPlane && distToXPlane <= distToZPlane) {
      return { x: position.x - blockX < 0.5 ? -1 : 1, y: 0, z: 0 };
    } else if (distToYPlane <= distToXPlane && distToYPlane <= distToZPlane) {
      return { x: 0, y: position.y - blockY < 0.5 ? -1 : 1, z: 0 };
    } else {
      return { x: 0, y: 0, z: position.z - blockZ < 0.5 ? -1 : 1 };
    }
  }
  
  checkProjectileCollision(projectile) {
    // Check collision with blocks
    const raycastResult = this.raycast(
      projectile.previousPosition,
      {
        x: projectile.position.x - projectile.previousPosition.x,
        y: projectile.position.y - projectile.previousPosition.y,
        z: projectile.position.z - projectile.previousPosition.z
      },
      Math.sqrt(
        Math.pow(projectile.position.x - projectile.previousPosition.x, 2) +
        Math.pow(projectile.position.y - projectile.previousPosition.y, 2) +
        Math.pow(projectile.position.z - projectile.previousPosition.z, 2)
      )
    );
    
    if (raycastResult.hit) {
      return raycastResult;
    }
    
    // Check collision with entities
    for (const entity of this.entities) {
      if (entity.position && entity.dimensions) {
        // Simple AABB collision detection
        if (
          projectile.position.x >= entity.position.x - entity.dimensions.x / 2 &&
          projectile.position.x <= entity.position.x + entity.dimensions.x / 2 &&
          projectile.position.y >= entity.position.y - entity.dimensions.y / 2 &&
          projectile.position.y <= entity.position.y + entity.dimensions.y / 2 &&
          projectile.position.z >= entity.position.z - entity.dimensions.z / 2 &&
          projectile.position.z <= entity.position.z + entity.dimensions.z / 2
        ) {
          return {
            hit: true,
            entity,
            position: projectile.position,
            distance: Math.sqrt(
              Math.pow(projectile.position.x - projectile.previousPosition.x, 2) +
              Math.pow(projectile.position.y - projectile.previousPosition.y, 2) +
              Math.pow(projectile.position.z - projectile.previousPosition.z, 2)
            )
          };
        }
      }
    }
    
    return { hit: false };
  }
  
  handleProjectileBlockImpact(projectile, position, normal) {
    // Handle different elemental effects on blocks
    if (projectile.element === 'Pyro') {
      // Fire element can set blocks on fire
      const blockX = position.x;
      const blockY = position.y;
      const blockZ = position.z;
      
      const blockType = this.getBlock(blockX, blockY, blockZ);
      const properties = this.blockProperties[blockType];
      
      if (properties && properties.flammable) {
        this.setBlockOnFire(blockX, blockY, blockZ);
      }
    } else if (projectile.element === 'Hydro') {
      // Water element can extinguish fire
      const blockX = position.x;
      const blockY = position.y;
      const blockZ = position.z;
      
      if (this.getBlock(blockX, blockY, blockZ) === 'fire') {
        this.setBlock(blockX, blockY, blockZ, 'air');
      }
    } else if (projectile.element === 'Electro') {
      // Electric element can create chain lightning
      // For now, just create a visual effect
    } else if (projectile.element === 'Cryo') {
      // Ice element can freeze water
      const blockX = position.x;
      const blockY = position.y;
      const blockZ = position.z;
      
      if (this.getBlock(blockX, blockY, blockZ) === 'water') {
        this.setBlock(blockX, blockY, blockZ, 'ice');
      }
    } else if (projectile.element === 'Anemo') {
      // Wind element can create push effect
      // For now, just create a visual effect
    } else if (projectile.element === 'Geo') {
      // Earth element can strengthen blocks
      // For now, just create a visual effect
    }
  }
  
  loadChunksAroundPlayer(playerPosition, renderDistance) {
    // Calculate current chunk
    const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
    const playerChunkY = Math.floor(playerPosition.y / this.chunkSize);
    const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);
    
    // Track which chunks should be kept loaded
    const chunksToKeep = new Set();
    
    // Load chunks in render distance
    for (let x = playerChunkX - renderDistance; x <= playerChunkX + renderDistance; x++) {
      for (let y = Math.max(0, playerChunkY - 1); y <= playerChunkY + 1; y++) {
        for (let z = playerChunkZ - renderDistance; z <= playerChunkZ + renderDistance; z++) {
          const chunkKey = `${x},${y},${z}`;
          chunksToKeep.add(chunkKey);
          
          // Generate chunk if it doesn't exist
          if (!this.chunks[chunkKey]) {
            this.generateChunk(x, y, z);
          }
        }
      }
    }
    
    // Unload chunks outside render distance
    for (const chunkKey of this.loadedChunks) {
      if (!chunksToKeep.has(chunkKey)) {
        // In a real implementation, we would store chunks to disk
        // For the prototype, we'll just remove them from memory
        delete this.chunks[chunkKey];
        this.loadedChunks.delete(chunkKey);
      }
    }
    
    // Update loaded chunks
    for (const chunkKey of chunksToKeep) {
      this.loadedChunks.add(chunkKey);
    }
  }
  
  addEntity(entity) {
    this.entities.push(entity);
    return entity;
  }
  
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      return true;
    }
    return false;
  }
  
  addProjectile(projectile) {
    this.projectiles.push(projectile);
    return projectile;
  }
  
  getEntitiesInRadius(position, radius) {
    return this.entities.filter(entity => {
      if (!entity.position) return false;
      
      const distanceSquared = 
        Math.pow(entity.position.x - position.x, 2) +
        Math.pow(entity.position.y - position.y, 2) +
        Math.pow(entity.position.z - position.z, 2);
      
      return distanceSquared <= radius * radius;
    });
  }
  
  getChunksData() {
    // Return data for renderer
    const chunksData = [];
    
    for (const chunkKey of this.loadedChunks) {
      const chunk = this.chunks[chunkKey];
      
      // Skip undefined chunks
      if (!chunk) continue;
      
      chunksData.push({
        x: chunk.x,
        y: chunk.y,
        z: chunk.z,
        blocks: chunk.blocks
      });
    }
    
    return chunksData;
  }

  addBlock(position, blockType) {
    // Create or get the correct chunk based on the position
    const chunkKey = `${Math.floor(position.x / this.chunkSize)},${Math.floor(position.y / this.chunkSize)},${Math.floor(position.z / this.chunkSize)}`;
    let chunk = this.chunks[chunkKey];
    if (!chunk) {
      chunk = this.generateChunk(Math.floor(position.x / this.chunkSize), Math.floor(position.y / this.chunkSize), Math.floor(position.z / this.chunkSize));
    }
    
    // Convert the world position to local chunk coordinates
    const localX = Math.abs(position.x % this.chunkSize);
    const localY = Math.abs(position.y % this.chunkSize);
    const localZ = Math.abs(position.z % this.chunkSize);
    
    // Place the block in the chunk's block array
    chunk.blocks[localX][localY][localZ] = blockType;
    
    // Optionally, update the renderer to show the new block
    if (this.renderer) {
      this.renderer.addVoxelBlock(position.x, position.y, position.z, blockType);
    }
    
    console.log(`Placed block '${blockType}' at (${position.x}, ${position.y}, ${position.z})`);
  }  

}