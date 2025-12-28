export enum DiagramType {
  FISHBONE = 'FISHBONE',
  PARETO = 'PARETO',
  ACTION_PLAN = 'ACTION_PLAN',
  BRAINWRITING = 'BRAINWRITING',
  MIND_MAP = 'MIND_MAP',
  SWOT = 'SWOT',
  RADAR = 'RADAR',
  TIMELINE = 'TIMELINE'
}

// --- Existing Types ---

export interface FishboneCause {
  name: string;
  items: string[];
}

export interface FishboneData {
  type: DiagramType.FISHBONE;
  problem: string;
  categories: FishboneCause[];
}

export interface ParetoItem {
  name: string;
  value: number;
}

export interface ParetoData {
  type: DiagramType.PARETO;
  title: string;
  items: ParetoItem[];
}

export interface ActionPlanNode {
  title: string;
  items: string[];
}

export interface ActionPlanData {
  type: DiagramType.ACTION_PLAN;
  centralTopic: string;
  nodes: ActionPlanNode[];
}

export interface BrainwritingRow {
  participant: string;
  ideas: string[];
}

export interface BrainwritingData {
  type: DiagramType.BRAINWRITING;
  topic: string;
  columns: string[];
  rows: BrainwritingRow[];
}

export interface MindMapData {
  type: DiagramType.MIND_MAP;
  centralTopic: string;
  nodes: ActionPlanNode[];
}

// --- New Types ---

export interface SwotData {
  type: DiagramType.SWOT;
  topic: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RadarAxis {
  label: string;
  value: number; // 0-100 or 0-10 normalized
}

export interface RadarData {
  type: DiagramType.RADAR;
  title: string;
  axes: RadarAxis[];
}

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export interface TimelineData {
  type: DiagramType.TIMELINE;
  title: string;
  events: TimelineEvent[];
}

export type DiagramData = 
  | FishboneData 
  | ParetoData 
  | ActionPlanData 
  | BrainwritingData 
  | MindMapData 
  | SwotData
  | RadarData
  | TimelineData;

export interface DashboardResponse {
  title: string;
  summary: string;
  diagrams: DiagramData[];
}

export enum DiagramStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
