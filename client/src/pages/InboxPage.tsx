
// Make title/header 100% consistent with other pages

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import InboxContent from '@/components/inbox/InboxContent';
import { useInboxState } from '@/hooks/useInboxState';
import PageSectionHeader from '@/components/shared/PageSectionHeader';

const InboxPage = () => {
  const {
    selectedEmails,
    selectedEmail,
    activeTab,
    currentPage,
    totalPages,
    filteredEmails,
    currentEmail,
    unreadCount,
    handleSelectEmail,
    handleSelectAll,
    handleEmailClick,
    handleBackToList,
    handleTabChange,
    setCurrentPage,
  } = useInboxState();

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <PageSectionHeader title="Inbox" />
        <div className="flex-1 flex flex-col">
          <InboxContent
            selectedEmails={selectedEmails}
            selectedEmail={selectedEmail}
            activeTab={activeTab}
            currentPage={currentPage}
            totalPages={totalPages}
            filteredEmails={filteredEmails}
            currentEmail={currentEmail}
            unreadCount={unreadCount}
            onSelectEmail={handleSelectEmail}
            onSelectAll={handleSelectAll}
            onEmailClick={handleEmailClick}
            onBackToList={handleBackToList}
            onTabChange={handleTabChange}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default InboxPage;
