
import React from 'react';
import { ArrowLeft, Star, Archive, Delete, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailDetailToolbarProps {
  isStarred: boolean;
  onBack: () => void;
}

const EmailDetailToolbar = ({ isStarred, onBack }: EmailDetailToolbarProps) => {
  return (
    <div className="px-6 py-3 border-b border-border bg-muted/50">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-accent">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <Archive className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <Delete className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default EmailDetailToolbar;
