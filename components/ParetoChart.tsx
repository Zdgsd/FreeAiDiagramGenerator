import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ParetoData } from '../types';

interface ParetoChartProps {
  data: ParetoData;
  width?: number;
  height?: number;
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const ParetoChart: React.FC<ParetoChartProps> = ({ 
  data, 
  width = 800, 
  height = 500,
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const items = data.items || [];
    if (items.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const colors = {
      textMain: isDarkMode ? "#e2e8f0" : "#1e293b",
      textMuted: isDarkMode ? "#94a3b8" : "#64748b",
      axis: isDarkMode ? "#475569" : "#cbd5e1",
      bar: "#3b82f6",
      line: "#ef4444",
      bg: isDarkMode ? "#0f172a" : "#ffffff"
    };

    const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);
    let cumulative = 0;
    const processedData = items.map(item => {
      cumulative += (item.value || 0);
      return {
        ...item,
        value: item.value || 0,
        cumulativePercentage: totalValue > 0 ? (cumulative / totalValue) * 100 : 0
      };
    });

    const margin = { top: 70, right: 60, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
      
    // BG for export
    svg.insert("rect", ":first-child")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", colors.bg);

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif")
      .attr("font-size", "20px")
      .attr("font-weight", "700")
      .attr("fill", colors.textMain) 
      .text(data.title || "Pareto Chart");

    const x = d3.scaleBand()
      .domain(processedData.map(d => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    const y1 = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) || 0])
      .nice()
      .range([innerHeight, 0]);

    const y2 = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Grid
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y1).tickSize(-innerWidth).tickFormat(() => ""))
      .call(g => g.select(".domain").remove())
      .selectAll("line")
      .attr("stroke", isDarkMode ? "#334155" : "#e2e8f0");

    // X Axis
    const xAxisGroup = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10));
    
    xAxisGroup.select(".domain").attr("stroke", colors.axis);
    xAxisGroup.selectAll("text")
        .attr("transform", "translate(-10,5)rotate(-30)")
        .style("text-anchor", "end")
        .attr("font-family", "'Inter', sans-serif")
        .attr("fill", colors.textMuted)
        .attr("font-weight", "500")
        .attr("font-size", "12px");

    // Left Y Axis
    const yAxisLeft = g.append("g")
      .call(d3.axisLeft(y1).ticks(5).tickSize(0).tickPadding(10));
    
    yAxisLeft.select(".domain").remove();
    yAxisLeft.selectAll("text")
        .attr("font-family", "'Inter', sans-serif")
        .attr("fill", colors.textMuted)
        .attr("font-size", "12px");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Inter', sans-serif")
        .attr("fill", colors.textMain)
        .attr("font-weight", "600")
        .attr("font-size", "13px")
        .text("Frequency");

    // Right Y Axis
    const yAxisRight = g.append("g")
      .attr("transform", `translate(${innerWidth},0)`)
      .call(d3.axisRight(y2).tickFormat(d => d + "%").tickSize(0).tickPadding(10));

    yAxisRight.select(".domain").remove();
    yAxisRight.selectAll("text")
        .attr("font-family", "'Inter', sans-serif")
        .attr("fill", colors.line)
        .attr("font-size", "12px");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", innerWidth + 50)
        .attr("x", -innerHeight / 2)
        .attr("text-anchor", "middle")
        .attr("font-family", "'Inter', sans-serif")
        .attr("fill", colors.line)
        .attr("font-weight", "600")
        .attr("font-size", "13px")
        .text("Cumulative %");

    // Bars
    g.selectAll(".bar")
      .data(processedData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name) || 0)
      .attr("y", d => y1(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y1(d.value))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", colors.bar)
      .attr("opacity", 0.9);

    // Labels
    g.selectAll(".label")
      .data(processedData)
      .enter().append("text")
      .attr("x", d => (x(d.name) || 0) + x.bandwidth() / 2)
      .attr("y", d => y1(d.value) - 8)
      .attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", colors.bar)
      .text(d => d.value);

    // Line
    const lineGenerator = d3.line<typeof processedData[0]>()
      .x(d => (x(d.name) || 0) + x.bandwidth() / 2)
      .y(d => y2(d.cumulativePercentage))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", colors.line)
      .attr("stroke-width", 3)
      .attr("d", lineGenerator);

    g.selectAll(".point")
      .data(processedData)
      .enter().append("circle")
      .attr("cx", d => (x(d.name) || 0) + x.bandwidth() / 2)
      .attr("cy", d => y2(d.cumulativePercentage))
      .attr("r", 5)
      .attr("fill", isDarkMode ? "#1e293b" : "#ffffff")
      .attr("stroke", colors.line)
      .attr("stroke-width", 2);

    if (onReady && svgRef.current) {
      onReady(svgRef.current);
    }

  }, [data, width, height, onReady, isDarkMode]);

  return (
    <div className={`overflow-auto border rounded-lg shadow-sm p-4 flex justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <svg 
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '100%', height: 'auto', fontFamily: 'Inter, sans-serif' }}
      />
    </div>
  );
};