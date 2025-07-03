import React, { useState, useEffect } from 'react';
import { 
  Power, 
  Settings, 
  Thermometer, 
  Droplets, 
  Lightbulb,
  Save,
  RotateCcw
} from 'lucide-react';
import { apiService } from '../services/api.js';
import toast from 'react-hot-toast';

const DeviceControls = ({ deviceId, onUpdate }) => {
  const [ledStatus, setLedStatus] = useState(false);
  const [sensorsEnabled, setSensorsEnabled] = useState({
    temperature: true,
    moisture: true
  });
  const [settings, setSettings] = useState({
    thresholds: {
      temperature: { min: 15, max: 35 },
      moisture: { min: 200, max: 800 }
    }
  });
  const [loading, setLoading] = useState({
    led: false,
    sensors: false,
    settings: false
  });

  useEffect(() => {
    fetchDeviceStatus();
    fetchSettings();
  }, [deviceId]);

  const fetchDeviceStatus = async () => {
    try {
      const [ledResponse, sensorResponse] = await Promise.all([
        apiService.getLEDStatus(deviceId),
        apiService.getSensorStatus(deviceId)
      ]);

      if (ledResponse.data.success) {
        setLedStatus(ledResponse.data.data.ledStatus);
      }

      if (sensorResponse.data.success) {
        setSensorsEnabled(sensorResponse.data.data.sensorsEnabled);
      }
    } catch (error) {
      console.error('Failed to fetch device status:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await apiService.getSettings(deviceId);
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleLEDToggle = async () => {
    setLoading(prev => ({ ...prev, led: true }));
    try {
      const newStatus = !ledStatus;
      const response = await apiService.controlLED(deviceId, newStatus);
      
      if (response.data.success) {
        setLedStatus(newStatus);
        toast.success(`LED ${newStatus ? 'turned ON' : 'turned OFF'}`);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Failed to control LED:', error);
      toast.error('Failed to control LED');
    } finally {
      setLoading(prev => ({ ...prev, led: false }));
    }
  };

  const handleSensorToggle = async (sensor) => {
    setLoading(prev => ({ ...prev, sensors: true }));
    try {
      const newStatus = !sensorsEnabled[sensor];
      const response = await apiService.controlSensor(deviceId, sensor, newStatus);
      
      if (response.data.success) {
        setSensorsEnabled(prev => ({
          ...prev,
          [sensor]: newStatus
        }));
        toast.success(`${sensor} sensor ${newStatus ? 'enabled' : 'disabled'}`);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Failed to control sensor:', error);
      toast.error(`Failed to control ${sensor} sensor`);
    } finally {
      setLoading(prev => ({ ...prev, sensors: false }));
    }
  };

  const handleSettingsUpdate = async () => {
    setLoading(prev => ({ ...prev, settings: true }));
    try {
      const response = await apiService.updateSettings(deviceId, {
        thresholds: settings.thresholds
      });
      
      if (response.data.success) {
        toast.success('Settings updated successfully');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  };

  const resetSettings = () => {
    setSettings({
      thresholds: {
        temperature: { min: 15, max: 35 },
        moisture: { min: 200, max: 800 }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* LED Control */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">LED Control</h3>
              <p className="text-sm text-gray-600">ESP32 Pin 22</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLEDToggle}
          disabled={loading.led}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            ledStatus
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } ${loading.led ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading.led ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          ) : (
            <Power className="w-5 h-5" />
          )}
          <span>{ledStatus ? 'Turn OFF' : 'Turn ON'}</span>
        </button>
      </div>

      {/* Sensor Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sensor Controls</h3>
            <p className="text-sm text-gray-600">Enable/Disable Sensors</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Temperature Sensor */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Thermometer className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Temperature</span>
            </div>
            <button
              onClick={() => handleSensorToggle('temperature')}
              disabled={loading.sensors}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                sensorsEnabled.temperature ? 'bg-orange-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sensorsEnabled.temperature ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Moisture Sensor */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Soil Moisture</span>
            </div>
            <button
              onClick={() => handleSensorToggle('moisture')}
              disabled={loading.sensors}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                sensorsEnabled.moisture ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  sensorsEnabled.moisture ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Threshold Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Alert Settings</h3>
            <p className="text-sm text-gray-600">Configure thresholds</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Temperature Thresholds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature Range (°C)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={settings.thresholds.temperature.min}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    thresholds: {
                      ...prev.thresholds,
                      temperature: {
                        ...prev.thresholds.temperature,
                        min: parseFloat(e.target.value)
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={settings.thresholds.temperature.max}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    thresholds: {
                      ...prev.thresholds,
                      temperature: {
                        ...prev.thresholds.temperature,
                        max: parseFloat(e.target.value)
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Moisture Thresholds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moisture Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={settings.thresholds.moisture.min}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    thresholds: {
                      ...prev.thresholds,
                      moisture: {
                        ...prev.thresholds.moisture,
                        min: parseInt(e.target.value)
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={settings.thresholds.moisture.max}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    thresholds: {
                      ...prev.thresholds,
                      moisture: {
                        ...prev.thresholds.moisture,
                        max: parseInt(e.target.value)
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSettingsUpdate}
              disabled={loading.settings}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading.settings ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
            
            <button
              onClick={resetSettings}
              className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceControls;