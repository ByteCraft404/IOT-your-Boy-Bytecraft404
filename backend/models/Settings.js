import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  thresholds: {
    temperature: {
      min: { type: Number, default: 15 },
      max: { type: Number, default: 35 }
    },
    moisture: {
      min: { type: Number, default: 200 },
      max: { type: Number, default: 800 }
    }
  },
  sensors: {
    temperature: { type: Boolean, default: true },
    moisture: { type: Boolean, default: true }
  },
  alerts: {
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  dataRetention: {
    type: Number,
    default: 30 
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);
