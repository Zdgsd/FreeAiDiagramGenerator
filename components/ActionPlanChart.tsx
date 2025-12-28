import React, { useEffect, useRef } from 'react';
import { select } from 'd3';
import { ActionPlanData } from '../types';

interface ActionPlanChartProps {
  data: ActionPlanData;
  width?: number;
  height?: number;
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const ActionPlanChart: React.FC<ActionPlanChartProps> = ({ 
  data, 
  width = 1000, 
  height = 800,
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const nodes = data.nodes || [];
    if (nodes.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const colors = {
      centerFill: isDarkMode ? "#1e40af" : "#1e40af",   
      centerStroke: isDarkMode ? "#60a5fa" : "#172554", 
      centerText: "#ffffff",
      nodeFill: isDarkMode ? "#1e293b" : "#ffffff",
      nodeStroke: isDarkMode ? "#475569" : "#e2e8f0",   
      nodeHeaderFill: isDarkMode ? "#334155" : "#f1f5f9", 
      nodeTitle: isDarkMode ? "#f1f5f9" : "#0f172a",    
      nodeText: isDarkMode ? "#cbd5e1" : "#475569",     
      connector: isDarkMode ? "#64748b" : "#94a3b8",
      bg: isDarkMode ? "#0f172a" : "#ffffff"
    };

    const centerX = width / 2;
    const centerY = height / 2;
    const layoutRadius = Math.min(width, height) / 2 - 140; 

    const g = svg.append("g");
    
    // BG for export
    svg.insert("rect", ":first-child")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", colors.bg);

    const count = nodes.length;
    const angleStep = (2 * Math.PI) / count;

    const getNodePos = (index: number) => {
      const angle = index * angleStep - (Math.PI / 2);
      return {
        x: centerX + layoutRadius * Math.cos(angle),
        y: centerY + layoutRadius * Math.sin(angle),
        angle
      };
    };

    // Connectors
    nodes.forEach((_, i) => {
      const pos = getNodePos(i);
      g.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", pos.x)
        .attr("y2", pos.y)
        .attr("stroke", colors.connector)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");
    });

    // Central Topic
    const centerBoxWidth = 220;
    const centerBoxHeight = 80;
    const centerGroup = g.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    centerGroup.append("rect")
      .attr("x", -centerBoxWidth / 2)
      .attr("y", -centerBoxHeight / 2)
      .attr("width", centerBoxWidth)
      .attr("height", centerBoxHeight)
      .attr("rx", 12)
      .attr("fill", colors.centerFill)
      .attr("stroke", colors.centerStroke)
      .attr("stroke-width", 2);

    const centerText = centerGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", colors.centerText)
      .text(data.centralTopic);
    
    wrapText(centerText, centerBoxWidth - 20);

    // Nodes
    const nodeWidth = 200;
    nodes.forEach((node, i) => {
      const pos = getNodePos(i);
      const items = node.items || [];
      const nodeGroup = g.append("g").attr("transform", `translate(${pos.x}, ${pos.y})`);

      const headerHeight = 36;
      const padding = 20;
      let contentHeight = (items.length * 20) + padding; 
      if (contentHeight < 60) contentHeight = 60;
      const totalHeight = headerHeight + contentHeight;

      nodeGroup.append("rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -totalHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", totalHeight)
        .attr("rx", 8)
        .attr("fill", colors.nodeFill)
        .attr("stroke", colors.nodeStroke)
        .attr("stroke-width", 1);

      nodeGroup.append("rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -totalHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", headerHeight)
        .attr("rx", 8)
        .attr("fill", colors.nodeHeaderFill)
        .attr("stroke", "none");
        
      nodeGroup.append("rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -totalHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", totalHeight)
        .attr("rx", 8)
        .attr("fill", "none")
        .attr("stroke", colors.nodeStroke)
        .attr("stroke-width", 1);
        
      nodeGroup.append("line")
        .attr("x1", -nodeWidth / 2)
        .attr("y1", -totalHeight / 2 + headerHeight)
        .attr("x2", nodeWidth / 2)
        .attr("y2", -totalHeight / 2 + headerHeight)
        .attr("stroke", colors.nodeStroke);

      nodeGroup.append("text")
        .attr("x", 0)
        .attr("y", -totalHeight / 2 + headerHeight / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-family", "'Inter', sans-serif")
        .attr("font-size", "13px")
        .attr("font-weight", "700")
        .attr("fill", colors.nodeTitle)
        .text(node.title || "Category");

      const startTextY = -totalHeight / 2 + headerHeight + 15;
      items.forEach((item, itemIdx) => {
        const itemY = startTextY + (itemIdx * 20);
        nodeGroup.append("circle").attr("cx", -nodeWidth / 2 + 15).attr("cy", itemY).attr("r", 2).attr("fill", colors.nodeText);
        const textEl = nodeGroup.append("text").attr("x", -nodeWidth / 2 + 25).attr("y", itemY).attr("dy", "0.35em").attr("font-family", "'Inter', sans-serif").attr("font-size", "11px").attr("fill", colors.nodeText).text(item || "");
        if (item && item.length > 30) textEl.text(item.substring(0, 28) + "...");
      });
    });

    if (onReady && svgRef.current) {
      onReady(svgRef.current);
    }
  }, [data, width, height, onReady, isDarkMode]);

  function wrapText(textSelection: any, width: number) {
    textSelection.each(function(this: any) {
      const text = select(this);
      const content = text.text();
      if (!content) return;
      const words = content.split(/\s+/).reverse();
      let word, line: string[] = [], lineNumber = 0, lineHeight = 1.2, y = text.attr("y"), dy = parseFloat(text.attr("dy") || "0");
      let tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if ((tspan.node()?.getComputedTextLength() || 0) > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
      const shift = (lineNumber * lineHeight) / 2;
      text.selectAll("tspan").attr("dy", function(this: any) { return (parseFloat(select(this).attr("dy")) - shift) + "em"; });
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