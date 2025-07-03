import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, unit, icon, color, trend }) => {
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon()}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-baseline space-x-1">
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </p>
          {unit && (
            <p className="text-sm font-medium text-gray-500">{unit}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;