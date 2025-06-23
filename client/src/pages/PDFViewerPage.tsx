import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Edit3,
  Trash2,
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
  timestamp: Date;
  number: number;
}

interface Pin {
  id: string;
  x: number;
  y: number;
  pageNumber: number;
  user: User;
  number: number;
  commentId: string;
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

// Mock current user
const CURRENT_USER: User = {
  id: "user-1",
  name: "Current User",
  color: USER_COLORS[0],
};

export default function PDFViewerPage() {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [scale, setScale] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [pendingComment, setPendingComment] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [highlightedComment, setHighlightedComment] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPin, setDraggedPin] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCursorHint, setShowCursorHint] = useState(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageRef = useRef<pdfjsLib.PDFPageProxy | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const commentBoxRef = useRef<HTMLTextAreaElement>(null);

  // Sample PDF URL
  const PDF_URL = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
  const currentPdfUrl = uploadedPdfUrl || PDF_URL;

  // Load PDF initially
  useEffect(() => {
    loadPDF();
  }, []);

  // Load PDF when uploaded URL changes
  useEffect(() => {
    if (uploadedPdfUrl) {
      loadPDF();
    }
  }, [uploadedPdfUrl]);

  // Render page when PDF doc, page, or scale changes
  useEffect(() => {
    if (pdfDoc && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  // Keyboard shortcuts and click outside handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCommentBox(false);
        setPendingComment(null);
        setCommentText("");
        setEditingComment(null);
      }
      if (e.key === "Enter" && showCommentBox && commentText.trim()) {
        handleSaveComment();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (showCommentBox && pdfContainerRef.current) {
        const commentBox = document.querySelector('[data-comment-box]');
        if (commentBox && !commentBox.contains(e.target as Node)) {
          setShowCommentBox(false);
          setPendingComment(null);
          setCommentText("");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCommentBox, commentText]);

  // Mouse tracking for cursor hint
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (pdfContainerRef.current && !isPanning && !isDragging && !showCommentBox) {
        const rect = pdfContainerRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          setMousePosition({ x: e.clientX, y: e.clientY });
          setShowCursorHint(true);
        } else {
          setShowCursorHint(false);
        }
      } else {
        setShowCursorHint(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isPanning, isDragging, showCommentBox]);

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      const loadingTask = pdfjsLib.getDocument(currentPdfUrl);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Clear existing comments and pins
      setComments([]);
      setPins([]);
      
      // Reset zoom to fit height
      setScale(1.0);
      setPanOffset({ x: 0, y: 0 });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading PDF:", error);
      setIsLoading(false);
      toast({
        title: "Error Loading PDF",
        description: "Failed to load the PDF document.",
        variant: "destructive",
      });
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !pdfContainerRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      pageRef.current = page;

      // Remove existing canvas
      if (canvasRef.current) {
        canvasRef.current.remove();
      }

      // Calculate scale to fit height if scale is 1.0 (default)
      let actualScale = scale;
      if (scale === 1.0 && viewerRef.current) {
        const containerHeight = viewerRef.current.clientHeight - 100; // Account for toolbar
        const viewport = page.getViewport({ scale: 1 });
        actualScale = containerHeight / viewport.height;
        setScale(actualScale);
        return; // Will re-render with correct scale
      }

      const viewport = page.getViewport({ scale: actualScale });
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
    } catch (error) {
      console.error("Error rendering page:", error);
    }
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

  const handleClick = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left clicks
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / scale;
    const y = (e.clientY - rect.top - panOffset.y) / scale;
    
    setPendingComment({ x, y, pageNumber: currentPage });
    setShowCommentBox(true);
    setCommentText("");
    
    // Focus comment box after render
    setTimeout(() => {
      commentBoxRef.current?.focus();
    }, 100);
  };

  const handleSaveComment = () => {
    if (!pendingComment || !commentText.trim()) return;

    const nextNumber = Math.max(0, ...comments.map(c => c.number)) + 1;
    const commentId = `comment-${Date.now()}`;
    const pinId = `pin-${Date.now()}`;

    const newComment: Comment = {
      id: commentId,
      x: pendingComment.x,
      y: pendingComment.y,
      pageNumber: pendingComment.pageNumber,
      text: commentText,
      user: CURRENT_USER,
      timestamp: new Date(),
      number: nextNumber,
    };

    const newPin: Pin = {
      id: pinId,
      x: pendingComment.x,
      y: pendingComment.y,
      pageNumber: pendingComment.pageNumber,
      user: CURRENT_USER,
      number: nextNumber,
      commentId: commentId,
    };

    setComments([...comments, newComment]);
    setPins([...pins, newPin]);
    setShowCommentBox(false);
    setPendingComment(null);
    setCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // Remove comment and pin
    const newComments = comments.filter(c => c.id !== commentId);
    const newPins = pins.filter(p => p.commentId !== commentId);

    // Renumber remaining comments and pins
    const renumberedComments = newComments
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((c, index) => ({ ...c, number: index + 1 }));

    const renumberedPins = newPins.map(p => {
      const correspondingComment = renumberedComments.find(c => c.id === p.commentId);
      return correspondingComment ? { ...p, number: correspondingComment.number } : p;
    });

    setComments(renumberedComments);
    setPins(renumberedPins);
  };

  const handleEditComment = (commentId: string, newText: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, text: newText } : c
    ));
    setEditingComment(null);
  };

  const handlePinClick = (commentId: string) => {
    setHighlightedComment(commentId);
    setTimeout(() => setHighlightedComment(null), 2000);
  };

  const handlePinDragStart = (e: React.MouseEvent, pinId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDraggedPin(pinId);
  };

  const handlePinDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedPin || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setPins(pins.map(p => 
      p.id === draggedPin ? { ...p, x, y } : p
    ));

    const pin = pins.find(p => p.id === draggedPin);
    if (pin) {
      setComments(comments.map(c => 
        c.id === pin.commentId ? { ...c, x, y } : c
      ));
    }
  }, [isDragging, draggedPin, pins, comments, scale]);

  const handlePinDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedPin(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handlePinDragMove);
      document.addEventListener('mouseup', handlePinDragEnd);
      return () => {
        document.removeEventListener('mousemove', handlePinDragMove);
        document.removeEventListener('mouseup', handlePinDragEnd);
      };
    }
  }, [isDragging, handlePinDragMove, handlePinDragEnd]);

  const handlePanStart = (e: React.MouseEvent) => {
    if (scale <= 1.0 || e.button !== 0) return;
    
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handlePanMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  }, [isPanning, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handlePanMove);
      document.addEventListener('mouseup', handlePanEnd);
      return () => {
        document.removeEventListener('mousemove', handlePanMove);
        document.removeEventListener('mouseup', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.2, Math.min(3.0, prev + delta)));
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.2));
  const resetZoom = () => setScale(1.0);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = currentPdfUrl;
    link.download = uploadedFileName || "document.pdf";
    link.click();
  };

  const getCurrentPagePins = () => {
    return pins.filter(pin => pin.pageNumber === currentPage && scale <= 1.0);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Resize sidebar
  const handleSidebarResize = useCallback((e: MouseEvent) => {
    const newWidth = window.innerWidth - e.clientX;
    setSidebarWidth(Math.max(250, Math.min(600, newWidth)));
  }, []);

  const startSidebarResize = () => {
    document.addEventListener('mousemove', handleSidebarResize);
    document.addEventListener('mouseup', stopSidebarResize);
  };

  const stopSidebarResize = () => {
    document.removeEventListener('mousemove', handleSidebarResize);
    document.removeEventListener('mouseup', stopSidebarResize);
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
        <div className="bg-white dark:bg-gray-800 border-b p-3 shadow-sm z-10">
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
              <Button variant="outline" size="sm" onClick={resetZoom}>
                Fit
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
          ref={viewerRef}
          className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-800"
          onWheel={handleWheel}
        >
          {/* Cursor hint */}
          {showCursorHint && !showCommentBox && (
            <div 
              className="fixed bg-black text-white px-2 py-1 rounded text-xs z-50 pointer-events-none"
              style={{ 
                left: mousePosition.x + 10, 
                top: mousePosition.y - 30
              }}
            >
              Click to add comment
            </div>
          )}

          <div className="flex justify-center items-center h-full p-8 overflow-hidden">
            <div 
              ref={pdfContainerRef}
              className="relative"
              onClick={handleClick}
              onMouseDown={handlePanStart}
              style={{ 
                cursor: isPanning ? 'grabbing' : scale > 1.0 ? 'grab' : 'crosshair',
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* Pins for current page */}
              {getCurrentPagePins().map((pin) => (
                <div
                  key={pin.id}
                  className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: pin.x * scale, 
                    top: pin.y * scale 
                  }}
                  onMouseDown={(e) => handlePinDragStart(e, pin.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(pin.commentId);
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white hover:scale-110 transition-transform"
                    style={{ backgroundColor: pin.user.color }}
                  >
                    {pin.number}
                  </div>
                </div>
              ))}

              {/* Comment box */}
              {showCommentBox && pendingComment && (
                <div
                  data-comment-box
                  className="absolute z-20 bg-white border shadow-lg rounded-lg p-3 min-w-[250px]"
                  style={{ 
                    left: pendingComment.x * scale + 20, 
                    top: pendingComment.y * scale,
                    transform: 'translateY(-50%)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Textarea
                    ref={commentBoxRef}
                    placeholder="Enter your comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] mb-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (commentText.trim()) {
                          handleSaveComment();
                        }
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleSaveComment}
                      disabled={!commentText.trim()}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setShowCommentBox(false);
                        setPendingComment(null);
                        setCommentText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {sidebarOpen && (
        <div 
          ref={sidebarRef}
          className="fixed right-0 top-0 h-full bg-white dark:bg-gray-800 border-l shadow-lg z-30"
          style={{ width: sidebarWidth }}
        >
          {/* Resize handle */}
          <div 
            className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-gray-400 opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={startSidebarResize}
          />
          
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Comments</h2>
              <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
            </div>
          </div>
          
          <ScrollArea className="h-full pb-16">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 mt-8 px-4">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Right-click on the PDF to add comments</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {comments
                  .sort((a, b) => a.number - b.number)
                  .map((comment) => (
                    <Card 
                      key={comment.id} 
                      className={`border-l-4 transition-colors ${
                        highlightedComment === comment.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                      style={{ borderLeftColor: comment.user.color }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: comment.user.color }}
                          >
                            {comment.number}
                          </div>
                          <span className="text-xs font-medium">{comment.user.name}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            Page {comment.pageNumber}
                          </span>
                        </div>
                        
                        {editingComment === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              defaultValue={comment.text}
                              className="min-h-[60px] text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  const target = e.target as HTMLTextAreaElement;
                                  handleEditComment(comment.id, target.value);
                                }
                              }}
                            />
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                                  handleEditComment(comment.id, textarea?.value || '');
                                }}
                              >
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 text-xs"
                                onClick={() => setEditingComment(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm mb-2">{comment.text}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setEditingComment(comment.id)}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}