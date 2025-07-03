import React from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard.jsx';

function App() {
  return (
    <div className="App">
      <Dashboard />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: '#ff6b6b',
            },
          },
        }}
      />
    </div>
  );
}

export default App;