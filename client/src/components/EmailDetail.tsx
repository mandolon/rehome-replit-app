
import React, { useState } from 'react';
import { Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmailDetailToolbar from './email-detail/EmailDetailToolbar';
import EmailDetailHeader from './email-detail/EmailDetailHeader';
import EmailDetailContent from './email-detail/EmailDetailContent';
import EmailReplyForm from './email-detail/EmailReplyForm';

interface EmailDetailProps {
  email: {
    id: string;
    sender: string;
    subject: string;
    preview: string;
    time: string;
    isRead: boolean;
    isStarred: boolean;
    content?: string;
    senderEmail?: string;
    recipient?: string;
  };
  onBack: () => void;
}

const EmailDetail = ({ email, onBack }: EmailDetailProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const emailContent = email.content || `
    <p>Hi team,</p>
    
    <p>I wanted to provide an update on the current progress of the Ogden Thew Development project. We've completed the initial design phase and are moving forward with the next steps.</p>
    
    <p>Key accomplishments this week:</p>
    <ul>
      <li>Finalized schematic designs</li>
      <li>Obtained preliminary approvals</li>
      <li>Scheduled site visit for next week</li>
    </ul>
    
    <p>Please let me know if you have any questions or concerns.</p>
    
    <p>Best regards,<br>${email.sender}</p>
  `;

  const handleReply = () => {
    setShowReplyForm(true);
  };

  const handleSendReply = (message: string) => {
    console.log('Sending reply:', message);
    setShowReplyForm(false);
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <EmailDetailToolbar 
        isStarred={email.isStarred}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto bg-background px-6 py-6">
        <div className="space-y-6">
          <EmailDetailHeader
            subject={email.subject}
            sender={email.sender}
            senderEmail={email.senderEmail}
            time={email.time}
            isStarred={email.isStarred}
          />

          <EmailDetailContent content={emailContent} />

          {!showReplyForm && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReply}
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
          )}

          {showReplyForm && (
            <EmailReplyForm
              recipientName={email.sender}
              onSend={handleSendReply}
              onCancel={handleCancelReply}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
