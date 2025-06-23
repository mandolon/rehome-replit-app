import { useState, useEffect, useRef, useCallback } from "react";
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
  Upload
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import PDFCanvas, { PDFCanvasHandle } from "@/components/PDFCanvas";
import PDFToolbar from "@/components/PDFToolbar";
import PDFComments from "@/components/PDFComments";

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
  xPercent: number;
  yPercent: number;
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
  xPercent: number;
  yPercent: number;
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
  const [scale, setScale] = useState(1.2);
  
  // Add debugging for scale changes
  useEffect(() => {
    console.log("📊 Scale state changed:", { 
      newScale: scale,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack?.split('\n').slice(0, 5)
    });
  }, [scale]);
  const [fitToHeight, setFitToHeight] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [highlightedComment, setHighlightedComment] = useState<string | null>(null);
  const [popoverComment, setPopoverComment] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [popoverText, setPopoverText] = useState("");
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [canvasHovering, setCanvasHovering] = useState(false);
  const [tempPin, setTempPin] = useState<Pin | null>(null);
  
  const pdfCanvasRef = useRef<PDFCanvasHandle>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle click outside popover to cancel comment
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverComment && popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        cancelPopoverComment();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverComment]);

  // Update pin positions when scale changes to maintain relative positioning
  useEffect(() => {
    if (scale && pdfCanvasRef.current) {
      const canvas = pdfCanvasRef.current.getCanvasElement();
      if (canvas) {
        // Update all pins to maintain their percentage-based positions
        setPins(prevPins => prevPins.map(pin => ({
          ...pin,
          x: (pin.xPercent / 100) * canvas.width,
          y: (pin.yPercent / 100) * canvas.height,
        })));

        // Update all comments to match pin positions
        setComments(prevComments => prevComments.map(comment => ({
          ...comment,
          x: (comment.xPercent / 100) * canvas.width,
          y: (comment.yPercent / 100) * canvas.height,
        })));

        // Update temp pin if it exists
        if (tempPin) {
          setTempPin(prevTempPin => prevTempPin ? {
            ...prevTempPin,
            x: (prevTempPin.xPercent / 100) * canvas.width,
            y: (prevTempPin.yPercent / 100) * canvas.height,
          } : null);
        }
      }
    }
  }, [scale, pdfDoc]);

  // Handle window resize to maintain fit mode consistency
  useEffect(() => {
    console.log("🪟 Setting up window resize listener, pdfDoc available:", !!pdfDoc);
    
    const handleResize = async () => {
      console.log("🔄 Window resize detected, recalculating fit scale...");
      if (pdfDoc) {
        console.log("📏 Calculating new fit scale due to resize...");
        const newFitScale = await calculateFitToHeightScale();
        console.log("📏 New fit scale from resize:", newFitScale);
        setScale(newFitScale);
      } else {
        console.log("❌ No PDF document available for resize calculation");
      }
    };

    const debouncedResize = debounce(handleResize, 150);
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      console.log("🧹 Cleaning up window resize listener");
      window.removeEventListener('resize', debouncedResize);
    };
  }, [pdfDoc]);

  // Simple debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Debug component lifecycle and render timing
  useEffect(() => {
    console.log("🔄 PDFViewerPage component rendered/updated");
    console.log("🔍 Current component state:", {
      pdfDoc: !!pdfDoc,
      scale,
      currentPage,
      totalPages,
      isLoading,
      sidebarOpen,
      hovering,
      uploadedPdfUrl: !!uploadedPdfUrl,
      currentPdfUrl,
      pinsCount: pins.length,
      commentsCount: comments.length
    });
  });

  // Sample PDF URL - using Mozilla's sample PDF
  const PDF_URL = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

  // Use uploaded PDF URL if available, otherwise use default
  const currentPdfUrl = uploadedPdfUrl || PDF_URL;

  useEffect(() => {
    console.log("🚀 Initial PDF load useEffect triggered");
    console.log("🔍 Initial state check:", { 
      currentScale: scale, 
      pdfDoc: !!pdfDoc, 
      currentPdfUrl,
      isLoading 
    });
    loadPDF();
  }, []);

  useEffect(() => {
    console.log("📤 Upload URL useEffect triggered:", { uploadedPdfUrl });
    if (uploadedPdfUrl) {
      console.log("🔄 Triggering loadPDF due to uploaded PDF URL change");
      console.log("🔍 Upload state check:", { 
        currentScale: scale, 
        pdfDoc: !!pdfDoc, 
        uploadedPdfUrl,
        isLoading 
      });
      loadPDF();
    }
  }, [uploadedPdfUrl]);

  useEffect(() => {
    console.log("📊 Current PDF URL changed:", { currentPdfUrl, uploadedPdfUrl });
  }, [currentPdfUrl]);

  const calculateFitToHeightScale = async (pdf?: pdfjsLib.PDFDocumentProxy) => {
    console.log("🔍 calculateFitToHeightScale called with:", { pdf: !!pdf, pdfDoc: !!pdfDoc });
    
    const doc = pdf || pdfDoc;
    if (!doc) {
      console.log("❌ No PDF document available for fit calculation");
      return 1.2;
    }
    
    try {
      console.log("📄 Getting first page for fit calculation...");
      const page = await doc.getPage(1); // Always use first page for initial calculation
      const viewport = page.getViewport({ scale: 1 });
      
      console.log("📐 PDF page dimensions (scale 1):", {
        width: viewport.width,
        height: viewport.height
      });
      
      // Get container dimensions (accounting for toolbar, padding, and margins)
      const windowHeight = window.innerHeight;
      const toolbarHeight = 80;
      const padding = 40;
      const extraPadding = 60;
      const containerHeight = windowHeight - toolbarHeight - padding;
      const availableHeight = Math.max(400, containerHeight - extraPadding);
      
      console.log("📏 Container dimensions:", {
        windowHeight,
        toolbarHeight,
        padding,
        extraPadding,
        containerHeight,
        availableHeight
      });
      
      const fitScale = availableHeight / viewport.height;
      const clampedScale = Math.max(0.3, Math.min(3.0, fitScale));
      
      console.log("⚖️ Scale calculations:", {
        rawFitScale: fitScale,
        clampedScale,
        willFit: fitScale >= 0.3 && fitScale <= 3.0
      });
      
      return clampedScale;
    } catch (error) {
      console.error("❌ Error calculating fit-to-height scale:", error);
      return 1.2;
    }
  };

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
      
      console.log("🔧 Setting PDF document state...");
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1); // Reset to first page when loading new PDF
      
      console.log("📏 Current scale before fit calculation:", scale);
      
      // Wait for next tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Calculate and apply fit-to-height scale for new PDF
      console.log("🎯 Starting fit-to-height calculation for new PDF...");
      const fitScale = await calculateFitToHeightScale(pdf);
      console.log("📏 Calculated fit scale:", fitScale);
      
      console.log("🔄 Setting new scale:", fitScale);
      setScale(fitScale);
      
      // Wait for scale update
      await new Promise(resolve => setTimeout(resolve, 0));
      
      console.log("✅ PDF loading complete with fit scale applied:", fitScale);
      console.log("🔍 Final state check:", { 
        scale: fitScale, 
        pdfDocSet: !!pdf, 
        totalPages: pdf.numPages 
      });
      
      console.log("🗑️ Clearing existing pins and comments for new PDF");
      // Clear existing pins and comments when loading new PDF
      setPins([]);
      setComments([]);
      
      console.log("✅ PDF loading complete, setting loading state to false");
      setIsLoading(false);
      
      // Auto-fit to height for new PDFs
      if (fitToHeight) {
        setTimeout(async () => {
          const fitScale = await calculateFitToHeightScale();
          setScale(fitScale);
        }, 100);
      }
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



  const handleCanvasClick = (x: number, y: number) => {
    console.log('Canvas clicked:', { x, y, canvasHovering, currentPage });
    
    // Create temporary pin immediately
    const tempPinData = createTemporaryPin(x, y);
    setTempPin(tempPinData);
    
    setPopoverComment({ x, y, pageNumber: currentPage });
    setPopoverText("");
    console.log('Popover comment set:', { x, y });
  };

  const addPopoverComment = () => {
    if (!popoverComment || !popoverText.trim() || !pdfCanvasRef.current) return;

    const commentId = `comment-${Date.now()}`;
    const pinId = `pin-${Date.now()}`;
    
    // Calculate sequential pin number across all pages
    const allPinsSorted = [...pins]
      .sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
        return a.y - b.y || a.x - b.x;
      });
    
    const pinNumber = allPinsSorted.length + 1;

    // Calculate percentage coordinates
    const canvas = pdfCanvasRef.current?.getCanvasElement();
    const xPercent = canvas ? (popoverComment.x / canvas.width) * 100 : 0;
    const yPercent = canvas ? (popoverComment.y / canvas.height) * 100 : 0;

    const newPin: Pin = {
      id: pinId,
      x: popoverComment.x,
      y: popoverComment.y,
      xPercent,
      yPercent,
      pageNumber: popoverComment.pageNumber,
      user: CURRENT_USER,
      number: pinNumber,
    };

    const newComment: Comment = {
      id: commentId,
      x: popoverComment.x,
      y: popoverComment.y,
      xPercent,
      yPercent,
      pageNumber: popoverComment.pageNumber,
      text: popoverText,
      user: CURRENT_USER,
      replies: [],
      timestamp: new Date(),
    };

    setPins([...pins, newPin]);
    setComments([...comments, newComment]);
    setPopoverText("");
    setPopoverComment(null);
    setTempPin(null); // Clear temporary pin after adding permanent one
    
    console.log('Added pin and comment:', { pin: newPin, comment: newComment });
  };

  const createTemporaryPin = (x: number, y: number) => {
    // Create a temporary pin when clicking, even before adding comment
    const tempPinId = `temp-pin-${Date.now()}`;
    const pinNumber = pins.filter(p => p.pageNumber === currentPage).length + 1;
    
    // Calculate percentage coordinates
    const canvas = pdfCanvasRef.current?.getCanvasElement();
    const xPercent = canvas ? (x / canvas.width) * 100 : 0;
    const yPercent = canvas ? (y / canvas.height) * 100 : 0;
    
    const tempPin: Pin = {
      id: tempPinId,
      x,
      y,
      xPercent,
      yPercent,
      pageNumber: currentPage,
      user: CURRENT_USER,
      number: pinNumber,
    };
    
    // Store the temporary pin separately so we can remove it if comment is cancelled
    return tempPin;
  };

  const cancelPopoverComment = () => {
    setPopoverComment(null);
    setPopoverText("");
    setTempPin(null); // Remove temporary pin when cancelling
  };

  const addComment = () => {
    if (!pendingPin || !commentText.trim()) return;

    const commentId = `comment-${Date.now()}`;
    const pinId = `pin-${Date.now()}`;
    const pinNumber = pins.filter(p => p.pageNumber === currentPage).length + 1;

    // Calculate percentage coordinates
    const canvas = pdfCanvasRef.current?.getCanvasElement();
    const xPercent = canvas ? (pendingPin.x / canvas.width) * 100 : 0;
    const yPercent = canvas ? (pendingPin.y / canvas.height) * 100 : 0;

    const newPin: Pin = {
      id: pinId,
      x: pendingPin.x,
      y: pendingPin.y,
      xPercent,
      yPercent,
      pageNumber: pendingPin.pageNumber,
      user: CURRENT_USER,
      number: pinNumber,
    };

    const newComment: Comment = {
      id: commentId,
      x: pendingPin.x,
      y: pendingPin.y,
      xPercent,
      yPercent,
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

  const addReply = (commentId: string, replyText: string) => {
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
  };

  const editComment = (commentId: string, newText: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, text: newText }
        : comment
    ));
  };

  const deleteComment = (commentId: string) => {
    // Remove the comment
    setComments(comments.filter(comment => comment.id !== commentId));
    
    // Remove associated pin and renumber remaining pins
    const updatedPins = pins.filter(pin => {
      const associatedComment = comments.find(c => c.id === commentId);
      return !(associatedComment && pin.x === associatedComment.x && pin.y === associatedComment.y && pin.pageNumber === associatedComment.pageNumber);
    });
    
    // Renumber pins sequentially by pageNumber and position
    const renumberedPins = updatedPins
      .sort((a, b) => {
        if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
        return a.y - b.y || a.x - b.x; // Sort by position
      })
      .map((pin, index) => ({ ...pin, number: index + 1 }));
    
    setPins(renumberedPins);
    
    // Clear highlighting if this comment was highlighted
    if (highlightedComment === commentId) {
      setHighlightedComment(null);
    }
  };

  const highlightComment = (commentId: string) => {
    setHighlightedComment(highlightedComment === commentId ? null : commentId);
  };

  const handlePinDrag = (pinId: string, xPercent: number, yPercent: number) => {
    // Update pin positions using percentage coordinates
    setPins(pins.map(pin => {
      if (pin.id === pinId) {
        // Calculate new pixel coordinates from percentages
        const canvas = pdfCanvasRef.current?.getCanvasElement();
        const newX = canvas ? (xPercent / 100) * canvas.width : pin.x;
        const newY = canvas ? (yPercent / 100) * canvas.height : pin.y;
        
        return {
          ...pin,
          x: newX,
          y: newY,
          xPercent,
          yPercent,
        };
      }
      return pin;
    }));

    // Update corresponding comments
    setComments(comments.map(comment => {
      const associatedPin = pins.find(p => p.id === pinId);
      if (associatedPin && comment.x === associatedPin.x && comment.y === associatedPin.y && comment.pageNumber === associatedPin.pageNumber) {
        const canvas = pdfCanvasRef.current?.getCanvasElement();
        const newX = canvas ? (xPercent / 100) * canvas.width : comment.x;
        const newY = canvas ? (yPercent / 100) * canvas.height : comment.y;
        
        return {
          ...comment,
          x: newX,
          y: newY,
          xPercent,
          yPercent,
        };
      }
      return comment;
    }));
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
    setFitToHeight(false);
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setFitToHeight(false);
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFitToHeight = async () => {
    setFitToHeight(true);
    const fitScale = await calculateFitToHeightScale();
    setScale(fitScale);
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

  const getCurrentPagePins = () => {
    const currentPins = pins.filter(pin => pin.pageNumber === currentPage);
    // Include temporary pin if it exists and is on current page
    if (tempPin && tempPin.pageNumber === currentPage) {
      return [...currentPins, tempPin];
    }
    return currentPins;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Toolbar */}
      <PDFToolbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        uploadedFileName={uploadedFileName}
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitToHeight={handleFitToHeight}
        onDownload={downloadPDF}
        onFileUpload={handleFileUpload}
      />

      {/* Main PDF Viewer - with constrained boundaries */}
      <div className={`fixed top-16 bottom-0 left-0 transition-all duration-200 ${sidebarOpen ? 'right-80' : 'right-0'}`}>
        {/* PDF Container with internal scrolling */}
        <div 
          className="w-full h-full overflow-auto relative"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          <PDFCanvas
            ref={pdfCanvasRef}
            pdfDoc={pdfDoc}
            currentPage={currentPage}
            scale={scale}
            onCanvasClick={handleCanvasClick}
            hovering={canvasHovering}
            onHoverChange={(hovering) => {
              setCanvasHovering(hovering);
              if (!hovering) {
                setCursorPosition(null);
              }
            }}
            onCursorMove={(x, y) => {
              const container = pdfCanvasRef.current?.getContainerElement();
              if (container) {
                const containerRect = container.getBoundingClientRect();
                setCursorPosition({
                  x: containerRect.left + x,
                  y: containerRect.top + y
                });
              }
            }}
            onPinDrag={handlePinDrag}
            pins={getCurrentPagePins()}
          />
          
          {/* Cursor Comment Indicator */}
          {canvasHovering && cursorPosition && !popoverComment && (
            <div
              className="fixed z-40 pointer-events-none"
              style={{
                left: cursorPosition.x + 15,
                top: cursorPosition.y - 5,
              }}
            >
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                Click to add comment
              </div>
            </div>
          )}

          {/* Popover Comment Input */}
          {popoverComment && (
            <div
              ref={popoverRef}
              className="absolute z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 w-64"
              style={{
                left: popoverComment.x + 25,
                top: popoverComment.y - 15,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Textarea
                value={popoverText}
                onChange={(e) => setPopoverText(e.target.value)}
                placeholder="Add your comment..."
                className="min-h-[80px] text-sm mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addPopoverComment();
                  } else if (e.key === 'Escape') {
                    cancelPopoverComment();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={cancelPopoverComment}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={addPopoverComment}
                  disabled={!popoverText.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Sidebar */}
      <PDFComments
        isOpen={sidebarOpen}
        comments={comments}
        pins={pins}
        currentPage={currentPage}
        onAddReply={addReply}
        onEditComment={editComment}
        onDeleteComment={deleteComment}
        onHighlightComment={highlightComment}
        highlightedComment={highlightedComment}
      />

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