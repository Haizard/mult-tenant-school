import React, { useMemo } from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: 'purple' | 'green' | 'blue' | 'orange' | 'red';
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  id?: string; // Add optional id prop for stable IDs
}

const ProgressRing = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color = 'purple',
  label,
  showPercentage = true,
  animated = true,
  id
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    purple: 'stroke-accent-purple',
    green: 'stroke-accent-green',
    blue: 'stroke-accent-blue',
    orange: 'stroke-status-warning',
    red: 'stroke-status-danger',
  };

  // Use a stable ID based on color and percentage to avoid hydration mismatch
  const gradientId = useMemo(() => {
    if (id) return `gradient-${color}-${id}`;
    return `gradient-${color}-${percentage}-${size}`;
  }, [color, id, percentage, size]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color === 'purple' ? '#7C3AED' : color === 'green' ? '#10B981' : color === 'blue' ? '#3B82F6' : color === 'orange' ? '#F59E0B' : '#EF4444'} />
            <stop offset="100%" stopColor={color === 'purple' ? '#A855F7' : color === 'green' ? '#34D399' : color === 'blue' ? '#60A5FA' : color === 'orange' ? '#FBBF24' : '#F87171'} />
          </linearGradient>
        </defs>
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-out ${animated ? 'animate-pulse' : ''}`}
          style={{
            strokeDasharray: strokeDasharray,
            strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-text-primary">
            {percentage}%
          </span>
        )}
        {label && (
          <span className="text-sm text-text-secondary mt-1 text-center px-2">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
