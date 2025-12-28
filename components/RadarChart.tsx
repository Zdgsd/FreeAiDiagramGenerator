import React, { useEffect, useRef } from 'react';
import { select, scaleLinear, lineRadial, curveLinearClosed } from 'd3';
import { RadarData } from '../types';

interface RadarChartProps {
  data: RadarData;
  width?: number;
  height?: number;
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  width = 600, 
  height = 500,
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const axes = data.axes || [];
    if (axes.length < 3) return; 

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const colors = {
      title: isDarkMode ? "#e2e8f0" : "#1e293b",
      grid: isDarkMode ? "#334155" : "#e2e8f0",
      gridLine: isDarkMode ? "#475569" : "#e2e8f0",
      axis: isDarkMode ? "#64748b" : "#cbd5e1",
      label: isDarkMode ? "#94a3b8" : "#475569",
      bg: isDarkMode ? "#0f172a" : "#ffffff"
    };

    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    // BG Export
    svg.insert("rect", ":first-child").attr("width", width).attr("height", height).attr("fill", colors.bg);

    svg.append("text")
      .attr("x", width / 2).attr("y", 35).attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif").attr("font-weight", "700").attr("font-size", "20px")
      .attr("fill", colors.title).text(data.title || "Radar Chart");

    const levels = 5;
    const rScale = scaleLinear().domain([0, 100]).range([0, radius]);
    const axisGrid = g.append("g").attr("class", "axisWrapper");

    for (let level = 0; level < levels; level++) {
      const levelFactor = radius * ((level + 1) / levels);
      axisGrid.append("circle")
        .attr("r", levelFactor)
        .attr("fill", isDarkMode ? "transparent" : "#f8fafc")
        .attr("stroke", colors.gridLine)
        .attr("stroke-dasharray", "4,4");
    }

    const allAxis = axes.map(d => d.label);
    const total = allAxis.length;
    const angleSlice = (Math.PI * 2) / total;

    const axis = axisGrid.selectAll(".axis").data(axes).enter().append("g").attr("class", "axis");

    axis.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", (d, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("stroke", colors.axis).attr("stroke-width", 1);

    axis.append("text")
      .attr("class", "legend")
      .style("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => (rScale(100) * 1.15) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => (rScale(100) * 1.15) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.label || "").attr("font-family", "'Inter', sans-serif")
      .attr("font-weight", "600").attr("fill", colors.label);

    const radarLine = lineRadial<any>()
      .radius(d => rScale(d.value || 0))
      .angle((d, i) => i * angleSlice)
      .curve(curveLinearClosed);

    g.append("path")
      .datum(axes).attr("d", radarLine)
      .attr("fill", "#8b5cf6").attr("fill-opacity", 0.2)
      .attr("stroke", "#7c3aed").attr("stroke-width", 2);

    g.selectAll(".radarCircle")
      .data(axes).enter().append("circle")
      .attr("class", "radarCircle").attr("r", 4)
      .attr("cx", (d, i) => rScale(d.value || 0) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.value || 0) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("fill", "#7c3aed").attr("stroke", isDarkMode ? "#1e293b" : "white").attr("stroke-width", 2);

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