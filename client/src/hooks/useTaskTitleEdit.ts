
import { useState } from 'react';
import { updateTask } from '@/data/taskData';

export const useTaskTitleEdit = (taskId: number, initialTitle: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(initialTitle);

  const startEditing = () => {
    setIsEditing(true);
    setEditingValue(initialTitle);
  };

  const saveEdit = () => {
    if (editingValue.trim() !== '' && editingValue !== initialTitle) {
      updateTask(taskId, { title: editingValue.trim() });
      console.log(`Updated task ${taskId} title to: ${editingValue.trim()}`);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditingValue(initialTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleBlur = () => {
    saveEdit();
  };

  return {
    isEditing,
    editingValue,
    setEditingValue,
    startEditing,
    saveEdit,
    cancelEdit,
    handleKeyDown,
    handleBlur
  };
};
