import React, { useEffect, useRef } from 'react';
import { select } from 'd3';
import { BrainwritingData } from '../types';

interface BrainwritingChartProps {
  data: BrainwritingData;
  width?: number;
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const BrainwritingChart: React.FC<BrainwritingChartProps> = ({ 
  data, 
  width = 1000, 
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const columns = data.columns || [];
    const rows = data.rows || [];
    if (columns.length === 0 || rows.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const colors = {
      headerFill: isDarkMode ? "#334155" : "#f1f5f9",
      headerText: isDarkMode ? "#f1f5f9" : "#0f172a",
      rowEven: isDarkMode ? "#1e293b" : "#ffffff",
      rowOdd: isDarkMode ? "#0f172a" : "#f8fafc",
      stroke: isDarkMode ? "#475569" : "#cbd5e1",
      textMain: isDarkMode ? "#cbd5e1" : "#334155",
      title: isDarkMode ? "#f1f5f9" : "#1e293b",
      bg: isDarkMode ? "#0f172a" : "#ffffff"
    };

    const margin = { top: 60, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    
    const numIdeaCols = columns.length;
    const partColWidth = innerWidth * 0.2;
    const ideaColWidth = (innerWidth * 0.8) / Math.max(1, numIdeaCols);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
    // BG
    svg.insert("rect", ":first-child").attr("width", width).attr("height", 1000).attr("fill", colors.bg); // Temp height

    svg.append("text")
      .attr("x", width / 2).attr("y", 35).attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif").attr("font-size", "20px").attr("font-weight", "700")
      .attr("fill", colors.title).text(`Brainwriting: ${data.topic || ""}`);

    const headerHeight = 50;
    const headers = ["Participant", ...columns];
    const getColX = (i: number) => i === 0 ? 0 : partColWidth + (i - 1) * ideaColWidth;
    const getColW = (i: number) => (i === 0 ? partColWidth : ideaColWidth);

    const headerG = g.append("g");
    headers.forEach((h, i) => {
      headerG.append("rect")
        .attr("x", getColX(i)).attr("y", 0).attr("width", getColW(i)).attr("height", headerHeight)
        .attr("fill", colors.headerFill).attr("stroke", colors.stroke).attr("stroke-width", 1);
      headerG.append("text")
        .attr("x", getColX(i) + getColW(i) / 2).attr("y", headerHeight / 2).attr("dy", "0.35em").attr("text-anchor", "middle")
        .attr("font-family", "'Inter', sans-serif").attr("font-weight", "600").attr("font-size", "14px")
        .attr("fill", colors.headerText).text(h || "");
    });

    let currentY = headerHeight;
    const rowPadding = 15;
    const lineHeight = 20;

    rows.forEach((row, rowIndex) => {
      const ideas = row.ideas || [];
      const texts = [row.participant || "", ...ideas];
      const cellHeights = texts.map((text, i) => {
        const w = getColW(i) - 20;
        const safeLen = text ? text.length : 0;
        const estimatedLines = Math.ceil((safeLen * 7) / w); 
        const lines = Math.max(estimatedLines, 2); 
        return (lines * lineHeight) + (rowPadding * 2);
      });
      const rowHeight = Math.max(...cellHeights);
      const rowG = g.append("g").attr("transform", `translate(0, ${currentY})`);

      rowG.append("rect")
        .attr("width", innerWidth).attr("height", rowHeight)
        .attr("fill", rowIndex % 2 === 0 ? colors.rowEven : colors.rowOdd);

      texts.forEach((text, i) => {
        rowG.append("rect")
          .attr("x", getColX(i)).attr("y", 0).attr("width", getColW(i)).attr("height", rowHeight)
          .attr("fill", "none").attr("stroke", colors.stroke).attr("stroke-width", 1);
        if (text) {
          const textEl = rowG.append("text")
            .attr("x", getColX(i) + 10).attr("y", rowPadding).attr("dy", "0.8em")
            .attr("font-family", "'Inter', sans-serif").attr("font-size", "13px")
            .attr("fill", colors.textMain).text(text);
          wrapText(textEl, getColW(i) - 20, lineHeight);
        }
      });
      currentY += rowHeight;
    });

    const totalHeight = currentY + margin.top + margin.bottom;
    svg.attr("height", totalHeight);
    svg.attr("viewBox", `0 0 ${width} ${totalHeight}`);
    svg.select("rect").attr("height", totalHeight); // fix bg height

    if (onReady && svgRef.current) {
      onReady(svgRef.current);
    }
  }, [data, width, onReady, isDarkMode]);

  function wrapText(textSelection: any, width: number, lineHeight: number) {
    textSelection.each(function(this: any) {
      const text = select(this);
      const content = text.text();
      if (!content) return;
      const words = content.split(/\s+/).reverse();
      let word, line: string[] = [], lineNumber = 0, x = text.attr("x"), y = text.attr("y"), dy = parseFloat(text.attr("dy") || "0");
      let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if ((tspan.node()?.getComputedTextLength() || 0) > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "px").text(word);
        }
      }
    });
  }

  return (
    <div className={`overflow-auto border rounded-lg shadow-sm p-4 flex justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <svg 
        ref={svgRef}
        width={width}
        style={{ maxWidth: '100%', height: 'auto', fontFamily: 'Inter, sans-serif' }}
      />
    </div>
  );
};