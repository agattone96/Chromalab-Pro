import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';

const GlobalSpinner: React.FC = () => {
  return (
    <div 
        className="fixed inset-0 bg-[--color-base]/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]"
        role="status"
        aria-live="polite"
        aria-label="Loading"
    >
        <div className="relative">
            <div className="w-24 h-24 border-4 border-t-4 border-[--color-border] border-t-[--color-accent-pink] rounded-full animate-spin"></div>
            <SparklesIcon className="w-12 h-12 text-[--color-accent-violet] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-6 text-lg font-semibold text-[--color-text-primary] font-data tracking-wider">
            Chromalab AI is thinking...
        </p>
        <p className="mt-2 text-sm text-[--color-text-secondary]">
            Please wait while we process your request.
        </p>
    </div>
  );
};

export default GlobalSpinner;
