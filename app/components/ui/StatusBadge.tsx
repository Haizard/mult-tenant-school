import React from 'react';

interface StatusBadgeProps {
  status: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
}

const StatusBadge = ({ status, color, size = 'md', showIcon = true, children }: StatusBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const statusConfig = {
    active: {
      bg: 'bg-gradient-to-r from-accent-green to-accent-green-light',
      text: 'text-white',
      icon: '●',
      glow: 'shadow-green-glow',
    },
    inactive: {
      bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
      text: 'text-white',
      icon: '●',
      glow: 'shadow-gray-400',
    },
    pending: {
      bg: 'bg-gradient-to-r from-status-warning to-yellow-400',
      text: 'text-white',
      icon: '⏳',
      glow: 'shadow-yellow-glow',
    },
    completed: {
      bg: 'bg-gradient-to-r from-accent-green to-accent-green-light',
      text: 'text-white',
      icon: '✓',
      glow: 'shadow-green-glow',
    },
    cancelled: {
      bg: 'bg-gradient-to-r from-status-danger to-red-400',
      text: 'text-white',
      icon: '✕',
      glow: 'shadow-red-glow',
    },
    expired: {
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
      text: 'text-white',
      icon: '⏰',
      glow: 'shadow-gray-500',
    },
    warning: {
      bg: 'bg-gradient-to-r from-orange-500 to-red-500',
      text: 'text-white',
      icon: '⚠',
      glow: 'shadow-orange-glow',
    },
    success: {
      bg: 'bg-gradient-to-r from-accent-green to-accent-green-light',
      text: 'text-white',
      icon: '✓',
      glow: 'shadow-green-glow',
    },
    danger: {
      bg: 'bg-gradient-to-r from-status-danger to-red-400',
      text: 'text-white',
      icon: '✕',
      glow: 'shadow-red-glow',
    },
    info: {
      bg: 'bg-gradient-to-r from-accent-blue to-accent-blue-light',
      text: 'text-white',
      icon: 'ℹ',
      glow: 'shadow-blue-glow',
    },
    // Schedule-specific statuses
    class: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-white',
      icon: '📚',
      glow: 'shadow-blue-glow',
    },
    exam: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      text: 'text-white',
      icon: '📝',
      glow: 'shadow-red-glow',
    },
    event: {
      bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
      text: 'text-white',
      icon: '🎉',
      glow: 'shadow-purple-glow',
    },
    meeting: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      text: 'text-white',
      icon: '👥',
      glow: 'shadow-orange-glow',
    },
    draft: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      text: 'text-white',
      icon: '📝',
      glow: 'shadow-yellow-glow',
    },
    default: {
      bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
      text: 'text-white',
      icon: '●',
      glow: 'shadow-gray-400',
    },
  };

  // Ensure status is a string and use predefined config if status matches, otherwise use color-based system
  const statusStr = String(status || '').toLowerCase();
  const config = statusConfig[statusStr] || null;
  
  // Color-based system for custom statuses (like grades)
  const getColorClasses = (colorName: string) => {
    const colorMap = {
      green: { bg: 'bg-green-500', text: 'text-white', glow: 'shadow-green-400', icon: '●' },
      blue: { bg: 'bg-blue-500', text: 'text-white', glow: 'shadow-blue-400', icon: '●' },
      yellow: { bg: 'bg-yellow-500', text: 'text-white', glow: 'shadow-yellow-400', icon: '●' },
      orange: { bg: 'bg-orange-500', text: 'text-white', glow: 'shadow-orange-400', icon: '●' },
      red: { bg: 'bg-red-500', text: 'text-white', glow: 'shadow-red-400', icon: '●' },
      purple: { bg: 'bg-purple-500', text: 'text-white', glow: 'shadow-purple-400', icon: '●' },
      gray: { bg: 'bg-gray-500', text: 'text-white', glow: 'shadow-gray-400', icon: '●' },
    };
    return colorMap[colorName] || colorMap.gray;
  };

  const finalConfig = config || (color ? getColorClasses(color) : getColorClasses('gray'));

  return (
    <span
      className={`
        ${sizeClasses[size]}
        ${finalConfig.bg}
        ${finalConfig.text}
        ${finalConfig.glow}
        rounded-full
        font-medium
        inline-flex
        items-center
        gap-1
        backdrop-blur-sm
        border
        border-white/20
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-lg
      `}
    >
      {showIcon && (
        <span className="text-xs animate-pulse">
          {finalConfig.icon}
        </span>
      )}
      {children || (statusStr.charAt(0).toUpperCase() + statusStr.slice(1))}
    </span>
  );
};

export default StatusBadge;

