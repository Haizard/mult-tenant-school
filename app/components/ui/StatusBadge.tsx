import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'expired' | 'warning' | 'success' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
}

const StatusBadge = ({ status, size = 'md', showIcon = true, children }: StatusBadgeProps) => {
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
    default: {
      bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
      text: 'text-white',
      icon: '●',
      glow: 'shadow-gray-400',
    },
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <span
      className={`
        ${sizeClasses[size]}
        ${config.bg}
        ${config.text}
        ${config.glow}
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
          {config.icon}
        </span>
      )}
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;

