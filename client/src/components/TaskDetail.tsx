
import React, { useState } from 'react';
import TaskDetailHeader from './task-detail/TaskDetailHeader';
import TaskDetailForm from './task-detail/TaskDetailForm';
import TaskDetailAttachments from './task-detail/TaskDetailAttachments';
import TaskDetailActivity from './task-detail/TaskDetailActivity';
import TaskDetailTrashButton from './task-detail/TaskDetailTrashButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from '@/lib/schemas/task';

interface TaskDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectClick?: () => void;
  task: Task | null;
  onDeleted?: () => void; // <--- NEW
}

const TaskDetail = ({ isOpen, onClose, onProjectClick, task, onDeleted }: TaskDetailProps) => {
  const [timeLogged, setTimeLogged] = useState(task?.timeLogged || '0');

  if (!task || !isOpen) return null;

  const handleTimeUpdated = (newTime: string) => {
    setTimeLogged(newTime);
  };

  return (
    <div className="h-full bg-background flex flex-col max-w-none overflow-hidden">
      <TaskDetailHeader task={task} onClose={onClose} onProjectClick={onProjectClick} />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Main Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <TaskDetailForm task={task} onTimeUpdated={handleTimeUpdated} />
            <div className="mt-3">
              <TaskDetailAttachments taskId={task.taskId} />
            </div>
            <div className="mt-8">
              <TaskDetailTrashButton task={task} onDeleted={onDeleted} />
            </div>
          </div>
        </ScrollArea>

        {/* Activity Sidebar */}
        <div className="w-[25vw] min-w-[280px] max-w-[600px] flex-shrink-0 overflow-hidden border-l border-[#bbbbbb] dark:border-border">
          <TaskDetailActivity taskId={task.taskId} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;

