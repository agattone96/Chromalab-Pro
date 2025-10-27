import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Homepage from './components/Homepage';
import IntakeTab from './components/IntakeTab';
import PlanTab from './components/PlanTab';
import ImageStudioTab from './components/ImageStudioTab';
import ResearchTab from './components/ResearchTab';
import ProfileTab from './components/auth/ProfileTab';
import Tooltip from './components/common/Tooltip';
import GlobalSpinner from './components/common/GlobalSpinner';
import TourGuide from './components/common/TourGuide';
import AssistantPanel from './components/assistant/AssistantPanel';
import { useAuth } from './contexts/AuthContext';
import type { HairAnalysis, ColorPlan, Tab, ClientPhoto, AppUser } from './types';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Homepage');
  const [clientPhoto, setClientPhoto] = useState<ClientPhoto | null>(null);
  const [hairAnalysis, setHairAnalysis] = useState<HairAnalysis | null>(null);
  const [colorPlan, setColorPlan] = useState<ColorPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlanned, setIsAutoPlanned] = useState<boolean>(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Auto-open assistant when a new color plan is created
  useEffect(() => {
    if (colorPlan && currentUser?.isVerified) {
      setIsAssistantOpen(true);
    }
  }, [colorPlan, currentUser?.isVerified]);

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const withGlobalLoading = async <T,>(promise: () => Promise<T>): Promise<T> => {
    setIsGlobalLoading(true);
    try {
      return await promise();
    } finally {
      setIsGlobalLoading(false);
    }
  };
  
  const startTour = () => {
    setClientPhoto(null);
    setHairAnalysis(null);
    setColorPlan(null);
    setError(null);
    setIsAutoPlanned(false);
    setActiveTab('Homepage');
    setTourStep(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'T') {
        startTour();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTourNext = () => {
    setTourStep(prev => (prev !== null ? prev + 1 : null));
  };

  const endTour = () => {
    setTourStep(null);
  };



  const renderContent = () => {
    // This check is important for RBAC
    if (!currentUser) return <Homepage setActiveTab={setActiveTab} startTour={startTour} />;
    
    const isVerified = currentUser.isVerified;

    switch (activeTab) {
      case 'Homepage':
        return <Homepage setActiveTab={setActiveTab} startTour={startTour} />;
      case 'Intake & Analyze':
        return isVerified ? (
          <IntakeTab
            setClientPhoto={setClientPhoto}
            clientPhoto={clientPhoto}
            setHairAnalysis={setHairAnalysis}
            hairAnalysis={hairAnalysis}
            setColorPlan={setColorPlan}
            setError={setError}
            setActiveTab={setActiveTab}
            setIsAutoPlanned={setIsAutoPlanned}
            withGlobalLoading={withGlobalLoading}
          />
        ) : <ProfileTab setActiveTab={setActiveTab} />;
      case 'Formula Builder':
        return isVerified ? (
          <PlanTab
            hairAnalysis={hairAnalysis}
            setColorPlan={setColorPlan}
            colorPlan={colorPlan}
            setError={setError}
            isAutoPlanned={isAutoPlanned}
            setIsAutoPlanned={setIsAutoPlanned}
            setClientPhoto={setClientPhoto}
            setHairAnalysis={setHairAnalysis}
            withGlobalLoading={withGlobalLoading}
          />
        ) : <ProfileTab setActiveTab={setActiveTab} />;
      case 'Simulation Studio':
        return isVerified ? (
          <ImageStudioTab clientPhoto={clientPhoto} setError={setError} withGlobalLoading={withGlobalLoading} />
        ) : <ProfileTab setActiveTab={setActiveTab} />;
      case 'Research & Education':
        return isVerified ? (
          <ResearchTab setError={setError} withGlobalLoading={withGlobalLoading} />
        ) : <ProfileTab setActiveTab={setActiveTab} />;
      case 'Profile':
        return <ProfileTab setActiveTab={setActiveTab} />;
      default:
        return null;
    }
  };

  const isTourActive = tourStep !== null;

  return (
    <div className="min-h-screen bg-[--color-base] text-[--color-text-primary]">
      {isGlobalLoading && <GlobalSpinner />}
      {isTourActive && (
        <TourGuide
          step={tourStep}
          onNext={handleTourNext}
          onEnd={endTour}
          setActiveTab={setActiveTab}
        />
      )}
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-[--color-surface] shadow-2xl rounded-2xl border border-[--color-border]">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="p-4 sm:p-6 md:p-8">
            {error && (
              <div
                className="bg-red-900/50 border border-red-600/50 text-red-300 px-4 py-3 rounded-lg relative mb-6"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <Tooltip text="Clear Error">
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
                    <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </span>
                </Tooltip>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </main>
      <AssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        colorPlan={colorPlan}
        hairAnalysis={hairAnalysis}
      />
    </div>
  );
};

export default App;