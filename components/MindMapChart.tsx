import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MindMapData } from '../types';

interface MindMapChartProps {
  data: MindMapData;
  width?: number;
  height?: number;
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const MindMapChart: React.FC<MindMapChartProps> = ({ 
  data, 
  width = 1200, 
  height = 900,
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const nodes = data.nodes || [];
    if (nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const colors = {
      centerFill: "#ec4899",   
      centerStroke: "#831843", 
      centerText: "#ffffff",
      nodeFill: isDarkMode ? "#1e293b" : "#ffffff",
      nodeStroke: isDarkMode ? "#475569" : "#e2e8f0",   
      nodeTitle: isDarkMode ? "#f1f5f9" : "#334155",    
      itemText: isDarkMode ? "#cbd5e1" : "#64748b",     
      bg: isDarkMode ? "#0f172a" : "#ffffff"
    };

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const centerX = width / 2;
    const centerY = height / 2;
    const layoutRadius = Math.min(width, height) / 2 - 160; 
    
    const branchColors = [
      "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"
    ];

    const g = svg.append("g");

    // BG
    svg.insert("rect", ":first-child").attr("width", width).attr("height", height).attr("fill", colors.bg);

    const count = nodes.length;
    const angleStep = (2 * Math.PI) / count;

    const getNodePos = (index: number) => {
      const angle = index * angleStep - (Math.PI / 2);
      return {
        x: centerX + layoutRadius * Math.cos(angle),
        y: centerY + layoutRadius * Math.sin(angle),
        angle,
        color: branchColors[index % branchColors.length]
      };
    };

    // Links
    nodes.forEach((_, i) => {
      const pos = getNodePos(i);
      const cp1 = {
        x: centerX + (layoutRadius * 0.4) * Math.cos(pos.angle),
        y: centerY + (layoutRadius * 0.4) * Math.sin(pos.angle)
      };
      
      const pathData = `M ${centerX} ${centerY} Q ${cp1.x} ${cp1.y} ${pos.x} ${pos.y}`;
      
      g.append("path")
        .attr("d", pathData)
        .attr("fill", "none")
        .attr("stroke", pos.color)
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-linecap", "round");
    });

    // Center
    const centerGroup = g.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    centerGroup.append("ellipse").attr("rx", 100).attr("ry", 60).attr("fill", colors.centerFill).attr("stroke", colors.centerStroke).attr("stroke-width", 3);
    centerGroup.append("text").attr("dy", "0.3em").attr("text-anchor", "middle").attr("font-family", "'Inter', sans-serif").attr("font-size", "16px").attr("font-weight", "bold").attr("fill", colors.centerText).text(data.centralTopic || "Central Topic").call(wrapText, 160);

    // Nodes
    nodes.forEach((node, i) => {
      const pos = getNodePos(i);
      const nodeW = 180;
      const items = node.items || [];
      const nodeGroup = g.append("g").attr("transform", `translate(${pos.x}, ${pos.y})`);

      const lineHeight = 18;
      const titleHeight = 30;
      const padding = 15;
      let contentHeight = (items.length * lineHeight) + padding;
      if (contentHeight < 40) contentHeight = 40;
      const totalHeight = titleHeight + contentHeight;

      nodeGroup.append("rect")
        .attr("x", -nodeW / 2).attr("y", -totalHeight / 2).attr("width", nodeW).attr("height", totalHeight).attr("rx", 12)
        .attr("fill", colors.nodeFill).attr("stroke", pos.color).attr("stroke-width", 2);

      nodeGroup.append("text")
        .attr("x", 0).attr("y", -totalHeight / 2 + 20).attr("text-anchor", "middle")
        .attr("font-family", "'Inter', sans-serif").attr("font-size", "13px").attr("font-weight", "700").attr("fill", pos.color)
        .text(node.title || "");

      nodeGroup.append("line")
        .attr("x1", -nodeW/2 + 10).attr("y1", -totalHeight / 2 + 30).attr("x2", nodeW/2 - 10).attr("y2", -totalHeight / 2 + 30)
        .attr("stroke", isDarkMode ? "#475569" : "#f1f5f9");

      const startY = -totalHeight / 2 + 45;
      items.forEach((item, idx) => {
        const textEl = nodeGroup.append("text")
          .attr("x", 0).attr("y", startY + (idx * lineHeight)).attr("text-anchor", "middle")
          .attr("font-family", "'Inter', sans-serif").attr("font-size", "11px").attr("fill", colors.itemText).text(item || "");
         if (item && item.length > 30) textEl.text(item.substring(0, 28) + "...");
      });
    });

    if (onReady && svgRef.current) {
      onReady(svgRef.current);
    }
  }, [data, width, height, onReady, isDarkMode]);

  function wrapText(textSelection: any, width: number) {
    textSelection.each(function(this: any) {
      const text = d3.select(this);
      const content = text.text();
      if (!content) return;
      const words = content.split(/\s+/).reverse();
      let word, line: string[] = [], lineNumber = 0, lineHeight = 1.2, y = text.attr("y") || 0, dy = parseFloat(text.attr("dy") || "0");
      let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if ((tspan.node()?.getComputedTextLength() || 0) > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  return (
    <div className={`overflow-auto border rounded-lg shadow-sm p-4 flex justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
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