let io;

export const initializeSocket = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);
    
    socket.emit('connected', {
      message: 'Connected to AgriPulse WebSocket',
      timestamp: new Date().toISOString()
    });

    // Handle ESP32 joining room
    socket.on('esp32Connect', (data) => {
      console.log('🔌 ESP32 connected:', data);
      socket.join('esp32-devices');
    });

    // Handle LED control requests from frontend
    socket.on('ledControl', (data) => {
      const { deviceId, status } = data;
      io.to('esp32-devices').emit('ledControl', { deviceId, status });
      console.log(`🔦 Relayed LED control → ${deviceId}: ${status}`);
    });

    // Handle client ping (from ESP32)
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Optional: send server ping to client every 30 seconds
    const interval = setInterval(() => {
      socket.emit('ping');
    }, 30000);

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`📴 Client disconnected: ${socket.id}`);
      clearInterval(interval);
    });
  });
};

export const emitLedControl = (deviceId, status) => {
  if (io) {
    io.to('esp32-devices').emit('ledControl', {
      deviceId,
      status
    });
    console.log(`🔦 Sent LED control to ${deviceId}: ${status}`);
  }
};


export const getSocketIO = () => io;

export const broadcastSensorData = (data) => {
  if (io) {
    io.emit('sensorData', data);
  }
};

export const broadcastAlert = (alert) => {
  if (io) {
    io.emit('alert', alert);
  }
};