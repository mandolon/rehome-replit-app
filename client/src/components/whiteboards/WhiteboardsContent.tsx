
import React, { useState } from 'react';
import WhiteboardsHeader from './WhiteboardsHeader';
import WhiteboardsGrid from './WhiteboardsGrid';
import WhiteboardCreateDialog from './WhiteboardCreateDialog';
import TldrawWhiteboard from './TldrawWhiteboard';
import { useUser } from "@/contexts/UserContext";

const WhiteboardsContent = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'whiteboard'>('grid');
  const [sortBy, setSortBy] = useState('Last viewed');
  const [refresh, setRefresh] = useState(0);
  const [currentWhiteboardId, setCurrentWhiteboardId] = useState<string | null>(null);
  const { currentUser } = useUser();

  const isTeam = currentUser.role !== "Client";

  const handleWhiteboardOpen = (whiteboardId: string) => {
    setCurrentWhiteboardId(whiteboardId);
    setViewMode('whiteboard');
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setCurrentWhiteboardId(null);
  };

  if (viewMode === 'whiteboard') {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={handleBackToGrid}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Back to Whiteboards
          </button>
          <h2 className="text-lg font-semibold">Whiteboard</h2>
          <div></div>
        </div>
        <div className="flex-1">
          <TldrawWhiteboard whiteboardId={currentWhiteboardId || undefined} />
        </div>
      </div>
    );
  }

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
        <WhiteboardsGrid 
          viewMode={viewMode} 
          key={refresh}
        />
      </div>
    </div>
  );
};

export default WhiteboardsContent;
