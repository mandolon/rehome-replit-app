import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Image, Calendar, Clock, Edit2, Trash2, FileText, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';

interface NoteAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  completed: boolean;
  attachments?: NoteAttachment[];
}

interface NotePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotePopup: React.FC<NotePopupProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useUser();
  const [newNote, setNewNote] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [completedNotes, setCompletedNotes] = useState<NoteItem[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: '1',
      title: 'Review quarterly budget report',
      content: 'Need to analyze the Q3 financial data and prepare recommendations for Q4 budget allocation.',
      author: 'Review quarterly budget report',
      authorAvatar: 'AL',
      timestamp: 'Last Updated: Today at 2:15 pm',
      completed: false,
      attachments: [
        { id: 'att1', name: 'Q3_Financial_Report.pdf', size: 2500000, type: 'application/pdf' },
        { id: 'att2', name: 'Budget_Analysis.xlsx', size: 1200000, type: 'application/vnd.ms-excel' }
      ]
    },
    {
      id: '2',
      title: 'Update client presentation slides',
      content: 'Incorporate latest design changes and add new feature demos for the PinerWorks client meeting.',
      author: 'Update client presentation slides',
      authorAvatar: 'AD',
      timestamp: 'Last Updated: Yesterday at 4:30 pm',
      completed: true
    },
    {
      id: '3',
      title: 'Schedule team standup meetings',
      content: 'Coordinate with all team leads to establish consistent meeting times for next sprint.',
      author: 'Schedule team standup meetings',
      authorAvatar: 'MP',
      timestamp: 'Last Updated: 2 days ago at 10:00 am',
      completed: false
    },
    {
      id: '4',
      title: 'Finalize website wireframes',
      content: 'Complete the wireframe designs for the new product landing page and get approval from stakeholders.',
      author: 'Finalize website wireframes',
      authorAvatar: 'SS',
      timestamp: 'Last Updated: 3 days ago at 1:45 pm',
      completed: false
    },
    {
      id: '5',
      title: 'Test mobile responsiveness',
      content: 'Run comprehensive tests on mobile devices to ensure the application works seamlessly across different screen sizes.',
      author: 'Test mobile responsiveness',
      authorAvatar: 'JJ',
      timestamp: 'Last Updated: 4 days ago at 11:20 am',
      completed: true,
      attachments: [
        { id: 'att3', name: 'Mobile_Test_Results.docx', size: 800000, type: 'application/msword' }
      ]
    },
    {
      id: '6',
      title: 'Database optimization review',
      content: 'Analyze query performance and implement indexing strategies to improve database response times.',
      author: 'Database optimization review',
      authorAvatar: 'AL',
      timestamp: 'Last Updated: 5 days ago at 3:30 pm',
      completed: false
    },
    {
      id: '7',
      title: 'User feedback integration',
      content: 'Review user feedback from beta testing and create action items for the next development cycle.',
      author: 'User feedback integration',
      authorAvatar: 'AD',
      timestamp: 'Last Updated: 1 week ago at 9:15 am',
      completed: false
    },
    {
      id: '8',
      title: 'Security audit documentation',
      content: 'Document security protocols and create guidelines for secure coding practices across the team.',
      author: 'Security audit documentation',
      authorAvatar: 'MP',
      timestamp: 'Last Updated: 1 week ago at 4:00 pm',
      completed: true
    }
  ]);

  const handleSubmit = () => {
    if (newNote.trim()) {
      const noteTitle = newNote.length > 50 ? newNote.substring(0, 50) + '...' : newNote;
      const note: NoteItem = {
        id: Date.now().toString(),
        title: noteTitle,
        content: newNote,
        author: noteTitle, // Use note title instead of author name
        authorAvatar: currentUser.avatar,
        timestamp: 'Last Updated: Just now',
        completed: false,
        attachments: attachments.length > 0 ? [...attachments] : undefined
      };
      setNotes([note, ...notes]);
      setNewNote('');
      setTitle('Untitled'); // Reset title to default
      setAttachments([]); // Clear attachments
    }
  };

  const toggleComplete = (id: string) => {
    const note = notes.find(t => t.id === id);
    if (note) {
      if (!note.completed) {
        // Moving to completed
        const completedNote = { ...note, completed: true };
        setCompletedNotes(prev => [completedNote, ...prev]);
        setNotes(prev => prev.filter(t => t.id !== id));
      }
    }
  };

  const restoreFromCompleted = (id: string) => {
    const completedNote = completedNotes.find(t => t.id === id);
    if (completedNote) {
      const restoredNote = { ...completedNote, completed: false };
      setNotes(prev => [restoredNote, ...prev]);
      setCompletedNotes(prev => prev.filter(t => t.id !== id));
    }
  };

  const startEditingNote = (note: NoteItem) => {
    setEditingNote(note.id);
    setEditText(note.content);
  };

  const saveEditNote = () => {
    if (editingNote && editText.trim()) {
      setNotes(notes.map(note => 
        note.id === editingNote ? { 
          ...note, 
          content: editText, 
          title: editText.length > 50 ? editText.substring(0, 50) + '...' : editText
        } : note
      ));
    }
    setEditingNote(null);
    setEditText('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
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
      const newAttachments: NoteAttachment[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Clear the input
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

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return now.toLocaleDateString('en-US', options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Note
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

          {/* New Note Input */}
          <div className="px-6 pb-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
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
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Separator line */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Note Lists */}
          <div className="px-6 pb-4 overflow-y-auto h-[320px] note-popup-scrollbar">
            <div className="space-y-3 pt-4 h-full">
              {showCompleted ? (
                // Show completed notes
                completedNotes.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 text-sm">
                      <div className="mb-2"><Check className="w-6 h-6 mx-auto" /></div>
                      <div>All clear! No completed notes yet.</div>
                    </div>
                  </div>
                ) : (
                  completedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="group p-3 border border-gray-200 dark:border-gray-700 rounded-lg opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => restoreFromCompleted(note.id)}
                          className="w-4 h-4 rounded border-2 bg-green-500 border-green-500 flex items-center justify-center mt-1 hover:bg-green-600 transition-colors"
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-900 dark:text-white line-through">
                              {note.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {note.timestamp}
                            </span>
                          </div>
                          <p className="text-xs line-through text-gray-500">
                            {note.content}
                          </p>
                          
                          {/* Show attachments if any */}
                          {note.attachments && note.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {note.attachments.map((attachment) => (
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
                        <div>
                          <p className={`text-xs ${
                            todo.completed 
                              ? 'line-through text-gray-500' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
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
                  ))
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {showCompleted ? 'Hide Completed' : `Show Completed (${completedTodos.length})`}
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newTodo.trim()}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                newTodo.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
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
    </div>
  );
};

export default TodoPopup;