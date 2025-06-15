
import React, { useState, useRef, useEffect } from 'react';
import { getAvailableProjects, getProjectIdFromDisplayName } from '@/utils/projectMapping';
import { useTaskAttachmentContext } from '@/contexts/TaskAttachmentContext';
import QuickAddTaskMainInput from './quick-add/QuickAddTaskMainInput';
import QuickAddTaskActions from './quick-add/QuickAddTaskActions';
import { TEAM_USERS } from '@/utils/teamUsers';

interface QuickAddTaskPerson {
  id: string;                    // <-- Ensure ID present!
  name: string;
  avatar: string;
  fullName?: string;
  avatarColor?: string;
  projectId?: string;            // <-- Attach projectId for traceability
}

interface QuickAddTaskProps {
  onSave: (taskData: any) => void;
  onCancel: () => void;
  defaultStatus: string;
}

const QuickAddTask = ({ onSave, onCancel, defaultStatus }: QuickAddTaskProps) => {
  // Main state kept centralized
  const [taskName, setTaskName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const taskNameInputRef = useRef<HTMLInputElement>(null);

  const availableProjects = getAvailableProjects();
  const filteredProjects = availableProjects.filter(project =>
    project.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [assignee, setAssignee] = useState<QuickAddTaskPerson | null>(null);
  const [showAssigneePopover, setShowAssigneePopover] = useState(false);
  const projectDropdownAnchor = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const { addAttachments } = useTaskAttachmentContext();
  const canSave = !!taskName.trim() && !!selectedProject && !!assignee;

  useEffect(() => {
    if (showProjectDropdown && projectDropdownAnchor.current) {
      const rect = projectDropdownAnchor.current.getBoundingClientRect();
      const dropdownWidth = rect.width < 280 ? 280 : rect.width;
      let top = rect.top + window.scrollY + rect.height + 5;
      let left = rect.left + window.scrollX;
      const rightEdge = left + dropdownWidth;
      const viewportWidth = window.innerWidth;
      if (rightEdge > viewportWidth - 8) left = viewportWidth - dropdownWidth - 8;
      if (left < 8) left = 8;
      setDropdownStyle({ top, left, width: dropdownWidth });
    }
  }, [showProjectDropdown]);

  useEffect(() => {
    if (showProjectDropdown && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
    }
  }, [showProjectDropdown]);

  useEffect(() => {
    if (showProjectDropdown && dropdownStyle) {
      const el = document.getElementById('quick-add-project-list-dropdown');
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
          window.scrollBy({ top: rect.bottom - window.innerHeight + 12, behavior: "smooth" });
        } else if (rect.top < 0) {
          window.scrollBy({ top: rect.top - 12, behavior: "smooth" });
        }
      }
    }
  }, [showProjectDropdown, dropdownStyle]);

  useEffect(() => {
    return () => {
      setAssignee(null);
    };
  }, []);

  const handleSave = () => {
    if (!canSave || !assignee) return;
    const projectId = selectedProject ? getProjectIdFromDisplayName(selectedProject) : 'unknown-project';
    // Ensure assignee includes unique id and project ID
    const teamUser = TEAM_USERS.find(u => u.id === assignee.id);
    const newAssignee: QuickAddTaskPerson = teamUser
      ? { ...teamUser, projectId }
      : { ...assignee, projectId, id: assignee.id || 'unknown' };
    const newTask = {
      id: Date.now(),
      title: taskName,
      projectId,
      project: selectedProject || 'No Project',
      estimatedCompletion: '—',
      dateCreated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      }),
      dueDate: '—',
      assignee: newAssignee,     // <-- assign full assignee object
      hasAttachment: attachedFiles.length > 0,
      attachments: attachedFiles,
      status: defaultStatus,
    };
    onSave(newTask);
    if (attachedFiles.length > 0) {
      addAttachments(String(newTask.id), attachedFiles, newAssignee.name || "ME");
    }
    setTaskName('');
    setSelectedProject('');
    setAttachedFiles([]);
    setAssignee(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canSave) {
        handleSave();
      }
    }
  };

  const handleProjectSelect = (
    project: { displayName: string; projectId: string }, e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedProject(project.displayName);
    setShowProjectDropdown(false);
    setSearchTerm('');
    taskNameInputRef.current?.focus();
  };

  return (
    <div className="px-4 py-2 bg-background border border-border rounded transition-colors duration-100">
      <div className="grid grid-cols-12 gap-4 items-center overflow-visible">
        <QuickAddTaskMainInput
          colSpan={6}
          taskName={taskName}
          setTaskName={setTaskName}
          selectedProject={selectedProject}
          setShowProjectDropdown={setShowProjectDropdown}
          showProjectDropdown={showProjectDropdown}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProjects={filteredProjects}
          onProjectSelect={handleProjectSelect}
          taskNameInputRef={taskNameInputRef}
          projectDropdownAnchor={projectDropdownAnchor}
          searchInputRef={searchInputRef}
          dropdownStyle={dropdownStyle}
          handleKeyDown={handleKeyDown}
        />
        <div className="col-span-2" />
        <QuickAddTaskActions
          colSpan={4}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          assignee={assignee}
          setAssignee={setAssignee}
          showAssigneePopover={showAssigneePopover}
          setShowAssigneePopover={setShowAssigneePopover}
          onCancel={() => { onCancel(); setAssignee(null); }}
          onSave={handleSave}
          canSave={canSave}
        />
      </div>
    </div>
  );
};

export default QuickAddTask;
