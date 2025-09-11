import React from 'react';

// Define the props for the button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  // Variant classes from ui-design-system.md
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white shadow-[0_4px_16px_rgba(107,70,193,0.3)]',
    secondary: 'bg-[rgba(255,255,255,0.25)] text-[#6B46C1] border border-[rgba(107,70,193,0.3)]',
    ghost: 'bg-transparent hover:bg-gray-100/50',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-9 px-3 rounded-md',
    md: 'h-10 py-3 px-6 rounded-[12px]',
    lg: 'h-11 px-8 rounded-md',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
