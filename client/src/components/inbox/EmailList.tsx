
import React from 'react';
import { Star, Paperclip } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Email } from '@/types/email';

interface EmailListProps {
  emails: Email[];
  selectedEmails: string[];
  onSelectEmail: (emailId: string) => void;
  onEmailClick: (emailId: string) => void;
}

const EmailList = ({ emails, selectedEmails, onSelectEmail, onEmailClick }: EmailListProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`px-6 py-2.5 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors ${
            !email.isRead ? 'bg-accent/20' : 'bg-white'
          } ${selectedEmails.includes(email.id) ? 'bg-blue-50' : ''}`}
          onClick={() => onEmailClick(email.id)}
        >
          <div className="flex items-center gap-3 text-left">
            <Checkbox 
              checked={selectedEmails.includes(email.id)}
              onCheckedChange={() => onSelectEmail(email.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className={`p-1 hover:bg-accent rounded ${email.isStarred ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Star className={`w-3.5 h-3.5 ${email.isStarred ? 'fill-current' : ''}`} />
            </button>
            
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={email.avatar} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {getInitials(email.sender)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                  <span className={`text-xs truncate ${!email.isRead ? 'font-medium' : 'font-normal'}`}>
                    {email.sender}
                  </span>
                  <span className={`text-xs truncate ${!email.isRead ? 'font-medium' : 'font-normal'}`}>
                    {email.subject}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    - {email.preview}
                  </span>
                  {email.hasAttachment && (
                    <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-3">
                  {email.time}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailList;
