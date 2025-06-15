
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText } from 'lucide-react';

interface Note {
  id: number;
  name: string;
  dateCreated: string;
  headText: string;
}

const NotesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      name: 'Note #1',
      dateCreated: '10.12.24',
      headText: 'Table Cell Text'
    },
    {
      id: 2,
      name: 'Note #2',
      dateCreated: '11.24.24',
      headText: 'Table Cell Text'
    }
  ]);

  const filteredNotes = notes.filter(note =>
    note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.headText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    const newNote: Note = {
      id: notes.length + 1,
      name: `Note #${notes.length + 1}`,
      dateCreated: new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      }),
      headText: 'New note content'
    };
    setNotes([...notes, newNote]);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Notes Table */}
      <div className="flex-1 overflow-y-auto mt-0">
        <div className="space-y-0.5">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-1.5 border-b">
            <div className="col-span-4">Name</div>
            <div className="col-span-4">Date Created</div>
            <div className="col-span-4">Head Text</div>
          </div>
          
          {/* Note Rows */}
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No notes found
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30">
                <div className="col-span-4 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-600 hover:underline truncate">{note.name}</span>
                </div>
                <div className="col-span-4 text-muted-foreground">{note.dateCreated}</div>
                <div className="col-span-4 text-muted-foreground">{note.headText}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create New Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleCreateNew}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          Create New
        </Button>
      </div>
    </div>
  );
};

export default NotesTab;
