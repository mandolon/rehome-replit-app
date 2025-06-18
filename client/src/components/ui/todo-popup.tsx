import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Image, Calendar, Clock, Edit2, Trash2, FileText, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TodoAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface TodoItem {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  completed: boolean;
  attachments?: TodoAttachment[];
}

interface TodoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  initialTodos?: TodoItem[];
  onTodosChange?: (todos: TodoItem[]) => void;
}

export const TodoPopup = ({ 
  isOpen, 
  onClose, 
  className,
  initialTodos = [],
  onTodosChange 
}: TodoPopupProps) => {
  const [newTodo, setNewTodo] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [attachments, setAttachments] = useState<TodoAttachment[]>([]);
  const [completedTodos, setCompletedTodos] = useState<TodoItem[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);

  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return now.toLocaleDateString('en-US', options);
  };

  const handleSubmit = () => {
    if (newTodo.trim()) {
      const todoTitle = newTodo.length > 50 ? newTodo.substring(0, 50) + '...' : newTodo;
      const todo: TodoItem = {
        id: Date.now().toString(),
        title: todoTitle,
        content: newTodo,
        author: todoTitle,
        authorAvatar: 'U',
        timestamp: 'Last Updated: Just now',
        completed: false,
        attachments: attachments.length > 0 ? [...attachments] : undefined
      };
      const updatedTodos = [todo, ...todos];
      setTodos(updatedTodos);
      onTodosChange?.(updatedTodos);
      setNewTodo('');
      setTitle('Untitled');
      setAttachments([]);
    }
  };

  const toggleComplete = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      if (!todo.completed) {
        const completedTodo = { ...todo, completed: true };
        setCompletedTodos(prev => [completedTodo, ...prev]);
        const updatedTodos = todos.filter(t => t.id !== id);
        setTodos(updatedTodos);
        onTodosChange?.(updatedTodos);
      }
    }
  };

  const restoreFromCompleted = (id: string) => {
    const completedTodo = completedTodos.find(t => t.id === id);
    if (completedTodo) {
      const restoredTodo = { ...completedTodo, completed: false };
      const updatedTodos = [restoredTodo, ...todos];
      setTodos(updatedTodos);
      onTodosChange?.(updatedTodos);
      setCompletedTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  const startEditingTodo = (todo: TodoItem) => {
    setEditingTodo(todo.id);
    setEditText(todo.content);
  };

  const saveEditTodo = () => {
    if (editingTodo && editText.trim()) {
      const updatedTodos = todos.map(todo =>
        todo.id === editingTodo
          ? { ...todo, content: editText, title: editText.length > 50 ? editText.substring(0, 50) + '...' : editText }
          : todo
      );
      setTodos(updatedTodos);
      onTodosChange?.(updatedTodos);
      setEditingTodo(null);
      setEditText('');
    }
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    onTodosChange?.(updatedTodos);
  };

  const handleTitleEdit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTitle('Untitled');
      setIsEditingTitle(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: TodoAttachment[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-md p-0 gap-0 h-[600px] todo-popup-scrollbar", className)}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Todo List</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Title */}
            <div className="px-6 pt-4 pb-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleTitleEdit}
                  onBlur={() => setIsEditingTitle(false)}
                  className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 w-full pl-3 px-1 py-0.5"
                  autoFocus
                />
              ) : (
                <h2 
                  className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 py-0.5 pl-3"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title}
                </h2>
              )}
            </div>

            {/* Current Date Info */}
            <div className="px-6 pb-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 pl-3">
                {getCurrentDateTime()}
              </span>
            </div>

            {/* New Todo Input */}
            <div className="px-6 pb-4">
              <Textarea
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Write something or type '/' for commands and AI actions"
                className="min-h-[100px] border-0 shadow-none resize-none text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit();
                  }
                }}
              />
              
              {/* Attachments Display */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 text-xs"
                    >
                      <span className="text-sm">{getFileIcon(attachment.type)}</span>
                      <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                        {attachment.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatFileSize(attachment.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-auto p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Separator line */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Todo Lists */}
            <div className="px-6 pb-4 overflow-y-auto h-[320px] todo-popup-scrollbar">
              <div className="space-y-3 pt-4 h-full">
                {showCompleted ? (
                  // Show completed todos
                  completedTodos.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500 text-sm">
                        <div className="mb-2"><Check className="w-6 h-6 mx-auto" /></div>
                        <div>All clear! No completed tasks yet.</div>
                      </div>
                    </div>
                  ) : (
                    completedTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => restoreFromCompleted(todo.id)}
                            className="w-4 h-4 rounded border-2 bg-green-500 border-green-500 flex items-center justify-center mt-1 hover:bg-green-600 transition-colors p-0 h-auto"
                          >
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-900 dark:text-white line-through">
                                {todo.author}
                              </span>
                              <span className="text-xs text-gray-500">
                                {todo.timestamp}
                              </span>
                            </div>
                            <p className="text-xs line-through text-gray-500">
                              {todo.content}
                            </p>
                            
                            {/* Show attachments if any */}
                            {todo.attachments && todo.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {todo.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 text-xs opacity-60"
                                  >
                                    <span className="text-sm">{getFileIcon(attachment.type)}</span>
                                    <span className="flex-1 truncate text-gray-600 dark:text-gray-400">
                                      {attachment.name}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                      {formatFileSize(attachment.size)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  // Show active todos
                  todos.filter(todo => !todo.completed).length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500 text-sm">
                        <div className="mb-2"><FileText className="w-6 h-6 mx-auto" /></div>
                        <div>Ready to get started? Add your first task above.</div>
                      </div>
                    </div>
                  ) : (
                    todos.filter(todo => !todo.completed).map((todo) => (
                      <div
                        key={todo.id}
                        className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition-all hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                      >
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleComplete(todo.id)}
                            className="w-4 h-4 rounded border-2 flex items-center justify-center mt-1 border-gray-300 dark:border-gray-600 p-0 h-auto hover:bg-transparent"
                          >
                            {todo.completed && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {todo.author}
                              </span>
                              <span className="text-xs text-gray-500">
                                {todo.timestamp}
                              </span>
                            </div>
                            {editingTodo === todo.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="text-xs min-h-[60px] resize-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                      saveEditTodo();
                                    } else if (e.key === 'Escape') {
                                      setEditingTodo(null);
                                      setEditText('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={saveEditTodo}
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setEditingTodo(null);
                                      setEditText('');
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  {todo.content}
                                </p>
                                
                                {/* Show attachments if any */}
                                {todo.attachments && todo.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {todo.attachments.map((attachment) => (
                                      <div
                                        key={attachment.id}
                                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 text-xs"
                                      >
                                        <span className="text-sm">{getFileIcon(attachment.type)}</span>
                                        <span className="flex-1 truncate text-gray-600 dark:text-gray-400">
                                          {attachment.name}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                          {formatFileSize(attachment.size)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Action buttons - only show on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingTodo(todo)}
                              className="h-auto p-1 text-gray-500 hover:text-gray-700"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                              className="h-auto p-1 text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="h-auto px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Check className="w-3 h-3 mr-1" />
              {showCompleted ? 'Hide Completed' : `Show Completed (${completedTodos.length})`}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-auto p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newTodo.trim()}
                size="sm"
                className="h-auto px-3 py-1 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TodoPopup;