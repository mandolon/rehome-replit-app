
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TimesheetsHeader from '@/components/timesheets/TimesheetsHeader';
import TimesheetTable from '@/components/timesheets/TimesheetTable';
import TimesheetStats from '@/components/timesheets/TimesheetStats';
import TimesheetCalendarSelector from '@/components/timesheets/TimesheetCalendarSelector';
import ProjectLogTab from '@/components/timesheets/ProjectLogTab';
import AddTimeEntryDialog from '@/components/timesheets/AddTimeEntryDialog';
import TaskDetail from '@/components/TaskDetail';
import { Task } from '@/types/task';

const TimesheetsPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('timesheet');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const handleAddTimeEntry = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleTaskDetailClose = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
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
              <TimesheetCalendarSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
              <TimesheetStats selectedWeek={selectedWeek} refreshTrigger={refreshTrigger} />
              <TimesheetTable selectedWeek={selectedWeek} refreshTrigger={refreshTrigger} />
            </>
          ) : (
            <ProjectLogTab 
              selectedWeek={selectedWeek} 
              refreshTrigger={refreshTrigger} 
              onTaskClick={handleTaskClick}
            />
          )}
        </div>

        <AddTimeEntryDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={handleAddTimeEntry}
        />

        <TaskDetail
          isOpen={isTaskDetailOpen}
          onClose={handleTaskDetailClose}
          task={selectedTask}
          onDeleted={() => {
            setRefreshTrigger(prev => prev + 1);
            handleTaskDetailClose();
          }}
        />
      </div>
    </AppLayout>
  );
};

export default TimesheetsPage;
