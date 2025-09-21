
import React from 'react';
import TaskBoard from '@/components/TaskBoard';
import PageSectionHeader from '@/components/shared/PageSectionHeader';

const TasksPage = React.memo(() => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageSectionHeader title="Task Board" />
      <div className="flex-1 min-h-0 overflow-hidden">
        <TaskBoard />
      </div>
    </div>
  );
});

TasksPage.displayName = "TasksPage";
export default TasksPage;

