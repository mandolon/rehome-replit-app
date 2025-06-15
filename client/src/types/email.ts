
export interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment?: boolean;
  status: 'inbox' | 'drafts' | 'sent' | 'archive' | 'trash';
  avatar?: string;
  content?: string;
  senderEmail?: string;
  recipient?: string;
}
