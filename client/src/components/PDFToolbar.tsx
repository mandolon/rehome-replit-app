import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff,
  Upload
} from "lucide-react";

interface PDFToolbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  uploadedFileName: string | null;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PDFToolbar({
  sidebarOpen,
  onToggleSidebar,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  uploadedFileName,
  scale,
  onZoomIn,
  onZoomOut,
  onDownload,
  onFileUpload
}: PDFToolbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b p-3 shadow-sm z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
          >
            {sidebarOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {sidebarOpen ? "Hide" : "Show"} Comments
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
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
              onClick={onNextPage}
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
              onChange={onFileUpload}
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
          
          <Button variant="outline" size="sm" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}