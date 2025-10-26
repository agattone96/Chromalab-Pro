import React from 'react';

// FIX: Extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      {...props}
      className={`bg-[--color-surface] border border-[--color-border] rounded-xl p-6 shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
