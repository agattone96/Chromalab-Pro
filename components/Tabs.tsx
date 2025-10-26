import React from 'react';
import type { Tab } from '../types';
import Tooltip from './common/Tooltip';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const tabs: { name: Tab, requiresVerification: boolean }[] = [
    { name: 'Homepage', requiresVerification: false },
    { name: 'Intake & Analyze', requiresVerification: true },
    { name: 'Formula Builder', requiresVerification: true },
    { name: 'Simulation Studio', requiresVerification: true },
    { name: 'Research & Education', requiresVerification: true },
    { name: 'Profile', requiresVerification: false },
  ];

  const getTabId = (tabName: Tab) => `tab-${tabName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`;

  return (
    <div className="border-b border-[--color-border]">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 px-4 sm:px-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const tabId = getTabId(tab.name);
          const isLocked = tab.requiresVerification && !currentUser?.isVerified;

          const buttonClasses = `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--color-surface] focus:ring-[--color-accent-pink] rounded-t-sm flex items-center gap-2 ${
            activeTab === tab.name
              ? 'border-[--color-accent-violet] text-[--color-accent-violet]'
              : isLocked
                ? 'border-transparent text-gray-500 cursor-not-allowed'
                : 'border-transparent text-[--color-text-secondary] hover:text-[--color-text-primary] hover:border-gray-500'
          }`;
          
          const tabContent = (
            <>
              {isLocked && <LockClosedIcon className="w-4 h-4" />}
              {tab.name}
            </>
          );

          if (isLocked) {
            return (
              <Tooltip key={tab.name} text="Verify your license in your Profile to unlock.">
                <span id={tabId} className={buttonClasses} aria-disabled="true">
                  {tabContent}
                </span>
              </Tooltip>
            );
          }

          return (
            <button key={tab.name} id={tabId} onClick={() => setActiveTab(tab.name)} className={buttonClasses}>
              {tabContent}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
