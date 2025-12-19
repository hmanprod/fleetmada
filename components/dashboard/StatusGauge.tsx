"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusGaugeProps {
  title: string;
  value: number; // 0-100
  max?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  icon?: LucideIcon;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-100',
    fill: 'bg-green-500',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  yellow: {
    bg: 'bg-yellow-100',
    fill: 'bg-yellow-500',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  red: {
    bg: 'bg-red-100',
    fill: 'bg-red-500',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  blue: {
    bg: 'bg-blue-100',
    fill: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  purple: {
    bg: 'bg-purple-100',
    fill: 'bg-purple-500',
    text: 'text-purple-700',
    border: 'border-purple-200'
  }
};

const sizeClasses = {
  sm: {
    container: 'w-20 h-20',
    text: 'text-lg',
    subtitle: 'text-xs'
  },
  md: {
    container: 'w-24 h-24',
    text: 'text-xl',
    subtitle: 'text-sm'
  },
  lg: {
    container: 'w-32 h-32',
    text: 'text-2xl',
    subtitle: 'text-sm'
  }
};

export default function StatusGauge({
  title,
  value,
  max = 100,
  color = 'green',
  icon: Icon,
  subtitle,
  size = 'md',
  showPercentage = true,
  className = ''
}: StatusGaugeProps) {
  const colors = colorClasses[color];
  const sizes = sizeClasses[size];
  
  // Normaliser la valeur entre 0 et 100
  const normalizedValue = Math.max(0, Math.min(100, (value / max) * 100));
  
  // Déterminer la couleur en fonction de la valeur
  const getGaugeColor = () => {
    if (normalizedValue >= 80) return 'green';
    if (normalizedValue >= 50) return 'yellow';
    return 'red';
  };
  
  const gaugeColor = getGaugeColor();
  const gaugeColors = colorClasses[gaugeColor];
  
  // Calculer la circonférence du cercle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  if (normalizedValue === 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className={`${sizes.container} mx-auto mb-2 rounded-full border-2 border-gray-300 flex items-center justify-center`}>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} className="text-gray-400" />}
        </div>
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`${sizes.container} mx-auto mb-2 relative`}>
        {/* SVG pour la jauge circulaire */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Cercle de fond */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Cercle de progression */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={gaugeColors.fill.replace('bg-', '')}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Contenu au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {Icon && (
              <Icon 
                size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} 
                className={`${sizes.text} ${gaugeColors.text} mx-auto mb-1`} 
              />
            )}
            <div className={`font-bold ${sizes.text} ${gaugeColors.text}`}>
              {showPercentage ? `${Math.round(normalizedValue)}%` : value}
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// Composant pour jauge horizontale
interface HorizontalGaugeProps {
  title: string;
  value: number;
  max?: number;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  subtitle?: string;
  showValues?: boolean;
  className?: string;
}

export function HorizontalGauge({
  title,
  value,
  max = 100,
  color = 'green',
  subtitle,
  showValues = true,
  className = ''
}: HorizontalGaugeProps) {
  const colors = colorClasses[color];
  const normalizedValue = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {showValues && (
          <span className="text-sm text-gray-600">
            {value}/{max}
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${colors.fill} h-3 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${normalizedValue}%` }}
        ></div>
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Composant pour jauge de statut simple
interface SimpleStatusProps {
  status: 'healthy' | 'warning' | 'critical';
  title: string;
  count?: number;
  className?: string;
}

export function SimpleStatus({
  status,
  title,
  count,
  className = ''
}: SimpleStatusProps) {
  const statusConfig = {
    healthy: {
      color: 'text-green-600',
      bg: 'bg-green-100',
      label: 'Sain'
    },
    warning: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      label: 'Attention'
    },
    critical: {
      color: 'text-red-600',
      bg: 'bg-red-100',
      label: 'Critique'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${config.bg}`}></div>
      <span className={`text-sm font-medium ${config.color}`}>
        {title}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-500">
          ({count})
        </span>
      )}
    </div>
  );
}