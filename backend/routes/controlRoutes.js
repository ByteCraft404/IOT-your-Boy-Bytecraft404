import express from 'express';
import Device from '../models/Device.js';

const router = express.Router();

// POST /api/control/sensors - Enable/disable sensors
router.post('/sensors', async (req, res) => {
  try {
    const { deviceId = 'esp32-01', sensor, enabled } = req.body;

    if (!sensor || typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Sensor type and enabled status required'
      });
    }

    if (!['temperature', 'moisture'].includes(sensor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sensor type. Must be temperature or moisture'
      });
    }

    const updateField = `sensorsEnabled.${sensor}`;
    const defaultDeviceName = `Device-${deviceId.substring(0, 4)}`;

    let device = await Device.findOne({ deviceId });

    if (!device) {
      device = await Device.create({
        deviceId,
        name: defaultDeviceName,
        online: true,
        sensorsEnabled: {
          temperature: true,
          moisture: true
        },
        ledStatus: false,
        lastSeen: new Date()
      });
    }

    device.sensorsEnabled[sensor] = enabled;
    device.lastSeen = new Date();
    await device.save();

    req.io.emit('sensorControl', {
      deviceId,
      sensor,
      enabled,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `${sensor} sensor ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        deviceId,
        sensor,
        enabled,
        sensorsEnabled: device.sensorsEnabled
      }
    });

  } catch (error) {
    console.error('Error controlling sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to control sensor'
    });
  }
});

// GET /api/control/sensors - Get sensor status
router.get('/sensors', async (req, res) => {
  try {
    const { deviceId = 'esp32-01' } = req.query;

    let device = await Device.findOne({ deviceId });

    if (!device) {
      const defaultDeviceName = `Device-${deviceId.substring(0, 4)}`;
      device = await Device.create({
        deviceId,
        name: defaultDeviceName,
        online: true,
        sensorsEnabled: {
          temperature: true,
          moisture: true
        },
        ledStatus: false,
        lastSeen: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        deviceId,
        sensorsEnabled: device.sensorsEnabled,
        ledStatus: device.ledStatus ?? false,
        lastUpdated: device.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching sensor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor status'
    });
  }
});

// POST /api/control/led - Set LED status
router.post('/led', async (req, res) => {
  try {
    const { deviceId = 'esp32-01', status } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'LED status must be true or false'
      });
    }

    let device = await Device.findOne({ deviceId });

    if (!device) {
      device = await Device.create({
        deviceId,
        name: `Device-${deviceId.substring(0, 4)}`,
        online: true,
        sensorsEnabled: {
          temperature: true,
          moisture: true
        },
        ledStatus: status,
        lastSeen: new Date()
      });
    } else {
      device.ledStatus = status;
      device.lastSeen = new Date();
      await device.save();
    }

    res.json({
      success: true,
      message: `LED ${status ? 'turned ON' : 'turned OFF'}`,
      data: {
        deviceId,
        ledStatus: status
      }
    });

  } catch (error) {
    console.error('Error setting LED status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update LED status'
    });
  }
});

// GET /api/control/led - Get LED status
router.get('/led', async (req, res) => {
  try {
    const { deviceId = 'esp32-01' } = req.query;

    let device = await Device.findOne({ deviceId });

    if (!device) {
      const defaultDeviceName = `Device-${deviceId.substring(0, 4)}`;
      device = await Device.create({
        deviceId,
        name: defaultDeviceName,
        online: true,
        sensorsEnabled: {
          temperature: true,
          moisture: true
        },
        ledStatus: false,
        lastSeen: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        deviceId,
        ledStatus: device.ledStatus ?? false
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
