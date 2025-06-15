import React, { useState } from 'react';
import { Menu, ChevronDown, Circle, Bell, BellOff, Settings, Keyboard, Download, HelpCircle, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle'; // Added ThemeToggle import

interface PageHeaderProps {
  onToggleSidebar?: () => void;
}

const PageHeader = ({ 
  onToggleSidebar
}: PageHeaderProps) => {
  const navigate = useNavigate();
  const { currentUser, updateUserStatus, toggleNotifications, logout } = useUser();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-300';
      case 'away': return 'text-amber-300';
      case 'busy': return 'text-rose-300';
      default: return 'text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="border-b border-border px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* User Info and Dropdown */}
        <div className="flex items-center gap-3">
          <ThemeToggle /> {/* Added ThemeToggle here */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent px-2 py-1 rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {currentUser.avatar}
                  </div>
                  <Circle className={`w-3 h-3 absolute -bottom-0.5 -right-0.5 ${getStatusColor(currentUser.status)} fill-current`} />
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* User Info Section */}
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                      {currentUser.avatar}
                    </div>
                    <Circle className={`w-3 h-3 absolute -bottom-0.5 -right-0.5 ${getStatusColor(currentUser.status)} fill-current`} />
                  </div>
                  <div>
                    <div className="font-semibold">{currentUser.name}</div>
                    <div className="text-sm text-muted-foreground">{currentUser.email}</div>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              {/* Status Controls */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Circle className={`w-4 h-4 mr-2 ${getStatusColor(currentUser.status)} fill-current`} />
                  Set status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => updateUserStatus('online')}>
                    <Circle className="w-4 h-4 mr-2 text-green-300 fill-current" />
                    Online
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateUserStatus('away')}>
                    <Circle className="w-4 h-4 mr-2 text-amber-300 fill-current" />
                    Away
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateUserStatus('busy')}>
                    <Circle className="w-4 h-4 mr-2 text-rose-300 fill-current" />
                    Busy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateUserStatus('offline')}>
                    <Circle className="w-4 h-4 mr-2 text-gray-300 fill-current" />
                    Offline
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuItem onClick={toggleNotifications}>
                {currentUser.notificationsMuted ? (
                  <Bell className="w-4 h-4 mr-2" />
                ) : (
                  <BellOff className="w-4 h-4 mr-2" />
                )}
                {currentUser.notificationsMuted ? 'Unmute notifications' : 'Mute notifications'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Navigation */}
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              {/* The "Themes" DropdownMenuItem used to be here. 
                  It's good practice to remove redundant UI elements when a dedicated toggle is available.
                  However, the user didn't explicitly ask for this, so I will keep it for now.
                  If the user asks to remove it, I will.
              */}
              <DropdownMenuItem>
                <div className="w-4 h-4 mr-2" /> {/* Spacer for themes icon */}
                Themes 
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/notifications')}>
                <Bell className="w-4 h-4 mr-2" />
                Notification settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Utilities */}
              <DropdownMenuItem>
                <Keyboard className="w-4 h-4 mr-2" />
                Keyboard shortcuts
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="w-4 h-4 mr-2" /> {/* Spacer for referrals icon */}
                Referrals
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download apps
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Help */}
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Important Actions */}
              <DropdownMenuItem onClick={() => navigate('/settings?tab=trash')}>
                <Trash2 className="w-4 h-4 mr-2" />
                Trash
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
