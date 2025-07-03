import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// POST /api/settings - Update settings
router.post('/', async (req, res) => {
  try {
    const { deviceId = 'esp32-01', thresholds, alerts, dataRetention } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { deviceId },
      {
        ...(thresholds && { thresholds }),
        ...(alerts && { alerts }),
        ...(dataRetention && { dataRetention })
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// GET /api/settings - Get settings
router.get('/', async (req, res) => {
  try {
    const { deviceId = 'esp32-01' } = req.query;

    let settings = await Settings.findOne({ deviceId });

    if (!settings) {
      // Create default settings
      settings = new Settings({ deviceId });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

export default router;