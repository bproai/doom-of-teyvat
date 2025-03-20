// UI Manager for DOOM of Teyvat

export class UIManager {
    constructor() {
      this.elements = {};
      this.visible = {
        hud: true,
        startScreen: false,
        pauseMenu: false,
        inventory: false,
        map: false,
        gameOver: false
      };
    }
    
    initialize() {
      console.log('Initializing UI manager...');
      
      // Create UI elements
      this.createUIElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('UI manager initialized');
    }
    
    createUIElements() {
      // Create container for UI elements
      const uiContainer = document.createElement('div');
      uiContainer.id = 'ui-container';
      uiContainer.style.position = 'absolute';
      uiContainer.style.top = '0';
      uiContainer.style.left = '0';
      uiContainer.style.width = '100%';
      uiContainer.style.height = '100%';
      uiContainer.style.pointerEvents = 'none'; // Allow clicks to pass through by default
      document.body.appendChild(uiContainer);
      
      // Create HUD
      this.elements.hud = this.createHUD();
      uiContainer.appendChild(this.elements.hud);
      
      // Create start screen
      this.elements.startScreen = this.createStartScreen();
      uiContainer.appendChild(this.elements.startScreen);
      this.elements.startScreen.style.display = 'none';
      
      // Create pause menu
      this.elements.pauseMenu = this.createPauseMenu();
      uiContainer.appendChild(this.elements.pauseMenu);
      this.elements.pauseMenu.style.display = 'none';
      
      // Create inventory
      this.elements.inventory = this.createInventory();
      uiContainer.appendChild(this.elements.inventory);
      this.elements.inventory.style.display = 'none';
      
      // Create map
      this.elements.map = this.createMap();
      uiContainer.appendChild(this.elements.map);
      this.elements.map.style.display = 'none';
      
      // Create game over screen
      this.elements.gameOver = this.createGameOverScreen();
      uiContainer.appendChild(this.elements.gameOver);
      this.elements.gameOver.style.display = 'none';
      
      // Create crosshair
      this.elements.crosshair = this.createCrosshair();
      uiContainer.appendChild(this.elements.crosshair);
    }
    
    setupEventListeners() {
      // Add event listeners for UI buttons
      const startButton = this.elements.startScreen.querySelector('#start-button');
      if (startButton) {
        startButton.addEventListener('click', () => {
          this.hideStartScreen();
          // Signal the engine to start the game
          document.dispatchEvent(new CustomEvent('startGame'));
        });
      }
      
      const resumeButton = this.elements.pauseMenu.querySelector('#resume-button');
      if (resumeButton) {
        resumeButton.addEventListener('click', () => {
          this.hidePauseMenu();
          // Signal the engine to resume the game
          document.dispatchEvent(new CustomEvent('resumeGame'));
        });
      }
      
      const restartButton = this.elements.gameOver.querySelector('#restart-button');
      if (restartButton) {
        restartButton.addEventListener('click', () => {
          this.hideGameOverScreen();
          // Signal the engine to restart the game
          document.dispatchEvent(new CustomEvent('restartGame'));
        });
      }
    }
    
