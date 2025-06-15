
import React from 'react';
import { ChevronLeft, ChevronRight, Inbox, FileText, Send, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InboxTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const InboxTabs = ({ activeTab, onTabChange, currentPage, totalPages, onPageChange }: InboxTabsProps) => {
  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`text-xs py-1 flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Pagination arrows */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InboxTabs;
