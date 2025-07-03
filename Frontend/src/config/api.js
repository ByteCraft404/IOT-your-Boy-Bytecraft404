// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: 'https://bytecraftiot-backend.onrender.com',
  WEBSOCKET_URL: 'https://bytecraftiot-backend.onrender.com',

  ENDPOINTS: {
    // Data endpoints
    SENSOR_DATA: '/api/data',
    LATEST_DATA: '/api/data/latest',
    HISTORY_DATA: '/api/data/history',
    DEVICES: '/api/data/devices',
    
    // Control endpoints
    LED_CONTROL: '/api/led',
    LED_STATUS: '/api/led/status',
    SENSOR_CONTROL: '/api/control/sensors',
    
    // Settings
    SETTINGS: '/api/settings',
    
    // Health check
    HEALTH: '/api/health'
  }
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export for easy switching between environments
export const setBaseUrl = (newBaseUrl) => {
  API_CONFIG.BASE_URL = newBaseUrl;
  API_CONFIG.WEBSOCKET_URL = newBaseUrl;
};