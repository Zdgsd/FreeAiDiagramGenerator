import React from 'react';
import { X, FileText, Share2, Download, Zap, BarChart2, GitGraph, Clock, Target, Activity, Lightbulb } from 'lucide-react';

interface DocumentationProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const Documentation: React.FC<DocumentationProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  if (!isOpen) return null;

  const diagramTypes = [
    { name: "Fishbone (Ishikawa)", icon: <GitGraph className="w-5 h-5" />, desc: "Root cause analysis identifying potential factors causing an overall effect." },
    { name: "Pareto Chart", icon: <BarChart2 className="w-5 h-5" />, desc: "Highlights the most significant factors in a data set (80/20 rule)." },
    { name: "Timeline / Gantt", icon: <Clock className="w-5 h-5" />, desc: "Visualizes project schedules, sequences of events, or historical milestones." },
    { name: "SWOT Analysis", icon: <Activity className="w-5 h-5" />, desc: "Strategic planning technique identifying Strengths, Weaknesses, Opportunities, and Threats." },
    { name: "Action Plan", icon: <Target className="w-5 h-5" />, desc: "Structured steps and items needed to achieve a central goal." },
    { name: "Radar Chart", icon: <Zap className="w-5 h-5" />, desc: "Compares multiple quantitative variables (e.g., skills, performance metrics)." },
  ];

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
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Documentation & User Guide</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: How to Use */}
          <section>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>1</span>
              How to Use
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>1. Input Data</div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select <strong>Auto Analyst</strong> to upload a CSV/Excel file or paste raw report text. The AI will decide the best diagrams for you.
                </p>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>2. Manual Generation</div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select <strong>Manual Mode</strong> if you know exactly what you want (e.g., "Fishbone for Software Bugs").
                </p>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>3. Export & Share</div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Use the <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-medium ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300'}`}><Share2 className="w-3 h-3"/> Copy</span> button to paste directly into Word or Docs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Supported Diagrams */}
          <section>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>2</span>
              Supported Diagrams
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diagramTypes.map((d) => (
                <div key={d.name} className={`flex gap-3 p-3 rounded-lg border transition-all ${isDarkMode ? 'hover:bg-slate-850 border-transparent hover:border-slate-700' : 'hover:bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <div className="text-slate-500 mt-1">{d.icon}</div>
                  <div>
                    <div className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{d.name}</div>
                    <div className={`text-xs leading-relaxed mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Prompting Tips */}
          <section className={`rounded-xl p-5 border ${isDarkMode ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50/50 border-blue-100'}`}>
             <h3 className={`text-base font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
               <Lightbulb className="w-4 h-4" /> Pro Tips for Better Results
             </h3>
             <ul className={`list-disc list-inside space-y-2 text-sm ${isDarkMode ? 'text-blue-200/80' : 'text-blue-800'}`}>
               <li><strong>Be Specific:</strong> Instead of "sales data", try "Pareto chart of sales decline causes in Q3".</li>
               <li><strong>Paste Raw Data:</strong> You can paste messy meeting notes or CSV data directly. The AI handles the cleanup.</li>
               <li><strong>Iterate:</strong> If the result isn't perfect, switch to Manual Mode and specify exactly what categories or axes you need.</li>
             </ul>
          </section>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t flex justify-end ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
          <button 
            onClick={onClose}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-lg ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/30' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
          >
            Got it, let's start
          </button>
        </div>
      </div>
    </div>
  );
};