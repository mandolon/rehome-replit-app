import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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

      onTimeUpdated(numValue.toString());
      setIsEditing(false);
      
      toast({
        title: "Time updated",
        description: `Set to ${formatTime(numValue.toString())}`,
      });
    } catch (error) {
      console.error('Error updating time:', error);
      toast({
        title: "Error",
        description: "Failed to update time",
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

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={loading}
        className="text-xs bg-transparent border-b border-border focus:border-primary outline-none w-16"
        placeholder="0"
      />
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="text-xs cursor-pointer hover:text-foreground transition-colors"
      title="Click to edit time logged"
    >
      {formatTime(currentTime)}
    </div>
  );
};

export default InlineTimeField;