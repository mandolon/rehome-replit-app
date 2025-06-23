import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff,
  Reply,
  Upload,
  Edit,
  Trash,
  GripVertical
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface User {
  id: string;
  name: string;
  color: string;
}

interface Comment {
  id: string;
  x: number;
  y: number;
  pageNumber: number;
  text: string;
  user: User;
  replies: Reply[];
  timestamp: Date;
  relativeX: number;
  relativeY: number;
}

interface Reply {
  id: string;
  text: string;
  user: User;
  timestamp: Date;
}

interface Pin {
  id: string;
  x: number;
  y: number;
  pageNumber: number;
  user: User;
  number: number;
  relativeX: number;
  relativeY: number;
}

// Predefined user colors
const USER_COLORS = [
  "#ec4899", // pink
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#8b5cf6", // violet
];

// Mock current user - in real app this would come from auth
const CURRENT_USER: User = {
  id: "user-1",
  name: "Current User",
  color: USER_COLORS[0],
};

export default function PDFViewerPage() {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [hovering, setHovering] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [scale, setScale] = useState(1.0);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [draggedPin, setDraggedPin] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [highlightedComment, setHighlightedComment] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageRef = useRef<pdfjsLib.PDFPageProxy | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Sample PDF URL - using Mozilla's sample PDF
  const PDF_URL = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

  // Use uploaded PDF URL if available, otherwise use default
  const currentPdfUrl = uploadedPdfUrl || PDF_URL;

  // Enhanced marker positioning system for perfect anchoring
  const updatePinPositions = useCallback(() => {
    if (!canvasRef.current || pdfDimensions.width === 0 || pdfDimensions.height === 0) {
      console.log("Skipping pin position update - invalid dimensions", { 
        canvas: !!canvasRef.current, 
        dimensions: pdfDimensions 
      });
      return;
    }

    console.log("Updating pin positions based on PDF dimensions:", pdfDimensions);

    setPins(prevPins => 
      prevPins.map(pin => {
        const newX = pin.relativeX * pdfDimensions.width;
        const newY = pin.relativeY * pdfDimensions.height;
        console.log(`Pin ${pin.id}: relative(${pin.relativeX}, ${pin.relativeY}) -> absolute(${newX}, ${newY})`);
        return {
          ...pin,
          x: newX,
          y: newY
        };
      })
    );

    setComments(prevComments =>
      prevComments.map(comment => {
        const newX = comment.relativeX * pdfDimensions.width;
        const newY = comment.relativeY * pdfDimensions.height;
        console.log(`Comment ${comment.id}: relative(${comment.relativeX}, ${comment.relativeY}) -> absolute(${newX}, ${newY})`);
        return {
          ...comment,
          x: newX,
          y: newY
        };
      })
    );
  }, [pdfDimensions]);

  const autoFitToHeight = useCallback(async () => {
    if (!pdfDoc || !pdfContainerRef.current) return;
    
    try {
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const containerHeight = pdfContainerRef.current.clientHeight - 40;
      const containerWidth = pdfContainerRef.current.clientWidth - 40;
      
      // For auto-fit, still use the minimum scale to fit content
      const scaleByHeight = containerHeight / viewport.height;
      const scaleByWidth = containerWidth / viewport.width;
      const newScale = Math.min(scaleByHeight, scaleByWidth, 1.5); // Reduced cap for better initial fit
      
      console.log("Auto-fitting PDF:", { 
        containerHeight, 
        containerWidth, 
        pdfHeight: viewport.height,
        pdfWidth: viewport.width,
        newScale 
      });
      setScale(newScale);
    } catch (error) {
      console.error("Error auto-fitting PDF:", error);
    }
  }, [pdfDoc]);

  // Effects
  useEffect(() => {
    console.log("Initial PDF load useEffect triggered");
    loadPDF();
  }, []);

  useEffect(() => {
    console.log("Render page useEffect triggered:", { pdfDoc: !!pdfDoc, currentPage, totalPages, scale });
    if (pdfDoc && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    console.log("Upload URL useEffect triggered:", { uploadedPdfUrl });
    if (uploadedPdfUrl) {
      console.log("Triggering loadPDF due to uploaded PDF URL change");
      loadPDF();
    }
  }, [uploadedPdfUrl]);

  useEffect(() => {
    if (pdfDoc && pdfContainerRef.current) {
      autoFitToHeight();
    }
  }, [pdfDoc, pdfContainerRef.current, autoFitToHeight]);

  useEffect(() => {
    updatePinPositions();
  }, [pdfDimensions, updatePinPositions]);

  // Handle clicks outside PDF area to close comment boxes
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (activeComment && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
        cancelComment();
      }
    }
  }, [activeComment]);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  // Wheel zoom functionality for enhanced user experience
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => {
        const newScale = Math.max(0.05, Math.min(10, prev + delta));
        console.log("Wheel zoom:", { from: prev, to: newScale, delta });
        return newScale;
      });
    }
  }, []);

  // Add wheel zoom event listener
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Main functions
  const loadPDF = async () => {
    try {
      console.log("Starting PDF loading process");
      setIsLoading(true);
      
      const loadingTask = pdfjsLib.getDocument(currentPdfUrl);
      const pdf = await loadingTask.promise;
      
      console.log("PDF document loaded successfully!");
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setPins([]);
      setComments([]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading PDF:", error);
      setIsLoading(false);
      toast({
        title: "PDF Loading Error",
        description: "Failed to load the PDF document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderPage = async (pageNum: number) => {
    console.log(`Starting to render page ${pageNum} at scale ${scale}`);
    
    if (!pdfDoc || !pdfContainerRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      pageRef.current = page;

      if (canvasRef.current) {
        canvasRef.current.remove();
      }

      const viewport = page.getViewport({ scale });
      console.log("Viewport dimensions:", { width: viewport.width, height: viewport.height, scale });
      
      setPdfDimensions({ width: viewport.width, height: viewport.height });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (!context) return;

      // Set canvas dimensions to match viewport exactly
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Remove width restrictions to allow zooming beyond container width
      canvas.className = "border shadow-lg bg-white";
      canvas.style.maxWidth = "none"; // Remove max-width restriction
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      
      pdfContainerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      console.log(`Page ${pageNum} rendered successfully with dimensions ${viewport.width}x${viewport.height}`);
      
      // Update pin positions after rendering is complete
      setTimeout(() => {
        updatePinPositions();
      }, 50);
      
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || draggedPin || activeComment) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate click position relative to the canvas
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Ensure click is within canvas bounds
    if (clickX < 0 || clickY < 0 || clickX > rect.width || clickY > rect.height) {
      return;
    }

    // Convert screen coordinates to canvas coordinates accounting for any scaling
    const scaleFactorX = canvas.width / rect.width;
    const scaleFactorY = canvas.height / rect.height;
    
    const canvasX = clickX * scaleFactorX;
    const canvasY = clickY * scaleFactorY;

    // Calculate relative position (0-1) based on actual canvas dimensions
    const relativeX = canvasX / canvas.width;
    const relativeY = canvasY / canvas.height;

    console.log("Enhanced click handling:", { 
      screen: { x: clickX, y: clickY },
      canvas: { x: canvasX, y: canvasY, width: canvas.width, height: canvas.height },
      relative: { x: relativeX, y: relativeY },
      scale: scale,
      page: currentPage 
    });
    
    const commentId = `comment-${Date.now()}`;
    const pinId = `pin-${Date.now()}`;
    const pinNumber = getNextPinNumber();

    const newPin: Pin = {
      id: pinId,
      x: canvasX, // Use canvas coordinates
      y: canvasY,
      pageNumber: currentPage,
      user: CURRENT_USER,
      number: pinNumber,
      relativeX,
      relativeY,
    };

    setPins(prev => [...prev, newPin]);
    setActiveComment(commentId);
  };

  const getNextPinNumber = () => {
    const currentPagePins = pins.filter(p => p.pageNumber === currentPage);
    return currentPagePins.length + 1;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setUploadedPdfUrl(fileUrl);
      setUploadedFileName(file.name);
      
      toast({
        title: "PDF Uploaded Successfully",
        description: `${file.name} has been loaded for viewing.`,
      });
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid PDF file.",
        variant: "destructive",
      });
    }
    event.target.value = '';
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = currentPdfUrl;
    link.download = uploadedFileName || "document.pdf";
    link.click();
  };

  const zoomIn = () => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.25, 10); // Increased max zoom to 10x for detailed inspection
      console.log("Zooming in:", { from: prev, to: newScale });
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.25, 0.05); // Reduced min zoom to 0.05x for overview
      console.log("Zooming out:", { from: prev, to: newScale });
      return newScale;
    });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const saveComment = () => {
    if (!commentText.trim() || !activeComment) return;

    const commentId = activeComment;
    const relatedPin = pins.find(pin => pin.id.includes(activeComment.split('-')[1]));
    
    if (!relatedPin) return;

    const newComment: Comment = {
      id: commentId,
      x: relatedPin.x,
      y: relatedPin.y,
      pageNumber: relatedPin.pageNumber,
      text: commentText,
      user: CURRENT_USER,
      replies: [],
      timestamp: new Date(),
      relativeX: relatedPin.relativeX,
      relativeY: relatedPin.relativeY,
    };

    setComments(prev => [...prev, newComment]);
    setCommentText("");
    setActiveComment(null);
  };

  const cancelComment = () => {
    if (activeComment) {
      setPins(prev => prev.filter(pin => !pin.id.includes(activeComment.split('-')[1])));
    }
    setActiveComment(null);
    setCommentText("");
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setPins(prev => prev.filter(pin => !pin.id.includes(commentId.split('-')[1])));
    renumberPins();
  };

  const renumberPins = () => {
    const updatedPins = pins.map(pin => {
      const samePagePins = pins.filter(p => p.pageNumber === pin.pageNumber && p.id !== pin.id);
      const smallerNumbers = samePagePins.filter(p => p.number < pin.number);
      return { ...pin, number: smallerNumbers.length + 1 };
    });
    setPins(updatedPins);
  };

  const handlePinDragStart = (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation();
    const pin = pins.find(p => p.id === pinId);
    if (!pin || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate offset accounting for canvas scaling
    const scaleFactorX = canvas.width / rect.width;
    const scaleFactorY = canvas.height / rect.height;
    
    const screenX = (e.clientX - rect.left) * scaleFactorX;
    const screenY = (e.clientY - rect.top) * scaleFactorY;
    
    const offsetX = screenX - pin.x;
    const offsetY = screenY - pin.y;
    
    console.log("Drag start:", { 
      pinId, 
      pinPos: { x: pin.x, y: pin.y },
      screenPos: { x: screenX, y: screenY },
      offset: { x: offsetX, y: offsetY }
    });
    
    setDraggedPin(pinId);
    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handlePinDrag = (e: React.MouseEvent) => {
    if (!isDragging || !draggedPin || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Convert screen coordinates to canvas coordinates
    const scaleFactorX = canvas.width / rect.width;
    const scaleFactorY = canvas.height / rect.height;
    
    const screenX = (e.clientX - rect.left) * scaleFactorX;
    const screenY = (e.clientY - rect.top) * scaleFactorY;
    
    const newX = screenX - dragOffset.x;
    const newY = screenY - dragOffset.y;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, canvas.width));
    const constrainedY = Math.max(0, Math.min(newY, canvas.height));

    // Calculate new relative position
    const newRelativeX = constrainedX / canvas.width;
    const newRelativeY = constrainedY / canvas.height;

    console.log("Dragging:", {
      screen: { x: screenX, y: screenY },
      canvas: { x: constrainedX, y: constrainedY },
      relative: { x: newRelativeX, y: newRelativeY }
    });

    setPins(prev => prev.map(pin => 
      pin.id === draggedPin 
        ? { ...pin, x: constrainedX, y: constrainedY, relativeX: newRelativeX, relativeY: newRelativeY } 
        : pin
    ));
    
    setComments(prev => prev.map(comment => 
      comment.id.includes(draggedPin.split('-')[1]) 
        ? { ...comment, x: constrainedX, y: constrainedY, relativeX: newRelativeX, relativeY: newRelativeY } 
        : comment
    ));
  };

  const handlePinDragEnd = () => {
    setDraggedPin(null);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  const getCurrentPageComments = () => {
    return comments.filter(comment => comment.pageNumber === currentPage);
  };

  const getCurrentPagePins = () => {
    return pins.filter(pin => pin.pageNumber === currentPage);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleResize = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX);
      setSidebarWidth(Math.max(200, Math.min(600, newWidth)));
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main PDF Viewer */}
      <div className="flex-1 flex flex-col" style={{ marginRight: sidebarOpen ? sidebarWidth : 0 }}>
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {sidebarOpen ? "Hide" : "Show"} Comments
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">
                  {uploadedFileName || "Sample Document"}
                </span>
                {uploadedFileName && (
                  <Badge variant="secondary" className="text-xs">
                    Uploaded
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Container */}
        <div 
          className="flex-1 overflow-auto p-4 relative"
          style={{ 
            scrollBehavior: 'smooth',
            overflowX: 'auto',
            overflowY: 'auto'
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={(e) => {
            handleMouseMove(e);
            if (isDragging) {
              handlePinDrag(e);
            }
          }}
          onMouseUp={handlePinDragEnd}
        >
          {/* Hover instruction */}
          {hovering && !activeComment && !isDragging && (
            <div 
              className="fixed bg-black/75 text-white px-2 py-1 rounded text-xs z-50 pointer-events-none"
              style={{ 
                left: mousePosition.x + 10, 
                top: mousePosition.y - 25
              }}
            >
              Click to add comment
            </div>
          )}

          {/* Unrestricted scrollable container for zoomed content */}
          <div className="inline-block min-w-full">
            <div 
              ref={pdfContainerRef}
              className="relative cursor-crosshair inline-block"
              style={{
                minWidth: 'fit-content',
                width: 'max-content'
              }}
              onClick={handleCanvasClick}
            >
              {/* Pins for current page */}
              {getCurrentPagePins().map((pin) => (
                <Popover key={pin.id} open={activeComment === `comment-${pin.id.split('-')[1]}`}>
                  <PopoverTrigger asChild>
                    <div
                      className="absolute z-10 cursor-move transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                      style={{ left: pin.x, top: pin.y }}
                      onMouseDown={(e) => handlePinDragStart(e, pin.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDragging) {
                          const commentId = comments.find(c => 
                            c.x === pin.x && c.y === pin.y && c.pageNumber === pin.pageNumber
                          )?.id;
                          if (commentId) {
                            setHighlightedComment(commentId);
                          }
                        }
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white"
                        style={{ backgroundColor: pin.user.color }}
                      >
                        {pin.number}
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Enter your comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[80px] text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            saveComment();
                          }
                          if (e.key === 'Escape') {
                            cancelComment();
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={cancelComment}>
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={saveComment}
                          disabled={!commentText.trim()}
                        >
                          Save Comment
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {sidebarOpen && (
        <div 
          ref={sidebarRef}
          className="fixed right-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg border-l z-20"
          style={{ width: sidebarWidth }}
        >
          {/* Resize handle */}
          <div
            ref={resizeRef}
            className="absolute left-0 top-0 w-1 h-full bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 transition-colors"
            onMouseDown={handleResizeStart}
          >
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Comments</h2>
              <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
            </div>
          </div>
          
          <ScrollArea className="h-full p-3">
            {getCurrentPageComments().length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No comments on this page</p>
                <p className="text-xs mt-1">Click anywhere on the PDF to add a comment</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getCurrentPageComments().map((comment, index) => {
                  const pinNumber = getCurrentPagePins().find(p => 
                    p.x === comment.x && p.y === comment.y
                  )?.number || index + 1;
                  
                  return (
                    <Card 
                      key={comment.id} 
                      className={`border-l-4 transition-colors ${
                        highlightedComment === comment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      style={{ borderLeftColor: comment.user.color }}
                    >
                      <CardHeader className="pb-1 px-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: comment.user.color }}
                            >
                              {pinNumber}
                            </div>
                            <CardTitle className="text-xs">{comment.user.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingComment(comment.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => deleteComment(comment.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 pb-2">
                        <p className="text-xs mb-1">{comment.text}</p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(comment.timestamp)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}