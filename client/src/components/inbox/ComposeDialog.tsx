
import React, { useState } from 'react';
import { Send, Paperclip, Smile, Image, Calendar, MoreHorizontal, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: {
    sender: string;
    senderEmail?: string;
    subject: string;
  };
}

const ComposeDialog = ({ isOpen, onClose, replyTo }: ComposeDialogProps) => {
  const [to, setTo] = useState(replyTo?.senderEmail || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSend = () => {
    // In a real app, this would send the email
    console.log('Sending email:', { to, subject, message });
    onClose();
    // Reset form
    setTo('');
    setSubject('');
    setMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className={`${isMinimized ? 'h-12' : 'h-auto'} transition-all duration-200`}>
          {/* Header */}
          <DialogHeader className="px-4 py-3 bg-white border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-sm font-medium">
              {replyTo ? 'Reply' : 'New Message'}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onClose}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </DialogHeader>

          {!isMinimized && (
            <div className="flex flex-col h-96">
              {/* Email fields */}
              <div className="px-4 py-2 space-y-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">To</span>
                  <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Recipients"
                    className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">Subject</span>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                  />
                </div>
              </div>

              {/* Formatting toolbar */}
              <div className="px-4 py-2 border-b bg-gray-100">
                <div className="flex items-center gap-1">
                  <select className="text-sm border-0 bg-transparent">
                    <option>Sans Serif</option>
                  </select>
                  <Separator orientation="vertical" className="h-4" />
                  <Button variant="ghost" size="sm" className="h-6 px-1">
                    <span className="font-bold text-sm">B</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-1">
                    <span className="italic text-sm">I</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-1">
                    <span className="underline text-sm">U</span>
                  </Button>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 px-4 py-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Compose your message..."
                  className="border-0 shadow-none resize-none focus-visible:ring-0 h-full"
                />
              </div>

              {/* Bottom toolbar */}
              <div className="px-4 py-3 border-t bg-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSend}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeDialog;
