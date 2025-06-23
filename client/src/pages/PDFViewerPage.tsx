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

const USER_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

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
  number: number;
  user: User;
  comment: Comment;
}

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
  const [scale, setScale] = useState(1.2);
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
    if (pdfDoc && currentPage <= totalPages && totalPages > 0) {
      // Add small delay to ensure DOM is ready
      setTimeout(() => {
        renderPage(currentPage);
      }, 50);
    }
  }, [pdfDoc, currentPage, scale, totalPages]);

  useEffect(() => {
    console.log("📤 Upload URL useEffect triggered:", { uploadedPdfUrl });
    if (uploadedPdfUrl) {
      console.log("🔄 Triggering loadPDF due to uploaded PDF URL change");
      loadPDF();
    }
  }, [uploadedPdfUrl]);

  useEffect(() => {
    console.log("📊 Current PDF URL changed:", { currentPdfUrl, uploadedPdfUrl });
  }, [currentPdfUrl, uploadedPdfUrl]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      console.log("📁 File selected:", file.name);
      setUploadedFileName(file.name);
      const url = URL.createObjectURL(file);
      setUploadedPdfUrl(url);
      toast({
        title: "PDF Uploaded",
        description: `Successfully loaded ${file.name}`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid PDF file",
        variant: "destructive",
      });
    }
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = uploadedFileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "PDF download has begun",
    });
  };

  const loadPDF = async () => {
    console.log("📂 Loading PDF from URL:", currentPdfUrl);
    
    try {
      setIsLoading(true);
      console.log("🔄 Fetching PDF document...");
      
      const loadingTask = pdfjsLib.getDocument({
        url: currentPdfUrl,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      console.log("✅ PDF loaded successfully!");
      console.log("📊 PDF Info:", {
        numPages: pdf.numPages,
        fingerprints: pdf.fingerprints
      });
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      toast({
        title: "PDF Loaded",
        description: `Document loaded with ${pdf.numPages} pages`,
      });
    } catch (error) {
      console.error("❌ Error loading PDF:", error);
      toast({
        title: "Error Loading PDF",
        description: "Failed to load the PDF document. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    console.log(`🎨 Starting to render page ${pageNum}`);
    
    if (!pdfDoc) {
      console.log("❌ No PDF document available for rendering");
      return;
    }
    
    // Wait for container to be available
    let retries = 0;
    while (!pdfContainerRef.current && retries < 10) {
      console.log(`⏳ Waiting for PDF container ref... (${retries + 1}/10)`);
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!pdfContainerRef.current) {
      console.log("❌ PDF container ref not available after retries");
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

      console.log("🖼️ Creating new canvas element");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      if (!context) {
        console.error("❌ Could not get 2D context from canvas");
        return;
      }

      canvas.className = "pdf-canvas border border-gray-200 dark:border-gray-700 shadow-lg";
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvasRef.current = canvas;

      console.log("📦 Canvas created with dimensions:", {
        width: canvas.width,
        height: canvas.height
      });

      // Clear the container and add the new canvas
      pdfContainerRef.current.innerHTML = "";
      pdfContainerRef.current.appendChild(canvas);

      console.log("🎨 Starting page render task...");
      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
      });

      await renderTask.promise;
      console.log(`✅ Page ${pageNum} rendered successfully!`);
      
      setIsLoading(false);
    } catch (error) {
      console.error(`❌ Error rendering page ${pageNum}:`, error);
      toast({
        title: "Rendering Error",
        description: `Failed to render page ${pageNum}`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("🖱️ Canvas clicked");
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log("📍 Click coordinates:", { x, y });
    
    // Store pending pin location
    const pin = { x, y, pageNumber: currentPage };
    setPendingPin(pin);
    setShowCommentDialog(true);
    
    console.log("💬 Opening comment dialog for pin:", pin);
  };

  const addComment = () => {
    if (!pendingPin || !commentText.trim()) {
      console.log("❌ Cannot add comment: missing pin or text");
      return;
    }

    console.log("💬 Adding new comment:", { pendingPin, commentText });

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      x: pendingPin.x,
      y: pendingPin.y,
      pageNumber: pendingPin.pageNumber,
      text: commentText,
      user: CURRENT_USER,
      replies: [],
      timestamp: new Date(),
    };

    const pin: Pin = {
      id: `pin-${Date.now()}`,
      x: pendingPin.x,
      y: pendingPin.y,
      pageNumber: pendingPin.pageNumber,
      number: comments.length + 1,
      user: CURRENT_USER,
      comment,
    };

    setComments(prev => [...prev, comment]);
    setPins(prev => [...prev, pin]);
    setShowCommentDialog(false);
    setCommentText("");
    setPendingPin(null);

    console.log("✅ Comment and pin added successfully");
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the document",
    });
  };

  const addReply = (commentId: string) => {
    if (!replyText.trim()) return;

    console.log("💬 Adding reply to comment:", commentId);

    const reply: Reply = {
      id: `reply-${Date.now()}`,
      text: replyText,
      user: CURRENT_USER,
      timestamp: new Date(),
    };

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyText("");
    setReplyingTo(null);

    console.log("✅ Reply added successfully");
    toast({
      title: "Reply Added",
      description: "Your reply has been added",
    });
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const fitToScreen = () => {
    console.log("fitToScreen() called");
    
    const canvas = document.querySelector('.pdf-canvas') as HTMLCanvasElement;
    const container = document.getElementById('pdf-viewer-container');
    const pageContainer = document.querySelector('.pdf-page-container') as HTMLElement;
    
    if (!canvas || !container || !pageContainer) {
      console.log("Canvas, container, or page container not found");
      return;
    }
    
    // Reset any previous transforms and container adjustments
    canvas.style.transform = '';
    canvas.style.transformOrigin = 'top left';
    pageContainer.style.width = '';
    pageContainer.style.height = '';
    
    // Force reflow to get accurate dimensions
    canvas.offsetHeight;
    
    // Get container dimensions using getBoundingClientRect
    const containerRect = container.getBoundingClientRect();
    const availableWidth = containerRect.width - 64; // Account for padding (32px each side)
    const availableHeight = containerRect.height - 64;
    
    // Get canvas natural dimensions
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    
    console.log("Available space:", { availableWidth, availableHeight });
    console.log("Canvas size:", { canvasWidth, canvasHeight });
    
    if (canvasWidth === 0 || canvasHeight === 0 || availableWidth <= 0 || availableHeight <= 0) {
      console.log("Invalid dimensions, cannot fit to screen");
      return;
    }
    
    // Calculate scale to fit both width and height
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const fitScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    // Calculate scaled dimensions
    const scaledWidth = canvasWidth * fitScale;
    const scaledHeight = canvasHeight * fitScale;
    
    // Apply transform to canvas
    canvas.style.transform = `scale(${fitScale})`;
    canvas.style.transformOrigin = 'top left';
    
    // Adjust container size to match scaled content
    pageContainer.style.width = `${scaledWidth}px`;
    pageContainer.style.height = `${scaledHeight}px`;
    pageContainer.style.overflow = 'visible';
    
    console.log("Applied scale:", fitScale);
    console.log("Scaled dimensions:", { scaledWidth, scaledHeight });
  };

  const resetZoom = () => {
    const canvas = document.querySelector('.pdf-canvas') as HTMLCanvasElement;
    const pageContainer = document.querySelector('.pdf-page-container') as HTMLElement;
    
    if (canvas) {
      canvas.style.transform = '';
      canvas.style.transformOrigin = '';
    }
    
    if (pageContainer) {
      pageContainer.style.width = '';
      pageContainer.style.height = '';
      pageContainer.style.overflow = '';
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar for Comments */}
      {sidebarOpen && (
        <div id="comment-sidebar" className="w-80 bg-white dark:bg-gray-800 border-r shadow-lg flex flex-col">
          <div className="p-4 border-b">
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
                <p className="text-sm mt-2">Click on the document to add a comment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getCurrentPageComments().map((comment) => {
                  const matchingPin = getCurrentPagePins().find(pin => 
                    pin.x === comment.x && pin.y === comment.y
                  );
                  
                  return (
                    <Card key={comment.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {matchingPin && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: matchingPin.user.color }}
                            >
                              {matchingPin.number}
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-sm font-medium">
                              {comment.user.name}
                            </CardTitle>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(comment.timestamp)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm mb-3">{comment.text}</p>
                        
                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">{reply.user.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(reply.timestamp)}
                                  </span>
                                </div>
                                <p>{reply.text}</p>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar Container */}
        <div 
          id="toolbar" 
          className="bg-white dark:bg-gray-800 border-b shadow-sm"
          style={{ height: '60px', minHeight: '60px', maxHeight: '60px' }}
        >
          <div className="h-full px-4 py-2 flex items-center justify-between">
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
              <Button variant="outline" size="sm" onClick={fitToScreen}>
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

        {/* Canvas Container */}
        <div 
          id="pdf-viewer-container"
          className="flex-1 overflow-auto relative bg-gray-100 dark:bg-gray-900"
          style={{ height: 'calc(100vh - 60px)' }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="p-8 h-full">
            {/* Hover instruction */}
            {hovering && (
              <div className="absolute top-4 left-4 bg-black text-white px-3 py-2 rounded-lg text-sm z-10 pointer-events-none">
                Click to add comment
              </div>
            )}

            <div className="flex justify-center h-full">
              <div 
                ref={pdfContainerRef}
                className="pdf-page-container relative cursor-crosshair"
                onClick={handleCanvasClick}
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