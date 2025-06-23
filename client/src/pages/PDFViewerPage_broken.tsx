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
  // Store relative positions (0-1) instead of absolute pixels
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
  // Store relative positions (0-1) instead of absolute pixels
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

  useEffect(() => {
    console.log("🚀 Initial PDF load useEffect triggered");
    loadPDF();
  }, []);

  useEffect(() => {
    console.log("🎨 Render page useEffect triggered:", { pdfDoc: !!pdfDoc, currentPage, totalPages, scale });
    if (pdfDoc && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    console.log("📤 Upload URL useEffect triggered:", { uploadedPdfUrl });
    if (uploadedPdfUrl) {
      console.log("🔄 Triggering loadPDF due to uploaded PDF URL change");
      loadPDF();
    }
  }, [uploadedPdfUrl]);

  useEffect(() => {
    console.log("📊 Current PDF URL changed:", { currentPdfUrl, uploadedPdfUrl });
  }, [currentPdfUrl]);

  const updatePinPositions = useCallback(() => {
    if (!canvasRef.current || pdfDimensions.width === 0) return;

    setPins(prevPins => 
      prevPins.map(pin => ({
        ...pin,
        x: pin.relativeX * pdfDimensions.width,
        y: pin.relativeY * pdfDimensions.height
      }))
    );

    setComments(prevComments =>
      prevComments.map(comment => ({
        ...comment,
        x: comment.relativeX * pdfDimensions.width,
        y: comment.relativeY * pdfDimensions.height
      }))
    );
  }, [pdfDimensions]);

  const autoFitToHeight = useCallback(async () => {
    if (!pdfDoc || !pdfContainerRef.current) return;
    
    try {
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const containerHeight = pdfContainerRef.current.clientHeight - 40; // Account for padding
      const containerWidth = pdfContainerRef.current.clientWidth - 40;
      
      // Calculate scale to fit both height and width, maintaining aspect ratio
      const scaleByHeight = containerHeight / viewport.height;
      const scaleByWidth = containerWidth / viewport.width;
      const newScale = Math.min(scaleByHeight, scaleByWidth, 2); // Cap at 2x scale
      
      console.log("📐 Auto-fitting PDF:", { 
        containerHeight, 
        containerWidth, 
        pdfHeight: viewport.height,
        pdfWidth: viewport.width,
        newScale 
      });
      setScale(newScale);
    } catch (error) {
      console.error("❌ Error auto-fitting PDF:", error);
    }
  }, [pdfDoc]);

  // Auto-fit PDF to viewer height
  useEffect(() => {
    if (pdfDoc && pdfContainerRef.current) {
      autoFitToHeight();
    }
  }, [pdfDoc, pdfContainerRef.current, autoFitToHeight]);

  // Update pin positions when PDF dimensions change due to zoom
  useEffect(() => {
    updatePinPositions();
  }, [pdfDimensions, updatePinPositions]);

  const loadPDF = async () => {
    try {
      console.log("🚀 Starting PDF loading process");
      console.log("📂 Current PDF URL:", currentPdfUrl);
      console.log("🔄 Setting loading state to true");
      
      setIsLoading(true);
      
      console.log("📋 Creating PDF.js loading task with URL:", currentPdfUrl);
      const loadingTask = pdfjsLib.getDocument(currentPdfUrl);
      
      console.log("⏳ Waiting for PDF document to load...");
      const pdf = await loadingTask.promise;
      
      console.log("✅ PDF document loaded successfully!");
      console.log("📊 PDF Details:", {
        numPages: pdf.numPages,
        fingerprints: pdf.fingerprints
      });
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1); // Reset to first page when loading new PDF
      
      console.log("🗑️ Clearing existing pins and comments for new PDF");
      // Clear existing pins and comments when loading new PDF
      setPins([]);
      setComments([]);
      
      console.log("✅ PDF loading complete, setting loading state to false");
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error loading PDF:", error);
      console.error("❌ PDF URL that failed:", currentPdfUrl);
      if (error instanceof Error) {
        console.error("❌ Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      setIsLoading(false);
      toast({
        title: "PDF Loading Error",
        description: "Failed to load the PDF document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderPage = async (pageNum: number) => {
    console.log(`🎨 Starting to render page ${pageNum}`);
    
    if (!pdfDoc) {
      console.log("❌ No PDF document available for rendering");
      return;
    }
    
    if (!pdfContainerRef.current) {
      console.log("❌ PDF container ref not available");
      return;
    }

    try {
      console.log(`📄 Getting page ${pageNum} from PDF document`);
      const page = await pdfDoc.getPage(pageNum);
      pageRef.current = page;
      
      console.log(`✅ Page ${pageNum} retrieved successfully`);

      // Remove existing canvas
      if (canvasRef.current) {
        console.log("🗑️ Removing existing canvas");
        canvasRef.current.remove();
      }

      console.log(`📐 Creating viewport with scale ${scale}`);
      const viewport = page.getViewport({ scale });
      console.log("📐 Viewport dimensions:", {
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale
      });

      // Store PDF dimensions for relative positioning calculations
      setPdfDimensions({ width: viewport.width, height: viewport.height });

      console.log("🖼️ Creating new canvas element");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (!context) {
        console.log("❌ Failed to get 2D context from canvas");
        return;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = "border shadow-lg bg-white max-w-full";
      
      console.log("🔗 Appending canvas to container");
      pdfContainerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      console.log(`🎨 Starting to render page ${pageNum} to canvas`);
      await page.render(renderContext).promise;
      console.log(`✅ Page ${pageNum} rendered successfully to canvas`);
      
      // Update pin positions after rendering
      updatePinPositions();
    } catch (error) {
      console.error(`❌ Error rendering page ${pageNum}:`, error);
      if (error instanceof Error) {
        console.error("❌ Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || draggedPin || activeComment) return;

    // Only allow clicking within the actual canvas bounds
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is within canvas bounds
    if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
      return;
    }

    // Calculate relative position (0-1) based on actual canvas dimensions
    const relativeX = x / canvas.width;
    const relativeY = y / canvas.height;

    console.log("📍 Adding new comment pin at:", { x, y, relativeX, relativeY, page: currentPage });
    
    const commentId = `comment-${Date.now()}`;
    const pinId = `pin-${Date.now()}`;
    const pinNumber = getNextPinNumber();

    const newPin: Pin = {
      id: pinId,
      x,
      y,
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


  const renumberPins = () => {
    const updatedPins = pins.map(pin => {
      const samePagePins = pins.filter(p => p.pageNumber === pin.pageNumber && p.id !== pin.id);
      const smallerNumbers = samePagePins.filter(p => p.number < pin.number);
      return { ...pin, number: smallerNumbers.length + 1 };
    });
    setPins(updatedPins);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🔄 PDF upload process started");
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log("❌ No file selected");
      return;
    }
    
    console.log("📄 File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    if (file && file.type === 'application/pdf') {
      console.log("✅ Valid PDF file detected, creating object URL");
      const fileUrl = URL.createObjectURL(file);
      console.log("🔗 Object URL created:", fileUrl);
      
      setUploadedPdfUrl(fileUrl);
      setUploadedFileName(file.name);
      
      console.log("📊 State updated - uploadedPdfUrl:", fileUrl);
      console.log("📊 State updated - uploadedFileName:", file.name);
      
      toast({
        title: "PDF Uploaded Successfully",
        description: `${file.name} has been loaded for viewing.`,
      });
    } else {
      console.log("❌ Invalid file type:", file.type);
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
      const newScale = Math.min(prev + 0.25, 5); // Increased max zoom for large format PDFs
      console.log("🔍 Zooming in:", { from: prev, to: newScale });
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.25, 0.1); // Reduced min zoom for large format PDFs
      console.log("🔍 Zooming out:", { from: prev, to: newScale });
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
    
    console.log("💬 Comment saved:", newComment);
  };

  const cancelComment = () => {
    if (activeComment) {
      // Remove the pin that was just created
      setPins(prev => prev.filter(pin => !pin.id.includes(activeComment.split('-')[1])));
    }
    setActiveComment(null);
    setCommentText("");
  };

  const deleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setPins(prev => prev.filter(pin => !pin.id.includes(commentId.split('-')[1])));
    renumberPins();
    
    console.log("🗑️ Comment deleted:", commentId);
  };

  const handlePinDragStart = (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation();
    const pin = pins.find(p => p.id === pinId);
    if (!pin || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - pin.x;
    const offsetY = e.clientY - rect.top - pin.y;
    
    setDraggedPin(pinId);
    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handlePinDrag = (e: React.MouseEvent) => {
    if (!isDragging || !draggedPin || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, canvasRef.current.width));
    const constrainedY = Math.max(0, Math.min(newY, canvasRef.current.height));

    // Calculate new relative positions
    const newRelativeX = constrainedX / canvasRef.current.width;
    const newRelativeY = constrainedY / canvasRef.current.height;

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

  // Handle clicks outside PDF area to close comment boxes
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (activeComment && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if click is outside canvas or outside comment popover
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

  const getCurrentPageComments = () => {
    return comments.filter(comment => comment.pageNumber === currentPage);
  };

  const getCurrentPagePins = () => {
    return pins.filter(pin => pin.pageNumber === currentPage);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sidebar resize functionality
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

              {/* Document Title */}
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

          <div className="flex justify-center">
            <div 
              ref={pdfContainerRef}
              className="relative cursor-crosshair"
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
                        {editingComment === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={commentText || comment.text}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="min-h-[60px] text-xs"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" className="text-xs px-2 py-1">
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs px-2 py-1"
                                onClick={() => {
                                  setEditingComment(null);
                                  setCommentText("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs mb-1">{comment.text}</p>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(comment.timestamp)}
                            </p>
                          </>
                        )}
                        
                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="space-y-1 mt-2">
                            <Separator />
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="ml-3 pl-2 border-l border-gray-200">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs font-medium">{reply.user.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(reply.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply input */}
                        {replyingTo === comment.id ? (
                          <div className="space-y-2 mt-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-[50px] text-xs"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" className="text-xs px-2 py-1">
                                Reply
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs px-2 py-1"
                                onClick={() => setReplyingTo(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setReplyingTo(comment.id)}
                            className="flex items-center gap-1 text-xs mt-1 px-1 py-0 h-5"
                          >
                            <Reply className="h-3 w-3" />
                            Reply
                          </Button>
                        )}
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