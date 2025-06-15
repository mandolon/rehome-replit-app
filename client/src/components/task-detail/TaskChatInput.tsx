
import React, { useRef, useState, useEffect } from 'react';
import { Send } from 'lucide-react';

interface TaskChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const TaskChatInput: React.FC<TaskChatInputProps> = ({ onSendMessage, disabled }) => {
  const [messageInput, setMessageInput] = useState('');
  const [inputHeight, setInputHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // 8 rows
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + "px";
      setInputHeight(Math.min(scrollHeight, maxHeight));
    }
  }, [messageInput]);

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setMessageInput('');
    setInputHeight(0);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="relative w-full mx-auto max-w-2xl">
        <div className="flex flex-col">
          <div
            className={
              "relative flex items-end w-full rounded-2xl bg-muted/60 shadow-sm border border-border px-3 py-2 focus-within:ring-2 focus-within:ring-primary transition"
            }
          >
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 resize-none bg-transparent border-none focus:ring-0 outline-none text-sm p-0 min-h-[60px] max-h-40 font-sans rounded-2xl placeholder:text-muted-foreground disabled:opacity-50"
              rows={2}
              spellCheck={true}
              autoFocus={false}
              style={{height: inputHeight ? `${inputHeight}px` : undefined}}
              aria-label="Send message"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || disabled}
              className={
                "absolute right-2 bottom-2 transition duration-200 " +
                (messageInput.trim() && !disabled
                  ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60") +
                " rounded-full w-9 h-9 flex items-center justify-center focus:outline-none"
              }
              aria-label="Send message"
              tabIndex={0}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {/* Helper text removed */}
        </div>
      </div>
    </div>
  );
};

export default TaskChatInput;

