import React, { useState } from 'react';
import { X, Send, Paperclip, Image, Calendar, Clock } from 'lucide-react';
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
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: 'Review quarterly budget report',
      content: 'Need to analyze the Q3 financial data and prepare recommendations for Q4 budget allocation.',
      author: 'Armando Lopez',
      authorAvatar: 'AL',
      timestamp: 'Today at 2:15 pm',
      completed: false
    },
    {
      id: '2',
      title: 'Update client presentation slides',
      content: 'Incorporate latest design changes and add new feature demos for the PinerWorks client meeting.',
      author: 'Alice Dale',
      authorAvatar: 'AD',
      timestamp: 'Yesterday at 4:30 pm',
      completed: true
    },
    {
      id: '3',
      title: 'Schedule team standup meetings',
      content: 'Coordinate with all team leads to establish consistent meeting times for next sprint.',
      author: 'Mark Pinsky',
      authorAvatar: 'MP',
      timestamp: '2 days ago at 10:00 am',
      completed: false
    }
  ]);

  const handleSubmit = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        title: newTodo.length > 50 ? newTodo.substring(0, 50) + '...' : newTodo,
        content: newTodo,
        author: currentUser.name,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Link to task or Doc
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Untitled
            </h2>
          </div>

          {/* Author Info */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {currentUser.avatar}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {currentUser.name}
            </span>
            <span className="text-sm text-gray-500">
              Last Updated: Today at 3:12 pm
            </span>
          </div>

          {/* New Todo Input */}
          <div className="px-4 pb-4">
            <Textarea
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Write something or type '/' for commands and AI actions"
              className="min-h-[100px] border-0 shadow-none resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* Existing Todos */}
          <div className="px-4 pb-4 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-3 border border-gray-200 dark:border-gray-700 rounded-lg ${
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
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {todo.authorAvatar}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {todo.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {todo.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        todo.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {todo.content}
                      </p>
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