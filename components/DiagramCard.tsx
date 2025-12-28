
import React, { useRef, useState } from 'react';
import { DiagramData, DiagramType } from '../types';
import { ChartFactory } from './ChartFactory';
import { Download, Copy, Maximize2, X, Check } from 'lucide-react';
import { copySvgToClipboard, downloadSvgAsPng } from '../utils/exportUtils';
import { clsx } from 'clsx';

interface DiagramCardProps {
  data: DiagramData;
  index: number;
  isDarkMode: boolean;
}

export const DiagramCard: React.FC<DiagramCardProps> = ({ data, index, isDarkMode }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReady = (el: SVGSVGElement) => {
    svgRef.current = el;
  };

  const handleCopy = async () => {
    if (!svgRef.current) return;
    const success = await copySvgToClipboard(svgRef.current, isDarkMode);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    downloadSvgAsPng(svgRef.current, data.type.toLowerCase(), isDarkMode);
  };

  const getTypeLabel = (type: DiagramType) => {
    return type.replace(/_/g, ' ');
  };

  const getTypeColor = (type: DiagramType) => {
    switch (type) {
      case DiagramType.FISHBONE: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300';
      case DiagramType.PARETO: return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300';
      case DiagramType.SWOT: return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300';
      case DiagramType.TIMELINE: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // Fullscreen Modal
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-fade-in">
        <div className={`relative w-full h-full max-w-[95vw] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-800">
             <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getTypeColor(data.type)}`}>
                  {getTypeLabel(data.type)}
                </span>
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Detailed View</h3>
             </div>
             <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
               <X className="w-6 h-6 text-slate-500" />
             </button>
          </div>
          <div className="flex-grow overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
             <ChartFactory data={data} onReady={() => {}} isDarkMode={isDarkMode} width={1400} />
          </div>
        </div>
      </div>
    );
  }

  // Standard Card
  return (
    <div className={`group relative flex flex-col rounded-2xl border transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-slate-850 border-slate-700 shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={clsx("px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shrink-0", getTypeColor(data.type))}>
            {data.type.substring(0, 2)}
          </div>
          <h3 className={`font-semibold text-sm sm:text-base truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {getTypeLabel(data.type)}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
           <button 
             onClick={() => setIsFullscreen(true)}
             className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             title="Fullscreen"
           >
             <Maximize2 className="w-4 h-4" />
           </button>
           <button 
             onClick={handleCopy}
             className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             title="Copy to Clipboard"
           >
             {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
           </button>
           <button 
             onClick={handleDownload}
             className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             title="Download PNG"
           >
             <Download className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-grow p-1 sm:p-4 overflow-hidden min-h-[350px] flex items-center justify-center bg-slate-50/30 dark:bg-slate-900/20">
        <div className="w-full overflow-x-auto scrollbar-hide py-2 px-2 flex justify-center">
            <div className="transform scale-[0.85] sm:scale-100 origin-center transition-transform">
               <ChartFactory data={data} onReady={handleReady} isDarkMode={isDarkMode} />
            </div>
        </div>
      </div>
    </div>
  );
};
