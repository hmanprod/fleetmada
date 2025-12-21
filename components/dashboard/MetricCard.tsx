"use client";

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  loading?: boolean;
  className?: string;
  'data-testid'?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-900',
    value: 'text-blue-800'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-900',
    value: 'text-green-800'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-900',
    value: 'text-yellow-800'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-900',
    value: 'text-red-800'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    text: 'text-purple-900',
    value: 'text-purple-800'
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-600',
    text: 'text-gray-900',
    value: 'text-gray-800'
  }
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false,
  className = '',
  'data-testid': dataTestId
}: MetricCardProps) {
  const colors = colorClasses[color];

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Formatage des nombres selon le contexte
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'k';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.isPositive === undefined) return <Minus size={16} className="text-gray-500" />;
    return trend.isPositive ?
      <TrendingUp size={16} className="text-green-600" /> :
      <TrendingDown size={16} className="text-red-600" />;
  };

  const getTrendColor = () => {
    if (!trend || trend.isPositive === undefined) return 'text-gray-600';
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`${colors.bg} ${colors.border} border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-6 w-6 bg-gray-300 rounded"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={dataTestId}
      className={`${colors.bg} ${colors.border} border rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-medium ${colors.text}`}>{title}</h3>
        {Icon && <Icon size={24} className={colors.icon} />}
      </div>

      <div className="mb-2">
        <span className={`text-3xl font-bold ${colors.value}`}>
          {formatValue(value)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {subtitle && (
          <span className={`text-sm ${colors.text} opacity-75`}>
            {subtitle}
          </span>
        )}

        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-gray-500 ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}