    createHUD() {
      const hud = document.createElement('div');
      hud.id = 'hud';
      hud.style.position = 'absolute';
      hud.style.top = '0';
      hud.style.left = '0';
      hud.style.width = '100%';
      hud.style.height = '100%';
      hud.style.pointerEvents = 'none';
      
      // Health bar
      const healthBar = document.createElement('div');
      healthBar.id = 'health-bar';
      healthBar.style.position = 'absolute';
      healthBar.style.bottom = '20px';
      healthBar.style.left = '20px';
      healthBar.style.width = '200px';
      healthBar.style.height = '20px';
      healthBar.style.backgroundColor = '#333';
      healthBar.style.border = '2px solid #000';
      
      const healthFill = document.createElement('div');
      healthFill.id = 'health-fill';
      healthFill.style.width = '100%';
      healthFill.style.height = '100%';
      healthFill.style.backgroundColor = '#f00';
      healthBar.appendChild(healthFill);
      
      const healthText = document.createElement('div');
      healthText.id = 'health-text';
      healthText.style.position = 'absolute';
      healthText.style.top = '0';
      healthText.style.left = '0';
      healthText.style.width = '100%';
      healthText.style.textAlign = 'center';
      healthText.style.color = '#fff';
      healthText.style.fontFamily = 'Arial, sans-serif';
      healthText.style.fontSize = '14px';
      healthText.style.fontWeight = 'bold';
      healthText.style.textShadow = '1px 1px 0 #000';
      healthText.textContent = '100';
      healthBar.appendChild(healthText);
      
      hud.appendChild(healthBar);
      
      // Stamina bar
      const staminaBar = document.createElement('div');
      staminaBar.id = 'stamina-bar';
      staminaBar.style.position = 'absolute';
      staminaBar.style.bottom = '45px';
      staminaBar.style.left = '20px';
      staminaBar.style.width = '200px';
      staminaBar.style.height = '10px';
      staminaBar.style.backgroundColor = '#333';
      staminaBar.style.border = '2px solid #000';
      
      const staminaFill = document.createElement('div');
      staminaFill.id = 'stamina-fill';
      staminaFill.style.width = '100%';
      staminaFill.style.height = '100%';
      staminaFill.style.backgroundColor = '#0f0';
      staminaBar.appendChild(staminaFill);
      
      hud.appendChild(staminaBar);
      
      // Vision indicator
      const visionIndicator = document.createElement('div');
      visionIndicator.id = 'vision-indicator';
      visionIndicator.style.position = 'absolute';
      visionIndicator.style.bottom = '20px';
      visionIndicator.style.right = '20px';
      visionIndicator.style.width = '50px';
      visionIndicator.style.height = '50px';
      visionIndicator.style.backgroundColor = '#f00'; // Default to Pyro
      visionIndicator.style.border = '2px solid #000';
      visionIndicator.style.borderRadius = '50%';
      
      const visionText = document.createElement('div');
      visionText.id = 'vision-text';
      visionText.style.position = 'absolute';
      visionText.style.top = '0';
      visionText.style.left = '0';
      visionText.style.width = '100%';
      visionText.style.height = '100%';
      visionText.style.display = 'flex';
      visionText.style.justifyContent = 'center';
      visionText.style.alignItems = 'center';
      visionText.style.color = '#fff';
      visionText.style.fontFamily = 'Arial, sans-serif';
      visionText.style.fontSize = '20px';
      visionText.style.fontWeight = 'bold';
      visionText.style.textShadow = '1px 1px 0 #000';
      visionText.textContent = 'P';
      visionIndicator.appendChild(visionText);
      
      hud.appendChild(visionIndicator);
      
      // Position indicator
      const positionIndicator = document.createElement('div');
      positionIndicator.id = 'position-indicator';
      positionIndicator.style.position = 'absolute';
      positionIndicator.style.top = '10px';
      positionIndicator.style.left = '10px';
      positionIndicator.style.color = '#fff';
      positionIndicator.style.fontFamily = 'monospace';
      positionIndicator.style.fontSize = '12px';
      positionIndicator.style.textShadow = '1px 1px 0 #000';
      positionIndicator.textContent = 'X: 0, Y: 0, Z: 0';
      
      hud.appendChild(positionIndicator);
      
      return hud;
    }
    
    createCrosshair() {
      const crosshair = document.createElement('div');
      crosshair.id = 'crosshair';
      crosshair.style.position = 'absolute';
      crosshair.style.top = '50%';
      crosshair.style.left = '50%';
      crosshair.style.transform = 'translate(-50%, -50%)';
      crosshair.style.width = '20px';
      crosshair.style.height = '20px';
      crosshair.style.pointerEvents = 'none';
      
      // Horizontal line
      const horizontal = document.createElement('div');
      horizontal.style.position = 'absolute';
      horizontal.style.top = '50%';
      horizontal.style.left = '0';
      horizontal.style.width = '100%';
      horizontal.style.height = '2px';
      horizontal.style.backgroundColor = '#fff';
      horizontal.style.transform = 'translateY(-50%)';
      crosshair.appendChild(horizontal);
      
      // Vertical line
      const vertical = document.createElement('div');
      vertical.style.position = 'absolute';
      vertical.style.top = '0';
      vertical.style.left = '50%';
      vertical.style.width = '2px';
      vertical.style.height = '100%';
      vertical.style.backgroundColor = '#fff';
      vertical.style.transform = 'translateX(-50%)';
      crosshair.appendChild(vertical);
      
      return crosshair;
    }
    
