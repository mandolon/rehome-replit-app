
import React from 'react';
import { Star, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmailDetailHeaderProps {
  subject: string;
  sender: string;
  senderEmail?: string;
  time: string;
  isStarred: boolean;
}

const EmailDetailHeader = ({ subject, sender, senderEmail, time, isStarred }: EmailDetailHeaderProps) => {
  const senderInitials = sender.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Subject */}
      <h1 className="text-xl font-normal text-foreground">{subject}</h1>

      {/* Sender info */}
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src="" />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {senderInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{sender}</span>
            <span className="text-sm text-muted-foreground">&lt;{senderEmail || `${sender.toLowerCase().replace(' ', '.')}@company.com`}&gt;</span>
          </div>
          <div className="text-xs text-muted-foreground">
            to me • {time}
          </div>
        </div>

        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default EmailDetailHeader;
