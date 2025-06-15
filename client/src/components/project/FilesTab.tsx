
import React from 'react';
import { FileText, Users } from 'lucide-react';

const FilesTab = () => {
  const files = [
    {
      name: "CDO-0063-Planning-Entitlement-Application - Letter of Agency",
      dateCreated: "Jul 31, 2024",
      author: "Matthew P.",
      type: "pdf"
    },
    {
      name: "CDO-0220-Owner-Builder-F...",
      dateCreated: "Aug 17, 2024", 
      author: "Armando L.",
      type: "pdf"
    },
    {
      name: "Agent-for-Owner-Authorizat...",
      dateCreated: "Aug 11, 2024",
      author: "Armando L.", 
      type: "pdf"
    },
    {
      name: "James Hall",
      dateCreated: "Aug 2, 2024",
      author: "Matthew P.",
      type: "contact"
    },
    {
      name: "Corina McCoy", 
      dateCreated: "Jul 23, 2024",
      author: "Matthew P.",
      type: "contact"
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-3 h-3 text-red-500" />;
      case 'contact':
        return <Users className="w-3 h-3 text-blue-500" />;
      default:
        return <FileText className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 mt-0">
      <div className="space-y-0.5">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-1.5 border-b">
          <div className="col-span-6">Name</div>
          <div className="col-span-3">Date Created</div>
          <div className="col-span-3">by</div>
        </div>
        
        {/* File Rows */}
        {files.map((file, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30">
            <div className="col-span-6 flex items-center gap-2">
              {getFileIcon(file.type)}
              <span className="text-blue-600 hover:underline truncate">{file.name}</span>
            </div>
            <div className="col-span-3 text-muted-foreground">{file.dateCreated}</div>
            <div className="col-span-3 text-muted-foreground">{file.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesTab;
