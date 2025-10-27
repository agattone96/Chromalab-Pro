import React, { useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Tab } from '../../types';

interface TourStep {
  title: string;
  content: string;
  targetSelector: string;
  action?: (setActiveTab: (tab: Tab) => void) => void;
}

interface TourGuideProps {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
  setActiveTab: (tab: Tab) => void;
}

const tourSteps: TourStep[] = [
  { // 0
    title: "Welcome to Chromalab Pro!",
    content: "Let's take a quick tour to get you set up and ready to create.",
    targetSelector: "#app-title",
  },
  { // 1
    title: "Step 1: Verify Your License",
    content: "First, let's visit your Profile. You'll need to upload your professional license here to unlock the core formulation and simulation tools.",
    targetSelector: "#tab-profile",
    action: (setActiveTab) => setActiveTab('Homepage'),
  },
  { // 2
    title: "The Verification Hub",
    content: "In your profile, you can manage your details and submit your license. Verification is required for professional features.",
    targetSelector: "#license-verification-card",
    action: (setActiveTab) => setActiveTab('Profile'),
  },
  { // 3
    title: "The Live Dashboard",
    content: "Once verified, this dashboard is your command center. From here, you can start a new session or jump into any tool.",
    targetSelector: "#live-dashboard-title",
    action: (setActiveTab) => setActiveTab('Homepage'),
  },
  { // 4
    title: "Start a Client Session",
    content: "The recommended workflow starts here. Upload a client photo for an instant, AI-powered hair diagnosis.",
    targetSelector: "#tab-intake-analyze",
  },
  { // 5
    title: "Craft the Perfect Formula",
    content: "Based on the AI analysis, the Formula Builder helps you create a precise, step-by-step color plan.",
    targetSelector: "#tab-formula-builder",
  },
  { // 6
    title: "Visualize the Result",
    content: "Use the Simulation Studio to edit the client's photo or generate new inspiration. You can use this creative tool anytime!",
    targetSelector: "#tab-simulation-studio",
  },
  { // 7
    title: "Get AI Guidance",
    content: "After generating a color plan, you can summon your AI Assistant for step-by-step guidance during the service.",
    targetSelector: "#assistant-bubble",
    action: (setActiveTab) => setActiveTab('Homepage'), // Go home so bubble is visible
  },
  { // 8
    title: "You're All Set!",
    content: "That's the core workflow. Feel free to explore, and remember you can restart this tour anytime. Happy formulating!",
    targetSelector: "#app-title",
  }
];

const TourGuide: React.FC<TourGuideProps> = ({ step, onNext, onPrev, onEnd, setActiveTab }) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  
  const currentStep = tourSteps[step];
  const isFinalStep = step === tourSteps.length - 1;

  useLayoutEffect(() => {
    if (!currentStep) {
      onEnd();
      return;
    }

    currentStep.action?.(setActiveTab);

    const timer = setTimeout(() => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Smarter positioning logic
        const placeAbove = rect.top + rect.height / 2 > window.innerHeight / 2;
        
        const newPopoverStyle: React.CSSProperties = {
          position: 'absolute',
          width: '320px',
          maxWidth: 'calc(100vw - 20px)',
          zIndex: 10001
        };

        if (placeAbove) {
          newPopoverStyle.bottom = `${window.innerHeight - rect.top + 10}px`;
        } else {
          newPopoverStyle.top = `${rect.bottom + 10}px`;
        }

        // Adjust for horizontal screen edges
        const popoverWidth = 320;
        const leftPos = rect.left + rect.width / 2;
        if (leftPos - popoverWidth / 2 < 10) {
            newPopoverStyle.left = '10px';
            newPopoverStyle.transform = 'translateX(0)';
        } else if (leftPos + popoverWidth / 2 > window.innerWidth - 10) {
            newPopoverStyle.left = `${window.innerWidth - 10}px`;
            newPopoverStyle.transform = 'translateX(-100%)';
        } else {
            newPopoverStyle.left = `${leftPos}px`;
            newPopoverStyle.transform = 'translateX(-50%)';
        }

        setPopoverStyle(newPopoverStyle);
      } else {
        console.warn(`Tour guide target not found: ${currentStep.targetSelector}`);
        setTargetRect(null); // Center on screen if target not found
        setPopoverStyle({
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            maxWidth: 'calc(100vw - 20px)',
            zIndex: 10001
        })
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [step, setActiveTab, onEnd, currentStep]);

  if (!currentStep || Object.keys(popoverStyle).length === 0) return null;

  const highlightStyle: React.CSSProperties = targetRect ? {
    position: 'absolute',
    left: `${targetRect.left - 4}px`,
    top: `${targetRect.top - 4}px`,
    width: `${targetRect.width + 8}px`,
    height: `${targetRect.height + 8}px`,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
    borderRadius: '8px',
    transition: 'all 0.3s ease-in-out',
    pointerEvents: 'none',
    zIndex: 10000,
    border: '2px solid var(--color-accent-pink)',
  } : {
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
  };
  
  const isAbove = popoverStyle.bottom !== undefined;
  
  const content = (
    <div className="fixed inset-0 z-[9999]">
      <div style={highlightStyle} />
      <div style={popoverStyle} className="bg-[--color-surface] border border-[--color-border] rounded-xl shadow-2xl p-4 animate-[fadeIn_0.3s_ease-out]">
         <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(${isAbove ? '10px' : '-10px'}); }
              to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
         {/* Arrow/Caret */}
        <div 
            className="absolute w-4 h-4 bg-[--color-surface] transform rotate-45 z-[-1]"
            style={{
                left: 'calc(50% - 8px)',
                ...(isAbove 
                    ? { bottom: '-8px', borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' } 
                    : { top: '-8px', borderTop: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)' })
            }}
        />
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] mb-2">{currentStep.title}</h3>
        <p className="text-[--color-text-secondary] text-sm mb-4">{currentStep.content}</p>
        <div className="flex items-center justify-between">
          <button onClick={onEnd} className="text-xs text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors">Skip Tour</button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={onPrev}
                className="text-sm font-semibold text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
                aria-label="Previous step"
              >
                Previous
              </button>
            )}
            <span className="text-xs font-data text-[--color-text-secondary]">{step + 1} / {tourSteps.length}</span>
            <button
              onClick={isFinalStep ? onEnd : onNext}
              className="bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] hover:opacity-90 text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-opacity duration-300"
              aria-label={isFinalStep ? 'Finish tour' : 'Next step'}
            >
              {isFinalStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(content, document.body);
};

export default TourGuide;