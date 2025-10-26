import React from 'react';

export const AIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5}
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0 -7"></path>
    <path d="M12 15.5v3.5"></path>
    <path d="M15.5 12h3.5"></path>
    <path d="M12 5.5v-3.5"></path>
    <path d="M8.5 12h-3.5"></path>
    <path d="M15 17l2 2"></path>
    <path d="M17 15l2 -2"></path>
    <path d="M9 17l-2 2"></path>
    <path d="M7 15l-2 -2"></path>
  </svg>
);

// Kept original export name to avoid breaking imports, but this is the AI Icon
export { AIIcon as LightBulbIcon };