    createStartScreen() {
      const startScreen = document.createElement('div');
      startScreen.id = 'start-screen';
      startScreen.style.position = 'absolute';
      startScreen.style.top = '0';
      startScreen.style.left = '0';
      startScreen.style.width = '100%';
      startScreen.style.height = '100%';
      startScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      startScreen.style.display = 'flex';
      startScreen.style.flexDirection = 'column';
      startScreen.style.justifyContent = 'center';
      startScreen.style.alignItems = 'center';
      startScreen.style.pointerEvents = 'auto';
      
      const title = document.createElement('h1');
      title.textContent = 'DOOM of Teyvat';
      title.style.color = '#f00';
      title.style.fontFamily = 'Impact, sans-serif';
      title.style.fontSize = '60px';
      title.style.textShadow = '0 0 10px #f00';
      title.style.marginBottom = '40px';
      startScreen.appendChild(title);
      
      const subtitle = document.createElement('h2');
      subtitle.textContent = 'The Blocky Adventure';
      subtitle.style.color = '#fff';
      subtitle.style.fontFamily = 'monospace';
      subtitle.style.fontSize = '24px';
      subtitle.style.marginBottom = '60px';
      startScreen.appendChild(subtitle);
      
      const startButton = document.createElement('button');
      startButton.id = 'start-button';
      startButton.textContent = 'Start Game';
      startButton.style.padding = '15px 30px';
      startButton.style.fontSize = '24px';
      startButton.style.backgroundColor = '#f00';
      startButton.style.color = '#fff';
      startButton.style.border = 'none';
      startButton.style.borderRadius = '5px';
      startButton.style.cursor = 'pointer';
      startButton.style.fontFamily = 'Arial, sans-serif';
      startButton.style.fontWeight = 'bold';
      startButton.style.textTransform = 'uppercase';
      startButton.style.transition = 'background-color 0.2s';
      
      startButton.addEventListener('mouseover', () => {
        startButton.style.backgroundColor = '#ff3333';
      });
      
      startButton.addEventListener('mouseout', () => {
        startButton.style.backgroundColor = '#f00';
      });
      
      startScreen.appendChild(startButton);
      
      const footer = document.createElement('p');
      footer.textContent = 'A parody game combining Genshin Impact, Minecraft, and DOOM';
      footer.style.color = '#aaa';
      footer.style.fontFamily = 'Arial, sans-serif';
      footer.style.fontSize = '14px';
      footer.style.marginTop = '60px';
      startScreen.appendChild(footer);
      
      return startScreen;
    }
    
    createPauseMenu() {
      const pauseMenu = document.createElement('div');
      pauseMenu.id = 'pause-menu';
      pauseMenu.style.position = 'absolute';
      pauseMenu.style.top = '0';
      pauseMenu.style.left = '0';
      pauseMenu.style.width = '100%';
      pauseMenu.style.height = '100%';
      pauseMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      pauseMenu.style.display = 'flex';
      pauseMenu.style.flexDirection = 'column';
      pauseMenu.style.justifyContent = 'center';
      pauseMenu.style.alignItems = 'center';
      pauseMenu.style.pointerEvents = 'auto';
      
      const title = document.createElement('h2');
      title.textContent = 'Paused';
      title.style.color = '#fff';
      title.style.fontFamily = 'Impact, sans-serif';
      title.style.fontSize = '48px';
      title.style.marginBottom = '40px';
      pauseMenu.appendChild(title);
      
      const buttonStyle = `
        padding: 12px 24px;
        margin: 10px;
        font-size: 18px;
        background-color: #555;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-weight: bold;
        text-transform: uppercase;
        transition: background-color 0.2s;
        width: 200px;
        text-align: center;
      `;
      
      const resumeButton = document.createElement('button');
      resumeButton.id = 'resume-button';
      resumeButton.textContent = 'Resume Game';
      resumeButton.style.cssText = buttonStyle;
      resumeButton.style.backgroundColor = '#0a0';
      
      resumeButton.addEventListener('mouseover', () => {
        resumeButton.style.backgroundColor = '#0c0';
      });
      
      resumeButton.addEventListener('mouseout', () => {
        resumeButton.style.backgroundColor = '#0a0';
      });
      
      pauseMenu.appendChild(resumeButton);
      
      const optionsButton = document.createElement('button');
      optionsButton.textContent = 'Options';
      optionsButton.style.cssText = buttonStyle;
      
      optionsButton.addEventListener('mouseover', () => {
        optionsButton.style.backgroundColor = '#777';
      });
      
      optionsButton.addEventListener('mouseout', () => {
        optionsButton.style.backgroundColor = '#555';
      });
      
      pauseMenu.appendChild(optionsButton);
      
      const mainMenuButton = document.createElement('button');
      mainMenuButton.textContent = 'Main Menu';
      mainMenuButton.style.cssText = buttonStyle;
      
      mainMenuButton.addEventListener('mouseover', () => {
        mainMenuButton.style.backgroundColor = '#777';
      });
      
      mainMenuButton.addEventListener('mouseout', () => {
        mainMenuButton.style.backgroundColor = '#555';
      });
      
      pauseMenu.appendChild(mainMenuButton);
      
      return pauseMenu;
    }
    
