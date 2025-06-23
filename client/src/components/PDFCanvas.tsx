import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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