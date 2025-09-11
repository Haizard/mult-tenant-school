import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '', ...props }: CardProps) => {
  const cardClasses = `
    bg-slate-800/60 
    backdrop-blur-xl 
    border 
    border-slate-700 
    rounded-2xl 
    shadow-2xl 
    shadow-black/50
    p-6
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
