import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { NewAssessmentPage } from './pages/NewAssessmentPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { PathwayReferencePage } from './pages/PathwayReferencePage';
import { MaterialsPage } from './pages/MaterialsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AssessmentResult, WasteInput } from './types';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeResult, setActiveResult] = useState<AssessmentResult | null>(null);
  const [prefillData, setPrefillData] = useState<WasteInput | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Verify backend connectivity on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await api.checkHealth();
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  const handleAssessmentCompleted = (result: AssessmentResult) => {
    setActiveResult(result);
    setCurrentTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoricalAssessment = async (id: number) => {
    try {
      const result = await api.getAssessment(id);
      setActiveResult(result);
      setCurrentTab('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Could not load assessment details: ${err.message}`);
    }
  };

  const handleSelectDemo = (demoInput: WasteInput) => {
    setPrefillData(demoInput);
    setCurrentTab('new-assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewAssessment = () => {
    setPrefillData(null);
    setCurrentTab('new-assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Backend Offline Warning Banner if API is not yet reachable */}
      {backendStatus === 'offline' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
          <span>Backend service connecting at http://127.0.0.1:8000...</span>
          <button
            onClick={checkBackendHealth}
            className="underline hover:opacity-80"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Global Navigation Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardPage
            onStartAssessment={handleStartNewAssessment}
            onSelectAssessment={handleSelectHistoricalAssessment}
            onSelectDemo={handleSelectDemo}
          />
        )}

        {currentTab === 'new-assessment' && (
          <NewAssessmentPage
            onAssessmentCompleted={handleAssessmentCompleted}
            prefillData={prefillData}
          />
        )}

        {currentTab === 'result' && activeResult && (
          <AssessmentResultPage
            result={activeResult}
            onNewAssessment={handleStartNewAssessment}
            onViewHistory={() => setCurrentTab('history')}
          />
        )}

        {currentTab === 'result' && !activeResult && (
          <div className="text-center py-16 space-y-4">
            <p className="text-sm text-slate-500">No active assessment selected.</p>
            <button
              onClick={handleStartNewAssessment}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Start New Assessment
            </button>
          </div>
        )}

        {currentTab === 'history' && (
          <HistoryPage
            onSelectAssessment={handleSelectHistoricalAssessment}
            onNewAssessment={handleStartNewAssessment}
          />
        )}

        {currentTab === 'rules' && <PathwayReferencePage />}

        {currentTab === 'materials' && <MaterialsPage />}

        {currentTab === 'about' && <MethodologyPage />}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default App;
