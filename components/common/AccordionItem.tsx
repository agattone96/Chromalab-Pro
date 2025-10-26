import React, { useState } from 'react';
import Tooltip from './Tooltip';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left text-[--color-text-primary] hover:text-[--color-accent-violet] transition-colors"
      >
        <span className="font-semibold">{title}</span>
        <Tooltip text={isOpen ? 'Collapse' : 'Expand'}>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </Tooltip>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pb-5 text-[--color-text-secondary] prose prose-invert max-w-none prose-p:my-2 prose-a:text-[--color-accent-coral]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
