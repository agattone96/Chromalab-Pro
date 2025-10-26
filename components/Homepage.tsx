import React, { useState, useEffect } from 'react';
import type { Tab } from '../types';
import Card from './common/Card';
import AccordionItem from './common/AccordionItem';
import Tooltip from './common/Tooltip';
import { DiagnosticsIcon } from './icons/ClipboardIcon';
import { FormulaIcon } from './icons/ColorSwatchIcon';
import { CameraIcon } from './icons/CameraIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { AIIcon } from './icons/LightBulbIcon';
import { TourIcon } from './icons/TourIcon';
import Modal from './common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface HomepageProps {
  setActiveTab: (tab: Tab) => void;
  startTour: () => void;
}

type FeatureStatus = 'Active' | 'Updated' | 'New' | 'Beta';

interface OnboardingContent {
  title: string;
  description: string;
  bullets: string[];
}

interface Feature {
  name: string;
  purpose: string;
  status: FeatureStatus;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  tab: Tab | null;
  onboarding?: OnboardingContent;
  tooltipText?: string;
  requiresVerification: boolean;
}

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  name: string;
  icon: string;
  questions: FaqItem[];
}

const ChangelogModalContent: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-[--color-text-primary] mb-2">Version Timeline</h3>
      <div className="flex items-center text-sm text-[--color-text-secondary]">
        <span className="font-data bg-gray-700 px-2 py-0.5 rounded">v2.8</span>
        <span className="flex-grow h-px bg-[--color-border] mx-2"></span>
        <span className="font-bold font-data bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] text-white px-2 py-0.5 rounded">v3.0</span>
      </div>
    </div>
    
    <div>
      <h3 className="font-semibold text-[--color-text-primary] mb-2">What's New in v3.0</h3>
      <ul className="space-y-3 list-disc list-inside pl-2 text-sm text-[--color-text-secondary]">
        <li><span className="text-[--color-text-primary] font-medium">Full Authentication:</span> Secure login, registration, and profile management for stylists.</li>
        <li><span className="text-[--color-text-primary] font-medium">License Verification:</span> Role-based access control ensures pro features are for verified stylists only.</li>
        <li><span className="text-[--color-text-primary] font-medium">Functional AI Assistant:</span> Get conversational, step-by-step guidance on your generated color plans.</li>
        <li><span className="text-[--color-text-primary] font-medium">Light/Dark Mode:</span> Toggle between themes to match your salon's lighting environment.</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold text-[--color-text-primary] mb-2">Developer Notes for Stylists</h3>
      <p className="text-sm text-[--color-text-secondary]">
        "Version 3.0 is the biggest leap forward for Chromalab Pro, transforming it into a full-fledged, secure platform. The new authentication and verification system provides the foundation for building a true professional community. We're incredibly excited to activate the AI Assistant to provide real-time support during your services. Thank you for being part of this journey!"
      </p>
    </div>
  </div>
);


