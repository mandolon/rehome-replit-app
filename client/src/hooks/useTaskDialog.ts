
import { useState } from 'react';
import { format } from 'date-fns';
import { getProjectDisplayName } from '@/data/projectClientData';
import { getProjectIdFromDisplayName } from '@/utils/projectMapping';
import { TEAM_USERS } from '@/utils/teamUsers';
import { useUser } from '@/contexts/UserContext';
import { insertTask } from '@/data/taskSupabase';

export const useTaskDialog = () => {
  const [taskName, setTaskName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [addDescription, setAddDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<any>('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const { currentUser } = useUser();

  /**
   * Create the task directly in Supabase!
   */
  const handleCreateTask = async (onCreateTask: (taskData: any) => void, onClose: () => void) => {
    if (!taskName.trim() || !assignedTo) {
      return; // Cannot create if no name or assignee
    }

    // Prepare assignee object
    let assigneeObj = assignedTo;
    if (typeof assignedTo === 'string') {
      assigneeObj = TEAM_USERS.find(u => u.id === assignedTo || u.name === assignedTo || u.fullName === assignedTo) 
        || { name: assignedTo, avatar: '', id: assignedTo };
    }
    assigneeObj = {
      ...assigneeObj,
      id: assigneeObj.id,
      projectId: getProjectIdFromDisplayName(selectedProject)
    };

    const projectId = getProjectIdFromDisplayName(selectedProject);
    const taskDataForSupabase = {
      taskId: undefined, // let insertTask generate if absent
      title: taskName,
      projectId,
      project: getProjectDisplayName(projectId),
      status: selectedStatus || 'progress',
      description: addDescription ? description : '',
      assignee: assigneeObj,
      dueDate: dueDate ? format(dueDate, 'MM/dd/yy') : '—',
      dateCreated: format(new Date(), 'MM/dd/yy'),
      estimatedCompletion: '—',
      hasAttachment: false,
      collaborators: [],
      createdBy: currentUser?.name ?? currentUser?.email ?? "Unknown",
      archived: false,
      deletedAt: null,
      deletedBy: null,
    };

    try {
      await insertTask(taskDataForSupabase);
      handleReset();
      onClose();
    } catch (err) {
      // For now, use window.alert. You can replace with toast/sonner.
      window.alert('Failed to create task! ' + (err as Error).message);
    }
  };

  const handleReset = () => {
    setTaskName('');
    setSelectedProject('');
    setSelectedStatus('');
    setAddDescription(false);
    setDescription('');
    setAssignedTo('');
    setDueDate(undefined);
  };

  return {
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
  };
};