    createInventory() {
      const inventory = document.createElement('div');
      inventory.id = 'inventory';
      inventory.style.position = 'absolute';
      inventory.style.top = '50%';
      inventory.style.left = '50%';
      inventory.style.transform = 'translate(-50%, -50%)';
      inventory.style.width = '80%';
      inventory.style.height = '80%';
      inventory.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      inventory.style.border = '3px solid #555';
      inventory.style.borderRadius = '10px';
      inventory.style.padding = '20px';
      inventory.style.display = 'flex';
      inventory.style.flexDirection = 'column';
      inventory.style.pointerEvents = 'auto';
      
      const title = document.createElement('h2');
      title.textContent = 'Inventory';
      title.style.color = '#fff';
      title.style.fontFamily = 'Arial, sans-serif';
      title.style.textAlign = 'center';
      title.style.margin = '0 0 20px 0';
      inventory.appendChild(title);
      
      // Create tabs
      const tabs = document.createElement('div');
      tabs.style.display = 'flex';
      tabs.style.marginBottom = '20px';
      
      const tabStyle = `
        padding: 10px 20px;
        margin-right: 5px;
        background-color: #333;
        color: #fff;
        border: none;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        cursor: pointer;
        font-family: Arial, sans-serif;
      `;
      
      const tabNames = ['Items', 'Weapons', 'Visions', 'Blocks', 'Crafting'];
      
      tabNames.forEach(tabName => {
        const tab = document.createElement('button');
        tab.textContent = tabName;
        tab.style.cssText = tabStyle;
        tab.addEventListener('click', () => {
          // Handle tab switching
        });
        tabs.appendChild(tab);
      });
      
      inventory.appendChild(tabs);
      
      // Create content area
      const content = document.createElement('div');
      content.style.flex = '1';
      content.style.backgroundColor = '#222';
      content.style.borderRadius = '5px';
      content.style.padding = '15px';
      content.style.overflowY = 'auto';
      
      // Mock inventory items
      const itemsGrid = document.createElement('div');
      itemsGrid.style.display = 'grid';
      itemsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
      itemsGrid.style.gap = '10px';
      
      // Create some placeholder items
      for (let i = 0; i < 20; i++) {
        const item = document.createElement('div');
        item.style.width = '80px';
        item.style.height = '80px';
        item.style.backgroundColor = '#444';
        item.style.border = '2px solid #555';
        item.style.borderRadius = '5px';
        item.style.display = 'flex';
        item.style.justifyContent = 'center';
        item.style.alignItems = 'center';
        item.style.color = '#fff';
        item.style.fontFamily = 'Arial, sans-serif';
        item.style.fontSize = '12px';
        item.textContent = `Item ${i+1}`;
        
        itemsGrid.appendChild(item);
      }
      
      content.appendChild(itemsGrid);
      inventory.appendChild(content);
      
      // Close button
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.marginTop = '20px';
      closeButton.style.padding = '10px';
      closeButton.style.backgroundColor = '#555';
      closeButton.style.color = '#fff';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '5px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.alignSelf = 'flex-end';
      
      closeButton.addEventListener('click', () => {
        this.hideInventory();
        document.dispatchEvent(new CustomEvent('resumeGame'));
      });
      
      inventory.appendChild(closeButton);
      
      return inventory;
    }
    
