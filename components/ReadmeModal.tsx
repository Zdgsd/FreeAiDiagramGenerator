import React from 'react';
import { X, BookOpen, Cpu, Rocket } from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className={`relative rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>README.md</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={`overflow-y-auto p-6 space-y-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          
          <div className="space-y-4">
            <h1 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Free AI Diagram Generator</h1>
            <p className="italic text-sm">By Sadok B.</p>
            <p>
              Welcome to the <strong>Free AI Diagram Generator</strong>, the application that exists because manually aligning rectangles in PowerPoint is a specific circle of hell that no one should have to visit.
            </p>
            <p>
              This tool uses the Google Gemini API to read your chaotic meeting notes, bug reports, or CSV files and instantly hallucinate—I mean, <em>generate</em>—structured, professional data visualizations. It renders them in D3.js so they look crisp, sharp, and like you spent four hours on them instead of four seconds.
            </p>
          </div>

          <section className="space-y-3">
             <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>The "Why"</h2>
             <ul className="list-disc list-inside space-y-1 pl-2">
                <li>You have data.</li>
                <li>Your boss loves diagrams.</li>
                <li>You love not making diagrams.</li>
             </ul>
             <p>This tool bridges that gap.</p>
          </section>

          <section className="space-y-3">
             <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Features</h2>
             <div className="grid gap-4 md:grid-cols-2">
               <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                 <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>1. Auto Analyst</h3>
                 <p className="text-sm">Drag and drop a CSV file, or paste a wall of text. The AI will read it, summarize it, and decide which diagrams best represent the data.</p>
               </div>
               <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                 <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>2. Manual Generator</h3>
                 <p className="text-sm">You select the diagram type, you type the prompt. "Pareto chart of reasons why the server crashed."</p>
               </div>
             </div>
          </section>

          <section className="space-y-3">
             <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Cpu className="w-5 h-5"/> Tech Stack
             </h2>
             <p>We used the good stuff. No jQuery were harmed in the making of this app.</p>
             <div className="flex flex-wrap gap-2">
                {["React 19", "Tailwind CSS", "D3.js", "Google Gemini API", "Vercel"].map(tag => (
                   <span key={tag} className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-600'}`}>
                     {tag}
                   </span>
                ))}
             </div>
          </section>
          
          <section className="space-y-3">
             <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Rocket className="w-5 h-5"/> Installation & Setup
             </h2>
             <p className="text-sm">If you want to run this locally:</p>
             <div className={`p-4 rounded-xl font-mono text-sm overflow-x-auto ${isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-slate-500"># 1. Install dependencies</span>
                    <div className="mt-1">npm install</div>
                  </div>
                  <div>
                    <span className="text-slate-500"># 2. Environment Setup (.env)</span>
                    <div className="mt-1 text-green-600 dark:text-green-400">API_KEY=your_google_gemini_api_key_here</div>
                  </div>
                  <div>
                    <span className="text-slate-500"># 3. Run it</span>
                    <div className="mt-1 text-blue-600 dark:text-blue-400">npm start</div>
                  </div>
                </div>
             </div>
          </section>

          <section className="pt-4 border-t border-slate-200 dark:border-slate-700">
             <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>License</h3>
             <p className="text-sm">MIT. Do whatever you want with it.</p>
          </section>

        </div>
      </div>
    </div>
  );
};