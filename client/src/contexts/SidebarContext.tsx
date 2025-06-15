
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarContextType {
  isCollapsed: boolean;
  isHidden: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarHidden: (hidden: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isCollapsedState, setIsCollapsedState] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isMobile = useIsMobile();

  // On mobile, force collapsed
  const isCollapsed = isMobile ? true : isCollapsedState;

  const toggleSidebar = () => {
    if (isMobile) {
      // no-op: Always collapsed
      return;
    }
    if (isHidden) {
      setIsHidden(false);
      setIsCollapsedState(false);
    } else if (isCollapsedState) {
      setIsCollapsedState(false);
    } else {
      setIsCollapsedState(true);
    }
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    if (isMobile) return; // no-op on mobile
    setIsCollapsedState(collapsed);
  };

  const setSidebarHidden = (hidden: boolean) => {
    setIsHidden(hidden);
    if (hidden) {
      setIsCollapsedState(false); // Reset collapsed state when hiding
    }
  };

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isHidden,
      toggleSidebar,
      setSidebarCollapsed,
      setSidebarHidden
    }}>
      {children}
    </SidebarContext.Provider>
  );
};
