
import React, { useRef } from 'react';
import { Paperclip, Plus } from 'lucide-react';
import { useTaskAttachmentContext } from '@/contexts/TaskAttachmentContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

interface TaskRowFilesProps {
  hasAttachment: boolean;
  onAddFileClick?: (e: React.MouseEvent) => void;
  taskId?: string;
}

const TaskRowFiles = ({
  hasAttachment,
  onAddFileClick,
  taskId,
}: TaskRowFilesProps) => {
  const { getAttachments, addAttachments } = useTaskAttachmentContext();
  const { currentUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachments = taskId ? getAttachments(taskId) : [];
  const hasFiles = attachments.length > 0;

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!taskId) return;
    if (e.target.files && e.target.files.length) {
      const files = Array.from(e.target.files);
      addAttachments(taskId, files, currentUser?.name ?? "Unknown");
      e.target.value = "";
    }
  };

  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <div className="flex items-center relative select-none">
      <div className="w-6 h-6 rounded flex items-center justify-center relative group border border-transparent hover:border-accent transition-colors bg-background">
        {hasFiles ? (
          <>
            {attachments.length === 1 ? (
              <a
                href={attachments[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full h-full justify-center"
                title={attachments[0].name}
                onClick={e => e.stopPropagation()}
              >
                <Paperclip className="w-4 h-4 text-gray-600" />
              </a>
            ) : (
              <>
                <button
                  type="button"
                  className="w-full h-full flex items-center justify-center"
                  onClick={e => {
                    e.stopPropagation();
                    setShowDropdown(v => !v);
                  }}
                  aria-label="Show attachments"
                >
                  <Paperclip className="w-4 h-4 text-gray-600" />
                </button>
                {showDropdown && (
                  <div
                    className="absolute left-0 top-7 z-20 bg-background border rounded shadow-lg min-w-[180px] py-1"
                    onClick={e => e.stopPropagation()}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    {attachments.map(att => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-1 text-xs text-foreground hover:bg-accent truncate"
                        title={att.name}
                        style={{ maxWidth: 160 }}
                        download={att.name}
                      >
                        {att.name}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
            {/* Show the attachment count as a badge in top left if available */}
            <span className="absolute -top-2 -left-2 bg-orange-600 text-white rounded-full text-[10px] px-1 font-semibold z-20 shadow"
              style={{ minWidth: 16, minHeight: 16 }}
              title={`${attachments.length} file${attachments.length > 1 ? 's' : ''}`}
            >
              {attachments.length}
            </span>
            {/* Show the plus button to add more files */}
            <button
              className="absolute bottom-0.5 -right-2 bg-background border border-border rounded-full p-[2px] shadow hover:bg-accent z-30 transition-colors"
              style={{ minWidth: 18, minHeight: 18 }}
              onClick={handleUploadClick}
              aria-label="Add file"
              tabIndex={0}
            >
              <Plus className="w-3 h-3 text-foreground" strokeWidth="2" />
            </button>
          </>
        ) : (
          // If no files, only show plus
          <button
            className="w-full h-full flex items-center justify-center rounded-full bg-background border border-border hover:bg-accent transition-colors"
            onClick={handleUploadClick}
            aria-label="Add file"
            tabIndex={0}
          >
            <Plus className="w-4 h-4 text-foreground" strokeWidth="2" />
          </button>
        )}

        {/* File upload hidden input */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
          aria-label="Upload file"
        />
      </div>
    </div>
  );
};

export default TaskRowFiles;
