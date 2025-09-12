import React from 'react';
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface NotificationCardProps {
  type?: 'info' | 'success' | 'warning' | 'error' | 'default';
  title: string;
  message: string;
  timestamp?: string;
  avatar?: string;
  author?: string;
  unread?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
}

const NotificationCard = ({
  type = 'default',
  title,
  message,
  timestamp,
  avatar,
  author,
  unread = false,
  onClick,
  onDismiss,
}: NotificationCardProps) => {
  const typeConfig = {
    info: {
      icon: FaInfoCircle,
      bg: 'bg-gradient-to-r from-accent-blue/20 to-accent-blue-light/20',
      border: 'border-accent-blue/30',
      iconColor: 'text-accent-blue',
      glow: 'shadow-blue-glow',
    },
    success: {
      icon: FaCheckCircle,
      bg: 'bg-gradient-to-r from-accent-green/20 to-accent-green-light/20',
      border: 'border-accent-green/30',
      iconColor: 'text-accent-green',
      glow: 'shadow-green-glow',
    },
    warning: {
      icon: FaExclamationTriangle,
      bg: 'bg-gradient-to-r from-status-warning/20 to-yellow-400/20',
      border: 'border-status-warning/30',
      iconColor: 'text-status-warning',
      glow: 'shadow-yellow-glow',
    },
    error: {
      icon: FaTimesCircle,
      bg: 'bg-gradient-to-r from-status-danger/20 to-red-400/20',
      border: 'border-status-danger/30',
      iconColor: 'text-status-danger',
      glow: 'shadow-red-glow',
    },
    default: {
      icon: FaBell,
      bg: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20',
      border: 'border-gray-400/30',
      iconColor: 'text-gray-500',
      glow: 'shadow-gray-400',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-105
        ${config.bg}
        ${config.border}
        ${unread ? config.glow : ''}
        ${unread ? 'border-l-4 border-l-accent-purple' : ''}
        relative
      `}
      onClick={onClick}
    >
      {/* Unread indicator */}
      {unread && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-purple rounded-full animate-pulse"></div>
      )}

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-2 right-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <FaTimesCircle className="text-sm" />
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${config.iconColor}
          bg-white/20 backdrop-blur-sm
        `}>
          <IconComponent className="text-lg" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-text-primary truncate">{title}</h4>
            {author && (
              <span className="text-xs text-text-muted">by {author}</span>
            )}
          </div>
          
          <p className="text-sm text-text-secondary mb-2 line-clamp-2">
            {message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {timestamp && (
              <span className="text-xs text-text-muted">{timestamp}</span>
            )}
            
            {avatar && (
              <img
                src={avatar}
                alt="Author"
                className="w-6 h-6 rounded-full border border-white/20"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;


