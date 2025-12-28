
import React, { useRef, useState } from 'react';
import { DiagramType, DiagramStatus } from '../types';
import { Sparkles, UploadCloud, FileText, Wand2, Loader2, PenTool } from 'lucide-react';
import { clsx } from 'clsx';

interface InputConsoleProps {
  mode: 'AUTO' | 'MANUAL';
  setMode: (m: 'AUTO' | 'MANUAL') => void;
  prompt: string;
  setPrompt: (s: string) => void;
  diagramType: DiagramType;
  setDiagramType: (t: DiagramType) => void;
  onGenerate: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  status: DiagramStatus;
  isDarkMode: boolean;
}

export const InputConsole: React.FC<InputConsoleProps> = ({
  mode, setMode, prompt, setPrompt, diagramType, setDiagramType, onGenerate, onFileUpload, status, isDarkMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => setIsDragOver(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       // Create a synthetic event to reuse existing handler
       const syntheticEvent = {
         target: { files: e.dataTransfer.files }
       } as unknown as React.ChangeEvent<HTMLInputElement>;
       onFileUpload(syntheticEvent);
    }
  };

  const isLoading = status === DiagramStatus.LOADING;

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl shadow-xl border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700 shadow-slate-950/50' : 'bg-white border-slate-200 shadow-xl shadow-blue-900/5'}`}>
      
      {/* Tabs */}
      <div className={`flex border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'}`}>
         <button 
           onClick={() => setMode('AUTO')}
           className={clsx(
             "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden",
             mode === 'AUTO' 
               ? (isDarkMode ? "text-blue-400 bg-slate-800/50" : "text-blue-600 bg-white shadow-sm") 
               : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
           )}
         >
           {mode === 'AUTO' && <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500"></div>}
           <Sparkles className="w-4 h-4" />
           <span>AI Auto-Analyst</span>
         </button>
         <button 
           onClick={() => setMode('MANUAL')}
           className={clsx(
             "flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden",
             mode === 'MANUAL' 
               ? (isDarkMode ? "text-indigo-400 bg-slate-800/50" : "text-indigo-600 bg-white shadow-sm") 
               : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
           )}
         >
           {mode === 'MANUAL' && <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500"></div>}
           <PenTool className="w-4 h-4" />
           <span>Manual Builder</span>
         </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Manual Type Selector */}
        {mode === 'MANUAL' && (
          <div className="animate-fade-in space-y-3">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Select Type</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(DiagramType).map((t) => (
                <button
                  key={t}
                  onClick={() => setDiagramType(t)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200",
                    diagramType === t 
                    ? (isDarkMode ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200')
                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50')
                  )}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Area Input */}
        <div className="relative group">
           <textarea
             disabled={isLoading}
             rows={mode === 'AUTO' ? 8 : 4}
             className={clsx(
               "w-full rounded-2xl p-5 text-sm sm:text-base resize-none outline-none transition-all ring-1 ring-inset",
               isDarkMode 
                 ? "bg-slate-950 border-transparent ring-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50" 
                 : "bg-slate-50 border-transparent ring-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-blue-500/20"
             )}
             placeholder={mode === 'AUTO' 
               ? "Paste your raw meeting notes, bug report, or CSV data here...\n\nWe'll analyze it, extract the key insights, and generate the perfect set of diagrams for you." 
               : `Describe the ${diagramType.toLowerCase().replace(/_/g,' ')} you want to build. Be specific about categories and items.`}
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
           />

           {/* Auto Mode File Drop Overlay */}
           {mode === 'AUTO' && !prompt && (
             <div 
               className={clsx(
                 "absolute inset-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 pointer-events-none",
                 isDragOver 
                   ? (isDarkMode ? "border-blue-400 bg-blue-900/20" : "border-blue-500 bg-blue-50")
                   : (isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-300 hover:border-slate-400")
               )}
             >
                <div className={clsx("p-4 rounded-full mb-3", isDarkMode ? "bg-slate-800" : "bg-white shadow-sm")}>
                   <UploadCloud className={clsx("w-6 h-6", isDarkMode ? "text-slate-400" : "text-blue-500")} />
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {isDragOver ? "Drop file to analyze" : "Drag & drop file or paste text"}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                   Supports .txt, .csv, .xlsx, .json
                </p>
             </div>
           )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
           {mode === 'AUTO' ? (
             <div className="w-full sm:w-auto">
               <input 
                 ref={fileInputRef}
                 type="file" 
                 accept=".csv,.xlsx,.xls,.txt,.json" 
                 className="hidden" 
                 onChange={onFileUpload} 
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isLoading}
                 className={clsx(
                   "w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                   isDarkMode
                     ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                     : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                 )}
               >
                 <FileText className="w-4 h-4" />
                 Upload File
               </button>
             </div>
           ) : (
             <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                * Tip: Be descriptive for best results.
             </div>
           )}

           <button
             onClick={onGenerate}
             disabled={isLoading || !prompt.trim()}
             className={clsx(
               "w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2",
               isDarkMode
                 ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/30 disabled:bg-slate-800 disabled:text-slate-600"
                 : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
             )}
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
             {isLoading ? 'Analysing...' : 'Generate Diagrams'}
           </button>
        </div>

      </div>
    </div>
  );
};
