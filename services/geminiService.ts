import { GoogleGenAI, Type } from "@google/genai";
import { DiagramData, DiagramType, FishboneData, ParetoData, ActionPlanData, BrainwritingData, MindMapData, SwotData, RadarData, TimelineData, DashboardResponse } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// --- Unified Dashboard Generator ---

export const analyzeDocument = async (context: string): Promise<DashboardResponse> => {
  // We ask the AI to decide what to build based on the data provided.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert Data Analyst and Visualization Architect.
    
    Here is a raw dataset or document content:
    """
    ${context.substring(0, 20000)} 
    """
    (Input truncated to 20k chars if too long)

    Tasks:
    1. Analyze the content.
    2. Provide a short executive summary (max 2 sentences).
    3. Generate a JSON object containing a list of 1 to 4 distinct diagrams that best visualize this data.
    
    Rules for selecting diagrams:
    - If there is time-series data or a schedule -> TIMELINE.
    - If there are numerical comparisons or frequencies -> PARETO.
    - If there are multi-variable scores (skills, performance attributes) -> RADAR.
    - If there is a root cause analysis text -> FISHBONE.
    - If there is strategic planning -> SWOT or ACTION_PLAN.
    - If there is brainstorming -> MIND_MAP or BRAINWRITING.

    Return a JSON with "title", "summary", and "diagrams" (an array).
    Each item in "diagrams" must have a "type" field matching one of: FISHBONE, PARETO, ACTION_PLAN, BRAINWRITING, MIND_MAP, SWOT, RADAR, TIMELINE.
    Structure each diagram data object according to standard schema for that type.
    `,
    config: {
      responseMimeType: "application/json",
      // We use a loose schema here to allow polymorphism in the 'diagrams' array, 
      // as strictly defining a union of 8 types in one schema can sometimes confuse the parser.
      // We trust the model to follow the "type" instruction.
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  // Clean up potential markdown formatting if model adds it despite MIME type
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
  return JSON.parse(jsonStr) as DashboardResponse;
};

// --- Single Generator (Legacy / Manual Mode) ---

export const generateDiagramData = async (prompt: string, type: DiagramType): Promise<DiagramData> => {
  try {
    switch (type) {
      case DiagramType.PARETO: return await generatePareto(prompt);
      case DiagramType.ACTION_PLAN: return await generateActionPlan(prompt);
      case DiagramType.BRAINWRITING: return await generateBrainwriting(prompt);
      case DiagramType.MIND_MAP: return await generateMindMap(prompt);
      case DiagramType.SWOT: return await generateSwot(prompt);
      case DiagramType.RADAR: return await generateRadar(prompt);
      case DiagramType.TIMELINE: return await generateTimeline(prompt);
      case DiagramType.FISHBONE: 
      default: return await generateFishbone(prompt);
    }
  } catch (error) {
    console.error("Error generating diagram data:", error);
    throw error;
  }
};

// --- Specific Generators ---

const generateFishbone = async (prompt: string): Promise<FishboneData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed Ishikawa Fishbone Diagram data for: "${prompt}". 
    Ensure you return a JSON object strictly matching this TypeScript interface:
    {
      type: "FISHBONE",
      problem: string,
      categories: [
        { name: string, items: string[] }
      ]
    }
    Provide comprehensive lists of items for each category where relevant.`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.FISHBONE };
};

const generatePareto = async (prompt: string): Promise<ParetoData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate Pareto Chart data for: "${prompt}". Return JSON with title and items (name, value).`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.PARETO };
};

const generateActionPlan = async (prompt: string): Promise<ActionPlanData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate Action Plan data for: "${prompt}". Return JSON with centralTopic and nodes (title, items).`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.ACTION_PLAN };
};

const generateBrainwriting = async (prompt: string): Promise<BrainwritingData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate Brainwriting table for: "${prompt}". Return JSON with topic, columns, and rows (participant, ideas).`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.BRAINWRITING };
};

const generateMindMap = async (prompt: string): Promise<MindMapData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate Mind Map data for: "${prompt}". Return JSON with centralTopic and nodes (title, items).`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.MIND_MAP };
};

const generateSwot = async (prompt: string): Promise<SwotData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a SWOT Analysis for: "${prompt}".
    Return JSON with:
    - topic
    - strengths (array of strings)
    - weaknesses (array of strings)
    - opportunities (array of strings)
    - threats (array of strings)`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.SWOT };
};

const generateRadar = async (prompt: string): Promise<RadarData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate Radar/Spider Chart data for: "${prompt}".
    Identify 5-8 measurable attributes (e.g. Skills, Performance Metrics).
    Assign a normalized value (0-100) to each.
    Return JSON with: title, axes [{label, value}].`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.RADAR };
};

const generateTimeline = async (prompt: string): Promise<TimelineData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a Project Timeline/Gantt data for: "${prompt}".
    Identify 5-10 key sequential events or milestones with dates (YYYY-MM-DD or descriptive like "Q1 2024").
    Return JSON with: title, events [{date, title, description}].`,
    config: { responseMimeType: "application/json" }
  });
  return { ...JSON.parse(response.text!), type: DiagramType.TIMELINE };
};
