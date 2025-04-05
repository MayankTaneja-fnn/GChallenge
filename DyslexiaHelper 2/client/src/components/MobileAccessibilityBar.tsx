import { useState } from 'react';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';

export default function MobileAccessibilityBar() {
  const { 
    toggleTheme, 
    setFontFamily, 
    increaseFontSize, 
    decreaseFontSize,
    increaseLetterSpacing,
    decreaseLetterSpacing
  } = useAccessibilitySettings();

  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isTextSizeMenuOpen, setIsTextSizeMenuOpen] = useState(false);

  // Toggle font menu
  const toggleFontMenu = () => {
    setIsFontMenuOpen(!isFontMenuOpen);
    setIsTextSizeMenuOpen(false);
  };

  // Toggle text size menu
  const toggleTextSizeMenu = () => {
    setIsTextSizeMenuOpen(!isTextSizeMenuOpen);
    setIsFontMenuOpen(false);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-10">
      <div className="flex justify-around items-center">
        {/* Text Size & Spacing */}
        <div className="relative">
          <button 
            className="flex flex-col items-center p-3" 
            aria-label="Text Size"
            onClick={toggleTextSizeMenu}
          >
            <i className="fas fa-text-height text-green-700 text-2xl"></i>
            <span className="text-sm mt-1 text-gray-800">Size</span>
          </button>

          {isTextSizeMenuOpen && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 w-52">
              <div className="text-center mb-3 text-lg font-semibold text-gray-800">Text Size</div>
              <div className="flex justify-around mb-4">
                <button 
                  className="p-3 bg-gray-200 rounded-md hover:bg-gray-300 transition" 
                  onClick={decreaseFontSize}
                  aria-label="Decrease Font Size"
                >
                  <i className="fas fa-minus text-xl"></i>
                </button>
                <button 
                  className="p-3 bg-gray-200 rounded-md hover:bg-gray-300 transition" 
                  onClick={increaseFontSize}
                  aria-label="Increase Font Size"
                >
                  <i className="fas fa-plus text-xl"></i>
                </button>
              </div>
              <div className="text-center mb-3 text-lg font-semibold text-gray-800">Letter Spacing</div>
              <div className="flex justify-around">
                <button 
                  className="p-3 bg-gray-200 rounded-md hover:bg-gray-300 transition" 
                  onClick={decreaseLetterSpacing}
                  aria-label="Decrease Letter Spacing"
                >
                  <i className="fas fa-compress-alt text-xl"></i>
                </button>
                <button 
                  className="p-3 bg-gray-200 rounded-md hover:bg-gray-300 transition" 
                  onClick={increaseLetterSpacing}
                  aria-label="Increase Letter Spacing"
                >
                  <i className="fas fa-expand-alt text-xl"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Font Family Options */}
        <div className="relative">
          <button 
            className="flex flex-col items-center p-3" 
            aria-label="Font Options"
            onClick={toggleFontMenu}
          >
            <i className="fas fa-font text-green-700 text-2xl"></i>
            <span className="text-sm mt-1 text-gray-800">Font</span>
          </button>

          {isFontMenuOpen && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 w-52">
              <div className="text-center mb-3 text-lg font-semibold text-gray-800">Font Family</div>
              <button 
                className="w-full p-3 mb-2 bg-gray-200 rounded-md text-left hover:bg-gray-300 transition" 
                onClick={() => setFontFamily('opendyslexic')}
                aria-label="Set font to OpenDyslexic"
              >
                OpenDyslexic
              </button>
              <button 
                className="w-full p-3 mb-2 bg-gray-200 rounded-md text-left hover:bg-gray-300 transition" 
                onClick={() => setFontFamily('roboto')}
                aria-label="Set font to Roboto"
              >
                Roboto
              </button>
              <button 
                className="w-full p-3 bg-gray-200 rounded-md text-left hover:bg-gray-300 transition" 
                onClick={() => setFontFamily('arial')}
                aria-label="Set font to Arial"
              >
                Arial
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          className="flex flex-col items-center p-3" 
          aria-label="Theme Toggle"
          onClick={toggleTheme}
        >
          <i className="fas fa-moon text-green-700 text-2xl"></i>
          <span className="text-sm mt-1 text-gray-800">Theme</span>
        </button>

        {/* Speech Options */}
        <button 
          className="flex flex-col items-center p-3" 
          aria-label="Speech Options"
        >
          <i className="fas fa-volume-up text-green-700 text-2xl"></i>
          <span className="text-sm mt-1 text-gray-800">Speech</span>
        </button>
      </div>
    </div>
  );
}
