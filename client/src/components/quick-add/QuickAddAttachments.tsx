
import React, { useRef, useState } from "react";
import { Paperclip, Plus } from "lucide-react";
import QuickAddFileIcons from "./QuickAddFileIcons";

interface QuickAddAttachmentsProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

// Only handles upload & removal, delegates icon display to QuickAddFileIcons
const QuickAddAttachments: React.FC<QuickAddAttachmentsProps> = ({ files, setFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      setFiles([...files, ...Array.from(e.target.files)]);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const hasFiles = files.length > 0;

  return (
    <div className="flex items-center gap-2 relative">
      {/* Attachment upload trigger, changes icon if files present */}
      <button
        type="button"
        className={`flex items-center justify-center border border-border rounded px-2 py-1 h-6 bg-white relative transition-colors
           ${hasFiles ? "hover:bg-accent/70 text-muted-foreground" : "text-muted-foreground hover:text-blue-700 hover:bg-accent"}`}
        title={hasFiles ? (files.length === 1 ? files[0].name : `${files.length} files`) : "Attach files"}
        onClick={e => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        aria-label="Attach file(s)"
        tabIndex={0}
        onMouseDown={e => e.preventDefault()}
      >
        {hasFiles ? (
          <Plus className="w-3 h-3" strokeWidth={2.5} /> 
        ) : (
          <Paperclip
            className="w-3 h-3"
            strokeWidth={2}
            fill="none"
          />
        )}
        {hasFiles && (
          <span className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full text-[10px] px-1 leading-none z-10 border border-white">
            {files.length}
          </span>
        )}
      </button>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-label="Attach file(s)"
      />
      {/* Icon-only file display */}
      {hasFiles && (
        <QuickAddFileIcons files={files} onRemoveFile={handleRemoveFile} />
      )}
    </div>
  );
};

export default QuickAddAttachments;

