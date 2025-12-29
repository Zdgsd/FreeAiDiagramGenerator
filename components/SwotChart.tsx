import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SwotData } from '../types';

interface SwotChartProps {
  data: SwotData;
  width?: number;
  height?: number;
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const SwotChart: React.FC<SwotChartProps> = ({ 
  data, 
  width = 800, 
  height = 600,
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 20, bottom: 20, left: 20 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Theme Colors
    const colors = {
      textTitle: isDarkMode ? "#e2e8f0" : "#1e293b",
      bgQuadrant: isDarkMode ? "#1e293b" : "#ffffff", // base fallback
      textItem: isDarkMode ? "#94a3b8" : "#334155"
    };

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif")
      .attr("font-weight", "800")
      .attr("font-size", "22px")
      .attr("fill", colors.textTitle)
      .text(`SWOT: ${data.topic}`);

    const midX = w / 2;
    const midY = h / 2;
    const padding = 12;

    // Quadrant Definition with No Emojis
    // We adjust BG colors for dark mode to be subtle overlays
    const quadrants = [
      { 
        title: "STRENGTHS", 
        data: data.strengths, 
        x: 0, 
        y: 0, 
        bg: isDarkMode ? "#064e3b" : "#ecfdf5", // Dark Emerald vs Light Emerald
        bgOpacity: isDarkMode ? 0.3 : 1,
        accent: "#059669", 
        marker: "circle" 
      }, 
      { 
        title: "WEAKNESSES", 
        data: data.weaknesses, 
        x: midX + padding, 
        y: 0, 
        bg: isDarkMode ? "#7f1d1d" : "#fef2f2", 
        bgOpacity: isDarkMode ? 0.3 : 1,
        accent: "#dc2626", 
        marker: "rect" 
      }, 
      { 
        title: "OPPORTUNITIES", 
        data: data.opportunities, 
        x: 0, 
        y: midY + padding, 
        bg: isDarkMode ? "#1e3a8a" : "#eff6ff", 
        bgOpacity: isDarkMode ? 0.3 : 1,
        accent: "#2563eb", 
        marker: "triangle" 
      }, 
      { 
        title: "THREATS", 
        data: data.threats, 
        x: midX + padding, 
        y: midY + padding, 
        bg: isDarkMode ? "#78350f" : "#fffbeb", 
        bgOpacity: isDarkMode ? 0.3 : 1,
        accent: "#d97706", 
        marker: "diamond" 
      } 
    ];

    const boxW = (w - padding) / 2;
    const boxH = (h - padding) / 2;

    quadrants.forEach(q => {
      const qg = g.append("g").attr("transform", `translate(${q.x}, ${q.y})`);

      // Background Card
      qg.append("rect")
        .attr("width", boxW)
        .attr("height", boxH)
        .attr("rx", 12)
        .attr("fill", q.bg)
        .attr("fill-opacity", q.bgOpacity)
        .attr("stroke", q.accent)
        .attr("stroke-width", isDarkMode ? 1 : 0.5)
        .attr("stroke-opacity", isDarkMode ? 0.5 : 0.3);

      // Header Band area (visual separation)
      // We can just use text spacing.
        
      // Header Icon Marker
      if (q.marker === "circle") {
          qg.append("circle").attr("cx", 24).attr("cy", 32).attr("r", 6).attr("fill", q.accent);
      } else if (q.marker === "rect") {
          qg.append("rect").attr("x", 18).attr("y", 26).attr("width", 12).attr("height", 12).attr("rx", 2).attr("fill", q.accent);
      } else if (q.marker === "triangle") {
          qg.append("path").attr("d", "M 24 26 L 30 38 L 18 38 Z").attr("fill", q.accent);
      } else {
          qg.append("path").attr("d", "M 24 26 L 30 32 L 24 38 L 18 32 Z").attr("fill", q.accent);
      }

      // Header Text
      qg.append("text")
        .attr("x", 42)
        .attr("y", 36)
        .attr("font-family", "'Inter', sans-serif")
        .attr("font-weight", "900")
        .attr("font-size", "14px")
        .attr("fill", q.accent)
        .attr("letter-spacing", "0.05em")
        .text(q.title);

      // List Items
      q.data.forEach((item, i) => {
        const itemY = 70 + (i * 26);
        if (itemY > boxH - 20) return; // simple overflow prevention

        qg.append("circle")
          .attr("cx", 24)
          .attr("cy", itemY - 4)
          .attr("r", 2.5)
          .attr("fill", isDarkMode ? colors.textItem : q.accent);

        qg.append("text")
          .attr("x", 38)
          .attr("y", itemY)
          .attr("font-family", "'Inter', sans-serif")
          .attr("font-size", "13px")
          .attr("fill", colors.textItem)
          .text(item);
      });
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