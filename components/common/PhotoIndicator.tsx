import React from 'react';

interface PhotoIndicatorProps {
  text: string;
  type: 'zone' | 'risk';
  positionClasses: string;
}

export const PhotoIndicator: React.FC<PhotoIndicatorProps> = ({ text, type, positionClasses }) => {
  const isRisk = type === 'risk';
  const bgColor = isRisk ? 'bg-red-500' : 'bg-[--color-accent-coral]';
  const pingColor = isRisk ? 'bg-red-400' : 'bg-[--color-accent-coral]';

  return (
    <div className={`absolute ${positionClasses} transform -translate-y-1/2 group`} >
      <span className="flex h-4 w-4 relative cursor-pointer">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-4 w-4 ${bgColor}`}></span>
      </span>
      <div className="absolute left-6 bottom-0 mb-0 w-48 p-2 bg-[--color-base] text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-[--color-border]">
        {text}
      </div>
    </div>
  );
};
