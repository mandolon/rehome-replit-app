import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserDropdownMenu from './UserDropdownMenu';

// Removed: import UserAvatar from './UserAvatar'; 

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  const { currentUser, updateUserStatus, toggleNotifications } = useUser();
  
  // Debug logging
  console.log('SidebarHeader - currentUser:', currentUser);

  if (isCollapsed) {
    return (
      <div className="px-2 py-3 border-b border-sidebar-border flex flex-col items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors p-0 focus:outline-none">
            {/* Use logo image as icon when collapsed */}
            <img
              src="/lovable-uploads/055f1e94-8aee-498f-b5c8-39455c83efc2.png"
              alt="Sidebar Logo"
              className="block dark:filter dark:invert dark:brightness-100"
              style={{
                maxHeight: 28,
                maxWidth: 28,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </DropdownMenuTrigger>
          <UserDropdownMenu 
            user={currentUser}
            onStatusChange={updateUserStatus}
            onToggleNotifications={toggleNotifications}
          />
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-sidebar-border">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent px-2 py-1 rounded-md transition-colors w-full">
          <div className="flex items-center gap-2 flex-grow">
            <div className="text-left">
              <div className="text-sm font-medium">{currentUser.name}</div>
              <div className="text-xs text-muted-foreground">{currentUser.company}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
          </div>
        </DropdownMenuTrigger>
        <UserDropdownMenu 
          user={currentUser}
          onStatusChange={updateUserStatus}
          onToggleNotifications={toggleNotifications}
        />
      </DropdownMenu>
    </div>
  );
};

export default SidebarHeader;
