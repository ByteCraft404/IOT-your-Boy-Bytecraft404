import express from 'express';
import SensorData from '../models/SensorData.js';
import Device from '../models/Device.js';

const router = express.Router();

// POST /api/data - Receive sensor data from ESP32
router.post('/', async (req, res) => {
  try {
    const {
      temperature,
      moisture,
      voltage,
      deviceId = 'esp32-01'
    } = req.body;

    const isMoistureEnabled = moisture !== -1 && moisture !== undefined;
    const isTempEnabled = temperature !== undefined && temperature !== -1000;

    if (!isMoistureEnabled && !isTempEnabled) {
      return res.status(400).json({
        success: false,
        message: 'At least temperature or moisture must be valid'
      });
    }

    if (voltage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Voltage is required'
      });
    }

    const data = {
      deviceId,
      voltage,
      status: voltage < 3.0 ? 'warning' : 'online'
    };

    if (isMoistureEnabled) {
      data.moisture = moisture;
    }

    if (isTempEnabled) {
      data.temperature = temperature;
    }

    const sensorData = new SensorData(data);
    await sensorData.save();

    await Device.findOneAndUpdate(
      { deviceId },
      {
        status: 'online',
        lastSeen: new Date()
      },
      { upsert: true }
    );

    req.io.emit('sensorData', {
      deviceId,
      voltage,
      timestamp: sensorData.timestamp,
      status: sensorData.status,
      ...(isMoistureEnabled && { moisture }),
      ...(isTempEnabled && { temperature })
    });

    res.json({
      success: true,
      message: 'Sensor data saved',
      data: sensorData
    });

  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save sensor data'
    });
  }
});

// GET /api/data/latest - Get latest sensor reading
router.get('/latest', async (req, res) => {
  try {
    const { deviceId = 'esp32-01' } = req.query;
    
    const latestData = await SensorData
      .findOne({ deviceId })
      .sort({ timestamp: -1 });

    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No sensor data found'
      });
    }

    res.json({
      success: true,
      data: latestData
    });

  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest data'
    });
  }
});

// GET /api/data/history - Get historical data
router.get('/history', async (req, res) => {
  try {
    const { deviceId = 'esp32-01', hours = 24, limit = 100 } = req.query;
    
    const hoursAgo = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    const historicalData = await SensorData
      .find({ 
        deviceId,
        timestamp: { $gte: hoursAgo }
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: historicalData.reverse(),
      count: historicalData.length
    });

  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical data'
    });
  }
});

// GET /api/data/devices - Get all devices with status
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find({});
    const fiveMinutesAgo = new Date(Date.now() - (5 * 60 * 1000));
    
    const devicesWithStatus = await Promise.all(
      devices.map(async (device) => {
        const latestData = await SensorData
          .findOne({ deviceId: device.deviceId })
          .sort({ timestamp: -1 });
        
        const isOnline = latestData && latestData.timestamp > fiveMinutesAgo;
        
        return {
          ...device.toObject(),
          status: isOnline ? 'online' : 'offline',
          lastReading: latestData ? latestData.timestamp : null,
          latestData: latestData || null
        };
      })
    );

    res.json({
      success: true,
      data: devicesWithStatus
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices'
    });
  }
});

export default router;
