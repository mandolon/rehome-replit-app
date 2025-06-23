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
  Upload,
  Edit,
  Trash,
  GripVertical
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker - use local worker file to prevent external URL issues
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
  timestamp: Date;
  relativeX: number;
  relativeY: number;
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

// User color palette
const USER_COLORS = [
  "#ec4899", "#3b82f6", "#22c55e", "#a855f7", 
  "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"
];

const CURRENT_USER: User = {
  id: "user-1",
  name: "Current User",
  color: USER_COLORS[0],
};

export default function PDFViewerPage() {
  const { toast } = useToast();
  
  // Core state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [hovering, setHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Comment system state
  const [comments, setComments] = useState<Comment[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [highlightedComment, setHighlightedComment] = useState<string | null>(null);
  
  // Drag system state
  const [draggedPin, setDraggedPin] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // File handling state
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  // Refs
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageRef = useRef<pdfjsLib.PDFPageProxy | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Default PDF for demo
  const PDF_URL = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
  const currentPdfUrl = uploadedPdfUrl || PDF_URL;

  // Core PDF functions
  const loadPDF = async () => {
    try {
      setIsLoading(true);
      const loadingTask = pdfjsLib.getDocument(currentPdfUrl);
      const pdf = await loadingTask.promise;
      
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

  const autoFitToHeight = useCallback(async () => {
    if (!pdfDoc || !viewportRef.current) return;
    
    try {
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const containerHeight = viewportRef.current.clientHeight - 80;
      const containerWidth = viewportRef.current.clientWidth - 80;
      
      // Scale to fit height, with width as secondary constraint
      const scaleByHeight = containerHeight / viewport.height;
      const scaleByWidth = containerWidth / viewport.width;
      const fitScale = Math.min(scaleByHeight, scaleByWidth);
      
      setScale(fitScale);
    } catch (error) {
      console.error("Error auto-fitting PDF:", error);
    }
  }, [pdfDoc]);

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !pdfContainerRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      pageRef.current = page;

      if (canvasRef.current) {
        canvasRef.current.remove();
      }

      const viewport = page.getViewport({ scale });
      setPdfDimensions({ width: viewport.width, height: viewport.height });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = "border shadow-lg bg-white";
      
      pdfContainerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      updatePinPositions();
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  };

  // Pin positioning system
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

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.1));

  // Page navigation
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

  // Comment system
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || draggedPin || activeComment) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) return;

    const relativeX = x / canvas.width;
    const relativeY = y / canvas.height;
    
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
    const pageNumber = currentPage;
    const currentPagePins = pins.filter(p => p.pageNumber === pageNumber);
    
    currentPagePins.sort((a, b) => a.number - b.number);
    
    const updatedPins = pins.map(pin => {
      if (pin.pageNumber === pageNumber) {
        const index = currentPagePins.findIndex(p => p.id === pin.id);
        return { ...pin, number: index + 1 };
      }
      return pin;
    });
    
    setPins(updatedPins);
  };

  // Drag system
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

    const constrainedX = Math.max(0, Math.min(newX, canvasRef.current.width));
    const constrainedY = Math.max(0, Math.min(newY, canvasRef.current.height));

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

  // File upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (file.type === 'application/pdf') {
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

  // Sidebar resize
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

  // Utility functions
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

  // Effects
  useEffect(() => {
    loadPDF();
  }, []);

  useEffect(() => {
    if (pdfDoc && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    if (uploadedPdfUrl) {
      loadPDF();
    }
  }, [uploadedPdfUrl]);

  useEffect(() => {
    if (pdfDoc && viewportRef.current) {
      autoFitToHeight();
    }
  }, [pdfDoc, autoFitToHeight]);

  useEffect(() => {
    updatePinPositions();
  }, [pdfDimensions, updatePinPositions]);

  // Handle clicks outside to close comment boxes
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (activeComment && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
          cancelComment();
        }
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeComment]);

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
          ref={viewportRef}
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
            className="absolute left-0 top-0 w-1 h-full bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-blue-500 transition-colors"
            onMouseDown={handleResizeStart}
          >
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="p-2 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Comments</h2>
              <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
            </div>
          </div>
          
          <ScrollArea className="h-full p-2">
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
                      className={`border-l-4 transition-colors cursor-pointer ${
                        highlightedComment === comment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      style={{ borderLeftColor: comment.user.color }}
                      onClick={() => setHighlightedComment(comment.id)}
                    >
                      <CardHeader className="pb-1 px-2 pt-2">
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteComment(comment.id);
                            }}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-2 pb-2">
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