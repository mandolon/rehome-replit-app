import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Download, Copy, Scissors, Monitor, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ScreenClipPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const ScreenClipPopup: React.FC<ScreenClipPopupProps> = ({ isOpen, onClose }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionArea | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Reset state when popup opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsCapturing(false);
      setCapturedImage(null);
      setSelection(null);
      setIsSelecting(false);
    }
  }, [isOpen]);

  const startScreenCapture = useCallback(async () => {
    try {
      setIsCapturing(true);
      
      // Request screen capture with optimal browser compatibility
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      });

      // Create video element to capture the stream with cursor
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      
      // Wait for video to be ready and playing
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = reject;
      });

      // Wait a bit more to ensure the first frame with cursor is captured
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create high-quality canvas to capture the frame with cursor
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        desynchronized: false,
        colorSpace: 'srgb',
        willReadFrequently: false
      });
      
      if (ctx) {
        // Disable image smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'high';
        
        // Capture the current frame which should include the cursor
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        // Use maximum quality PNG export (no compression)
        const imageData = canvas.toDataURL('image/png', 1.0);
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Show selection overlay
        showSelectionOverlay(imageData);
      }
    } catch (error) {
      console.error('Error starting screen capture:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = "Unable to start screen capture. Please ensure you grant permission.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Screen capture permission was denied. Please allow screen sharing to continue.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Screen capture is not supported in this browser. Try using Chrome, Firefox, or Edge.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No screens available for capture. Please check your display settings.";
        }
      }
      
      toast({
        title: "Multi-Monitor Capture Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  }, [toast]);

  const showSelectionOverlay = (fullScreenImage: string) => {
    // Get screen information for accurate coordinate mapping
    const screenInfo = {
      totalWidth: screen.width,
      totalHeight: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      pixelRatio: window.devicePixelRatio
    };

    // Create a full-screen overlay that spans all available screen space
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      cursor: crosshair;
      z-index: 99999;
      user-select: none;
      pointer-events: auto;
      touch-action: none;
    `;

    // Add instructions overlay
    const instructionsDiv = document.createElement('div');
    instructionsDiv.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      text-align: center;
      pointer-events: none;
      z-index: 100000;
    `;
    instructionsDiv.innerHTML = `
      <div><strong>Screen Capture Mode</strong></div>
      <div style="margin-top: 4px; font-size: 12px;">Click and drag to select area • Press ESC to cancel • Cursor will be included in capture</div>
    `;
    overlay.appendChild(instructionsDiv);

    // Add selection rectangle
    const selectionRect = document.createElement('div');
    selectionRect.style.cssText = `
      position: absolute;
      border: 2px dashed #fff;
      background: rgba(255, 255, 255, 0.1);
      display: none;
      pointer-events: none;
    `;
    overlay.appendChild(selectionRect);

    let startX = 0, startY = 0;
    let isMouseDown = false;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isMouseDown = true;
      
      // Use page coordinates for accurate positioning across screen boundaries
      startX = e.pageX || e.clientX;
      startY = e.pageY || e.clientY;
      
      selectionRect.style.left = startX + 'px';
      selectionRect.style.top = startY + 'px';
      selectionRect.style.width = '0px';
      selectionRect.style.height = '0px';
      selectionRect.style.display = 'block';
      
      // Show real-time coordinates
      updateCoordinateDisplay(startX, startY, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      e.preventDefault();
      
      const currentX = e.pageX || e.clientX;
      const currentY = e.pageY || e.clientY;
      
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      
      selectionRect.style.left = left + 'px';
      selectionRect.style.top = top + 'px';
      selectionRect.style.width = width + 'px';
      selectionRect.style.height = height + 'px';
      
      // Update coordinate display
      updateCoordinateDisplay(left, top, width, height);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown) return;
      e.preventDefault();
      
      isMouseDown = false;
      const endX = e.pageX || e.clientX;
      const endY = e.pageY || e.clientY;
      
      // Ensure minimum selection size
      const minSize = 10;
      if (Math.abs(endX - startX) < minSize || Math.abs(endY - startY) < minSize) {
        toast({
          title: "Selection Too Small",
          description: "Please select a larger area to capture.",
          variant: "destructive"
        });
        document.body.removeChild(overlay);
        setIsCapturing(false);
        return;
      }
      
      // Calculate selection area with screen coordinate mapping
      const selectionArea = {
        startX: Math.min(startX, endX),
        startY: Math.min(startY, endY),
        endX: Math.max(startX, endX),
        endY: Math.max(startY, endY)
      };

      // Remove overlay
      document.body.removeChild(overlay);
      
      // Crop the image with cursor preservation
      cropImage(fullScreenImage, selectionArea);
    };

    // Function to show real-time coordinate information
    const updateCoordinateDisplay = (x: number, y: number, w: number, h: number) => {
      let coordDisplay = overlay.querySelector('.coord-display') as HTMLElement;
      if (!coordDisplay) {
        coordDisplay = document.createElement('div');
        coordDisplay.className = 'coord-display';
        coordDisplay.style.cssText = `
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          pointer-events: none;
          z-index: 100001;
        `;
        overlay.appendChild(coordDisplay);
      }
      coordDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}, W: ${Math.round(w)}, H: ${Math.round(h)}`;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        setIsCapturing(false);
      }
    };

    overlay.addEventListener('mousedown', handleMouseDown);
    overlay.addEventListener('mousemove', handleMouseMove);
    overlay.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    const cleanup = () => {
      overlay.removeEventListener('mousedown', handleMouseDown);
      overlay.removeEventListener('mousemove', handleMouseMove);
      overlay.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };

    // Store cleanup function on overlay for later use
    (overlay as any).cleanup = cleanup;

    document.body.appendChild(overlay);
  };

  const cropImage = (fullScreenImage: string, area: SelectionArea) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        desynchronized: false,
        colorSpace: 'srgb'
      });
      
      if (ctx) {
        // Simple coordinate mapping for browser-based screen capture
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Calculate scale factors based on captured image dimensions
        const scaleX = img.width / window.innerWidth;
        const scaleY = img.height / window.innerHeight;
        
        // Apply pixel ratio adjustment
        const adjustedScaleX = scaleX * pixelRatio;
        const adjustedScaleY = scaleY * pixelRatio;
        
        // Calculate crop coordinates
        const cropX = Math.round(area.startX * adjustedScaleX);
        const cropY = Math.round(area.startY * adjustedScaleY);
        const cropWidth = Math.round((area.endX - area.startX) * adjustedScaleX);
        const cropHeight = Math.round((area.endY - area.startY) * adjustedScaleY);
        
        // Ensure crop dimensions are within image bounds
        const finalCropX = Math.max(0, Math.min(cropX, img.width));
        const finalCropY = Math.max(0, Math.min(cropY, img.height));
        const finalCropWidth = Math.max(1, Math.min(cropWidth, img.width - finalCropX));
        const finalCropHeight = Math.max(1, Math.min(cropHeight, img.height - finalCropY));
        
        // Set canvas size to exact crop dimensions (no scaling)
        canvas.width = finalCropWidth;
        canvas.height = finalCropHeight;
        
        // Configure context for high-quality cursor preservation
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'high';
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw the cropped area preserving cursor and all visual elements
        ctx.drawImage(
          img,
          finalCropX, finalCropY, finalCropWidth, finalCropHeight,
          0, 0, finalCropWidth, finalCropHeight
        );
        
        // Export at maximum quality with cursor preserved
        const croppedImage = canvas.toDataURL('image/png', 1.0);
        setCapturedImage(croppedImage);
        setIsCapturing(false);
        
        toast({
          title: "Screen Area Captured",
          description: `Successfully captured ${finalCropWidth}x${finalCropHeight}px area from shared content.`
        });
      }
    };
    img.src = fullScreenImage;
  };

  const saveImage = useCallback((format: 'png' | 'jpg' = 'png') => {
    if (!capturedImage) return;

    const downloadImage = (imageData: string, ext: string) => {
      const link = document.createElement('a');
      link.download = `screen-clip-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${ext}`;
      link.href = imageData;
      link.click();

      toast({
        title: "High-Quality Image Saved",
        description: `Screen clip has been downloaded as ${ext.toUpperCase()} with maximum quality.`
      });
    };

    if (format === 'jpg') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        desynchronized: false,
        colorSpace: 'srgb'
      });
      const img = new Image();
      
      img.onload = () => {
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Fill with white background for JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Disable smoothing for sharp rendering
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        
        // Export as high-quality JPEG (quality = 1.0 = maximum)
        const jpegImage = canvas.toDataURL('image/jpeg', 1.0);
        downloadImage(jpegImage, 'jpg');
      };
      
      img.src = capturedImage;
    } else {
      downloadImage(capturedImage, 'png');
    }
  }, [capturedImage, toast]);

  const copyToClipboard = async () => {
    if (!capturedImage) return;

    try {
      // Convert data URL to high-quality blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Ensure we're copying the original PNG format for maximum quality
      await navigator.clipboard.write([
        new ClipboardItem({ 
          'image/png': blob,
          'image/jpeg': blob // Fallback for compatibility
        })
      ]);

      toast({
        title: "High-Quality Image Copied",
        description: "Screen clip has been copied to your clipboard with full resolution."
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Clipboard Error",
        description: "Unable to copy image to clipboard.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Screen Clip
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!capturedImage && !isCapturing && (
            <div className="text-center">
              <div className="mb-6">
                <Monitor className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Screen Capture Tool
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                  Capture screens, windows, or browser tabs using your browser's built-in screen sharing API.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <div><strong>Capture Options:</strong></div>
                      <div>• Choose "Entire Screen" for full screen capture</div>
                      <div>• Choose "Window" to capture specific applications</div>
                      <div>• Choose "Browser Tab" to capture web content</div>
                      <div>• Cursor visibility depends on your browser and selection</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-800 dark:text-amber-200">
                      <strong>Browser Limitations:</strong> Web browsers can only capture content you explicitly share. For unrestricted desktop capture, consider using this app as an Electron desktop application.
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={startScreenCapture}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Start Screen Capture
              </Button>
            </div>
          )}

          {isCapturing && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select Area to Capture
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Click and drag to select the area you want to capture from the shared screen/window.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>• Drag to create selection rectangle</div>
                  <div>• Press ESC to cancel selection</div>
                  <div>• Area depends on what you chose to share</div>
                </div>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <img
                  src={capturedImage}
                  alt="Captured screen area"
                  className="max-w-full max-h-96 mx-auto rounded shadow-lg"
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => saveImage('png')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save PNG
                </Button>
                
                <Button
                  onClick={() => saveImage('jpg')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save JPG
                </Button>
                
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </Button>
                
                <Button
                  onClick={() => {
                    setCapturedImage(null);
                    setIsCapturing(false);
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  Capture Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenClipPopup;