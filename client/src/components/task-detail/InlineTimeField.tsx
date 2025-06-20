import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface InlineTimeFieldProps {
  taskId: string;
  currentTime: string;
  onTimeUpdated: (newTime: string) => void;
}

const InlineTimeField = ({ taskId, currentTime, onTimeUpdated }: InlineTimeFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentTime || '0');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast, dismiss } = useToast();

  const formatTime = (timeStr: string) => {
    const hours = parseFloat(timeStr || '0');
    if (hours === 0) return '0h';
    if (hours % 1 === 0) return `${hours}h`;
    return `${hours}h`;
  };

  const handleClick = () => {
    setIsEditing(true);
    setInputValue(currentTime || '0');
  };

  const handleSave = async () => {
    if (inputValue === currentTime) {
      setIsEditing(false);
      return;
    }

    // Validate input is a valid number
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number (e.g., 0.5, 1, 1.5, 2)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeLogged: numValue.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update time');
      }

      const newTime = numValue.toString();
      const previousTime = currentTime || '0';
      onTimeUpdated(newTime);
      setIsEditing(false);
      
      toast({
        title: "Time added to task",
        description: `Set to ${formatTime(newTime)}`,
        action: (
          <ToastAction
            altText="Undo time change"
            onClick={async () => {
              const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timeLogged: previousTime }),
              });
              if (response.ok) {
                onTimeUpdated(previousTime);
              }
              dismiss();
            }}
          >
            Undo
          </ToastAction>
        ),
        duration: 5000,
      });
    } catch (error) {
      console.error('Error updating time:', error);
      toast({
        title: "Failed to update time",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(currentTime || '0');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="relative">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={loading}
          className="text-xs bg-background border border-border focus:border-primary outline-none px-1 py-0.5 rounded w-16"
          placeholder="0"
        />
      ) : (
        <div 
          onClick={handleClick}
          className="text-xs cursor-pointer hover:text-foreground transition-colors px-1 py-0.5 min-w-[24px] inline-block"
          title="Click to edit time logged"
        >
          {formatTime(currentTime)}
        </div>
      )}
    </div>
  );
};

export default InlineTimeField;