
import React from "react";
import { File, FileText, FileImage, FileAudio, FileVideo, FileArchive } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Helper: guess file type for icon
function getFileIconType(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext) return "file";
  if (["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg"].includes(ext)) return "image";
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) return "audio";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["txt", "md", "rtf", "doc", "docx", "pdf"].includes(ext)) return "text";
  return "file";
}

const iconMap = {
  file: File,
  text: FileText,
  image: FileImage,
  audio: FileAudio,
  video: FileVideo,
  archive: FileArchive,
};

interface QuickAddFileIconsProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
}

const QuickAddFileIcons: React.FC<QuickAddFileIconsProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {files.map((file, i) => {
          const type = getFileIconType(file);
          const LucideIcon = iconMap[type as keyof typeof iconMap] || File;
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span
                  className="relative cursor-pointer group"
                  tabIndex={0}
                  onClick={e => e.stopPropagation()}
                >
                  <LucideIcon className="w-5 h-5 text-blue-700 bg-accent rounded" strokeWidth={2.1} />
                  {typeof onRemoveFile === "function" && (
                    <button
                      tabIndex={-1}
                      onClick={ev => { ev.stopPropagation(); onRemoveFile(i); }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      style={{ fontSize: 10 }}
                      aria-label="Remove file"
                      type="button"
                    >×</button>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-xs" side="top">
                {file.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default QuickAddFileIcons;
