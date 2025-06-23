import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "./PDFCanvas.css";

interface PDFCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  scale: number;
  onCanvasClick: (x: number, y: number) => void;
  hovering: boolean;
  onHoverChange: (hovering: boolean) => void;
  onCursorMove: (x: number, y: number) => void;
  onPinDrag: (pinId: string, xPercent: number, yPercent: number) => void;
  pins: Array<{
    id: string;
    x: number;
    y: number;
    xPercent: number;
    yPercent: number;
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
  onHoverChange,
  onCursorMove,
  onPinDrag,
  pins
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPanning = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const isDraggingPin = useRef(false);
  const draggedPinId = useRef<string | null>(null);
  const lastDragUpdate = useRef(0);
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      isPanning.current = true;
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning.current && containerRef.current) {
      const deltaX = e.clientX - lastPanPoint.current.x;
      const deltaY = e.clientY - lastPanPoint.current.y;
      
      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;
      
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 1) { // Middle mouse button
      isPanning.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = hovering ? 'crosshair' : 'default';
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || isPanning.current) return;

    console.log('PDFCanvas click event triggered');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log('Click coordinates:', { x, y });
    onCanvasClick(x, y);
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
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            onCursorMove(e.clientX - rect.left, e.clientY - rect.top);
          }
        }}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => {
          isPanning.current = false;
          onHoverChange(false);
          if (containerRef.current) {
            containerRef.current.style.cursor = 'default';
          }
        }}
      >
        {/* Pins for current page */}
        {getCurrentPagePins().map((pin) => (
          <div
            key={pin.id}
            className={`pdf-pin ${draggingPinId === pin.id ? 'dragging' : ''}`}
            style={{ 
              left: pin.x, 
              top: pin.y,
              '--pin-color': pin.user.color
            } as React.CSSProperties & { '--pin-color': string }}
            onMouseDown={(e) => {
              if (e.button === 0) { // Left mouse button only
                e.preventDefault();
                e.stopPropagation();
                isDraggingPin.current = true;
                draggedPinId.current = pin.id;
                setDraggingPinId(pin.id);
                
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  if (!isDraggingPin.current || !canvasRef.current) return;
                  
                  const now = Date.now();
                  if (now - lastDragUpdate.current < 16) return; // ~60fps throttling
                  lastDragUpdate.current = now;
                  
                  // Use requestAnimationFrame for smoother movement
                  requestAnimationFrame(() => {
                    if (!canvasRef.current) return;
                    
                    const rect = canvasRef.current.getBoundingClientRect();
                    const x = moveEvent.clientX - rect.left;
                    const y = moveEvent.clientY - rect.top;
                    
                    // Calculate percentage coordinates with bounds checking
                    const xPercent = Math.max(0, Math.min(100, (x / canvasRef.current.width) * 100));
                    const yPercent = Math.max(0, Math.min(100, (y / canvasRef.current.height) * 100));
                    
                    onPinDrag(pin.id, xPercent, yPercent);
                  });
                };
                
                const handleMouseUp = () => {
                  isDraggingPin.current = false;
                  draggedPinId.current = null;
                  setDraggingPinId(null);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }
            }}
          >
            <div 
              className="pdf-pin-circle"
              style={{ 
                cursor: isDraggingPin.current && draggedPinId.current === pin.id ? 'grabbing' : 'grab' 
              }}
            >
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