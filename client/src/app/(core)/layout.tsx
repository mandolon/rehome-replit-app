import React, { ReactNode, useRef, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
import { ThemeProvider } from './theme-provider';
import AppHeader from './header/AppHeader';
import SideNav from './nav/SideNav';
import { useLayoutStore } from '@/lib/zustand/useLayoutStore';

interface CoreLayoutProps {
  children: ReactNode;
}

const CoreLayout: React.FC<CoreLayoutProps> = ({ children }) => {
  const { collapsed, toggleCollapse, sidebarWidth, setSidebarWidth } = useLayoutStore();
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);

  const handleResize = (sizes: number[]) => {
    const sidebarSize = sizes[0];
    setSidebarWidth(sidebarSize);
    
    // If sidebar is dragged below 8% of screen width, collapse it
    if (sidebarSize < 8) {
      toggleCollapse();
    }
  };

  // If sidebar is collapsed (icon mode), don't make it resizable
  if (collapsed) {
    return (
      <ThemeProvider>
        <div className="min-h-screen w-full bg-background flex">
          {/* SideNav */}
          <div className="w-16 flex-shrink-0 h-screen overflow-hidden bg-sidebar border-r border-sidebar-border">
            <SideNav isCollapsed={true} />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* AppHeader */}
            <AppHeader onToggleSidebar={toggleCollapse} />
            
            {/* Page Content */}
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Resizable layout when sidebar is expanded
  return (
    <ThemeProvider>
      <div className="min-h-screen w-full bg-background">
        <PanelGroup 
          direction="horizontal" 
          onLayout={handleResize}
          autoSaveId="sidebar-layout"
        >
          {/* Resizable SideNav Panel */}
          <Panel 
            ref={sidebarPanelRef}
            defaultSize={sidebarWidth} 
            minSize={8}
            maxSize={40}
            className="h-screen overflow-hidden"
            collapsible={true}
            onCollapse={() => toggleCollapse()}
          >
            <div className="h-full bg-sidebar border-r border-sidebar-border">
              <SideNav isCollapsed={false} />
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-1 bg-sidebar-border hover:bg-blue-500 transition-colors duration-200" />

          {/* Main Content Panel */}
          <Panel minSize={60} className="h-screen overflow-hidden">
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              {/* AppHeader */}
              <AppHeader onToggleSidebar={toggleCollapse} />
              
              {/* Page Content */}
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </ThemeProvider>
  );
};

export default CoreLayout;