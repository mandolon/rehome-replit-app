import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Plus, Trash2, Paperclip, Download, File } from 'lucide-react';
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
  attachments: NoteAttachment[];
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
      authorAvatar: 'JS',
      timestamp: 'Last Updated: Yesterday at 4:30 pm',
      completed: false,
      attachments: [
        { id: 'att3', name: 'Client_Presentation_v2.pptx', size: 3400000, type: 'application/vnd.ms-powerpoint' }
      ]
    },
    {
      id: '3',
      title: 'Research competitor pricing strategies',
      content: 'Analyze current market trends and compile a comprehensive report on competitor pricing models.',
      author: 'Research competitor pricing strategies',
      authorAvatar: 'MK',
      timestamp: 'Last Updated: 2 days ago at 11:45 am',
      completed: false,
      attachments: []
    }
  ]);

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

  const addNote = () => {
    if (newNote.trim()) {
      const newNoteItem: NoteItem = {
        id: Date.now().toString(),
        title: newNote.trim(),
        content: '',
        author: currentUser?.name || 'Anonymous',
        authorAvatar: currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AN',
        timestamp: `Last Updated: ${getCurrentDateTime()}`,
        completed: false,
        attachments: [...attachments]
      };
      setNotes([...notes, newNoteItem]);
      setNewNote('');
      setAttachments([]);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const editNote = (id: string, newContent: string) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, title: newContent, timestamp: `Last Updated: ${getCurrentDateTime()}` }
        : note
    ));
    setEditingNote(null);
    setEditText('');
  };

  const startEditing = (note: NoteItem) => {
    setEditingNote(note.id);
    setEditText(note.title);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: NoteAttachment[] = Array.from(files).map(file => ({
        id: Date.now() + Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📎';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add new note */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
              />
              <button
                onClick={addNote}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Attachments for new note */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Attachments:</div>
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span>{getFileIcon(attachment.type)}</span>
                      <span className="text-gray-700 dark:text-gray-300">{attachment.name}</span>
                      <span className="text-gray-500">({formatFileSize(attachment.size)})</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
            >
              <Paperclip className="w-3 h-3" />
              Attach file
            </button>
          </div>

          {/* Note list */}
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                      {note.authorAvatar}
                    </div>
                    <div>
                      {editingNote === note.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="text-sm font-medium bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          onKeyPress={(e) => e.key === 'Enter' && editNote(note.id, editText)}
                          onBlur={() => editNote(note.id, editText)}
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                          onClick={() => startEditing(note)}
                        >
                          {note.title}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">{note.timestamp}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {note.content && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {note.content}
                  </div>
                )}

                {note.attachments.length > 0 && (
                  <div className="space-y-1">
                    {note.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded text-xs">
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(attachment.type)}</span>
                          <span className="text-gray-700 dark:text-gray-300">{attachment.name}</span>
                          <span className="text-gray-500">({formatFileSize(attachment.size)})</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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

export default NotePopup;