import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';

export default function AccessibilityPanel() {
  const { 
    theme, 
    setTheme, 
    fontFamily, 
    setFontFamily, 
    letterSpacing,
    increaseLetterSpacing,
    decreaseLetterSpacing
  } = useAccessibilitySettings();

  // Calculate a percentage width for the letter spacing indicator
  const spacingPercentage = Math.max(10, Math.min(90, 30 + (letterSpacing - 0.5) * 30));

  return (
    <div className="hidden md:block bg-gradient-to-r from-green-100 to-green-50 rounded-xl shadow-xl p-10 mb-12 transition-all duration-500">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">
        Accessibility Settings <span role="img" aria-label="Accessibility">♿️</span>
      </h2>
      <div className="grid md:grid-cols-3 gap-10">

        {/* Theme Toggle */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Display Theme <span role="img" aria-label="Theme">🎨</span>
          </h3>
          <div className="flex space-x-6">
            <button 
              className={`p-4 rounded-xl border-4 transition transform hover:scale-105 focus:outline-none ${
                theme === 'light'
                  ? 'border-green-600 bg-white text-gray-900'
                  : 'border-transparent bg-white text-gray-500'
              }`} 
              onClick={() => setTheme('light')}
              data-theme="light"
            >
              <span className="text-2xl mr-2" role="img" aria-label="Sun">☀️</span>Light
            </button>
            <button 
              className={`p-4 rounded-xl border-4 transition transform hover:scale-105 focus:outline-none ${
                theme === 'dark'
                  ? 'border-green-600 bg-gray-900 text-white'
                  : 'border-transparent bg-gray-900 text-gray-400'
              }`}
              onClick={() => setTheme('dark')}
              data-theme="dark"
            >
              <span className="text-2xl mr-2" role="img" aria-label="Moon">🌙</span>Dark
            </button>
          </div>
        </div>

        {/* Font Settings */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Font Type <span role="img" aria-label="Font">🔤</span>
          </h3>
          <select 
            id="font-family-select" 
            className="w-full p-4 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 transition text-lg bg-white text-gray-900"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="opendyslexic">OpenDyslexic</option>
            <option value="roboto">Roboto</option>
            <option value="arial">Arial</option>
          </select>
          <p className="mt-2 text-sm text-gray-600">Choose a font that is easier to read.</p>
        </div>

        {/* Text Spacing */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Letter Spacing <span role="img" aria-label="Spacing">↔️</span>
          </h3>
          <div className="flex items-center space-x-4 w-full">
            <button 
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition focus:outline-none" 
              onClick={decreaseLetterSpacing}
              data-spacing="decrease"
            >
              <span role="img" aria-label="Decrease">🔽</span>
            </button>
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div 
                id="letter-spacing-indicator" 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-700 rounded-full transition-all duration-300" 
                style={{ width: `${spacingPercentage}%` }}
              ></div>
            </div>
            <button 
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition focus:outline-none" 
              onClick={increaseLetterSpacing}
              data-spacing="increase"
            >
              <span role="img" aria-label="Increase">🔼</span>
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">Adjust the spacing between letters for better readability.</p>
        </div>

      </div>
      <p className="mt-10 text-center text-gray-700 text-lg">
        Made with ❤️ for You
      </p>
    </div>
  );
}
