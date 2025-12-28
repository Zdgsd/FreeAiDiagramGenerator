
import React from 'react';
import { DiagramType, DiagramData, FishboneData, ParetoData, ActionPlanData, BrainwritingData, MindMapData, SwotData, RadarData, TimelineData } from '../types';
import { FishboneChart } from './FishboneChart';
import { ParetoChart } from './ParetoChart';
import { ActionPlanChart } from './ActionPlanChart';
import { BrainwritingChart } from './BrainwritingChart';
import { MindMapChart } from './MindMapChart';
import { SwotChart } from './SwotChart';
import { RadarChart } from './RadarChart';
import { TimelineChart } from './TimelineChart';

interface ChartFactoryProps {
  data: DiagramData;
  onReady: (svg: SVGSVGElement) => void;
  isDarkMode: boolean;
  width?: number;
  height?: number;
}

export const ChartFactory: React.FC<ChartFactoryProps> = (props) => {
  const { data } = props;
  
  // Helper to cast specific data types
  const p = (d: any) => ({ ...props, data: d });

  switch (data.type) {
    case DiagramType.FISHBONE: 
      return <FishboneChart {...p(data as FishboneData)} />;
    case DiagramType.PARETO: 
      return <ParetoChart {...p(data as ParetoData)} />;
    case DiagramType.ACTION_PLAN: 
      return <ActionPlanChart {...p(data as ActionPlanData)} />;
    case DiagramType.BRAINWRITING: 
      return <BrainwritingChart {...p(data as BrainwritingData)} />;
    case DiagramType.MIND_MAP: 
      return <MindMapChart {...p(data as MindMapData)} />;
    case DiagramType.SWOT: 
      return <SwotChart {...p(data as SwotData)} />;
    case DiagramType.RADAR: 
      return <RadarChart {...p(data as RadarData)} />;
    case DiagramType.TIMELINE: 
      return <TimelineChart {...p(data as TimelineData)} />;
    default: 
      return <div className="p-10 text-center opacity-50">Unknown Diagram Type</div>;
  }
};
