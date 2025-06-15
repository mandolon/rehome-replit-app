
import React, { createContext, useContext, useState, useMemo } from "react";

export interface TaskAttachment {
  id: string;
  taskId: string;
  name: string;
  size: number;
  url: string;
  author: string;
  dateCreated: string;
}

interface TaskAttachmentContextValue {
  getAttachments: (taskId: string) => TaskAttachment[];
  addAttachments: (taskId: string, files: File[], author: string) => void;
  removeAttachment: (taskId: string, id: string) => void;
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
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).slice(2),
      taskId,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      author,
      dateCreated: now,
    }));
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

  const value = useMemo(
    () => ({ getAttachments, addAttachments, removeAttachment }),
    [attachmentBucket]
  );

  return (
    <TaskAttachmentContext.Provider value={value}>
      {children}
    </TaskAttachmentContext.Provider>
  );
};
