
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectDataContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

export const useProjectData = () => {
  const context = useContext(ProjectDataContext);
  if (!context) {
    throw new Error('useProjectData must be used within a ProjectDataProvider');
  }
  return context;
};

interface ProjectDataProviderProps {
  children: ReactNode;
}

export const ProjectDataProvider = ({ children }: ProjectDataProviderProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ProjectDataContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ProjectDataContext.Provider>
  );
};
