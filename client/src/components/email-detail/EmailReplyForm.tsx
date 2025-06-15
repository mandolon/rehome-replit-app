
import React, { useState } from 'react';
import { Send, Bold, Italic, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EmailReplyFormProps {
  recipientName: string;
  onSend: (message: string) => void;
  onCancel: () => void;
}

const EmailReplyForm = ({ recipientName, onSend, onCancel }: EmailReplyFormProps) => {
  const [replyMessage, setReplyMessage] = useState('');

  const handleSend = () => {
    onSend(replyMessage);
    setReplyMessage('');
  };

  const handleFormatting = (format: string) => {
    // In a real implementation, this would apply formatting to selected text
    console.log('Applying format:', format);
  };

  return (
    <div className="border border-border rounded-lg">
      <div className="p-3 border-b border-border bg-muted/50">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">To:</span> {recipientName}
        </div>
      </div>

      {/* Formatting toolbar */}
      <div className="px-3 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleFormatting('bold')}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleFormatting('italic')}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleFormatting('bulletList')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleFormatting('numberedList')}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-3">
        <Textarea
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Type your reply..."
          className="border-0 shadow-none resize-none focus-visible:ring-0 min-h-24"
        />
      </div>

      <div className="p-3 border-t border-border bg-muted/50 flex items-center gap-2">
        <Button 
          onClick={handleSend}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EmailReplyForm;
