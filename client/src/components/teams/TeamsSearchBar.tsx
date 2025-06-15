import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import InviteDialog from '@/components/sidebar/InviteDialog';

interface TeamsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isMobile?: boolean;
}

const TeamsSearchBar = ({ searchTerm, onSearchChange, isMobile }: TeamsSearchBarProps) => {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className={`flex items-center justify-between mb-6 ${isMobile ? "flex-col gap-2 mb-4" : ""}`}>
      <div className="flex items-center gap-4 w-full">
        <div className="relative w-full max-w-xs">
          <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-7 pr-3 py-1 border border-border rounded text-xs w-full ${isMobile ? "max-w-full" : "w-48"}`}
          />
        </div>
      </div>
      <InviteDialog
        triggerButtonClassName={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 mt-2
          ${isMobile ? "self-stretch w-full justify-center" : ""}`}
      />
    </div>
  );
};

export default TeamsSearchBar;
