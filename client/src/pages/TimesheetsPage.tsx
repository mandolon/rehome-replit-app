
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TimesheetsHeader from '@/components/timesheets/TimesheetsHeader';
import TimesheetTable from '@/components/timesheets/TimesheetTable';
import TimesheetStats from '@/components/timesheets/TimesheetStats';
import AddTimeEntryDialog from '@/components/timesheets/AddTimeEntryDialog';

const TimesheetsPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddTimeEntry = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <TimesheetsHeader 
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          onAddTimeEntry={() => setIsAddDialogOpen(true)}
        />
        
        <div className="flex-1 overflow-hidden p-4 space-y-4">
          <TimesheetStats selectedWeek={selectedWeek} refreshTrigger={refreshTrigger} />
          <TimesheetTable selectedWeek={selectedWeek} refreshTrigger={refreshTrigger} />
        </div>

        <AddTimeEntryDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={handleAddTimeEntry}
        />
      </div>
    </AppLayout>
  );
};

export default TimesheetsPage;
