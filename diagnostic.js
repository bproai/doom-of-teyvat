// Diagnostics for DOOM of Teyvat
console.log("Diagnostic script loaded!");

// Create global diagnostic display
const createDiagDisplay = () => {
  const diagElement = document.createElement('div');
  diagElement.id = 'diagnostic-display';
  diagElement.style.position = 'fixed';
  diagElement.style.top = '10px';
  diagElement.style.left = '10px';
  diagElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
  diagElement.style.color = '#fff';
  diagElement.style.padding = '10px';
  diagElement.style.fontFamily = 'monospace';
  diagElement.style.fontSize = '12px';
  diagElement.style.zIndex = '9999';
  diagElement.style.maxWidth = '400px';
  diagElement.style.maxHeight = '400px';
  diagElement.style.overflow = 'auto';
  diagElement.style.whiteSpace = 'pre';
  document.body.appendChild(diagElement);
  return diagElement;
};

// Initialize diagnostic display
const diagDisplay = createDiagDisplay();

// Log to both console and diagnostic display
window.diagLog = function(message) {
  console.log(message);
  
  // Create timestamp
  const now = new Date();
  const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
  
  // Add to display
  diagDisplay.innerHTML += `[${timestamp}] ${message}\n`;
  
  // Limit log size
  if (diagDisplay.innerHTML.length > 5000) {
    diagDisplay.innerHTML = diagDisplay.innerHTML.substring(diagDisplay.innerHTML.length - 5000);
  }
  
  // Auto-scroll to bottom
  diagDisplay.scrollTop = diagDisplay.scrollHeight;
};

// Create test button for block placement
const createTestButton = () => {
  const button = document.createElement('button');
  button.textContent = 'Place Test Block';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.padding = '10px';
  button.style.backgroundColor = '#f00';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.zIndex = '9999';
  document.body.appendChild(button);
  
  // Add event listener
  button.addEventListener('click', () => {
    // Attempt to place block via custom event
    diagLog('Test button clicked - dispatching placeBlock event');
    document.dispatchEvent(new CustomEvent('placeTestBlock'));
  });
};

// Create key monitors
const createKeyMonitor = () => {
  window.addEventListener('keydown', (event) => {
    diagLog(`Key pressed: ${event.code} (${event.key})`);
  });
  
  window.addEventListener('mousedown', (event) => {
    diagLog(`Mouse button ${event.button} pressed at ${event.clientX},${event.clientY}`);
  });
};

// Initialize all diagnostic tools
createTestButton();
createKeyMonitor();

// Add direct event listener for block placement test
document.addEventListener('placeTestBlock', () => {
  if (window.engine) {
    diagLog('Engine found, attempting test block placement');
    try {
      window.engine.testBlockPlacement();
    } catch (error) {
      diagLog(`Error in testBlockPlacement: ${error.message}`);
    }
  } else {
    diagLog('Engine not found in global scope');
  }
});

diagLog('Diagnostic tools initialized');