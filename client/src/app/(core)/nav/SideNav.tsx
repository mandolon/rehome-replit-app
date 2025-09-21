import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarHeader from '@/components/sidebar/SidebarHeader';
import SidebarNavigation from '@/app/(core)/nav/SidebarNavigation';
import SidebarProjects from '@/components/sidebar/SidebarProjects';
import SidebarFooter from '@/components/sidebar/SidebarFooter';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useUser } from '@/contexts/UserContext';

interface SideNavProps {
  isCollapsed: boolean;
}

const SideNav = ({ isCollapsed }: SideNavProps) => {
  const { refreshTrigger } = useProjectData();
  const [openSections, setOpenSections] = useState({
    mainNav: true,
    projects: true
  });
  const { currentUser, isImpersonating, impersonatedUser } = useUser();

  // Detect client mode
  const clientMode =
    (isImpersonating && impersonatedUser && impersonatedUser.role === 'Client') ||
    (!isImpersonating && currentUser.role === 'Client');

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 ${
      isCollapsed ? 'w-16' : 'min-w-0'
    }`}>
      <SidebarHeader isCollapsed={isCollapsed} />

      {isCollapsed ? (
        <div className="flex-1 py-2 px-1">
          <SidebarNavigation 
            isCollapsed={true}
            isOpen={openSections.mainNav}
            onToggle={() => toggleSection('mainNav')}
          />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="py-2">
            <SidebarNavigation 
              isCollapsed={false}
              isOpen={openSections.mainNav}
              onToggle={() => toggleSection('mainNav')}
            />
            {/* Hide Projects section for clients */}
            {!clientMode && (
              <SidebarProjects 
                isOpen={openSections.projects}
                onToggle={() => toggleSection('projects')}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        </ScrollArea>
      )}

      {!isCollapsed && <SidebarFooter />}
    </div>
  );
};

export default SideNav;
