
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getAvailableProjects } from "@/utils/projectMapping";
import { createWhiteboard } from "@/utils/whiteboardStore";
import { useUser } from "@/contexts/UserContext";

const WhiteboardCreateDialog: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [shared, setShared] = useState(true);
  const { currentUser } = useUser();

  const availableProjects = getAvailableProjects();

  const handleCreate = () => {
    if (!title.trim() || !projectId) return;
    createWhiteboard({
      title,
      type: "pdf",
      projectId,
      createdBy: currentUser.id,
      sharedWithClient: shared,
    });
    setTitle("");
    setProjectId("");
    setShared(true);
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="mb-2">Create Whiteboard</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>New Whiteboard</DialogTitle>
        <div className="space-y-3 p-2">
          <Input
            placeholder="Whiteboard Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full"
          />
          <div>
            <label className="block text-xs font-medium mb-1">Project</label>
            <select
              className="w-full rounded border border-border px-2 py-1 text-sm"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
            >
              <option value="">Select project...</option>
              {availableProjects.map(p => (
                <option key={p.projectId} value={p.projectId}>
                  {p.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="share-client"
              checked={shared}
              onCheckedChange={setShared}
            />
            <label htmlFor="share-client" className="text-xs">
              Share with client?
            </label>
          </div>
          <div className="flex justify-end">
            <Button variant="default" size="sm" onClick={handleCreate} disabled={!title.trim() || !projectId}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhiteboardCreateDialog;
