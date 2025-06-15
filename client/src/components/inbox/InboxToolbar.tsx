
import React from 'react';
import { Archive, Trash2, Star, MoreHorizontal, RotateCcw, Tag, Clock, FolderOpen, Undo2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InboxToolbarProps {
  selectedEmails: string[];
  totalEmails: number;
  onSelectAll: () => void;
  activeTab?: string;
}

const InboxToolbar = ({ selectedEmails, totalEmails, onSelectAll, activeTab = 'inbox' }: InboxToolbarProps) => {
  const handleArchive = () => {
    console.log('Archiving emails:', selectedEmails);
  };

  const handleDelete = () => {
    console.log('Deleting emails:', selectedEmails);
  };

  const handleTrash = () => {
    console.log('Moving to trash:', selectedEmails);
  };

  const handleRestore = () => {
    console.log('Restoring emails:', selectedEmails);
  };

  const handleStar = () => {
    console.log('Starring emails:', selectedEmails);
  };

  const handleMoveToFolder = () => {
    console.log('Moving to folder:', selectedEmails);
  };

  const handleMarkRead = () => {
    console.log('Marking as read:', selectedEmails);
  };

  const handleMarkUnread = () => {
    console.log('Marking as unread:', selectedEmails);
  };

  const getTabSpecificActions = () => {
    switch (activeTab) {
      case 'trash':
        return (
          <>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleRestore}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        );
      case 'archive':
        return (
          <>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleRestore}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleTrash}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleStar}>
              <Star className="w-4 h-4" />
            </Button>
          </>
        );
      case 'sent':
        return (
          <>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleArchive}>
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleTrash}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleStar}>
              <Star className="w-4 h-4" />
            </Button>
          </>
        );
      case 'drafts':
        return (
          <>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleTrash}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleStar}>
              <Star className="w-4 h-4" />
            </Button>
          </>
        );
      default: // inbox
        return (
          <>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleArchive}>
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleTrash}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleStar}>
              <Star className="w-4 h-4" />
            </Button>
          </>
        );
    }
  };

  return (
    <div className="px-4 py-2 border-b border-border flex items-center gap-2">
      <Checkbox 
        checked={selectedEmails.length === totalEmails && totalEmails > 0}
        onCheckedChange={onSelectAll}
      />
      
      <Button variant="ghost" size="sm" className="h-8 px-2">
        <RotateCcw className="w-4 h-4" />
      </Button>
      
      {selectedEmails.length > 0 && (
        <>
          {getTabSpecificActions()}
          
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleMoveToFolder}>
            <FolderOpen className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Tag className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Clock className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleMarkRead}>Mark as read</DropdownMenuItem>
              <DropdownMenuItem onClick={handleMarkUnread}>Mark as unread</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveToFolder}>Move to folder</DropdownMenuItem>
              <DropdownMenuSeparator />
              {activeTab !== 'trash' && (
                <>
                  <DropdownMenuItem>Report spam</DropdownMenuItem>
                  <DropdownMenuItem>Block sender</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {activeTab === 'trash' ? (
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  Delete permanently
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleTrash} className="text-red-600">
                  Move to trash
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

export default InboxToolbar;
