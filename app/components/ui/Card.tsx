import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'gradient';
  glow?: 'purple' | 'green' | 'blue' | 'none';
}

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  glow = 'none',
  ...props 
}: CardProps) => {
  const baseClasses = 'rounded-2xl p-6 transition-all duration-300';
  
  const variantClasses = {
    default: 'glass-card',
    strong: 'glass-card-strong',
    gradient: 'bg-gradient-to-br from-glass-white to-glass-white-strong backdrop-blur-xl border border-glass-border rounded-2xl shadow-glass',
  };
  
  const glowClasses = {
    purple: 'purple-glow',
    green: 'green-glow',
    blue: 'blue-glow',
    none: '',
  };

  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${glowClasses[glow]}
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
