
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TimesheetsHeader from '@/components/timesheets/TimesheetsHeader';
import TimesheetTable from '@/components/timesheets/TimesheetTable';
import TimesheetStats from '@/components/timesheets/TimesheetStats';
import TimesheetCalendarSelector from '@/components/timesheets/TimesheetCalendarSelector';
import ProjectLogTab from '@/components/timesheets/ProjectLogTab';
import AddTimeEntryDialog from '@/components/timesheets/AddTimeEntryDialog';

const TimesheetsPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('timesheet');

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
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 overflow-hidden p-4 space-y-4">
          {activeTab === 'timesheet' ? (
            <>
              <TimesheetStats selectedWeek={selectedWeek} refreshTrigger={refreshTrigger} />
              <TimesheetCalendarSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
              <TimesheetTable selectedWeek={selectedWeek} refreshTrigger={refreshTrigger} />
            </>
          ) : (
            <ProjectLogTab selectedWeek={selectedWeek} refreshTrigger={refreshTrigger} />
          )}
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
