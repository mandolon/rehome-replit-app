import React, { useState } from 'react';
import { Menu, Search, Settings, HelpCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ComposeDialog from '@/components/inbox/ComposeDialog';

interface InboxTopBarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const InboxTopBar = ({ onToggleSidebar, searchQuery, onSearchChange }: InboxTopBarProps) => {
  const [showComposeDialog, setShowComposeDialog] = useState(false);

  return (
    <div className="h-14 border-b border-border flex items-center px-4 flex-shrink-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-accent rounded-md transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mail"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Bell className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Themes</DropdownMenuItem>
            <DropdownMenuItem>Import mail</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="h-8 px-2">
          <HelpCircle className="w-4 h-4" />
        </Button>

        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium"
          onClick={() => setShowComposeDialog(true)}
        >
          Compose
        </Button>
      </div>

      <ComposeDialog
        isOpen={showComposeDialog}
        onClose={() => setShowComposeDialog(false)}
      />
    </div>
  );
};

export default InboxTopBar;
