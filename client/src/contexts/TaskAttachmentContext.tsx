
import React, { createContext, useContext, useState, useMemo } from "react";

// Simple file type detection
function getFileType(extension: string): string {
  const ext = extension.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return 'Image';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'Document';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Spreadsheet';
  if (['ppt', 'pptx'].includes(ext)) return 'Presentation';
  if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(ext)) return 'Video';
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'Audio';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'Archive';
  if (['js', 'ts', 'html', 'css', 'py', 'java', 'cpp'].includes(ext)) return 'Code';
  return 'Other';
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  name: string;
  size: number;
  url: string;
  author: string;
  dateCreated: string;
  category: string;
  fileType: string;
}

interface TaskAttachmentContextValue {
  getAttachments: (taskId: string) => TaskAttachment[];
  addAttachments: (taskId: string, files: File[], author: string) => void;
  removeAttachment: (taskId: string, id: string) => void;
  updateAttachmentCategory: (taskId: string, attachmentId: string, category: string) => void;
}

const TaskAttachmentContext = createContext<TaskAttachmentContextValue | undefined>(undefined);

export const useTaskAttachmentContext = () => {
  const ctx = useContext(TaskAttachmentContext);
  if (!ctx) throw new Error("useTaskAttachmentContext must be used within the provider.");
  return ctx;
};

export const TaskAttachmentProvider = ({ children }: { children: React.ReactNode }) => {
  const [attachmentBucket, setAttachmentBucket] = useState<Record<string, TaskAttachment[]>>({});

  const getAttachments = (taskId: string) => attachmentBucket[taskId] || [];

  const addAttachments = (taskId: string, files: File[], author: string) => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    const newAttachments: TaskAttachment[] = files.map(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = getFileType(extension);
      return {
        id: Math.random().toString(36).slice(2),
        taskId,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        author,
        dateCreated: now,
        category: 'General',
        fileType,
      };
    });
    setAttachmentBucket(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), ...newAttachments],
    }));
  };

  const removeAttachment = (taskId: string, id: string) => {
    setAttachmentBucket(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(a => a.id !== id),
    }));
  };

  const updateAttachmentCategory = (taskId: string, attachmentId: string, category: string) => {
    setAttachmentBucket(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).map(att => 
        att.id === attachmentId ? { ...att, category } : att
      ),
    }));
  };

  const value = useMemo(
    () => ({ getAttachments, addAttachments, removeAttachment, updateAttachmentCategory }),
    [attachmentBucket]
  );

  return (
    <TaskAttachmentContext.Provider value={value}>
      {children}
    </TaskAttachmentContext.Provider>
  );
};
