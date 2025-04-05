import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  theme: 'light' | 'dark';
  fontFamily: 'roboto' | 'opendyslexic' | 'arial';
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
}

export function useAccessibilitySettings() {
  // Get saved settings from localStorage or use defaults
  const getInitialSettings = (): AccessibilitySettings => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      theme: 'light',
      fontFamily: 'roboto',
      fontSize: 16,
      letterSpacing: 0.5,
      lineHeight: 1.5
    };
  };

  const [settings, setSettings] = useState<AccessibilitySettings>(getInitialSettings);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply settings to body
    document.body.dataset.theme = settings.theme;
    document.body.dataset.fontFamily = settings.fontFamily;
    
    // Apply font family
    if (settings.fontFamily === 'opendyslexic') {
      document.body.classList.add('font-opendyslexic');
      document.body.classList.remove('font-roboto');
    } else if (settings.fontFamily === 'roboto') {
      document.body.classList.add('font-roboto');
      document.body.classList.remove('font-opendyslexic');
    } else {
      document.body.classList.remove('font-opendyslexic', 'font-roboto');
    }
    
    // Apply font size (to body for global effect)
    document.body.style.fontSize = `${settings.fontSize}px`;
    
    // Apply letter spacing
    document.body.style.letterSpacing = `${settings.letterSpacing}px`;
    
    // Apply line height
    document.body.style.lineHeight = `${settings.lineHeight}`;
    
  }, [settings]);

  // Theme functions
  const setTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({ 
      ...prev, 
      theme: prev.theme === 'light' ? 'dark' : 'light' 
    }));
  };

  // Font functions
  const setFontFamily = (fontFamily: 'roboto' | 'opendyslexic' | 'arial') => {
    setSettings(prev => ({ ...prev, fontFamily }));
  };

  // Font size functions
  const setFontSize = (fontSize: number) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const increaseFontSize = () => {
    setSettings(prev => ({ 
      ...prev, 
      fontSize: Math.min(28, prev.fontSize + 2) 
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({ 
      ...prev, 
      fontSize: Math.max(12, prev.fontSize - 2) 
    }));
  };

  // Letter spacing functions
  const setLetterSpacing = (letterSpacing: number) => {
    setSettings(prev => ({ ...prev, letterSpacing }));
  };

  const increaseLetterSpacing = () => {
    setSettings(prev => ({ 
      ...prev, 
      letterSpacing: Math.min(3, prev.letterSpacing + 0.5) 
    }));
  };

  const decreaseLetterSpacing = () => {
    setSettings(prev => ({ 
      ...prev, 
      letterSpacing: Math.max(0, prev.letterSpacing - 0.5) 
    }));
  };

  // Line height functions
  const setLineHeight = (lineHeight: number) => {
    setSettings(prev => ({ ...prev, lineHeight }));
  };

  const increaseLineHeight = () => {
    setSettings(prev => ({ 
      ...prev, 
      lineHeight: Math.min(3, prev.lineHeight + 0.25) 
    }));
  };

  const decreaseLineHeight = () => {
    setSettings(prev => ({ 
      ...prev, 
      lineHeight: Math.max(1, prev.lineHeight - 0.25) 
    }));
  };

  return {
    ...settings,
    setTheme,
    toggleTheme,
    setFontFamily,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    setLetterSpacing,
    increaseLetterSpacing,
    decreaseLetterSpacing,
    setLineHeight,
    increaseLineHeight,
    decreaseLineHeight,
  };
}
