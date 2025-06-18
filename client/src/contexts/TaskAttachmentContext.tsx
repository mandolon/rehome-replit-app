import React, { createContext, useContext } from "react";

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
  const context = useContext(TaskAttachmentContext);
  if (!context) {
    throw new Error('useTaskAttachmentContext must be used within a TaskAttachmentProvider');
  }
  return context;
};

// Hardcoded placeholder attachments
const PLACEHOLDER_ATTACHMENTS: TaskAttachment[] = [
  {
    id: "att1",
    taskId: "T1714",
    name: "project_requirements.pdf",
    size: 2048576,
    url: "#",
    author: "Sarah Chen",
    dateCreated: "2024-06-15",
    category: "",
    fileType: "PDF"
  },
  {
    id: "att2", 
    taskId: "T1714",
    name: "design_mockup.png",
    size: 1536000,
    url: "#",
    author: "Mike Johnson",
    dateCreated: "2024-06-16",
    category: "",
    fileType: "IMG"
  }
];

export const TaskAttachmentProvider = ({ children }: { children: React.ReactNode }) => {
  const getAttachments = (taskId: string): TaskAttachment[] => {
    return PLACEHOLDER_ATTACHMENTS.filter(att => att.taskId === taskId);
  };

  const addAttachments = () => {
    // Placeholder - no functionality
  };

  const removeAttachment = () => {
    // Placeholder - no functionality  
  };

  const updateAttachmentCategory = () => {
    // Placeholder - no functionality
  };

  const value = {
    getAttachments,
    addAttachments,
    removeAttachment,
    updateAttachmentCategory
  };

  return (
    <TaskAttachmentContext.Provider value={value}>
      {children}
    </TaskAttachmentContext.Provider>
  );
};