import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '', ...props }: CardProps) => {
  const cardClasses = `
    bg-[rgba(255,255,255,0.4)] 
    backdrop-blur-[10px] 
    border border-[rgba(255,255,255,0.2)] 
    rounded-[16px] 
    shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]
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
