
import React, { useState } from 'react';
import WhiteboardsHeader from './WhiteboardsHeader';
import WhiteboardsGrid from './WhiteboardsGrid';
import WhiteboardCreateDialog from './WhiteboardCreateDialog';
import { useUser } from "@/contexts/UserContext";

const WhiteboardsContent = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Last viewed');
  const [refresh, setRefresh] = useState(0);
  const { currentUser } = useUser();

  const isTeam = currentUser.role !== "Client";

  return (
    <div className="h-full flex flex-col bg-background">
      <WhiteboardsHeader 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      {isTeam && <div className="px-6 py-2">
        <WhiteboardCreateDialog onCreated={() => setRefresh(r => r + 1)} />
      </div>}
      <div className="flex-1 overflow-auto">
        <WhiteboardsGrid viewMode={viewMode} key={refresh} />
      </div>
    </div>
  );
};

export default WhiteboardsContent;
