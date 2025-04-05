import { useState } from 'react';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  mainTitle?: string;
}

export default function Header({ mainTitle = "TextEase" }: HeaderProps) {
  const { theme, toggleTheme } = useAccessibilitySettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-green-100 to-green-50 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-md bg-green-600 flex items-center justify-center text-white">
              <span role="img" aria-label="Book">📚</span>
            </div>
            <h1 className="text-4xl font-bold text-green-800">
              {mainTitle} <span role="img" aria-label="Sparkle">✨</span>
            </h1>
          </div>

          {/* Accessibility Controls */}
          <div className="hidden md:flex items-center space-x-10">
            <button 
              id="theme-toggle" 
              className="p-4 rounded-full hover:bg-green-200 focus:bg-green-200 transition" 
              aria-label="Toggle Dark Mode"
              onClick={toggleTheme}
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-3xl`}></i>
            </button>
            <div className="relative group">
              <button 
                id="font-toggle" 
                className="p-4 rounded-full hover:bg-green-200 focus:bg-green-200 transition" 
                aria-label="Font Settings"
              >
                <i className="fas fa-font text-3xl"></i>
              </button>
            </div>
            <div className="relative group">
              <button 
                id="spacing-toggle" 
                className="p-4 rounded-full hover:bg-green-200 focus:bg-green-200 transition" 
                aria-label="Spacing Settings"
              >
                <i className="fas fa-text-height text-3xl"></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            id="mobile-menu-button" 
            className="md:hidden p-4 rounded-full hover:bg-green-200 focus:bg-green-200 transition" 
            aria-label="Open Menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <i className="fas fa-bars text-3xl"></i>
          </button>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
