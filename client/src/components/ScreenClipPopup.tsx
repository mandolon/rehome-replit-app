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
      
      // Request screen capture permission with high quality settings for multi-monitor support
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // Prefer entire monitor over browser tab
          width: { ideal: 7680, max: 7680 }, // Support up to 8K for multi-monitor setups
          height: { ideal: 4320, max: 4320 },
          frameRate: { ideal: 60, max: 60 }
        },
        audio: false,
        systemAudio: 'exclude',
        surfaceSwitching: 'include', // Allow switching between different surfaces
        selfBrowserSurface: 'exclude' // Exclude the current browser tab to avoid recursion
      } as any); // TypeScript may not have latest displayMedia types

      // Create video element to capture the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create high-quality canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        desynchronized: false,
        colorSpace: 'srgb'
      });
      
      if (ctx) {
        // Disable image smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(video, 0, 0);
        
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
    // Create a full-screen overlay that spans all monitors
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: -100vh;
      left: -100vw;
      width: 300vw;
      height: 300vh;
      background: rgba(0, 0, 0, 0.3);
      cursor: crosshair;
      z-index: 9999;
      user-select: none;
      pointer-events: auto;
    `;

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
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionRect.style.left = startX + 'px';
      selectionRect.style.top = startY + 'px';
      selectionRect.style.width = '0px';
      selectionRect.style.height = '0px';
      selectionRect.style.display = 'block';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      
      selectionRect.style.left = left + 'px';
      selectionRect.style.top = top + 'px';
      selectionRect.style.width = width + 'px';
      selectionRect.style.height = height + 'px';
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown) return;
      
      isMouseDown = false;
      const endX = e.clientX;
      const endY = e.clientY;
      
      // Calculate selection area
      const selectionArea = {
        startX: Math.min(startX, endX),
        startY: Math.min(startY, endY),
        endX: Math.max(startX, endX),
        endY: Math.max(startY, endY)
      };

      // Remove overlay
      document.body.removeChild(overlay);
      
      // Crop the image
      cropImage(fullScreenImage, selectionArea);
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
        // Get the actual screen dimensions for multi-monitor support
        const screenWidth = screen.width * window.devicePixelRatio;
        const screenHeight = screen.height * window.devicePixelRatio;
        
        // Calculate scale factors based on the actual screen dimensions and captured image
        let scaleX = img.width / screenWidth;
        let scaleY = img.height / screenHeight;
        
        // If the captured image is smaller than expected, it might be a single monitor
        // In that case, use window dimensions as fallback
        if (img.width < screenWidth || img.height < screenHeight) {
          scaleX = img.width / (window.screen.width * window.devicePixelRatio);
          scaleY = img.height / (window.screen.height * window.devicePixelRatio);
        }
        
        // Calculate coordinates considering multi-monitor setup
        // Use screen coordinates if available, otherwise use relative positioning
        const hasMultiMonitorSupport = typeof window.screenX !== 'undefined' && window.screenX !== 0;
        
        let cropX, cropY, cropWidth, cropHeight;
        
        if (hasMultiMonitorSupport) {
          // Multi-monitor setup: adjust coordinates for monitor offset
          const adjustedStartX = area.startX + Math.abs(window.screenX);
          const adjustedStartY = area.startY + Math.abs(window.screenY);
          const adjustedEndX = area.endX + Math.abs(window.screenX);
          const adjustedEndY = area.endY + Math.abs(window.screenY);
          
          cropX = Math.round(adjustedStartX * scaleX);
          cropY = Math.round(adjustedStartY * scaleY);
          cropWidth = Math.round((adjustedEndX - adjustedStartX) * scaleX);
          cropHeight = Math.round((adjustedEndY - adjustedStartY) * scaleY);
        } else {
          // Single monitor or fallback: use direct coordinate mapping
          cropX = Math.round(area.startX * scaleX);
          cropY = Math.round(area.startY * scaleY);
          cropWidth = Math.round((area.endX - area.startX) * scaleX);
          cropHeight = Math.round((area.endY - area.startY) * scaleY);
        }
        
        // Ensure crop dimensions are within image bounds
        const finalCropX = Math.max(0, Math.min(cropX, img.width));
        const finalCropY = Math.max(0, Math.min(cropY, img.height));
        const finalCropWidth = Math.max(1, Math.min(cropWidth, img.width - finalCropX));
        const finalCropHeight = Math.max(1, Math.min(cropHeight, img.height - finalCropY));
        
        // Set canvas size to exact crop dimensions (no scaling)
        canvas.width = finalCropWidth;
        canvas.height = finalCropHeight;
        
        // Disable image smoothing for pixel-perfect cropping
        ctx.imageSmoothingEnabled = false;
        
        // Draw the cropped area with no interpolation
        ctx.drawImage(
          img,
          finalCropX, finalCropY, finalCropWidth, finalCropHeight,
          0, 0, finalCropWidth, finalCropHeight
        );
        
        // Export at maximum quality with no compression
        const croppedImage = canvas.toDataURL('image/png', 1.0);
        setCapturedImage(croppedImage);
        setIsCapturing(false);
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
                  Multi-Monitor Screen Capture
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                  Capture from any monitor or desktop area. Select "Entire Screen" or "Monitor" when prompted to access all displays.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Multi-Monitor Support:</strong> You can capture from any connected display, not just the current browser window.
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={startScreenCapture}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Start Multi-Monitor Capture
              </Button>
            </div>
          )}

          {isCapturing && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select Area Across Any Monitor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Click and drag to select any area from your desktop or connected monitors. The selection works across all displays.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>• Drag across monitor boundaries to capture multi-screen areas</div>
                  <div>• Press ESC to cancel selection</div>
                  <div>• Selection overlay covers all available displays</div>
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