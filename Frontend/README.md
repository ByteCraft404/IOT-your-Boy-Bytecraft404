# 🌱 AgriPulse - Smart Farming Platform

AgriPulse is a comprehensive IoT-based smart farming platform that enables real-time monitoring and control of agricultural environments through ESP32 sensors and a modern web dashboard.

## 🚀 Features

### Frontend Dashboard
- **Real-time Data Visualization**: Live temperature and soil moisture charts
- **Device Control**: Remote LED control (ESP32 Pin 22)
- **Sensor Management**: Enable/disable individual sensors
- **Alert System**: Real-time notifications for threshold breaches
- **Responsive Design**: Mobile-friendly interface
- **WebSocket Integration**: Live data updates without page refresh

### Backend API
- **REST API**: Comprehensive endpoints for data and device management
- **WebSocket Support**: Real-time bidirectional communication
- **MongoDB Integration**: Robust data storage and retrieval
- **Device Management**: Track multiple ESP32 devices
- **Settings Management**: Configurable alert thresholds

## 🏗️ Architecture

```
ESP32 Device → HTTP/WebSocket → Express Backend → MongoDB
                    ↓
              WebSocket/REST API
                    ↓
            React Frontend Dashboard
```

## 📁 Project Structure

```
AgriPulse/
├── backend/                 # Express.js Backend
│   ├── server.js           # Main server file
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/            # Database models
│   │   ├── SensorData.js
│   │   ├── Device.js
│   │   └── Settings.js
│   ├── routes/            # API routes
│   │   ├── dataRoutes.js
│   │   ├── ledRoutes.js
│   │   ├── controlRoutes.js
│   │   └── settingsRoutes.js
│   └── websocket/
│       └── sensorSocket.js # WebSocket handling
├── src/                    # React Frontend
│   ├── components/        # React components
│   │   ├── Dashboard.jsx
│   │   ├── SensorChart.jsx
│   │   ├── DeviceControls.jsx
│   │   └── MetricCard.jsx
│   ├── services/          # API services
│   │   ├── api.js
│   │   └── websocket.js
│   └── config/
│       └── api.js         # API configuration
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- ESP32 development board

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run backend:install

# Or install all at once
npm run setup
```

### 2. Environment Configuration

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/AgriPulse
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

## 🔌 API Endpoints

### Data Management
- `POST /api/data` - Receive sensor data from ESP32
- `GET /api/data/latest` - Get latest sensor reading
- `GET /api/data/history` - Get historical data (24h)
- `GET /api/data/devices` - List all devices with status

### Device Control
- `POST /api/led` - Control ESP32 LED (pin 22)
- `GET /api/led/status` - Get LED status
- `POST /api/control/sensors` - Enable/disable sensors
- `GET /api/control/sensors` - Get sensor status

### Settings
- `POST /api/settings` - Update alert thresholds
- `GET /api/settings` - Get current settings

### Health Check
- `GET /api/health` - Backend health status

## 📊 Data Format

### Sensor Data (ESP32 → Backend)
```json
{
  "temperature": 26.5,
  "moisture": 290,
  "voltage": 3.3,
  "deviceId": "esp32-01",
  "timestamp": "2025-01-02T17:00:00Z"
}
```

### LED Control (Frontend → ESP32)
```json
{
  "deviceId": "esp32-01",
  "status": true
}
```

## 🔧 Configuration

### API Configuration
Update `src/config/api.js` to change backend URL:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  WEBSOCKET_URL: 'http://localhost:3001',
  // ... endpoints
};
```

### Alert Thresholds
Configure via the dashboard or API:

```javascript
{
  "thresholds": {
    "temperature": { "min": 15, "max": 35 },
    "moisture": { "min": 200, "max": 800 }
  }
}
```

## 🌐 WebSocket Events

### Client → Server
- `requestLatestData` - Request current sensor data
- `esp32Connect` - ESP32 device connection

### Server → Client
- `sensorData` - Real-time sensor updates
- `ledControl` - LED control commands
- `sensorControl` - Sensor enable/disable
- `alert` - Alert notifications

## 🎯 ESP32 Integration

### HTTP POST Example
```cpp
// ESP32 code to send sensor data
WiFiClient client;
HTTPClient http;

http.begin(client, "http://your-backend-url/api/data");
http.addHeader("Content-Type", "application/json");

String payload = "{\"temperature\":" + String(temp) + 
                ",\"moisture\":" + String(moisture) + 
                ",\"voltage\":" + String(voltage) + "}";

int httpResponseCode = http.POST(payload);
```

### WebSocket Example
```cpp
// ESP32 WebSocket connection
#include <WebSocketsClient.h>

WebSocketsClient webSocket;
webSocket.begin("your-backend-url", 3001, "/");
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables
# Deploy to your preferred platform
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request limiting
- **Input Validation**: Data sanitization
- **Environment Variables**: Secure configuration

## 📱 Mobile Support

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🏆 Best Practices

1. **File Organization**: Modular, single-responsibility components
2. **Error Handling**: Comprehensive error catching and user feedback
3. **Real-time Updates**: WebSocket for live data without polling
4. **Data Validation**: Both client and server-side validation
5. **Performance**: Optimized charts and minimal re-renders

## 🆘 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check MongoDB connection string
   - Verify backend is running on correct port
   - Check firewall settings

2. **WebSocket Connection Issues**
   - Ensure both HTTP and WebSocket use same port
   - Check CORS configuration
   - Verify network connectivity

3. **Data Not Updating**
   - Check ESP32 network connection
   - Verify API endpoints are correct
   - Check browser console for errors

### Development Tips

1. **API Testing**: Use tools like Postman to test endpoints
2. **Real-time Testing**: Use browser dev tools to monitor WebSocket
3. **Database**: Use MongoDB Compass to view data
4. **Logging**: Check console logs for detailed error information

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ESP32 community for hardware support
- React and Express.js teams for excellent frameworks
- MongoDB for reliable data storage
- Recharts for beautiful data visualization

---

**Built with ❤️ for smart farming and sustainable agriculture**

🌾 Happy Farming! 🌾