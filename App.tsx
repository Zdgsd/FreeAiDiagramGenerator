
import React, { useState, useEffect } from 'react';
import { generateDiagramData, analyzeDocument } from './services/geminiService';
import { parseFile } from './utils/fileParser';
import { DiagramCard } from './components/DiagramCard';
import { InputConsole } from './components/InputConsole';
import { Documentation } from './components/Documentation';
import { Footer } from './components/Footer';
import { DiagramData, DiagramStatus, DiagramType } from './types';
import { 
  Network, HelpCircle, Moon, Sun, AlertCircle, XCircle
} from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [prompt, setPrompt] = useState('');
  const [diagramType, setDiagramType] = useState<DiagramType>(DiagramType.FISHBONE);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Dashboard State
  const [dashboardTitle, setDashboardTitle] = useState("Analysis Results");
  const [dashboardSummary, setDashboardSummary] = useState("");
  const [diagrams, setDiagrams] = useState<DiagramData[]>([]);
  
  const [status, setStatus] = useState<DiagramStatus>(DiagramStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Handlers ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStatus(DiagramStatus.LOADING);
      setError(null);
      setDiagrams([]);
      setDashboardSummary("Reading file...");
      
      try {
        const textContent = await parseFile(file);
        setPrompt(textContent); 
        await runAnalysis(textContent);
      } catch (err: any) {
        setError("Error parsing file: " + err.message);
        setStatus(DiagramStatus.ERROR);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    if (mode === 'AUTO') {
      await runAnalysis(prompt);
    } else {
      await runManualGeneration();
    }
  };

  const runManualGeneration = async () => {
    setStatus(DiagramStatus.LOADING);
    setError(null);
    setDiagrams([]);

    try {
      const result = await generateDiagramData(prompt, diagramType);
      setDiagrams([result]);
      setDashboardTitle("Custom Diagram");
      setDashboardSummary("Manual generation based on user prompt.");
      setStatus(DiagramStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Generation failed.");
      setStatus(DiagramStatus.ERROR);
    }
  };

  const runAnalysis = async (content: string) => {
    setStatus(DiagramStatus.LOADING);
    setError(null);
    try {
      const dashboard = await analyzeDocument(content);
      setDashboardTitle(dashboard.title);
      setDashboardSummary(dashboard.summary);
      setDiagrams(dashboard.diagrams);
      setStatus(DiagramStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed.");
      setStatus(DiagramStatus.ERROR);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Documentation isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} isDarkMode={isDarkMode} />
      
      {/* Navbar */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-600 text-white'}`}>
              <Network className="w-5 h-5" />
            </div>
            <h1 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Diagram Gen</h1>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <button 
               onClick={() => setIsDocsOpen(true)}
               className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
             >
               <HelpCircle className="w-4 h-4" />
               Guide
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
           <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             Visualize complexity <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">in seconds.</span>
           </h1>
           <p className={`text-lg sm:text-xl leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
             Turn messy notes, reports, and data into professional Ishikawa, Pareto, and Gantt charts using advanced AI.
           </p>
        </section>

        {/* Input Console */}
        <InputConsole 
          mode={mode} setMode={setMode}
          prompt={prompt} setPrompt={setPrompt}
          diagramType={diagramType} setDiagramType={setDiagramType}
          onGenerate={handleGenerate}
          onFileUpload={handleFileUpload}
          status={status}
          isDarkMode={isDarkMode}
        />

        {/* Error Notification */}
        {error && (
          <div className={`max-w-4xl mx-auto p-4 rounded-xl border flex gap-4 animate-slide-up ${isDarkMode ? 'bg-red-950/20 border-red-900/50 text-red-300' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-grow">
               <p className="font-semibold">Something went wrong</p>
               <p className="text-sm opacity-90">{error}</p>
            </div>
            <button onClick={() => setError(null)}><XCircle className="w-5 h-5 opacity-50" /></button>
          </div>
        )}

        {/* Results Grid */}
        {diagrams.length > 0 && (
          <section className="space-y-8 animate-fade-in pt-10 border-t border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{dashboardTitle}</h2>
                <p className={`mt-1 max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{dashboardSummary}</p>
              </div>
              <div className={`text-xs font-mono px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                {diagrams.length} Diagram{diagrams.length !== 1 ? 's' : ''} Generated
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {diagrams.map((diag, idx) => (
                <div key={idx} className={diagrams.length === 1 || diag.type === DiagramType.FISHBONE ? 'xl:col-span-2' : ''}>
                  <DiagramCard data={diag} index={idx} isDarkMode={isDarkMode} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
