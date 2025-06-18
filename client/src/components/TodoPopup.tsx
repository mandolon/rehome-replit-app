import React, { useState } from 'react';
import { X, Send, Paperclip, Image, Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';

interface TodoItem {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  completed: boolean;
}

interface TodoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TodoPopup: React.FC<TodoPopupProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useUser();
  const [newTodo, setNewTodo] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: 'Review quarterly budget report',
      content: 'Need to analyze the Q3 financial data and prepare recommendations for Q4 budget allocation.',
      author: 'Review quarterly budget report',
      authorAvatar: 'AL',
      timestamp: 'Today at 2:15 pm',
      completed: false
    },
    {
      id: '2',
      title: 'Update client presentation slides',
      content: 'Incorporate latest design changes and add new feature demos for the PinerWorks client meeting.',
      author: 'Update client presentation slides',
      authorAvatar: 'AD',
      timestamp: 'Yesterday at 4:30 pm',
      completed: true
    },
    {
      id: '3',
      title: 'Schedule team standup meetings',
      content: 'Coordinate with all team leads to establish consistent meeting times for next sprint.',
      author: 'Schedule team standup meetings',
      authorAvatar: 'MP',
      timestamp: '2 days ago at 10:00 am',
      completed: false
    }
  ]);

  const handleSubmit = () => {
    if (newTodo.trim()) {
      const todoTitle = newTodo.length > 50 ? newTodo.substring(0, 50) + '...' : newTodo;
      const todo: TodoItem = {
        id: Date.now().toString(),
        title: todoTitle,
        content: newTodo,
        author: todoTitle, // Use todo title instead of author name
        authorAvatar: currentUser.avatar,
        timestamp: 'Just now',
        completed: false
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
    }
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEditingTodo = (todo: TodoItem) => {
    setEditingTodo(todo.id);
    setEditText(todo.content);
  };

  const saveEditTodo = () => {
    if (editingTodo && editText.trim()) {
      setTodos(todos.map(todo => 
        todo.id === editingTodo ? { 
          ...todo, 
          content: editText, 
          title: editText.length > 50 ? editText.substring(0, 50) + '...' : editText
        } : todo
      ));
    }
    setEditingTodo(null);
    setEditText('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleTitleEdit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      setTitle('Untitled');
      setIsEditingTitle(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To Do
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Title */}
          <div className="p-4 pb-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleEdit}
                onBlur={() => setIsEditingTitle(false)}
                className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 w-full"
                autoFocus
              />
            ) : (
              <h2 
                className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 py-0.5 -mx-1 -my-0.5"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h2>
            )}
          </div>

          {/* Timestamp Info */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Last Updated: Today at 3:12 pm
            </span>
          </div>

          {/* New Todo Input */}
          <div className="px-4 pb-4">
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
          </div>

          {/* Existing Todos */}
          <div className="px-4 pb-4 flex-1 overflow-y-auto max-h-[300px]">
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group p-3 border border-gray-200 dark:border-gray-700 rounded-lg transition-all hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-1 ${
                        todo.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {todo.completed && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
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
                            <button
                              onClick={saveEditTodo}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingTodo(null);
                                setEditText('');
                              }}
                              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-xs ${
                          todo.completed 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {todo.content}
                        </p>
                      )}
                    </div>
                    {/* Action buttons - only show on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => startEditingTodo(todo)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500">
              <Calendar className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500">
              <Clock className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!newTodo.trim()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoPopup;