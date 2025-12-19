"use client";

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TrendChartProps {
  data: any[];
  type?: 'line' | 'area' | 'bar' | 'pie';
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  loading?: boolean;
  className?: string;
}

const COLORS = [
  '#008751', // Vert principal FleetMada
  '#fbbf24', // Jaune
  '#3b82f6', // Bleu
  '#ef4444', // Rouge
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

// Composant Tooltip personnalisé
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendChart({
  data,
  type = 'line',
  title,
  xAxisKey = 'name',
  yAxisKey = 'value',
  color = COLORS[0],
  colors = COLORS,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  loading = false,
  className = ''
}: TrendChartProps) {
  
  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Aucune donnée disponible</p>
        </div>
      );
    }

    const tooltipContent = showTooltip ? <CustomTooltip /> : null;

    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              stroke="#6b7280"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              stroke="#6b7280"
              tickFormatter={formatValue}
            />
            {tooltipContent}
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              fill={color}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              stroke="#6b7280"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              stroke="#6b7280"
              tickFormatter={formatValue}
            />
            {tooltipContent}
            <Bar
              dataKey={yAxisKey}
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {tooltipContent}
          </PieChart>
        );

      default: // line
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xAxisKey} 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              stroke="#6b7280"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              fontSize={12} 
              stroke="#6b7280"
              tickFormatter={formatValue}
            />
            {tooltipContent}
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div 
            className="bg-gray-300 rounded"
            style={{ height: `${height}px` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div style={{ height: `${height}px`, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}