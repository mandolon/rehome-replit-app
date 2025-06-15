
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TaskBoard from '@/components/TaskBoard';
import PageSectionHeader from '@/components/shared/PageSectionHeader';

const TasksPage = React.memo(() => {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <PageSectionHeader title="Task Board" />
        <div className="flex-1 min-h-0 flex flex-col">
          {/* TaskProvider REMOVED here. It's already at the App level */}
          <TaskBoard />
        </div>
      </div>
    </AppLayout>
  );
});

TasksPage.displayName = "TasksPage";
export default TasksPage;

