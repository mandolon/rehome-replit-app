
import React from 'react';
import InboxTabs from './InboxTabs';

interface InboxHeaderProps {
  unreadCount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const InboxHeader = ({ 
  unreadCount, 
  activeTab, 
  onTabChange, 
  currentPage, 
  totalPages, 
  onPageChange 
}: InboxHeaderProps) => {
  const getTabLabel = () => {
    switch (activeTab) {
      case 'inbox':
        return 'Inbox';
      case 'drafts':
        return 'Drafts';
      case 'sent':
        return 'Sent';
      case 'archive':
        return 'Archive';
      case 'trash':
        return 'Trash';
      default:
        return 'Inbox';
    }
  };

  return (
    <div className="border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-medium">{getTabLabel()}</h1>
          {activeTab === 'inbox' && unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">({unreadCount} unread)</span>
          )}
        </div>
      </div>
      <InboxTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default InboxHeader;
