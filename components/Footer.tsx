import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <footer className={`mt-12 py-10 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* SEO Keywords Block - Styled to be unobtrusive but readable by bots */}
      <div className={`mb-8 pb-8 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
         <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Popular Tools</h3>
         <div className={`text-xs leading-relaxed flex flex-wrap gap-x-4 gap-y-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>AI Fishbone Generator</span>
            <span>Ishikawa Diagram Maker</span>
            <span>Pareto Chart Analysis</span>
            <span>Text to Flowchart AI</span>
            <span>Automated Gantt Chart</span>
            <span>Root Cause Analysis Tool</span>
            <span>SWOT Analysis Generator</span>
            <span>Free Graph Maker</span>
            <span>Gemini AI Visualization</span>
            <span>CSV to Chart</span>
            <span>Meeting Notes to Diagram</span>
            <span>Project Timeline Creator</span>
            <span>No-Code Data Vis</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
          © {new Date().getFullYear()} Free AI Diagram Generator. All rights reserved.
        </div>
        <div className={`flex items-center gap-6 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <span className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-default">
             Powered by Gemini <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-1 ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>v3</span>
          </span>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1 text-slate-400">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by Sadok B.
          </span>
        </div>
      </div>
    </div>
  </footer>
);