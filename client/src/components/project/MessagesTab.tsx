
import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const MessagesTab = () => {
  const [messageInput, setMessageInput] = useState('');

  const messages = [
    {
      id: 1,
      user: "Kenneth A.",
      avatar: "KA",
      message: "The shadcn/ui Kit for Figma uses the Lucide icons as its main icon library. If you want to use a different icon set for your project, follow the instructions below.",
      timestamp: "Today, November 19, 2024",
      isCurrentUser: false
    },
    {
      id: 2,
      user: "You",
      avatar: "Y",
      message: "The shadcn/ui Kit for Figma uses the Lucide icons as its main icon library. If you want to use a different icon set for your project, follow the instructions below.",
      timestamp: "",
      isCurrentUser: true
    },
    {
      id: 3,
      user: "Kenneth A.",
      avatar: "KA",
      message: "The shadcn/ui Kit for Figma uses the Lucide icons as its main icon library. If you want to use a different icon set for your project, follow the instructions below.",
      timestamp: "",
      isCurrentUser: false
    }
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col mt-0">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-3xl">
          {messages.map((message, index) => (
            <div key={message.id} className="space-y-4">
              {/* Show timestamp if it exists */}
              {message.timestamp && (
                <div className="text-center">
                  <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                    {message.timestamp}
                  </span>
                </div>
              )}
              
              <div className={`flex gap-3 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!message.isCurrentUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                      {message.avatar}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-lg ${message.isCurrentUser ? 'order-first' : ''}`}>
                  {!message.isCurrentUser && (
                    <div className="text-sm font-medium mb-1">{message.user}</div>
                  )}
                  <div className={`p-3 rounded-lg text-sm ${
                    message.isCurrentUser 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-muted'
                  }`}>
                    {message.message}
                  </div>
                </div>
                
                {message.isCurrentUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-green-500 text-white text-xs font-medium">
                      {message.avatar}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                className="w-full p-3 pr-10 border border-border rounded-lg resize-none min-h-[44px] max-h-32 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={1}
              />
              <button 
                className="absolute right-2 bottom-2 p-1 text-muted-foreground hover:text-foreground"
                onClick={() => {/* Handle attachment */}}
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;
