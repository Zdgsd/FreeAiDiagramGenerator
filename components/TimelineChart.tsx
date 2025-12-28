import React, { useEffect, useRef } from 'react';
import { select, scalePoint } from 'd3';
import { TimelineData } from '../types';

interface TimelineChartProps {
  data: TimelineData;
  width?: number;
  height?: number;
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ 
  data, 
  width = 1000, 
  height = 500,
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const eventsRaw = data.events || [];
    if (eventsRaw.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const colors = {
      title: isDarkMode ? "#e2e8f0" : "#1e293b",
      line: isDarkMode ? "#475569" : "#cbd5e1",
      stem: isDarkMode ? "#64748b" : "#94a3b8",
      boxFill: isDarkMode ? "#1e293b" : "#ffffff",
      boxStroke: isDarkMode ? "#475569" : "#e2e8f0",
      boxHeader: isDarkMode ? "#334155" : "#f1f5f9",
      textDate: isDarkMode ? "#94a3b8" : "#64748b",
      textTitle: isDarkMode ? "#f1f5f9" : "#1e293b",
      textDesc: isDarkMode ? "#cbd5e1" : "#94a3b8",
      bg: isDarkMode ? "#0f172a" : "#ffffff"
    };

    const margin = { top: 70, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    
    const events = eventsRaw.map(e => ({ ...e }));
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Export BG
    svg.insert("rect", ":first-child").attr("width", width).attr("height", height).attr("fill", colors.bg);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif")
      .attr("font-weight", "700")
      .attr("font-size", "22px")
      .attr("fill", colors.title)
      .text(data.title || "Timeline");

    const lineY = (height - margin.top - margin.bottom) / 2;
    
    g.append("line")
      .attr("x1", 0).attr("y1", lineY).attr("x2", innerWidth).attr("y2", lineY)
      .attr("stroke", colors.line).attr("stroke-width", 4).attr("stroke-linecap", "round");

    const xScale = scalePoint()
        .domain(events.map((_, i) => i.toString()))
        .range([50, innerWidth - 50])
        .padding(0.5);

    events.forEach((ev, i) => {
        const x = xScale(i.toString()) || 0;
        const isTop = i % 2 === 0;
        const stemHeight = 60;
        const y = isTop ? lineY - stemHeight : lineY + stemHeight;
        const eventG = g.append("g");

        eventG.append("line")
            .attr("x1", x).attr("y1", lineY).attr("x2", x).attr("y2", y)
            .attr("stroke", colors.stem).attr("stroke-width", 2).attr("stroke-dasharray", "4,2");

        eventG.append("circle")
            .attr("cx", x).attr("cy", lineY).attr("r", 6)
            .attr("fill", "#3b82f6").attr("stroke", isDarkMode ? "#1e293b" : "#ffffff").attr("stroke-width", 2);

        const boxW = 140;
        const boxH = 70;
        const boxX = x - boxW / 2;
        const boxY = isTop ? y - boxH : y;

        eventG.append("rect")
            .attr("x", boxX).attr("y", boxY).attr("width", boxW).attr("height", boxH).attr("rx", 6)
            .attr("fill", colors.boxFill).attr("stroke", colors.boxStroke).attr("stroke-width", 1);
            
        eventG.append("rect")
            .attr("x", boxX).attr("y", boxY).attr("width", boxW).attr("height", 24).attr("rx", 6)
            .attr("fill", colors.boxHeader);
            
        eventG.append("text")
            .attr("x", x).attr("y", boxY + 16).attr("text-anchor", "middle")
            .attr("font-family", "'Inter', sans-serif").attr("font-size", "11px").attr("font-weight", "600")
            .attr("fill", colors.textDate).text(ev.date || "");

        const titleText = ev.title || "";
        eventG.append("text")
            .attr("x", x).attr("y", boxY + 40).attr("text-anchor", "middle")
            .attr("font-family", "'Inter', sans-serif").attr("font-size", "12px").attr("font-weight", "700")
            .attr("fill", colors.textTitle).text(titleText.substring(0, 18) + (titleText.length>18?"...":""));

        if (ev.description) {
            const desc = ev.description;
            eventG.append("text")
                .attr("x", x).attr("y", boxY + 56).attr("text-anchor", "middle")
                .attr("font-family", "'Inter', sans-serif").attr("font-size", "10px")
                .attr("fill", colors.textDesc).text(desc.substring(0, 22) + "...");
        }
    });

    if (onReady && svgRef.current) {
      onReady(svgRef.current);
    }
  }, [data, width, height, onReady, isDarkMode]);

  return (
    <div className={`overflow-hidden border rounded-xl shadow-sm transition-shadow ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 flex justify-center ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
        <svg 
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
};