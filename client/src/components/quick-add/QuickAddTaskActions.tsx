
import React from 'react';
import QuickAddAttachments from './QuickAddAttachments';
import QuickAddAssigneePopover from './QuickAddAssigneePopover';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface QuickAddTaskActionsProps {
  colSpan: number;
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
  assignee: any;
  setAssignee: (a: any) => void;
  showAssigneePopover: boolean;
  setShowAssigneePopover: (b: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  canSave: boolean;
}

const QuickAddTaskActions: React.FC<QuickAddTaskActionsProps> = ({
  colSpan,
  attachedFiles,
  setAttachedFiles,
  assignee,
  setAssignee,
  showAssigneePopover,
  setShowAssigneePopover,
  onCancel,
  onSave,
  canSave
}) => {
  const finalCanSave = canSave && !!assignee; // Save only enabled when assignee is selected
  return (
    <div className={`col-span-${colSpan} flex items-center justify-end gap-2 overflow-visible`}>
      <QuickAddAttachments files={attachedFiles} setFiles={setAttachedFiles} />
      <QuickAddAssigneePopover
        assignee={assignee}
        setAssignee={setAssignee}
        showAssigneePopover={showAssigneePopover}
        setShowAssigneePopover={setShowAssigneePopover}
      />
      <Separator orientation="vertical" className="h-4 bg-border" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="text-xs px-3 py-1 h-6 text-muted-foreground hover:text-foreground bg-background hover:bg-accent transition-colors"
      >
        Cancel
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        className="text-xs px-3 py-1 h-6 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400"
        disabled={!finalCanSave}
      >
        Save
      </Button>
    </div>
  );
};

export default QuickAddTaskActions;