const Homepage: React.FC<HomepageProps> = ({ setActiveTab, startTour }) => {
  const { currentUser } = useAuth();
  const [modalContent, setModalContent] = useState<OnboardingContent | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [showTourPrompt, setShowTourPrompt] = useState(false);
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('chromalabTourDismissed')) {
      setShowTourPrompt(true);
    }
  }, []);

  const handleDismissTour = () => {
    localStorage.setItem('chromalabTourDismissed', 'true');
    setShowTourPrompt(false);
  };

  const handleStartTour = () => {
    handleDismissTour(); // Dismiss banner when tour starts
    startTour();
  };


  const features: Feature[] = [
    { name: 'Intake & Analyze', purpose: 'Upload photo & get AI diagnostics', status: 'Active', icon: DiagnosticsIcon, tab: 'Intake & Analyze', tooltipText: 'Start here: Upload a photo for AI-powered hair analysis.', requiresVerification: true },
    { name: 'Formula Builder', purpose: 'Generate precise color plans', status: 'Updated', icon: FormulaIcon, tab: 'Formula Builder', tooltipText: 'Now supports auto developer ratioing.', requiresVerification: true },
    { name: 'Simulation Studio', purpose: 'Preview results with new gradient tools', status: 'New', icon: CameraIcon, tab: 'Simulation Studio', tooltipText: 'Just dropped: Visualize dual-tone gradients on your client.', requiresVerification: true },
    { name: 'Research & Education', purpose: 'Live salon data & color trend analysis', status: 'Active', icon: BookOpenIcon, tab: 'Research & Education', tooltipText: 'Access real-time trend data with Google Search grounding.', requiresVerification: true },
    { name: 'AI Assistant', purpose: 'Step-by-step formula walkthrough', status: 'Beta', icon: AIIcon, tab: null, tooltipText: 'Interactive step-by-step strand test planner.', requiresVerification: true },
  ];

  const whatsNewFeatures = [
    {
      tag: '🔒 Secure',
      tagColor: 'text-[--color-accent-coral]',
      title: 'Full Authentication is Live',
      summary: 'Manage your profile and license.',
      tab: 'Profile'
    },
    {
      tag: '🤖 New',
      tagColor: 'text-[--color-accent-violet]',
      title: 'AI Assistant Activated',
      summary: 'Get interactive guidance on formulas.',
      tab: 'Formula Builder'
    },
    {
      tag: '☀️ Light Mode',
      tagColor: 'text-cyan-400',
      title: 'New Theme Available',
      summary: 'Toggle between light and dark modes in the header.',
      tab: 'Homepage'
    }
  ];
  
  useEffect(() => {
    const tickerInterval = setInterval(() => {
        setCurrentTickerIndex(prevIndex => (prevIndex + 1) % whatsNewFeatures.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(tickerInterval);
  }, [whatsNewFeatures.length]);

  const priorityOrder = ['Intake & Analyze', 'Formula Builder', 'Simulation Studio'];
  
  const sortedFeatures = [...features].sort((a, b) => {
    const aIsPriority = priorityOrder.includes(a.name);
    const bIsPriority = priorityOrder.includes(b.name);

    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    if (aIsPriority && bIsPriority) return priorityOrder.indexOf(a.name) - priorityOrder.indexOf(b.name);
    
    // Fallback sort, though not strictly needed with the 5-column layout
    return a.name.localeCompare(b.name);
  });

  const handleFeatureClick = (feature: Feature) => {
    if (feature.requiresVerification && !currentUser?.isVerified) {
      setActiveTab('Profile');
      return;
    }
    if (feature.tab) {
      setActiveTab(feature.tab);
    } else {
      // Handle non-tab features like opening a modal
      if (feature.onboarding) setModalContent(feature.onboarding);
    }
  };

  const faqs: FaqCategory[] = [
    {
      name: "AI Learning",
      icon: "🧠",
      questions: [
        { q: "What lighting conditions work best?", a: "Use photos taken in natural, indirect daylight. Avoid harsh shadows, direct sunlight, and strong artificial lighting for the most accurate AI analysis." },
        { q: "How does the AI detect metallic dyes?", a: "The AI identifies unusual color patterns that suggest metallic salts or box dye. It raises a 'Risk Flag', but a physical strand test is always recommended for confirmation." },
      ],
    },
    {
      name: "Formulation Science",
      icon: "⚗️",
      questions: [
        { q: "How are toner mixes calculated?", a: "The AI uses color theory to analyze the hair's dominant undertone (e.g., yellow) and recommends a toner with the opposite base (e.g., violet) to neutralize warmth." },
      ],
    },
     {
      name: "App Workflow",
      icon: "💾",
      questions: [
        { q: "How do I start a new client session?", a: "Once your license is verified, navigate to the 'Intake & Analyze' tab or click its card on the homepage. Click 'Start a New Formula Session' to select a photo from your device for automatic analysis." },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {showTourPrompt && (
        <div className="bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="font-bold text-white">First time here?</h3>
              <p className="text-sm text-white/80">Take the 90-second tour to learn the workflow.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleDismissTour} className="text-sm text-white/80 hover:text-white font-medium py-2 px-4 rounded-md transition-colors">Dismiss</button>
            <button onClick={handleStartTour} className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-md transition-colors">Take Tour</button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="text-center pt-8 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-br from-[--color-surface] via-[#101216] to-[--color-surface] p-12 animate-subtle-pulse">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 sm:text-5xl">
            Your AI-Powered Color Co-Pilot
          </h1>
          <div className="mt-4 text-lg max-w-3xl mx-auto text-[--color-text-secondary] flex items-center justify-center gap-3">
            <Tooltip text="Click to view full changelog">
              <button onClick={() => setIsHistoryModalOpen(true)} className="font-data text-sm bg-[--color-base] px-2 py-1 rounded-full text-[--color-accent-pink] hover:bg-[--color-border] transition-colors">v3.0</button>
            </Tooltip>
            —
            <div className="relative h-6 w-[450px] overflow-hidden text-left">
              <div className="transition-opacity duration-700 ease-in-out" key={currentTickerIndex}>
                  <p 
                    className="cursor-pointer" 
                    onClick={() => setActiveTab(whatsNewFeatures[currentTickerIndex].tab as Tab)}>
                    <span className={`${whatsNewFeatures[currentTickerIndex].tagColor} font-semibold`}>{whatsNewFeatures[currentTickerIndex].title}</span>
                    <span className="text-sm text-[--color-text-secondary] ml-2 hidden sm:inline">{whatsNewFeatures[currentTickerIndex].summary}</span>
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Dashboard (Auto-Reordering) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 id="live-dashboard-title" className="text-2xl font-bold border-l-4 border-[--color-accent-pink] pl-4">Live Dashboard</h2>
          <Tooltip text="Start a guided tour (Shift + T)">
            <button 
              onClick={startTour}
              className="flex items-center gap-2 text-sm font-semibold text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
              aria-label="Start guided tour"
            >
              <TourIcon className="w-5 h-5" />
              Start Tour
            </button>
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {sortedFeatures.map((feature, index) => {
            const isLocked = feature.requiresVerification && !currentUser?.isVerified;
            const tooltipText = isLocked ? "Verify your license in your Profile to unlock." : (feature.tooltipText || `Go to the ${feature.name} tab`);

            return (
              <Tooltip key={feature.name} text={tooltipText}>
                <div
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="animate-fade-in-slide-up"
                >
                  <Card
                    onClick={() => handleFeatureClick(feature)}
                    className={`flex flex-col h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 group relative
                    ${isLocked ? 'opacity-60 grayscale-[50%] hover:opacity-100 hover:grayscale-0' : 'hover:border-[--color-border]'}`}
                  >
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-[--color-text-primary]">{feature.name}</h3>
                        <feature.icon className="w-8 h-8 text-[--color-accent-violet]/50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <p className="text-sm text-[--color-text-secondary]">{feature.purpose}</p>
                    </div>
                    <div className="mt-4 text-xs font-data text-right">
                      {isLocked && <LockClosedIcon className="w-5 h-5 absolute top-4 right-4 text-yellow-400" />}
                    </div>
                  </Card>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Interactive FAQ & Mini Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-[--color-accent-pink] pl-4">Common Questions</h2>
            <div className="space-y-6">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask a question... (coming soon)" 
                  disabled
                  className="w-full bg-black/20 border border-[--color-border] rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-[--color-accent-pink] focus:border-[--color-accent-pink] disabled:opacity-50"
                />
                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-[--color-text-secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
              {faqs.map((category) => (
                <div key={category.name}>
                    <h3 className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wider text-[--color-text-secondary] mb-3">
                      <span className="text-xl">{category.icon}</span>
                      {category.name}
                    </h3>
                    <Card className="p-0">
                      <div className="divide-y divide-[--color-border]">
                        {category.questions.map((faq, index) => (
                          <AccordionItem key={index} title={faq.q}>
                            <p>{faq.a}</p>
                          </AccordionItem>
                        ))}
                      </div>
                    </Card>
                </div>
              ))}
            </div>
        </div>
        <div>
           <h2 className="text-2xl font-bold mb-6 border-l-4 border-[--color-accent-pink] pl-4">Analytics</h2>
           <Card>
              <h3 className="font-semibold text-[--color-text-primary] mb-4">Your Week at a Glance</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-[--color-text-secondary]">Clients Analyzed:</span>
                  <span className="font-bold text-lg font-data text-[--color-accent-violet]">12</span>
                </div>
                 <div className="flex justify-between items-baseline">
                  <span className="text-[--color-text-secondary]">Most Common Tone:</span>
                  <span className="font-data text-[--color-text-primary]">Warm Blonde</span>
                </div>
                 <div className="flex justify-between items-baseline">
                  <span className="text-[--color-text-secondary]">Avg. Porosity:</span>
                  <span className="font-data text-[--color-text-primary]">Medium</span>
                </div>
              </div>
              <p className="text-xs text-center mt-4 text-[--color-text-secondary]/50">(Demo data)</p>
           </Card>
        </div>
      </div>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Feature History & Updates"
      >
        <ChangelogModalContent />
         <div className="mt-6 pt-4 border-t border-[--color-border] flex justify-end">
            <button 
              onClick={() => setIsHistoryModalOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
      </Modal>
    </div>
  );
};

export default Homepage;
