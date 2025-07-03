import express from 'express';
import Device from '../models/Device.js';
import { emitLedControl } from '../websocket/sensorSocket.js'; // ✅ Import WebSocket function

const router = express.Router();

// POST /api/led - Control ESP32 LED
router.post('/', async (req, res) => {
  try {
    const { deviceId = 'esp32-01', status } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'LED status must be boolean (true/false)'
      });
    }

    // Update LED status in the database
    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        ledStatus: status,
        lastSeen: new Date()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    // ✅ Emit LED control to ESP32 via WebSocket
    emitLedControl(deviceId, status);

    res.json({
      success: true,
      message: `LED ${status ? 'turned ON' : 'turned OFF'}`,
      data: {
        deviceId,
        ledStatus: status,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error controlling LED:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to control LED'
    });
  }
});

// GET /api/led/status - Get current LED status
router.get('/status', async (req, res) => {
  try {
    const { deviceId = 'esp32-01' } = req.query;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: {
        deviceId,
        ledStatus: device.ledStatus,
        lastUpdated: device.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching LED status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch LED status'
    });
  }
});

export default router;
