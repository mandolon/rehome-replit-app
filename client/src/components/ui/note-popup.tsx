import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Plus, Trash2, Paperclip, Download, Check } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  className?: string;
  initialNotes?: NoteItem[];
  onNotesChange?: (notes: NoteItem[]) => void;
}

export const NotePopup = ({ 
  isOpen, 
  onClose, 
  className,
  initialNotes = [],
  onNotesChange 
}: NotePopupProps) => {
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
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);

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
        author: 'Current User',
        authorAvatar: 'CU',
        timestamp: `Last Updated: ${getCurrentDateTime()}`,
        completed: false,
        attachments: [...attachments]
      };
      const updatedNotes = [...notes, newNoteItem];
      setNotes(updatedNotes);
      setNewNote('');
      setAttachments([]);
      
      if (onNotesChange) {
        onNotesChange(updatedNotes);
      }
    }
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (onNotesChange) {
      onNotesChange(updatedNotes);
    }
  };

  const toggleNoteComplete = (id: string) => {
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex !== -1) {
      const note = notes[noteIndex];
      const updatedNote = { ...note, completed: !note.completed };
      
      if (updatedNote.completed) {
        setCompletedNotes([...completedNotes, updatedNote]);
        setNotes(notes.filter(n => n.id !== id));
      } else {
        setNotes([...notes, updatedNote]);
        setCompletedNotes(completedNotes.filter(n => n.id !== id));
      }
    }
  };

  const editNote = (id: string, newContent: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, title: newContent, timestamp: `Last Updated: ${getCurrentDateTime()}` }
        : note
    );
    setNotes(updatedNotes);
    setEditingNote(null);
    setEditText('');
    
    if (onNotesChange) {
      onNotesChange(updatedNotes);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-md p-0 gap-0 h-[600px] note-popup-scrollbar", className)}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Note</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Add new note section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a new note..."
                  className="flex-1 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                />
                <Button onClick={addNote} size="sm" className="px-3">
                  <Plus className="w-4 h-4" />
                </Button>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 h-6 px-0"
              >
                <Paperclip className="w-3 h-3" />
                Attach file
              </Button>
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
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-sm font-medium h-6 px-2"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Completed notes */}
            {completedNotes.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs text-gray-500 mb-2 h-6 px-0"
                >
                  {showCompleted ? 'Hide' : 'Show'} Completed ({completedNotes.length})
                </Button>
                {showCompleted && (
                  <div className="space-y-2">
                    {completedNotes.map((note) => (
                      <div key={note.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 opacity-60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleNoteComplete(note.id)}
                              className="h-4 w-4 p-0 text-green-600"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <span className="text-sm line-through">{note.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="h-4 w-4 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

export default NotePopup;