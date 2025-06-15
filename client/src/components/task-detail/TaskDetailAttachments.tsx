
import React, { useRef, useState, DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { useTaskAttachmentContext } from '@/contexts/TaskAttachmentContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { useUser } from '@/contexts/UserContext';
import TaskAttachmentTable from '../attachments/TaskAttachmentTable';

interface TaskDetailAttachmentsProps {
  taskId?: string;
}

const TaskDetailAttachments = ({ taskId }: TaskDetailAttachmentsProps) => {
  const { getAttachments, addAttachments, removeAttachment } = useTaskAttachmentContext();
  const { customTasks } = useTaskContext();
  const { currentUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);

  let currentTaskId = taskId;
  if (!currentTaskId && customTasks && customTasks.length > 0) currentTaskId = customTasks[0]?.taskId;
  if (!currentTaskId) return null;
  const attachments = getAttachments(currentTaskId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      const files = Array.from(e.target.files);
      addAttachments(currentTaskId!, files, currentUser?.name ?? "Unknown");
      e.target.value = "";
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      addAttachments(currentTaskId!, files, currentUser?.name ?? "Unknown");
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Attachments</h2>
      <div
        className={`border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted/30 cursor-pointer hover:bg-accent/30 transition-colors relative ${
          dragActive ? 'bg-blue-100 border-blue-400' : ''
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
        aria-label="Drop files to attach"
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload file"
        />
        <span className="text-xs text-muted-foreground flex justify-center items-center gap-1">
          <Upload className="w-4 h-4" /> Drop your files here to upload
        </span>
        <div className="text-[10px] text-muted-foreground mt-1">(Click box to select files)</div>
        {/* Drag overlay */}
        {dragActive && (
          <div className="absolute inset-0 rounded-lg bg-blue-100/70 flex items-center justify-center pointer-events-none z-10 text-blue-600 font-semibold text-sm">
            Drop files to attach
          </div>
        )}
      </div>
      <TaskAttachmentTable
        attachments={attachments}
        onRemove={(id) => removeAttachment(currentTaskId!, id)}
      />
    </div>
  );
};

export default TaskDetailAttachments;
