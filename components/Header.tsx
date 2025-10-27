import React, { useState, useEffect, useRef } from 'react';
import Tooltip from './common/Tooltip';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../services/firebaseService';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onLoginClick, onRegisterClick }) => {
  const { currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[--color-surface]/50 backdrop-blur-sm border-b border-[--color-border]/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 id="app-title" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink]">
            Chromalab Pro
          </h1>
          <div className="flex items-center gap-4">
             <Tooltip text={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 bg-[--color-surface] border border-[--color-border] rounded-full flex items-center justify-center hover:border-[--color-accent-pink] transition-colors"
                aria-label="Toggle theme"
              >
                <span className="text-xl transition-transform duration-300 transform-gpu" style={{ transform: theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </span>
              </button>
            </Tooltip>
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <Tooltip text="Account Settings">
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 bg-gradient-to-br from-[--color-accent-violet] to-[--color-accent-pink] rounded-full flex items-center justify-center text-white font-bold uppercase border-2 border-[--color-surface]">
                    {currentUser.displayName?.[0] || currentUser.email?.[0]}
                  </button>
                </Tooltip>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[--color-surface] border border-[--color-border] rounded-md shadow-lg z-20 py-1">
                    <div className="px-4 py-2 border-b border-[--color-border]">
                      <p className="text-sm font-medium text-[--color-text-primary] truncate">{currentUser.displayName || 'Stylist'}</p>
                      <p className="text-xs text-[--color-text-secondary] truncate">{currentUser.email}</p>
                    </div>
                    <a href="#profile" onClick={() => { /* This should navigate to a profile tab/page */ setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-[--color-text-primary] hover:bg-[--color-border]">Profile & License</a>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[--color-border]">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={onLoginClick} className="text-sm font-semibold text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors px-4 py-2 rounded-md">
                  Sign In
                </button>
                <button onClick={onRegisterClick} className="text-sm font-semibold bg-gradient-to-r from-[--color-accent-violet] to-[--color-accent-pink] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;