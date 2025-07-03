import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Zap, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api.js';
import websocketService from '../services/websocket.js';
import toast from 'react-hot-toast';
import SensorChart from './SensorChart.jsx';
import DeviceControls from './DeviceControls.jsx';
import MetricCard from './MetricCard.jsx';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState('offline');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Initialize WebSocket and fetch initial data
 useEffect(() => {
  const initializeDashboard = async () => {
    try {
      // Connect to WebSocket
      websocketService.connect();

      // Check WebSocket connection status
      const checkConnection = setInterval(() => {
        const status = websocketService.getConnectionStatus();
        setIsConnected(status.connected);
      }, 1000);

      // Fetch initial data
      await Promise.all([
        fetchLatestData(),
        fetchHistoricalData()
      ]);

      // Start polling every 10 seconds
      const pollInterval = setInterval(() => {
        fetchLatestData();
      }, 10000);

      // WebSocket listeners
      websocketService.onSensorData(handleRealtimeData);
      websocketService.onAlert(handleAlert);

      setLoading(false);

      // Cleanup
      return () => {
        clearInterval(checkConnection);
        clearInterval(pollInterval);
        websocketService.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      toast.error('Failed to initialize dashboard');
      setLoading(false);
    }
  };

  initializeDashboard();
}, []);

  const fetchLatestData = async () => {
    try {
      const response = await apiService.getLatestData();
      if (response.data.success) {
        setSensorData(response.data.data);
        setDeviceStatus(response.data.data.status);
        setLastUpdate(new Date(response.data.data.timestamp));
      }
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
      setDeviceStatus('offline');
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await apiService.getHistoryData('esp32-01', 24, 50);
      if (response.data.success) {
        setHistoricalData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
  };

  const handleRealtimeData = (data) => {
  if ('temperature' in data && data.temperature !== undefined) {
    setTemperature(data.temperature);
  }

  if ('moisture' in data && data.moisture !== undefined) {
    setMoisture(data.moisture);
  }

  if ('voltage' in data && data.voltage !== undefined) {
    setVoltage(data.voltage);
  }

  if ('status' in data && data.status !== undefined) {
    setStatus(data.status);
  }

  if ('timestamp' in data && data.timestamp !== undefined) {
    setLastUpdated(data.timestamp);
  }
};


  const handleAlert = (alert) => {
    toast.error(alert.message);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <Wifi className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'offline': return <WifiOff className="w-5 h-5" />;
      default: return <WifiOff className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AgriPulse Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AgriPulse</h1>
                <p className="text-sm text-gray-600">Smart Farming Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${getStatusColor(deviceStatus)}`}>
                {getStatusIcon(deviceStatus)}
                <span className="text-sm font-medium capitalize">{deviceStatus}</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Temperature"
            value={sensorData?.temperature || '--'}
            unit="°C"
            icon={<Thermometer className="w-6 h-6" />}
            color="orange"
            trend={sensorData?.temperature > 30 ? 'up' : 'normal'}
          />
          
          <MetricCard
            title="Soil Moisture"
            value={sensorData?.moisture || '--'}
            unit=""
            icon={<Droplets className="w-6 h-6" />}
            color="blue"
            trend={sensorData?.moisture < 300 ? 'down' : 'normal'}
          />
          
          <MetricCard
            title="Battery Voltage"
            value={sensorData?.voltage || '--'}
            unit="V"
            icon={<Zap className="w-6 h-6" />}
            color="green"
            trend={sensorData?.voltage < 3.2 ? 'down' : 'normal'}
          />
          
          <MetricCard
            title="Last Update"
            value={lastUpdate ? lastUpdate.toLocaleTimeString() : '--'}
            unit=""
            icon={<Wifi className="w-6 h-6" />}
            color="purple"
            trend="normal"
          />
        </div>

        {/* Charts and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sensor Charts */}
          <div className="lg:col-span-2 space-y-6">
            <SensorChart
              title="Temperature Trend"
              data={historicalData}
              dataKey="temperature"
              color="#f97316"
              unit="°C"
            />
            
            <SensorChart
              title="Soil Moisture Trend"
              data={historicalData}
              dataKey="moisture"
              color="#3b82f6"
              unit=""
            />
          </div>

          {/* Device Controls */}
          <div className="lg:col-span-1">
            <DeviceControls 
              deviceId="esp32-01"
              onUpdate={fetchLatestData}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;