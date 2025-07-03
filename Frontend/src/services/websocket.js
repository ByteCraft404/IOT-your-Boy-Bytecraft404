import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api.js';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('🔗 WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket...');
    
    this.socket = io(API_CONFIG.WEBSOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔴 WebSocket reconnection error:', error);
    });

    // Handle server messages
    this.socket.on('connected', (data) => {
      console.log('📡 Server message:', data.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Generic event listener
  on(event, callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket not connected. Call connect() first.');
      return;
    }

    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
    
    // Clean up stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to server
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event: WebSocket not connected');
    }
  }

  // Specific event handlers for AgriPulse
  onSensorData(callback) {
    this.on('sensorData', callback);
  }

  onLEDControl(callback) {
    this.on('ledControl', callback);
  }

  onSensorControl(callback) {
    this.on('sensorControl', callback);
  }

  onAlert(callback) {
    this.on('alert', callback);
  }

  // Request latest data
  requestLatestData(deviceId = 'esp32-01') {
    this.emit('requestLatestData', { deviceId });
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;