import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "./PDFCanvas.css";

interface PDFCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  scale: number;
  onCanvasClick: (x: number, y: number) => void;
  hovering: boolean;
  pins: Array<{
    id: string;
    x: number;
    y: number;
    pageNumber: number;
    user: { color: string };
    number: number;
  }>;
}

export interface PDFCanvasHandle {
  getCanvasElement: () => HTMLCanvasElement | null;
  getContainerElement: () => HTMLDivElement | null;
}

const PDFCanvas = forwardRef<PDFCanvasHandle, PDFCanvasProps>(({
  pdfDoc,
  currentPage,
  scale,
  onCanvasClick,
  hovering,
  pins
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    getCanvasElement: () => canvasRef.current,
    getContainerElement: () => containerRef.current
  }));

  const renderPage = async () => {
    console.log(`🎨 PDFCanvas: Starting to render page ${currentPage}`);
    
    if (!pdfDoc) {
      console.log("❌ PDFCanvas: No PDF document available for rendering");
      return;
    }
    
    if (!containerRef.current) {
      console.log("❌ PDFCanvas: Container ref not available");
      return;
    }

    try {
      console.log(`📄 PDFCanvas: Getting page ${currentPage} from PDF document`);
      const page = await pdfDoc.getPage(currentPage);
      
      console.log(`✅ PDFCanvas: Page ${currentPage} retrieved successfully`);

      // Remove existing canvas
      if (canvasRef.current) {
        console.log("🗑️ PDFCanvas: Removing existing canvas");
        canvasRef.current.remove();
      }

      console.log(`📐 PDFCanvas: Creating viewport with scale ${scale}`);
      const viewport = page.getViewport({ scale });
      console.log("📐 PDFCanvas: Viewport dimensions:", {
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale
      });

      console.log("🖼️ PDFCanvas: Creating new canvas element");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (!context) {
        console.log("❌ PDFCanvas: Failed to get 2D context from canvas");
        return;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = "pdf-canvas";
      
      console.log("🔗 PDFCanvas: Appending canvas to container");
      containerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      console.log(`🎨 PDFCanvas: Starting to render page ${currentPage} to canvas`);
      await page.render(renderContext).promise;
      console.log(`✅ PDFCanvas: Page ${currentPage} rendered successfully to canvas`);
    } catch (error) {
      console.error(`❌ PDFCanvas: Error rendering page ${currentPage}:`, error);
      if (error instanceof Error) {
        console.error("❌ PDFCanvas: Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage();
    }
  }, [pdfDoc, currentPage, scale]);

  // Reset pan offset when changing pages or loading new PDF
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
    setIsPanning(false);
  }, [currentPage, pdfDoc]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    
    // Check if we're clicking on a pin to avoid interference
    const target = e.target as HTMLElement;
    if (target.closest('.pdf-pin')) return;
    
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current.parentElement;
    if (!container) return;
    
    const newPanOffset = {
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    };
    
    // Apply boundary constraints to prevent panning too far
    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    const maxPanX = Math.max(0, (canvasRect.width - containerRect.width) / 2 + 100);
    const maxPanY = Math.max(0, (canvasRect.height - containerRect.height) / 2 + 100);
    
    const constrainedOffset = {
      x: Math.max(-maxPanX, Math.min(maxPanX, newPanOffset.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newPanOffset.y))
    };
    
    setPanOffset(constrainedOffset);
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      e.preventDefault();
      return;
    }
    
    // Only trigger click for comment placement if we weren't panning
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;
    onCanvasClick(x, y);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  const getCurrentPagePins = () => {
    return pins.filter(pin => pin.pageNumber === currentPage);
  };

  return (
    <div className="pdf-canvas-container">
      {/* Hover instruction */}
      {hovering && (
        <div className="pdf-hover-instruction">
          Click to add comment
        </div>
      )}

      <div
        ref={containerRef}
        className="pdf-canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          cursor: isPanning ? 'grabbing' : (scale > 1.5 ? 'grab' : 'crosshair')
        }}
      >
        {/* Pins for current page */}
        {getCurrentPagePins().map((pin) => (
          <div
            key={pin.id}
            className="pdf-pin"
            style={{ 
              left: pin.x, 
              top: pin.y,
              '--pin-color': pin.user.color
            } as React.CSSProperties & { '--pin-color': string }}
          >
            <div className="pdf-pin-circle">
              {pin.number}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

PDFCanvas.displayName = "PDFCanvas";

export default PDFCanvas;