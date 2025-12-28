
export const prepareSvgForExport = (svgElement: SVGSVGElement, exportScale: number = 1, isDarkMode: boolean) => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
  let baseWidth = 0;
  let baseHeight = 0;

  // 1. Prioritize ViewBox for logical size
  if (svgElement.viewBox && svgElement.viewBox.baseVal && svgElement.viewBox.baseVal.width > 0) {
     baseWidth = svgElement.viewBox.baseVal.width;
     baseHeight = svgElement.viewBox.baseVal.height;
  } 
  // 2. Fallback to width attribute
  else if (svgElement.getAttribute("width") && !svgElement.getAttribute("width")?.includes('%')) {
     baseWidth = parseFloat(svgElement.getAttribute("width") || "0");
     baseHeight = parseFloat(svgElement.getAttribute("height") || "0");
  } 
  // 3. Fallback to bounding rect
  else {
     const bb = svgElement.getBoundingClientRect();
     baseWidth = bb.width;
     baseHeight = bb.height;
  }

  const finalWidth = baseWidth * exportScale;
  const finalHeight = baseHeight * exportScale;

  clone.setAttribute("width", finalWidth.toString());
  clone.setAttribute("height", finalHeight.toString());
  clone.style.width = finalWidth + 'px';
  clone.style.height = finalHeight + 'px';
  clone.style.backgroundColor = isDarkMode ? "#1e293b" : "#ffffff";
  
  return { clone, width: finalWidth, height: finalHeight };
};

export const copySvgToClipboard = async (svgElement: SVGSVGElement, isDarkMode: boolean): Promise<boolean> => {
  try {
    const { clone, width, height } = prepareSvgForExport(svgElement, 2.0, isDarkMode);
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = width;
    canvas.height = height;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        if(ctx) {
             ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        try {
          canvas.toBlob(async (blob) => {
            if (!blob) throw new Error("Canvas failure");
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            URL.revokeObjectURL(url);
            resolve(true);
          }, 'image/png');
        } catch (err) {
          console.error(err);
          resolve(false);
        }
      };
      img.onerror = (e) => {
        console.error(e);
        resolve(false);
      }
      img.src = url;
    });
  } catch (err) {
    console.error("Copy failed", err);
    return false;
  }
};

export const downloadSvgAsPng = async (svgElement: SVGSVGElement, fileName: string, isDarkMode: boolean) => {
    try {
        const { clone, width, height } = prepareSvgForExport(svgElement, 3.0, isDarkMode);
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(clone);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = width;
        canvas.height = height;

        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            if (ctx) {
                ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const link = document.createElement('a');
                link.download = `${fileName}_${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                URL.revokeObjectURL(url);
            }
        };
        img.src = url;
    } catch (err) {
        console.error("Download failed", err);
        alert("Failed to download image.");
    }
};
