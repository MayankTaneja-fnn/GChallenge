import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GroqTest from "@/pages/GroqTest";
import { useAccessibilitySettings } from "./hooks/useAccessibilitySettings";

function App() {
  const { theme, fontFamily, letterSpacing, lineHeight } = useAccessibilitySettings();
  
  return (
    <div 
      id="app-container" 
      data-theme={theme} 
      data-font-family={fontFamily}
      data-letter-spacing={letterSpacing}
      data-line-height={lineHeight}
      className={`transition-settings min-h-screen
        ${theme === 'dark' ? 'bg-neutral-darkest text-white' : 'bg-neutral-lightest text-neutral-dark'}
        ${fontFamily === 'opendyslexic' ? 'font-opendyslexic' : fontFamily === 'roboto' ? 'font-roboto' : ''}
      `}
      style={{
        letterSpacing: letterSpacing ? `${letterSpacing}px` : 'normal',
        lineHeight: lineHeight ? `${lineHeight}` : 'normal',
      }}
    >
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/groq-test" component={GroqTest} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
