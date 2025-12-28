import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateDiagramData, analyzeDocument } from './services/geminiService';
import { parseFile } from './utils/fileParser';
import { FishboneChart } from './components/FishboneChart';
import { ParetoChart } from './components/ParetoChart';
import { ActionPlanChart } from './components/ActionPlanChart';
import { BrainwritingChart } from './components/BrainwritingChart';
import { MindMapChart } from './components/MindMapChart';
import { SwotChart } from './components/SwotChart';
import { RadarChart } from './components/RadarChart';
import { TimelineChart } from './components/TimelineChart';
import { Documentation } from './components/Documentation';
import { Footer } from './components/Footer';
import { DiagramData, DiagramStatus, DiagramType, FishboneData, ParetoData, ActionPlanData, BrainwritingData, MindMapData, SwotData, RadarData, TimelineData } from './types';
import { 
  Download, Copy, RefreshCw, Wand2, UploadCloud, 
  Network, HelpCircle, Sparkles, AlertCircle,
  Moon, Sun, CheckCircle2, XCircle
} from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [prompt, setPrompt] = useState('');
  const [diagramType, setDiagramType] = useState<DiagramType>(DiagramType.FISHBONE);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Dashboard State
  const [dashboardTitle, setDashboardTitle] = useState("New Analysis");
  const [dashboardSummary, setDashboardSummary] = useState("");
  const [diagrams, setDiagrams] = useState<DiagramData[]>([]);
  
  const [status, setStatus] = useState<DiagramStatus>(DiagramStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Refs for exporting (Keyed by index)
  const svgRefs = useRef<{ [key: number]: SVGSVGElement | null }>({});

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
        // Feed text content to prompt
        setPrompt(textContent); 
        await runAnalysis(textContent);
      } catch (err: any) {
        setError("Error parsing file: " + err.message);
        setStatus(DiagramStatus.ERROR);
      }
    }
  };

  const handleManualGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus(DiagramStatus.LOADING);
    setError(null);
    setDiagrams([]);

    try {
      const result = await generateDiagramData(prompt, diagramType);
      setDiagrams([result]);
      setDashboardTitle("Single Diagram Analysis");
      setDashboardSummary("Manual generation based on user prompt.");
      setStatus(DiagramStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Generation failed.");
      setStatus(DiagramStatus.ERROR);
    }
  };

  const handleAutoAnalyze = async () => {
    if (!prompt.trim()) return;
    await runAnalysis(prompt);
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

  // --- Export Logic ---

  const prepareSvgForExport = (svgElement: SVGSVGElement, exportScale: number = 1) => {
      const clone = svgElement.cloneNode(true) as SVGSVGElement;
      
      let baseWidth = 0;
      let baseHeight = 0;

      // 1. Prioritize ViewBox for logical size
      if (svgElement.viewBox && svgElement.viewBox.baseVal && svgElement.viewBox.baseVal.width > 0) {
         baseWidth = svgElement.viewBox.baseVal.width;
         baseHeight = svgElement.viewBox.baseVal.height;
      } 
      // 2. Fallback to width attribute
      else if (svgElement.getAttribute("width") && !svgElement.getAttribute("width")?.includes('%')) {
         baseWidth = parseFloat(svgElement.getAttribute("width") || "0");
         baseHeight = parseFloat(svgElement.getAttribute("height") || "0");
      } 
      // 3. Fallback to bounding rect
      else {
         const bb = svgElement.getBoundingClientRect();
         baseWidth = bb.width;
         baseHeight = bb.height;
      }

      const finalWidth = baseWidth * exportScale;
      const finalHeight = baseHeight * exportScale;

      clone.setAttribute("width", finalWidth.toString());
      clone.setAttribute("height", finalHeight.toString());
      clone.style.width = finalWidth + 'px';
      clone.style.height = finalHeight + 'px';
      clone.style.backgroundColor = isDarkMode ? "#1e293b" : "#ffffff";
      
      return { clone, width: finalWidth, height: finalHeight };
  }

  const copyToClipboard = useCallback(async (index: number) => {
    const svgElement = svgRefs.current[index];
    if (!svgElement) return;

    try {
      const { clone, width, height } = prepareSvgForExport(svgElement, 2.0);
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clone);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = width;
      canvas.height = height;

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        if(ctx) {
             ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        try {
          canvas.toBlob(async (blob) => {
            if (!blob) throw new Error("Canvas failure");
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            const btn = document.getElementById(`copy-btn-${index}`);
            if(btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = `<span class="flex items-center gap-1 text-green-600 dark:text-green-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Copied!</span>`;
                setTimeout(() => { btn.innerHTML = originalText; }, 2000);
            }
            URL.revokeObjectURL(url);
          }, 'image/png');
        } catch (err) {
          console.error(err);
          alert("Failed to copy. Try downloading instead.");
        }
      };
      img.src = url;
    } catch (err) {
      console.error("Copy failed", err);
    }
  }, [isDarkMode]);

  const downloadImage = useCallback(async (index: number, type: string) => {
    const svgElement = svgRefs.current[index];
    if (!svgElement) return;

    try {
        const { clone, width, height } = prepareSvgForExport(svgElement, 3.0);
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clone);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = width;
        canvas.height = height;

        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            if (ctx) {
                ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const link = document.createElement('a');
                link.download = `${type.toLowerCase()}_diagram_${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                URL.revokeObjectURL(url);
            }
        };
        img.src = url;

    } catch (err) {
        console.error("Download failed", err);
        alert("Failed to download image.");
    }
  }, [isDarkMode]);

  const renderChart = (data: DiagramData, index: number) => {
    const refCallback = (el: SVGSVGElement) => { svgRefs.current[index] = el; };
    const props = { data: anyData(data), onReady: refCallback, isDarkMode };

    switch (data.type) {
      case DiagramType.FISHBONE: return <FishboneChart {...props} data={data as FishboneData} />;
      case DiagramType.PARETO: return <ParetoChart {...props} data={data as ParetoData} />;
      case DiagramType.ACTION_PLAN: return <ActionPlanChart {...props} data={data as ActionPlanData} />;
      case DiagramType.BRAINWRITING: return <BrainwritingChart {...props} data={data as BrainwritingData} />;
      case DiagramType.MIND_MAP: return <MindMapChart {...props} data={data as MindMapData} />;
      case DiagramType.SWOT: return <SwotChart {...props} data={data as SwotData} />;
      case DiagramType.RADAR: return <RadarChart {...props} data={data as RadarData} />;
      case DiagramType.TIMELINE: return <TimelineChart {...props} data={data as TimelineData} />;
      default: return null;
    }
  };

  // Helper type cast
  const anyData = (d: DiagramData): any => d;

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-100 dark:selection:bg-blue-900 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Documentation isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} isDarkMode={isDarkMode} />
      
      {/* Navbar */}
      <header className={`border-b sticky top-0 z-30 shadow-sm backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-lg ${isDarkMode ? 'bg-blue-600 shadow-blue-900/20' : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-200'}`}>
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-bold tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Diagram Gen</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Toggle Dark Mode"
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <button 
               onClick={() => setIsDocsOpen(true)}
               className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               <HelpCircle className="w-4 h-4" />
               Guide
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-12">
        
        {/* Hero & Input Section */}
        <section className="flex flex-col gap-8 items-center max-w-4xl mx-auto">
           <div className="text-center space-y-4 px-2">
             <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Turn Text into <span className="text-blue-600 dark:text-blue-400">Charts & Diagrams</span>
             </h1>
             <h2 className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               The free AI Ishikawa, Pareto, and Gantt generator. Paste your meeting notes, bug reports, or CSV data and get professional visualizations instantly.
             </h2>
           </div>

           <div className={`w-full rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl duration-500 border ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-slate-900/50' : 'bg-white border-slate-200 shadow-slate-200/50 hover:shadow-slate-200/60'}`}>
              
              {/* Mode Toggle */}
              <div className={`flex border-b p-1 ${isDarkMode ? 'border-slate-700 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
                 <button 
                   onClick={() => setMode('AUTO')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                     mode === 'AUTO' 
                     ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-sm' : 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5')
                     : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50')
                   }`}
                 >
                   <Sparkles className="w-4 h-4" />
                   <span className="hidden sm:inline">Auto Analyst</span>
                   <span className="sm:hidden">Auto</span>
                 </button>
                 <button 
                   onClick={() => setMode('MANUAL')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                     mode === 'MANUAL' 
                     ? (isDarkMode ? 'bg-slate-700 text-blue-400 shadow-sm' : 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5')
                     : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50')
                   }`}
                 >
                   <CheckCircle2 className="w-4 h-4" />
                   <span className="hidden sm:inline">Manual Generator</span>
                   <span className="sm:hidden">Manual</span>
                 </button>
              </div>

              <div className="p-4 sm:p-8 space-y-6">
                 {/* Manual Chips */}
                 {mode === 'MANUAL' && (
                    <div className="flex flex-wrap gap-2 animate-fade-in">
                      {Object.values(DiagramType).map((t) => (
                        <button
                          key={t}
                          onClick={() => setDiagramType(t)}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                            diagramType === t 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105' 
                            : (isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-600 hover:border-blue-500 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-slate-50')
                          }`}
                        >
                          {t.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="relative group">
                    <textarea
                      rows={6}
                      className={`block w-full rounded-xl border text-sm sm:text-base p-4 transition-all resize-none leading-relaxed focus:ring-4 ${
                          isDarkMode 
                          ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-blue-500/10'
                      }`}
                      placeholder={mode === 'AUTO' 
                        ? "Paste your meeting minutes, bug report, or raw CSV data here. We'll analyze it and pick the best diagrams." 
                        : `Describe the ${diagramType.toLowerCase().replace(/_/g,' ')} you need. E.g., "Production delays caused by machinery failure, staff shortage..."`}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    
                    {/* File Upload Overlay (Auto Mode Only) */}
                    {mode === 'AUTO' && !prompt && (
                      <div className="absolute inset-0 top-12 bottom-4 left-4 right-4 pointer-events-none flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                         <div className="flex flex-col items-center gap-2">
                           <UploadCloud className={`w-8 h-8 sm:w-10 sm:h-10 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                           <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Or drag & drop text files</span>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {mode === 'AUTO' ? (
                      <label className={`w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl border transition-all text-sm font-medium shadow-sm group ${
                          isDarkMode
                          ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-slate-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                      }`}>
                        <UploadCloud className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`} />
                        <span>Import File</span>
                        <input type="file" accept=".csv,.xlsx,.xls,.txt,.json" className="hidden" onChange={handleFileUpload} />
                      </label>
                    ) : (
                      <div className={`hidden sm:block text-xs font-medium italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        * Be specific with categories for best results
                      </div>
                    )}
                    
                    <button
                      onClick={mode === 'AUTO' ? handleAutoAnalyze : handleManualGenerate}
                      disabled={status === DiagramStatus.LOADING || !prompt.trim()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-bold tracking-wide hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform active:scale-95"
                    >
                      {status === DiagramStatus.LOADING ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                      {status === DiagramStatus.LOADING ? 'Processing...' : 'Generate Diagrams'}
                    </button>
                  </div>
              </div>
           </div>
           
        </section>

        {/* Error Alert */}
        {error && (
          <div className={`max-w-4xl mx-auto border p-4 rounded-xl shadow-sm flex items-start gap-4 animate-slide-up ${isDarkMode ? 'bg-red-950/40 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-grow">
               <p className="font-bold text-lg mb-1">Generation Failed</p>
               <p className="text-sm opacity-90 leading-relaxed mb-2">{error}</p>
               <p className="text-xs opacity-75">
                 Tip: If you see a JSON error, try simplifying your text or removing special characters.
               </p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition">
              <XCircle className="w-5 h-5 opacity-50" />
            </button>
          </div>
        )}

        {/* Results Section */}
        {diagrams.length > 0 && (
          <div className={`space-y-8 animate-fade-in pt-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="text-center space-y-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>Analysis Results</span>
              <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{dashboardTitle}</h2>
              <p className={`max-w-3xl mx-auto text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{dashboardSummary}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {diagrams.map((diag, idx) => (
                <div key={idx} className={`flex flex-col ${diagrams.length === 1 || diag.type === DiagramType.FISHBONE ? 'xl:col-span-2' : ''}`}>
                  <div className={`rounded-2xl shadow-sm border hover:shadow-xl transition-shadow duration-500 overflow-hidden flex flex-col h-full ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-200'}`}>
                    
                    {/* Card Header */}
                    <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            {diag.type === DiagramType.FISHBONE && <span className="font-bold text-xs">FB</span>}
                            {diag.type === DiagramType.PARETO && <span className="font-bold text-xs">PA</span>}
                            {diag.type === DiagramType.TIMELINE && <span className="font-bold text-xs">TL</span>}
                            {diag.type === DiagramType.SWOT && <span className="font-bold text-xs">SW</span>}
                            {!['FISHBONE','PARETO','TIMELINE','SWOT'].includes(diag.type) && <span className="font-bold text-xs">DG</span>}
                         </div>
                         <h3 className={`font-semibold text-sm sm:text-base truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                           {diag.type.replace(/_/g, ' ')}
                         </h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadImage(idx, diag.type)}
                          className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="Download HD PNG"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          id={`copy-btn-${idx}`}
                          onClick={() => copyToClipboard(idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${isDarkMode ? 'text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* Chart Area - Mobile Responsive Wrapper */}
                    <div className={`p-0 sm:p-6 flex-grow flex flex-col items-center justify-center min-h-[400px] ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/30'}`}>
                      {/* Horizontal Scroll Container for Mobile */}
                      <div className="w-full overflow-x-auto scrollbar-hide py-4 px-2 sm:px-0">
                         <div className="min-w-[600px] md:min-w-0 flex justify-center">
                            {renderChart(diag, idx)}
                         </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}