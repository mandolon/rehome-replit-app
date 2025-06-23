import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Maximize
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker to use local file
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
  const [scale, setScale] = useState(1.3); // Better default for standard letter readability
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fitMode, setFitMode] = useState(true); // Default to fit mode
  
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageRef = useRef<pdfjsLib.PDFPageProxy | null>(null);

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

  // Handle window resize to recalculate fit scale
  useEffect(() => {
    const handleResize = () => {
      if (fitMode && pageRef.current) {
        const newFitScale = calculateFitScale(pageRef.current);
        setScale(newFitScale);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitMode]);

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

  const logContainerDimensions = (label: string) => {
    if (!pdfContainerRef.current) return;
    
    const container = pdfContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const parentRect = container.parentElement?.getBoundingClientRect();
    
    console.log(`📏 ${label} - Container Dimensions:`, {
      containerRect: {
        width: containerRect.width,
        height: containerRect.height,
        top: containerRect.top,
        left: containerRect.left
      },
      parentRect: parentRect ? {
        width: parentRect.width,
        height: parentRect.height,
        top: parentRect.top,
        left: parentRect.left
      } : null,
      containerStyles: {
        overflow: getComputedStyle(container).overflow,
        position: getComputedStyle(container).position,
        display: getComputedStyle(container).display,
        maxWidth: getComputedStyle(container).maxWidth,
        maxHeight: getComputedStyle(container).maxHeight
      },
      scrollInfo: {
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth,
        hasVerticalOverflow: container.scrollHeight > container.clientHeight,
        hasHorizontalOverflow: container.scrollWidth > container.clientWidth
      }
    });
  };

  const calculateFitScale = (page: pdfjsLib.PDFPageProxy): number => {
    if (!pdfContainerRef.current) {
      console.log("❌ No container ref for fit scale calculation");
      return 1.3;
    }
    
    logContainerDimensions("Before Fit Scale Calculation");
    
    const container = pdfContainerRef.current;
    const containerParent = container.parentElement;
    if (!containerParent) {
      console.log("❌ No container parent for fit scale calculation");
      return 1.3;
    }
    
    // Get the actual available space in the PDF viewer area
    const parentRect = containerParent.getBoundingClientRect();
    const toolbar = document.querySelector('[class*="border-b p-3"]') as HTMLElement;
    const toolbarHeight = toolbar ? toolbar.offsetHeight : 60;
    
    const containerPadding = 32; // Account for padding
    const availableWidth = parentRect.width - containerPadding;
    const availableHeight = parentRect.height - containerPadding - toolbarHeight;
    
    console.log("📏 Available space calculation:", {
      parentWidth: parentRect.width,
      parentHeight: parentRect.height,
      toolbarHeight,
      containerPadding,
      availableWidth,
      availableHeight
    });
    
    const viewport = page.getViewport({ scale: 1 });
    const scaleX = availableWidth / viewport.width;
    const scaleY = availableHeight / viewport.height;
    
    // Use the smaller scale to ensure the PDF fits entirely, with some margin
    const fitScale = Math.min(scaleX, scaleY) * 0.95; // 5% margin for safety
    
    console.log("📐 Calculated fit scale:", {
      availableWidth,
      availableHeight,
      pageWidth: viewport.width,
      pageHeight: viewport.height,
      scaleX,
      scaleY,
      rawFitScale: Math.min(scaleX, scaleY),
      fitScaleWithMargin: fitScale,
      clampedFitScale: Math.max(0.3, Math.min(fitScale, 3))
    });
    
    return Math.max(0.3, Math.min(fitScale, 3)); // Clamp between 0.3 and 3
  };

  const logCanvasDimensions = (canvas: HTMLCanvasElement, viewport: pdfjsLib.PageViewport, label: string) => {
    const canvasRect = canvas.getBoundingClientRect();
    const canvasStyles = getComputedStyle(canvas);
    
    console.log(`🖼️ ${label} - Canvas Dimensions:`, {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        displayWidth: canvasRect.width,
        displayHeight: canvasRect.height
      },
      viewport: {
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale
      },
      canvasStyles: {
        width: canvasStyles.width,
        height: canvasStyles.height,
        maxWidth: canvasStyles.maxWidth,
        maxHeight: canvasStyles.maxHeight,
        objectFit: canvasStyles.objectFit,
        display: canvasStyles.display
      },
      positioning: {
        top: canvasRect.top,
        left: canvasRect.left,
        bottom: canvasRect.bottom,
        right: canvasRect.right
      }
    });
  };

  const renderPage = async (pageNum: number) => {
    console.log(`🎨 Starting to render page ${pageNum} with scale: ${scale}`);
    
    if (!pdfDoc) {
      console.log("❌ No PDF document available for rendering");
      return;
    }
    
    if (!pdfContainerRef.current) {
      console.log("❌ PDF container ref not available");
      return;
    }

    logContainerDimensions("Before Page Render");

    try {
      console.log(`📄 Getting page ${pageNum} from PDF document`);
      const page = await pdfDoc.getPage(pageNum);
      pageRef.current = page;
      
      console.log(`✅ Page ${pageNum} retrieved successfully`);

      // Calculate scale based on fit mode
      let currentScale = scale;
      if (fitMode) {
        currentScale = calculateFitScale(page);
        if (Math.abs(currentScale - scale) > 0.01) { // Only update if significantly different
          setScale(currentScale);
          console.log(`📏 Updated scale to fit: ${currentScale}`);
          return; // Exit early, will re-render with new scale
        }
      }

      // Remove existing canvas
      if (canvasRef.current) {
        console.log("🗑️ Removing existing canvas");
        const oldCanvas = canvasRef.current;
        logCanvasDimensions(oldCanvas, page.getViewport({ scale: currentScale }), "Before Canvas Removal");
        oldCanvas.remove();
      }

      console.log(`📐 Creating viewport with scale ${currentScale}`);
      const viewport = page.getViewport({ scale: currentScale });
      console.log("📐 Viewport dimensions:", {
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale,
        rotation: viewport.rotation
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
      canvas.className = "border shadow-lg bg-white";
      canvas.style.maxWidth = "100%";
      canvas.style.maxHeight = "100%";
      canvas.style.objectFit = "contain";
      
      console.log("🔗 Appending canvas to container");
      pdfContainerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      logCanvasDimensions(canvas, viewport, "After Canvas Creation");

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      console.log(`🎨 Starting to render page ${pageNum} to canvas`);
      await page.render(renderContext).promise;
      console.log(`✅ Page ${pageNum} rendered successfully to canvas`);
      
      logCanvasDimensions(canvas, viewport, "After Page Render");
      logContainerDimensions("After Page Render Complete");
      
      // Check for overflow after rendering
      setTimeout(() => {
        logContainerDimensions("Post-Render Overflow Check");
      }, 100);
      
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
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPendingPin({ x, y, pageNumber: currentPage });
    setShowCommentDialog(true);
  };

  const addComment = () => {
    if (!pendingPin || !commentText.trim()) return;

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
      text: commentText,
      user: CURRENT_USER,
      replies: [],
      timestamp: new Date(),
    };

    setPins([...pins, newPin]);
    setComments([...comments, newComment]);
    setCommentText("");
    setPendingPin(null);
    setShowCommentDialog(false);
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
    const newScale = Math.min(scale + 0.25, 3);
    console.log("🔍 Zoom In triggered:", {
      previousScale: scale,
      newScale,
      fitMode: fitMode
    });
    setFitMode(false);
    setScale(newScale);
    logContainerDimensions("After Zoom In");
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.5);
    console.log("🔍 Zoom Out triggered:", {
      previousScale: scale,
      newScale,
      fitMode: fitMode
    });
    setFitMode(false);
    setScale(newScale);
    logContainerDimensions("After Zoom Out");
  };

  const fitToPage = () => {
    console.log("📐 Fit To Page triggered");
    setFitMode(true);
    if (pageRef.current) {
      const fitScale = calculateFitScale(pageRef.current);
      console.log("📐 Setting fit scale:", fitScale);
      setScale(fitScale);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 border-r bg-white dark:bg-gray-800 shadow-lg flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Comments</h2>
              <Badge variant="secondary">{comments.length}</Badge>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {getCurrentPageComments().length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments on this page</p>
                <p className="text-sm mt-2">Click anywhere on the PDF to add a comment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getCurrentPageComments().map((comment, index) => {
                  const pinNumber = getCurrentPagePins().find(p => 
                    p.x === comment.x && p.y === comment.y
                  )?.number || index + 1;
                  
                  return (
                    <Card key={comment.id} className="border-l-4" style={{ borderLeftColor: comment.user.color }}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: comment.user.color }}
                          >
                            {pinNumber}
                          </div>
                          <CardTitle className="text-sm">{comment.user.name}</CardTitle>
                          <span className="text-xs text-gray-500 ml-auto">
                            Page {comment.pageNumber}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm mb-2">{comment.text}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          {formatTimestamp(comment.timestamp)}
                        </p>
                        
                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="space-y-2 mb-3">
                            <Separator />
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="ml-4 pl-3 border-l-2 border-gray-200">
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
                        {replyingTo === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => addReply(comment.id)}
                                disabled={!replyText.trim()}
                              >
                                Reply
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
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
                            className="flex items-center gap-1 text-xs"
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

      {/* Main PDF Viewer */}
      <div className="flex-1 flex flex-col">
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
              <Button 
                variant={fitMode ? "default" : "outline"} 
                size="sm" 
                onClick={fitToPage}
                className="flex items-center gap-1"
              >
                <Maximize className="h-4 w-4" />
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
          className="flex-1 overflow-auto relative"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{ maxHeight: 'calc(100vh - 80px)' }} // Prevent vertical overflow
        >
          {/* Hover instruction */}
          {hovering && (
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-2 rounded-lg text-sm z-10 pointer-events-none">
              Click to add comment
            </div>
          )}

          <div className="flex justify-center items-start min-h-full p-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div 
              ref={pdfContainerRef}
              className="relative cursor-crosshair"
              onClick={handleCanvasClick}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Pins for current page */}
              {getCurrentPagePins().map((pin) => (
                <div
                  key={pin.id}
                  className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: pin.x, top: pin.y }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white hover:scale-110 transition-transform"
                    style={{ backgroundColor: pin.user.color }}
                  >
                    {pin.number}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCommentDialog(false);
                  setCommentText("");
                  setPendingPin(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={addComment}
                disabled={!commentText.trim()}
              >
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}