import { useState } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import AccessibilityPanel from '../components/AccessibilityPanel';
import TabNavigation from '../components/TabNavigation';
import TextTools from '../components/TextTools';
import ChatAssistant from '../components/ChatAssistant';
import MobileAccessibilityBar from '../components/MobileAccessibilityBar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('text-tools');
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-8 mb-20">
        {/* Settings Panel (Desktop) */}
        <AccessibilityPanel />
        
        {/* Tabs Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Tab Content: Text Tools */}
        <TextTools isActive={activeTab === 'text-tools'} />
        
        {/* Tab Content: Chat Assistant */}
        <ChatAssistant isActive={activeTab === 'chat'} />
        
        {/* GROQ Test Link */}
        <div className="mt-8 text-center">
          <Link href="/groq-test" className="text-blue-600 hover:underline">
            Go to GROQ Test Page
          </Link>
        </div>
      </main>
      
      {/* Mobile Accessibility Controls (Fixed Bottom) */}
      <MobileAccessibilityBar />
    </>
  );
}