    createMap() {
      const map = document.createElement('div');
      map.id = 'map';
      map.style.position = 'absolute';
      map.style.top = '50%';
      map.style.left = '50%';
      map.style.transform = 'translate(-50%, -50%)';
      map.style.width = '80%';
      map.style.height = '80%';
      map.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      map.style.border = '3px solid #555';
      map.style.borderRadius = '10px';
      map.style.padding = '20px';
      map.style.display = 'flex';
      map.style.flexDirection = 'column';
      map.style.pointerEvents = 'auto';
      
      const title = document.createElement('h2');
      title.textContent = 'Map';
      title.style.color = '#fff';
      title.style.fontFamily = 'Arial, sans-serif';
      title.style.textAlign = 'center';
      title.style.margin = '0 0 20px 0';
      map.appendChild(title);
      
      // Map content (placeholder)
      const content = document.createElement('div');
      content.style.flex = '1';
      content.style.backgroundColor = '#113322';
      content.style.borderRadius = '5px';
      content.style.position = 'relative';
      
      // Player marker
      const playerMarker = document.createElement('div');
      playerMarker.id = 'player-marker';
      playerMarker.style.position = 'absolute';
      playerMarker.style.top = '50%';
      playerMarker.style.left = '50%';
      playerMarker.style.width = '10px';
      playerMarker.style.height = '10px';
      playerMarker.style.backgroundColor = '#ff0';
      playerMarker.style.borderRadius = '50%';
      playerMarker.style.transform = 'translate(-50%, -50%)';
      content.appendChild(playerMarker);
      
      // Draw some grid lines
      for (let i = 0; i < 20; i++) {
        const xLine = document.createElement('div');
        xLine.style.position = 'absolute';
        xLine.style.top = `${5 + i * 5}%`;
        xLine.style.left = '0';
        xLine.style.width = '100%';
        xLine.style.height = '1px';
        xLine.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        content.appendChild(xLine);
        
        const yLine = document.createElement('div');
        yLine.style.position = 'absolute';
        yLine.style.top = '0';
        yLine.style.left = `${5 + i * 5}%`;
        yLine.style.width = '1px';
        yLine.style.height = '100%';
        yLine.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        content.appendChild(yLine);
      }
      
      map.appendChild(content);
      
      // Close button
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.style.marginTop = '20px';
      closeButton.style.padding = '10px';
      closeButton.style.backgroundColor = '#555';
      closeButton.style.color = '#fff';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '5px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.alignSelf = 'flex-end';
      
      closeButton.addEventListener('click', () => {
        this.hideMap();
        document.dispatchEvent(new CustomEvent('resumeGame'));
      });
      
      map.appendChild(closeButton);
      
      return map;
    }
    
    createGameOverScreen() {
      const gameOver = document.createElement('div');
      gameOver.id = 'game-over';
      gameOver.style.position = 'absolute';
      gameOver.style.top = '0';
      gameOver.style.left = '0';
      gameOver.style.width = '100%';
      gameOver.style.height = '100%';
      gameOver.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      gameOver.style.display = 'flex';
      gameOver.style.flexDirection = 'column';
      gameOver.style.justifyContent = 'center';
      gameOver.style.alignItems = 'center';
      gameOver.style.pointerEvents = 'auto';
      
      const title = document.createElement('h1');
      title.textContent = 'Game Over';
      title.style.color = '#f00';
      title.style.fontFamily = 'Impact, sans-serif';
      title.style.fontSize = '72px';
      title.style.marginBottom = '40px';
      title.style.textShadow = '0 0 10px #f00';
      gameOver.appendChild(title);
      
      const restartButton = document.createElement('button');
      restartButton.id = 'restart-button';
      restartButton.textContent = 'Try Again';
      restartButton.style.padding = '15px 30px';
      restartButton.style.fontSize = '24px';
      restartButton.style.backgroundColor = '#f00';
      restartButton.style.color = '#fff';
      restartButton.style.border = 'none';
      restartButton.style.borderRadius = '5px';
      restartButton.style.cursor = 'pointer';
      restartButton.style.fontFamily = 'Arial, sans-serif';
      restartButton.style.marginBottom = '20px';
      
      restartButton.addEventListener('mouseover', () => {
        restartButton.style.backgroundColor = '#ff3333';
      });
      
      restartButton.addEventListener('mouseout', () => {
        restartButton.style.backgroundColor = '#f00';
      });
      
      gameOver.appendChild(restartButton);
      
      const mainMenuButton = document.createElement('button');
      mainMenuButton.textContent = 'Main Menu';
      mainMenuButton.style.padding = '15px 30px';
      mainMenuButton.style.fontSize = '24px';
      mainMenuButton.style.backgroundColor = '#555';
      mainMenuButton.style.color = '#fff';
      mainMenuButton.style.border = 'none';
      mainMenuButton.style.borderRadius = '5px';
      mainMenuButton.style.cursor = 'pointer';
      mainMenuButton.style.fontFamily = 'Arial, sans-serif';
      
      mainMenuButton.addEventListener('mouseover', () => {
        mainMenuButton.style.backgroundColor = '#777';
      });
      
      mainMenuButton.addEventListener('mouseout', () => {
        mainMenuButton.style.backgroundColor = '#555';
      });
      
      gameOver.appendChild(mainMenuButton);
      
      return gameOver;
    }
    
