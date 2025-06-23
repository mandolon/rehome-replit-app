import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Trash2,
  Move,
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
  const [isViewerOpen, setIsViewerOpen] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [draggedPin, setDraggedPin] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showPopover, setShowPopover] = useState<string | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load sample PDF on component mount
  useEffect(() => {
    loadSamplePDF();
  }, []);

  const loadSamplePDF = async () => {
    try {
      setIsLoading(true);
      // Create a simple sample PDF for demonstration
      const samplePdfUrl = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihTYW1wbGUgUERGIERvY3VtZW50KSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZgowMDAwMDAwMDA5IDAwMDAwIG4KMDAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgowMDAwMDAwMjQ1IDAwMDAwIG4KMDAwMDAwMDMyNiAwMDAwMCBuCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDE4CiUlRU9G';
      
      const pdf = await pdfjsLib.getDocument({ data: atob(samplePdfUrl) }).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      await renderPage(pdf, 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading sample PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load sample PDF",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    if (!canvasRef.current) return;
    
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  // Re-render when scale or page changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFileName(file.name);
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          await renderPage(pdf, 1);
          toast({
            title: "Success",
            description: `Uploaded ${file.name}`,
          });
        } catch (error) {
          console.error('Error loading PDF:', error);
          toast({
            title: "Error",
            description: "Failed to load PDF file",
            variant: "destructive",
          });
        }
      };
      
      fileReader.readAsArrayBuffer(file);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const downloadPDF = () => {
    // In a real app, this would download the actual PDF
    toast({
      title: "Download",
      description: "PDF download would start here",
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfContainerRef.current) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPendingPin({ x, y, pageNumber: currentPage });
    setShowCommentDialog(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfContainerRef.current) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // Handle pin dragging
    if (draggedPin) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPins(prev => prev.map(pin => 
        pin.id === draggedPin 
          ? { ...pin, x, y }
          : pin
      ));
      
      setComments(prev => prev.map(comment => {
        const pin = pins.find(p => p.id === draggedPin);
        if (pin && comment.x === pin.x && comment.y === pin.y && comment.pageNumber === pin.pageNumber) {
          return { ...comment, x, y };
        }
        return comment;
      }));
    }
  };

  const getCurrentPagePins = () => {
    return pins.filter(pin => pin.pageNumber === currentPage);
  };

  const getCurrentPageComments = () => {
    return comments.filter(comment => comment.pageNumber === currentPage);
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
    setPendingPin(null);
    setShowCommentDialog(false);
    setCommentText("");
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

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isViewerOpen) {
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
          onClick={() => setIsViewerOpen(false)}
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
                <canvas 
                  ref={canvasRef}
                  className="border shadow-lg"
                />
                
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
              </div>
            </div>
          </div>
        </div>

        {/* Comments Sidebar */}
        {sidebarOpen && (
          <>
            <div 
              className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors"
              onMouseDown={startResize}
            />
            <div 
              className="bg-white dark:bg-gray-800 border-l flex flex-col"
              style={{ width: sidebarWidth }}
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({getCurrentPageComments().length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {getCurrentPageComments().length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No comments on this page</p>
                      <p className="text-xs mt-1">Click on the document to add a comment</p>
                    </div>
                  ) : (
                    getCurrentPageComments().map((comment) => (
                      <Card 
                        key={comment.id}
                        className={`transition-colors ${
                          activeCommentId === comment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: comment.user.color }}
                              >
                                {pins.find(p => p.x === comment.x && p.y === comment.y && p.pageNumber === comment.pageNumber)?.number}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{comment.user.name}</div>
                                <div className="text-xs text-gray-500">
                                  {formatTimestamp(comment.timestamp)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditText(comment.text);
                                }}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteComment(comment.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {editingComment === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="min-h-[60px]"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    editComment(comment.id, editText);
                                    setEditingComment(null);
                                    setEditText("");
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingComment(null);
                                    setEditText("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm">{comment.text}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

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
    </div>
  );
}