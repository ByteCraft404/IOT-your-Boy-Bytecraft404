import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    default: 'esp32-01'
  },
  temperature: {
    type: Number,
    required: false, // ✅ Optional for temp-only OFF state
    min: -40,
    max: 100
  },
  moisture: {
    type: Number,
    required: false, // ✅ Optional for moisture OFF state
    min: 0,
    max: 4095
  },
  voltage: {
    type: Number,
    required: false, // ✅ Optional too
    min: 0,
    max: 5
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'warning'],
    default: 'online'
  }
}, {
  timestamps: true
});

// Index for efficient queries
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });
sensorDataSchema.index({ timestamp: -1 });

export default mongoose.model('SensorData', sensorDataSchema);