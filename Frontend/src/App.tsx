import React, { useState, useEffect } from 'react';
import { NavTab, AnalysisType, UploadedImageData } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeatureCards } from './components/FeatureCards';
import { WorkflowSection } from './components/WorkflowSection';
import { AnalysisWorkspace } from './components/AnalysisWorkspace';
import { AnalysisLoadingView } from './components/AnalysisLoadingView';
import { ResultsView } from './components/ResultsView';
import { GeospatialView } from './components/GeospatialView';
import { HistoryView } from './components/HistoryView';
import { AboutView } from './components/AboutView';
import { SettingsView } from './components/SettingsView';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { FinalAnalysisResult } from './types';
import { saveAnalysisToHistory } from './services/historyStorage';

export default function App() {
  // Parse initial route from URL
  const getInitialTab = (): NavTab => {
    const path = window.location.pathname.replace(/^\/+/, '').toLowerCase();
    if (path === 'results') return 'results';
    if (path === 'geospatial') return 'geospatial';
    if (path === 'analysis/loading') return 'analysis/loading';
    if (path === 'analyze') return 'analyze';
    if (path === 'history') return 'history';
    if (path === 'about') return 'about';
    if (path === 'settings') return 'settings';
    return 'home';
  };


  const [currentTab, setCurrentTab] = useState<NavTab>(getInitialTab);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Analysis Workspace shared state for backend dispatch
  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(null);
  const [query, setQuery] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('Auto Detect');
  const [latestResult, setLatestResult] = useState<FinalAnalysisResult | null>(null);

  // Sync route changes with browser history
  const navigateTo = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetPath = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  // Listen to popstate (browser back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle clicking feature card
  const handleSelectFeature = (_modality: 'Multispectral' | 'SAR' | 'Change Detection' | 'Optical') => {
    navigateTo('analyze');
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Universal Top Navigation */}
      <Header
        currentTab={currentTab}
        onNavigate={navigateTo}
      />

      {/* Main Viewport Content based on Route */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            {/* Hero Section */}
            <Hero
              onStartAnalysis={() => navigateTo('analyze')}
              onOpenDemo={() => setIsDemoOpen(true)}
            />

            {/* Feature Cards Section */}
            <FeatureCards
              onSelectFeature={handleSelectFeature}
            />

            {/* Bottom Workflow Section */}
            <WorkflowSection
              onStartAnalysis={() => navigateTo('analyze')}
            />
          </>
        )}

        {currentTab === 'analyze' && (
          <AnalysisWorkspace
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            query={query}
            setQuery={setQuery}
            analysisType={analysisType}
            setAnalysisType={setAnalysisType}
            onStartAnalysis={() => navigateTo('analysis/loading')}
          />
        )}

        {currentTab === 'analysis/loading' && (
          <AnalysisLoadingView
            uploadedImage={uploadedImage}
            query={query}
            analysisType={analysisType}
            onCancel={() => navigateTo('analyze')}
            onComplete={(result) => {
              setLatestResult(result);
              saveAnalysisToHistory(result);
              navigateTo('results');
            }}
          />
        )}

        {currentTab === 'results' && (
          <ResultsView
            result={latestResult}
            onNewAnalysis={() => navigateTo('analyze')}
            onOpenGeospatial={() => navigateTo('geospatial')}
          />
        )}

        {currentTab === 'geospatial' && (
          <GeospatialView
            result={latestResult}
            onBackToResults={() => navigateTo('results')}
            onNewAnalysis={() => navigateTo('analyze')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            onViewResult={(result) => {
              setLatestResult(result);
              navigateTo('results');
            }}
            onStartAnalysis={() => navigateTo('analyze')}
          />
        )}

        {currentTab === 'about' && (
          <AboutView />
        )}

        {currentTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Interactive Demonstration Modal */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onNavigateAnalyze={() => navigateTo('analyze')}
      />
    </div>
  );
}

