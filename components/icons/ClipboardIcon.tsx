import React from 'react';

// 🧴 Diagnostics Icon
export const DiagnosticsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5S16.5 9.235 16.5 6.75 14.485 2.25 12 2.25z" opacity="0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6v6.75a2.25 2.25 0 01-2.25 2.25H11.25a2.25 2.25 0 01-2.25-2.25V12.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5V12h6V7.5a3 3 0 00-3-3h0a3 3 0 00-3 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75h.01" />
    </svg>
);


// Kept original export name to avoid breaking imports, but this is the Diagnostics Icon
export { DiagnosticsIcon as ClipboardIcon };