    update(deltaTime, playerData) {
      if (!this.visible.hud) return;
      
      // Update health bar
      if (playerData.health) {
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        
        if (healthFill && healthText) {
          healthFill.style.width = `${playerData.health}%`;
          healthText.textContent = Math.floor(playerData.health);
        }
      }
      
      // Update stamina bar
      if (playerData.stamina) {
        const staminaFill = document.getElementById('stamina-fill');
        
        if (staminaFill) {
          staminaFill.style.width = `${playerData.stamina}%`;
        }
      }
      
      // Update vision indicator
      if (playerData.currentVision) {
        const visionIndicator = document.getElementById('vision-indicator');
        const visionText = document.getElementById('vision-text');
        
        if (visionIndicator && visionText) {
          const visionColors = [
            '#ff3300', // Pyro
            '#0088ff', // Hydro
            '#cc00ff', // Electro
            '#33ffcc', // Anemo
            '#ffcc00', // Geo
            '#99ffff', // Cryo
            '#33cc00'  // Dendro
          ];
          
          const visionSymbols = ['P', 'H', 'E', 'A', 'G', 'C', 'D'];
          
          visionIndicator.style.backgroundColor = visionColors[playerData.currentVision - 1];
          visionText.textContent = visionSymbols[playerData.currentVision - 1];
        }
      }
      
      // Update position indicator
      if (playerData.position) {
        const positionIndicator = document.getElementById('position-indicator');
        
        if (positionIndicator) {
          positionIndicator.textContent = `X: ${Math.floor(playerData.position.x)}, Y: ${Math.floor(playerData.position.y)}, Z: ${Math.floor(playerData.position.z)}`;
        }
      }
    }
    
    showStartScreen() {
      this.visible.startScreen = true;
      this.elements.startScreen.style.display = 'flex';
    }
    
    hideStartScreen() {
      this.visible.startScreen = false;
      this.elements.startScreen.style.display = 'none';
    }
    
    showPauseMenu() {
      this.visible.pauseMenu = true;
      this.elements.pauseMenu.style.display = 'flex';
    }
    
    hidePauseMenu() {
      this.visible.pauseMenu = false;
      this.elements.pauseMenu.style.display = 'none';
    }
    
    showInventory() {
      this.visible.inventory = true;
      this.elements.inventory.style.display = 'flex';
    }
    
    hideInventory() {
      this.visible.inventory = false;
      this.elements.inventory.style.display = 'none';
    }
    
    showMap() {
      this.visible.map = true;
      this.elements.map.style.display = 'flex';
    }
    
    hideMap() {
      this.visible.map = false;
      this.elements.map.style.display = 'none';
    }
    
    showGameOverScreen() {
      this.visible.gameOver = true;
      this.elements.gameOver.style.display = 'flex';
    }
    
    hideGameOverScreen() {
      this.visible.gameOver = false;
      this.elements.gameOver.style.display = 'none';
    }
    
    // Toggle UI visibility
    toggleHUD() {
      this.visible.hud = !this.visible.hud;
      this.elements.hud.style.display = this.visible.hud ? 'block' : 'none';
      this.elements.crosshair.style.display = this.visible.hud ? 'block' : 'none';
    }
    
