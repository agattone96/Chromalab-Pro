import React from 'react';

export const FormulaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251-.042.507-.068.772-.068h3.956a2.25 2.25 0 012.25 2.25v4.25c0 .621-.504 1.125-1.125 1.125H12M9.75 3.104a2.25 2.25 0 00-2.25 2.25v4.25c0 .621.504 1.125 1.125 1.125h3.956A2.25 2.25 0 0015 9.604v-4.25c0-1.242-1.008-2.25-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25v.003M7.5 14.5m-3 3a3 3 0 106 0 3 3 0 10-6 0" />
    </svg>
);

// Kept original export name to avoid breaking imports, but this is the Formula Icon
export { FormulaIcon as ColorSwatchIcon };