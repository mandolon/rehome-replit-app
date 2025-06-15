
import { useState, useMemo } from 'react';
import { Email } from '@/types/email';
import { mockEmails } from '@/data/emailData';

export const useInboxState = () => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = useMemo(() => {
    let tabFilteredEmails = mockEmails;

    // Filter by tab
    switch (activeTab) {
      case 'inbox':
        tabFilteredEmails = mockEmails.filter(email => email.status === 'inbox');
        break;
      case 'drafts':
        tabFilteredEmails = mockEmails.filter(email => email.status === 'drafts');
        break;
      case 'sent':
        tabFilteredEmails = mockEmails.filter(email => email.status === 'sent');
        break;
      case 'archive':
        tabFilteredEmails = mockEmails.filter(email => email.status === 'archive');
        break;
      case 'trash':
        tabFilteredEmails = mockEmails.filter(email => email.status === 'trash');
        break;
      default:
        tabFilteredEmails = mockEmails.filter(email => email.status === 'inbox');
    }

    // Filter by search query
    if (!searchQuery.trim()) {
      return tabFilteredEmails;
    }
    
    const query = searchQuery.toLowerCase();
    return tabFilteredEmails.filter(email => 
      email.sender.toLowerCase().includes(query) ||
      email.subject.toLowerCase().includes(query) ||
      email.preview.toLowerCase().includes(query) ||
      (email.senderEmail && email.senderEmail.toLowerCase().includes(query))
    );
  }, [activeTab, searchQuery]);

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEmails(selectedEmails.length === filteredEmails.length ? [] : filteredEmails.map(e => e.id));
  };

  const handleEmailClick = (emailId: string) => {
    setSelectedEmail(emailId);
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedEmails([]);
    setSelectedEmail(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedEmails([]);
    setSelectedEmail(null);
    setCurrentPage(1);
  };

  const currentEmail = selectedEmail ? mockEmails.find(e => e.id === selectedEmail) : null;
  const unreadCount = filteredEmails.filter(e => !e.isRead).length;

  return {
    selectedEmails,
    selectedEmail,
    activeTab,
    currentPage,
    searchQuery,
    filteredEmails,
    currentEmail,
    unreadCount,
    totalPages: 5,
    handleSelectEmail,
    handleSelectAll,
    handleEmailClick,
    handleBackToList,
    handleSearchChange,
    handleTabChange,
    setCurrentPage,
  };
};