    // Show a temporary message on screen
    showMessage(message, duration = 3000) {
      // Check if message container exists, create if not
      let messageContainer = document.getElementById('message-container');
      
      if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.style.position = 'absolute';
        messageContainer.style.top = '20%';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translateX(-50%)';
        messageContainer.style.padding = '10px 20px';
        messageContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageContainer.style.color = '#fff';
        messageContainer.style.fontFamily = 'Arial, sans-serif';
        messageContainer.style.fontSize = '18px';
        messageContainer.style.borderRadius = '5px';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.pointerEvents = 'none';
        messageContainer.style.transition = 'opacity 0.3s';
        document.getElementById('ui-container').appendChild(messageContainer);
      }
      
      // Set message
      messageContainer.textContent = message;
      messageContainer.style.opacity = '1';
      
      // Clear any existing timeout
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }
      
      // Hide message after duration
      this.messageTimeout = setTimeout(() => {
        messageContainer.style.opacity = '0';
      }, duration);
    }
    
    // Create a hotbar for quick item/block selection
    createHotbar() {
      const hotbar = document.createElement('div');
      hotbar.id = 'hotbar';
      hotbar.style.position = 'absolute';
      hotbar.style.bottom = '10px';
      hotbar.style.left = '50%';
      hotbar.style.transform = 'translateX(-50%)';
      hotbar.style.display = 'flex';
      hotbar.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      hotbar.style.padding = '5px';
      hotbar.style.borderRadius = '5px';
      
      // Create hotbar slots
      for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.id = `hotbar-slot-${i}`;
        slot.style.width = '40px';
        slot.style.height = '40px';
        slot.style.margin = '0 2px';
        slot.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
        slot.style.border = i === 0 ? '2px solid #fff' : '2px solid #555';
        slot.style.borderRadius = '3px';
        
        hotbar.appendChild(slot);
      }
      
      return hotbar;
    }
    
    // Updates the currently selected hotbar slot
    updateHotbarSelection(index) {
      for (let i = 0; i < 9; i++) {
        const slot = document.getElementById(`hotbar-slot-${i}`);
        if (slot) {
          slot.style.border = i === index ? '2px solid #fff' : '2px solid #555';
        }
      }
    }
    
    // Add element to the hotbar
    addHotbarItem(index, itemType) {
      const slot = document.getElementById(`hotbar-slot-${index}`);
      if (slot) {
        // Clear existing content
        slot.innerHTML = '';
        
        // Add item icon
        const icon = document.createElement('div');
        icon.style.width = '100%';
        icon.style.height = '100%';
        icon.style.display = 'flex';
        icon.style.justifyContent = 'center';
        icon.style.alignItems = 'center';
        
        // Set icon based on item type
        switch (itemType) {
          case 'dirt':
            icon.style.backgroundColor = '#553300';
            break;
          case 'stone':
            icon.style.backgroundColor = '#888888';
            break;
          case 'grass':
            icon.style.backgroundColor = '#338833';
            break;
          case 'wood':
            icon.style.backgroundColor = '#885522';
            break;
          case 'leaves':
            icon.style.backgroundColor = '#226622';
            break;
          case 'water':
            icon.style.backgroundColor = '#2233aa';
            icon.style.opacity = '0.7';
            break;
          default:
            icon.textContent = itemType.charAt(0).toUpperCase();
            icon.style.color = '#fff';
            icon.style.fontFamily = 'Arial, sans-serif';
            icon.style.fontSize = '18px';
            icon.style.fontWeight = 'bold';
        }
        
        slot.appendChild(icon);
      }
    }
    
    // Show a tooltip
    showTooltip(text, x, y) {
      let tooltip = document.getElementById('tooltip');
      
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.padding = '5px 10px';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = '#fff';
        tooltip.style.fontFamily = 'Arial, sans-serif';
        tooltip.style.fontSize = '14px';
        tooltip.style.borderRadius = '3px';
        tooltip.style.zIndex = '2000';
        tooltip.style.pointerEvents = 'none';
        document.getElementById('ui-container').appendChild(tooltip);
      }
      
      tooltip.textContent = text;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.display = 'block';
    }
    
    // Hide tooltip
    hideTooltip() {
      const tooltip = document.getElementById('tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';
      }
    }
  }