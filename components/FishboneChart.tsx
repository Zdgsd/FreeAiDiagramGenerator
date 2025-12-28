import React, { useEffect, useRef, useState } from 'react';
import { select } from 'd3';
import { FishboneData } from '../types';

interface FishboneChartProps {
  data: FishboneData;
  width?: number; 
  height?: number; 
  onReady?: (svg: SVGSVGElement) => void;
  isDarkMode?: boolean;
}

export const FishboneChart: React.FC<FishboneChartProps> = ({ 
  data, 
  onReady,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ w: 1000, h: 600 });

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // --- 1. Data Parsing & Safety ---
    const categories = data.categories || [];
    if (categories.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    // --- 2. Dynamic Layout Calculation ---
    const maxItemsInCat = Math.max(...categories.map(c => (c.items ? c.items.length : 0)), 0);
    const ITEM_Y_SPACING = 35; 
    const MIN_RIB_LEN = 240;
    const RIB_ANGLE_DEG = 60;
    const RIB_ANGLE_RAD = RIB_ANGLE_DEG * (Math.PI / 180);
    const RIB_SPACING_X = 400; 
    const TEXT_BUFFER_LEFT = 220; 
    
    const ribLength = Math.max(MIN_RIB_LEN, (maxItemsInCat * ITEM_Y_SPACING) + 120);
    const ribHorizProj = ribLength * Math.cos(RIB_ANGLE_RAD);
    const numPairs = Math.ceil(categories.length / 2);
    const spineRibSpan = (Math.max(0, numPairs - 1) * RIB_SPACING_X) + 120; 
    const marginLeft = 50;
    const headX = marginLeft + TEXT_BUFFER_LEFT + ribHorizProj + spineRibSpan;
    const HEAD_SHAPE_WIDTH = 260;
    const marginRight = 50;
    const finalW = Math.max(1000, headX + HEAD_SHAPE_WIDTH + marginRight);
    const halfHeight = ribLength * Math.sin(RIB_ANGLE_RAD);
    const verticalPadding = 140; 
    const finalH = Math.max(600, (halfHeight * 2) + verticalPadding);

    setDimensions({ w: finalW, h: finalH });

    svg
       .attr("viewBox", `0 0 ${finalW} ${finalH}`)
       .attr("preserveAspectRatio", "xMidYMid meet");

    // --- 3. Drawing Setup ---
    const colors = {
      spine: isDarkMode ? "#94a3b8" : "#334155",      
      rib: isDarkMode ? "#64748b" : "#475569",        
      itemLine: isDarkMode ? "#475569" : "#94a3b8",   
      headFill: isDarkMode ? "#1e40af" : "#eff6ff",   
      headStroke: isDarkMode ? "#3b82f6" : "#2563eb", 
      headText: isDarkMode ? "#ffffff" : "#1e3a8a",   
      catFill: isDarkMode ? "#1e293b" : "#ffffff",
      catStroke: isDarkMode ? "#64748b" : "#64748b",
      catText: isDarkMode ? "#f1f5f9" : "#0f172a",
      itemText: isDarkMode ? "#cbd5e1" : "#334155",
      bg: isDarkMode ? "#0f172a" : "#ffffff"
    };

    const g = svg.append("g");

    // Background (for export)
    g.append("rect")
      .attr("width", finalW)
      .attr("height", finalH)
      .attr("fill", colors.bg)
      .lower();

    // Defs
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", isDarkMode ? "arrow-main-dark" : "arrow-main")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", colors.spine);

    const spineY = finalH / 2;
    const tailX = marginLeft; 

    // --- 4. Draw Spine ---
    g.append("line")
      .attr("x1", tailX)
      .attr("y1", spineY)
      .attr("x2", headX)
      .attr("y2", spineY)
      .attr("stroke", colors.spine)
      .attr("stroke-width", 5)
      .attr("stroke-linecap", "round")
      .attr("marker-end", `url(#${isDarkMode ? "arrow-main-dark" : "arrow-main"})`);

    // --- 5. Draw Head ---
    const headGroup = g.append("g").attr("transform", `translate(${headX}, ${spineY})`);
    const hw = 240;
    const hh = 120;
    
    headGroup.append("path")
      .attr("d", `
        M 5 ${-hh/2}
        L ${hw-30} ${-hh/2}
        Q ${hw} ${-hh/2} ${hw} 0
        Q ${hw} ${hh/2} ${hw-30} ${hh/2}
        L 5 ${hh/2}
        Q -15 ${hh/2} -15 0
        Q -15 ${-hh/2} 5 ${-hh/2}
        Z
      `)
      .attr("fill", colors.headFill)
      .attr("stroke", colors.headStroke)
      .attr("stroke-width", 2);

    const headText = headGroup.append("text")
      .attr("x", hw/2 - 10)
      .attr("y", 0)
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .attr("font-family", "'Inter', sans-serif")
      .attr("font-size", "16px")
      .attr("font-weight", "800")
      .attr("fill", colors.headText)
      .text(data.problem || "Effect");
    
    wrapText(headText, hw - 40);

    // --- 6. Draw Ribs & Categories ---
    categories.forEach((cat, i) => {
      const pairIndex = Math.floor(i / 2);
      const isTop = i % 2 === 0;
      const spineAttachX = headX - 120 - (pairIndex * RIB_SPACING_X);
      
      const dx = -Math.cos(RIB_ANGLE_RAD) * ribLength;
      const dy = isTop ? -Math.sin(RIB_ANGLE_RAD) * ribLength : Math.sin(RIB_ANGLE_RAD) * ribLength;

      const ribTipX = spineAttachX + dx;
      const ribTipY = spineY + dy;

      g.append("line")
        .attr("x1", spineAttachX)
        .attr("y1", spineY)
        .attr("x2", ribTipX)
        .attr("y2", ribTipY)
        .attr("stroke", colors.rib)
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round");

      // --- Category Label ---
      const labelW = 180;
      const labelH = 44;
      const labelG = g.append("g").attr("transform", `translate(${ribTipX}, ${ribTipY})`);
      
      const boxY = isTop ? -labelH - 8 : 8;
      
      labelG.append("rect")
        .attr("x", -labelW/2)
        .attr("y", boxY)
        .attr("width", labelW)
        .attr("height", labelH)
        .attr("rx", 6)
        .attr("fill", colors.catFill)
        .attr("stroke", colors.catStroke)
        .attr("stroke-width", 2);

      const catText = labelG.append("text")
        .attr("x", 0)
        .attr("y", boxY + labelH/2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-family", "'Inter', sans-serif")
        .attr("font-size", "13px")
        .attr("font-weight", "700")
        .attr("fill", colors.catText)
        .text(cat.name || "Category");
      
      if ((cat.name || "").length > 25) {
        catText.style("font-size", "11px");
      }

      // --- 7. Draw Items ---
      const items = cat.items || [];
      const startT = 0.15;
      const endT = 0.85; 

      items.forEach((item, j) => {
        let t = 0.5;
        if (items.length > 1) {
          t = startT + (j / (items.length - 1)) * (endT - startT);
        }

        const px = spineAttachX + (t * dx);
        const py = spineY + (t * dy);
        const branchLen = 45;
        const branchEndX = px + branchLen;
        const branchEndY = py;

        g.append("line")
          .attr("x1", px)
          .attr("y1", py)
          .attr("x2", branchEndX)
          .attr("y2", branchEndY)
          .attr("stroke", colors.itemLine)
          .attr("stroke-width", 1.5);

        const textG = g.append("g").attr("transform", `translate(${branchEndX + 5}, ${branchEndY})`);
        
        const txt = textG.append("text")
          .attr("y", -4)
          .attr("font-family", "'Inter', sans-serif")
          .attr("font-size", "12px")
          .attr("font-weight", "500")
          .attr("fill", colors.itemText)
          .text(item);
        
        wrapText(txt, 220);
      });
    });

    if (onReady && svgRef.current) {
      onReady(svgRef.current);
    }

  }, [data, onReady, isDarkMode]);

  function wrapText(textSelection: any, width: number) {
    textSelection.each(function(this: any) {
      const text = select(this);
      const content = text.text();
      if (!content) return;
      const words = content.split(/\s+/).reverse();
      let word, line: string[] = [], lineNumber = 0;
      const lineHeight = 1.15, x = text.attr("x") || 0, y = text.attr("y") || 0, dy = parseFloat(text.attr("dy") || "0");
      text.text(null);
      let tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if ((tspan.node()?.getComputedTextLength() || 0) > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  return (
    <div className={`w-full flex justify-center border rounded-lg shadow-sm p-4 ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50/30'}`}>
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${dimensions.w} ${dimensions.h}`}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
};