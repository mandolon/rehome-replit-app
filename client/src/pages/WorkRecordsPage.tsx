import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import WorkRecordsHeader from '@/components/work-records/WorkRecordsHeader';
import WorkRecordsTable from '@/components/work-records/WorkRecordsTable';
import AddWorkRecordDialog from '@/components/work-records/AddWorkRecordDialog';

const WorkRecordsPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    project: 'all',
    dateRange: 'all'
  });

  const handleAddWorkRecord = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <WorkRecordsHeader 
          onAddWorkRecord={() => setIsAddDialogOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
        
        <div className="flex-1 overflow-hidden p-6">
          <WorkRecordsTable 
            searchTerm={searchTerm}
            filters={selectedFilters}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <AddWorkRecordDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={handleAddWorkRecord}
        />
      </div>
    </AppLayout>
  );
};

export default WorkRecordsPage;