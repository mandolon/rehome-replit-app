
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getNextTaskId } from '@/data/taskData';
import { useTaskDialog } from '@/hooks/useTaskDialog';
import TaskDialogForm from './task-dialog/TaskDialogForm';
import TaskDialogActions from './task-dialog/TaskDialogActions';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (taskData: any) => void;
}

const TaskDialog = ({ isOpen, onClose, onCreateTask }: TaskDialogProps) => {
  const {
    taskName,
    setTaskName,
    selectedProject,
    setSelectedProject,
    selectedStatus,
    setSelectedStatus,
    addDescription,
    setAddDescription,
    description,
    setDescription,
    assignedTo,
    setAssignedTo,
    dueDate,
    setDueDate,
    handleCreateTask,
    handleReset
  } = useTaskDialog();

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const onCreateTaskClick = () => {
    handleCreateTask(onCreateTask, onClose);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl w-[900px] bg-background border border-border shadow-lg">
        <DialogHeader className="py-3">
          <DialogTitle className="text-base font-medium">
            Task - {getNextTaskId()}
          </DialogTitle>
        </DialogHeader>
        
        <TaskDialogForm
          taskName={taskName}
          setTaskName={setTaskName}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          addDescription={addDescription}
          setAddDescription={setAddDescription}
          description={description}
          setDescription={setDescription}
        />

        <TaskDialogActions
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          dueDate={dueDate}
          setDueDate={setDueDate}
          taskName={taskName}
          onCreateTask={onCreateTaskClick}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
