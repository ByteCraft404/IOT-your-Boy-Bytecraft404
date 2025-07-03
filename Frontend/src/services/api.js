import axios from 'axios';
import { API_CONFIG, buildUrl } from '../config/api.js';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Health check
  checkHealth: () => api.get(API_CONFIG.ENDPOINTS.HEALTH),

  // Sensor data
  getLatestData: (deviceId = 'esp32-01') => 
    api.get(API_CONFIG.ENDPOINTS.LATEST_DATA, { params: { deviceId } }),
  
  getHistoryData: (deviceId = 'esp32-01', hours = 24, limit = 100) =>
    api.get(API_CONFIG.ENDPOINTS.HISTORY_DATA, { 
      params: { deviceId, hours, limit } 
    }),
  
  sendSensorData: (data) => 
    api.post(API_CONFIG.ENDPOINTS.SENSOR_DATA, data),

  // Device management
  getDevices: () => api.get(API_CONFIG.ENDPOINTS.DEVICES),

  // LED control
  controlLED: (deviceId = 'esp32-01', status) =>
    api.post(API_CONFIG.ENDPOINTS.LED_CONTROL, { deviceId, status }),
  
  getLEDStatus: (deviceId = 'esp32-01') =>
    api.get(API_CONFIG.ENDPOINTS.LED_STATUS, { params: { deviceId } }),

  // Sensor control
  controlSensor: (deviceId = 'esp32-01', sensor, enabled) =>
    api.post(API_CONFIG.ENDPOINTS.SENSOR_CONTROL, { deviceId, sensor, enabled }),
  
  getSensorStatus: (deviceId = 'esp32-01') =>
    api.get(API_CONFIG.ENDPOINTS.SENSOR_CONTROL, { params: { deviceId } }),

  // Settings
  getSettings: (deviceId = 'esp32-01') =>
    api.get(API_CONFIG.ENDPOINTS.SETTINGS, { params: { deviceId } }),
  
  updateSettings: (deviceId = 'esp32-01', settings) =>
    api.post(API_CONFIG.ENDPOINTS.SETTINGS, { deviceId, ...settings }),
};

export default api;