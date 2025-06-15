
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvailableProjects } from '@/utils/projectMapping';

interface TaskDialogFormProps {
  taskName: string;
  setTaskName: (value: string) => void;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  addDescription: boolean;
  setAddDescription: (value: boolean) => void;
  description: string;
  setDescription: (value: string) => void;
}

const TaskDialogForm = ({
  taskName,
  setTaskName,
  selectedProject,
  setSelectedProject,
  selectedStatus,
  setSelectedStatus,
  addDescription,
  setAddDescription,
  description,
  setDescription
}: TaskDialogFormProps) => {
  const availableProjects = getAvailableProjects();

  return (
    <div className="space-y-3 py-2">
      {/* Project and Status Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {availableProjects.map((project) => (
                <SelectItem key={project.projectId} value={project.displayName}>
                  {project.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="redline">Task/Redline</SelectItem>
              <SelectItem value="progress">Progress/Update</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Name */}
      <div>
        <Input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Task Name or type '/' for commands"
          className="h-8 text-sm"
        />
      </div>

      {/* Add Description Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="addDescription"
          checked={addDescription}
          onCheckedChange={(checked) => setAddDescription(checked as boolean)}
        />
        <Label htmlFor="addDescription" className="text-sm text-muted-foreground">Add description</Label>
      </div>

      {/* Description Field (if enabled) */}
      {addDescription && (
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description..."
            className="w-full h-20 px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      )}
    </div>
  );
};

export default TaskDialogForm;
