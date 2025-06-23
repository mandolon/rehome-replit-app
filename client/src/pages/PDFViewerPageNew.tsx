import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  X,
  Edit3,
  Trash2
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
  isEditing?: boolean;
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
  isDragging?: boolean;
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

interface PDFViewerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialPdfUrl?: string;
}

export default function PDFViewerPage({ isOpen = true, onClose, initialPdfUrl }: PDFViewerProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [hovering, setHovering] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scale, setScale] = useState(1.2);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopover, setShowPopover] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [draggedPin, setDraggedPin] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageRef = useRef<pdfjsLib.PDFPageProxy | null>(null);

  // Sample PDF URL - using Mozilla's sample PDF
  const PDF_URL = initialPdfUrl || "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

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

      // Calculate scale to fit height
      const containerHeight = pdfContainerRef.current.clientHeight - 64;
      const pageViewport = page.getViewport({ scale: 1 });
      const fitScale = containerHeight / pageViewport.height;
      const finalScale = Math.min(fitScale, scale);

      console.log(`📐 Creating viewport with scale ${finalScale}`);
      const viewport = page.getViewport({ scale: finalScale });
      console.log("📐 Viewport dimensions:", {
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale
      });

      console.log("🖼️ Creating new canvas element");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (!context) {
        console.log("❌ Failed to get 2D context from canvas");
        return;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = "border shadow-lg bg-white cursor-crosshair";
      
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
    if (!canvasRef.current || draggedPin) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const commentId = `comment-${Date.now()}`;
    setPendingPin({ x, y, pageNumber: currentPage });
    setShowPopover(commentId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
    
    if (draggedPin && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPins(pins.map(pin => 
        pin.id === draggedPin ? { ...pin, x, y } : pin
      ));
      
      setComments(comments.map(comment => 
        comment.id === draggedPin ? { ...comment, x, y } : comment
      ));
    }
  };

  const handlePinMouseDown = (pinId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedPin(pinId);
  };

  const handleMouseUp = () => {
    setDraggedPin(null);
  };

  const handleSidebarResize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      setSidebarWidth(Math.max(250, Math.min(600, newWidth)));
    }
  }, [isResizing]);

  const startResize = () => {
    setIsResizing(true);
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleSidebarResize);
      document.addEventListener('mouseup', stopResize);
      return () => {
        document.removeEventListener('mousemove', handleSidebarResize);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing, handleSidebarResize]);

  const addComment = (text: string) => {
    if (!pendingPin || !text.trim()) return;

    const commentId = `comment-${Date.now()}`;
    const pinId = `pin-${Date.now()}`;
    const pinNumber = pins.filter(p => p.pageNumber === currentPage).length + 1;

    const newPin: Pin = {
      id: pinId,
      x: pendingPin.x,
      y: pendingPin.y,
      pageNumber: pendingPin.pageNumber,
      user: CURRENT_USER,
      number: pinNumber,
    };

    const newComment: Comment = {
      id: commentId,
      x: pendingPin.x,
      y: pendingPin.y,
      pageNumber: pendingPin.pageNumber,
      text: text,
      user: CURRENT_USER,
      replies: [],
      timestamp: new Date(),
    };

    setPins([...pins, newPin]);
    setComments([...comments, newComment]);
    setPendingPin(null);
    setShowPopover(null);
  };

  const editComment = (commentId: string, newText: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, text: newText, isEditing: false }
        : comment
    ));
  };

  const deleteComment = (commentId: string) => {
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) return;

    const newComments = comments.filter(c => c.id !== commentId);
    const newPins = pins.filter(p => !(p.x === commentToDelete.x && p.y === commentToDelete.y && p.pageNumber === commentToDelete.pageNumber));
    
    // Renumber remaining pins on the same page
    const pageComments = newComments.filter(c => c.pageNumber === commentToDelete.pageNumber);
    const updatedPins = newPins.map(pin => {
      if (pin.pageNumber === commentToDelete.pageNumber) {
        const commentIndex = pageComments.findIndex(c => 
          c.x === pin.x && c.y === pin.y && c.pageNumber === pin.pageNumber
        );
        return { ...pin, number: commentIndex + 1 };
      }
      return pin;
    });

    setComments(newComments);
    setPins(updatedPins);
  };

  const highlightComment = (commentId: string) => {
    setActiveCommentId(commentId);
    setTimeout(() => setActiveCommentId(null), 2000);
  };

  const addReply = (commentId: string) => {
    if (!replyText.trim()) return;

    const reply: Reply = {
      id: `reply-${Date.now()}`,
      text: replyText,
      user: CURRENT_USER,
      timestamp: new Date(),
    };

    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyText("");
    setReplyingTo(null);
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
    // Reset the input
    event.target.value = '';
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = currentPdfUrl;
    link.download = "document.pdf";
    link.click();
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
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

  const getCurrentPageComments = () => {
    return comments.filter(comment => comment.pageNumber === currentPage);
  };

  const getCurrentPagePins = () => {
    return pins.filter(pin => pin.pageNumber === currentPage);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-lg">Loading PDF...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full h-full max-w-7xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
        >
          <X className="h-4 w-4" />
        </Button>

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
            className="flex-1 overflow-auto p-8 relative"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Hover instruction */}
            {hovering && !draggedPin && (
              <div 
                className="absolute bg-black text-white px-2 py-1 rounded text-xs z-20 pointer-events-none"
                style={{ left: cursorPosition.x + 10, top: cursorPosition.y - 30 }}
              >
                Click to add comment
              </div>
            )}

            <div className="flex justify-center">
              <div 
                ref={pdfContainerRef}
                className="relative"
                onClick={handleCanvasClick}
              >
                {/* Pins for current page */}
                {getCurrentPagePins().map((pin) => (
                  <div
                    key={pin.id}
                    className="absolute z-10 cursor-move transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: pin.x, top: pin.y }}
                    onMouseDown={(e) => handlePinMouseDown(pin.id, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      highlightComment(pin.id);
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white hover:scale-110 transition-transform"
                      style={{ backgroundColor: pin.user.color }}
                    >
                      {pin.number}
                    </div>
                  </div>
                ))}

                {/* New comment popover */}
                {pendingPin && showPopover && (
                  <Popover open={true} onOpenChange={(open) => !open && setShowPopover(null)}>
                    <PopoverTrigger asChild>
                      <div
                        className="absolute z-10"
                        style={{ left: pendingPin.x, top: pendingPin.y }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3">
                      <CommentPopover
                        onSave={addComment}
                        onCancel={() => {
                          setShowPopover(null);
                          setPendingPin(null);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resizable Sidebar */}
        {sidebarOpen && (
          <div 
            className="absolute right-0 top-0 h-full bg-white dark:bg-gray-800 border-l shadow-lg flex"
            style={{ width: sidebarWidth }}
          >
            {/* Resize Handle */}
            <div
              className="w-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 cursor-col-resize flex-shrink-0"
              onMouseDown={startResize}
            />
            
            {/* Sidebar Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <h2 className="text-sm font-semibold">Comments</h2>
                  <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                {getCurrentPageComments().length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No comments on this page</p>
                    <p className="text-xs mt-1 text-gray-400">Click anywhere on the PDF to add a comment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCurrentPageComments().map((comment, index) => {
                      const pinNumber = getCurrentPagePins().find(p => 
                        p.x === comment.x && p.y === comment.y
                      )?.number || index + 1;
                      
                      return (
                        <Card 
                          key={comment.id} 
                          className={`border-l-4 transition-colors ${
                            activeCommentId === comment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          style={{ borderLeftColor: comment.user.color }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: comment.user.color }}
                              >
                                {pinNumber}
                              </div>
                              <span className="text-xs font-medium">{comment.user.name}</span>
                              <span className="text-xs text-gray-500 ml-auto">
                                Page {comment.pageNumber}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setComments(comments.map(c => 
                                    c.id === comment.id ? { ...c, isEditing: !c.isEditing } : c
                                  ))}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteComment(comment.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {comment.isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  defaultValue={comment.text}
                                  className="text-xs min-h-[60px]"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      editComment(comment.id, e.currentTarget.value);
                                    }
                                  }}
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={(e) => {
                                      const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                                      if (textarea) editComment(comment.id, textarea.value);
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={() => setComments(comments.map(c => 
                                      c.id === comment.id ? { ...c, isEditing: false } : c
                                    ))}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs mb-2">{comment.text}</p>
                                <p className="text-xs text-gray-500">
                                  {formatTimestamp(comment.timestamp)}
                                </p>
                              </>
                            )}
                            
                            {/* Replies */}
                            {comment.replies.length > 0 && !comment.isEditing && (
                              <div className="mt-3 space-y-2">
                                <Separator />
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="ml-3 pl-2 border-l-2 border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
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
                            {replyingTo === comment.id && !comment.isEditing ? (
                              <div className="mt-3 space-y-2">
                                <Textarea
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="text-xs min-h-[50px]"
                                />
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    className="h-6 text-xs"
                                    onClick={() => addReply(comment.id)}
                                    disabled={!replyText.trim()}
                                  >
                                    Reply
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-6 text-xs"
                                    onClick={() => setReplyingTo(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : !comment.isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReplyingTo(comment.id)}
                                className="mt-2 h-6 text-xs flex items-center gap-1"
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
          </div>
        )}
      </div>
    </div>
  );
}

// Comment Popover Component
interface CommentPopoverProps {
  onSave: (text: string) => void;
  onCancel: () => void;
}

function CommentPopover({ onSave, onCancel }: CommentPopoverProps) {
  const [text, setText] = useState('');

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Add Comment</label>
        <Textarea
          placeholder="Enter your comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (text.trim()) {
                onSave(text);
                setText('');
              }
            }
            if (e.key === 'Escape') {
              onCancel();
            }
          }}
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={() => {
            if (text.trim()) {
              onSave(text);
              setText('');
            }
          }}
          disabled={!text.trim()}
        >
          Save Comment
        </Button>
      </div>
    </div>
  );
}