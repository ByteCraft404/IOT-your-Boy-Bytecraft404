import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'warning'],
    default: 'offline'
  },
  ledStatus: {
    type: Boolean,
    default: false
  },
  sensorsEnabled: {
    temperature: {
      type: Boolean,
      default: true
    },
    moisture: {
      type: Boolean,
      default: true
    }
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    default: 'Field A'
  },
  firmware: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

export default mongoose.model('Device', deviceSchema);