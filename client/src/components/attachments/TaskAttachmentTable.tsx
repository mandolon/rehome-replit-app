
import React from "react";
import { X } from "lucide-react";
import { TaskAttachment } from "@/contexts/TaskAttachmentContext";
import { TEAM_USERS } from "@/utils/teamUsers";
import { formatFirstNameLastInitial } from "@/utils/taskUtils";

// Util for mapping author string to a Team User object to match tasks table logic
function findTeamUserByCreatedBy(createdBy: string): { fullName?: string; name?: string; email?: string } | null {
  if (!createdBy) return null;
  const match = TEAM_USERS.find(
    user =>
      user.fullName?.toLowerCase() === createdBy.toLowerCase() ||
      user.name?.toLowerCase() === createdBy.toLowerCase() ||
      user.email?.toLowerCase() === createdBy.toLowerCase()
  );
  return match || null;
}

// Utility function to format file size in human-readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface TaskAttachmentTableProps {
  attachments: TaskAttachment[];
  onRemove?: (attachmentId: string) => void;
}

const TaskAttachmentTable: React.FC<TaskAttachmentTableProps> = ({
  attachments,
  onRemove,
}) => {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2 px-3 text-left font-medium w-[50%] min-w-[130px]">Name</th>
            <th className="py-2 px-2 text-left font-medium whitespace-nowrap w-[12%] min-w-[60px]">Size</th>
            <th className="py-2 px-2 text-left font-medium whitespace-nowrap w-[16%] min-w-[90px]">Date Created</th>
            <th className="py-2 px-2 text-left font-medium whitespace-nowrap w-[12%] min-w-[80px]">Created by</th>
            {onRemove && <th className="py-2 px-2 text-right font-medium w-[10%] min-w-[56px]">Action</th>}
          </tr>
        </thead>
        <tbody>
          {attachments.length === 0 ? (
            <tr>
              <td colSpan={onRemove ? 5 : 4} className="px-3 py-4 text-center text-muted-foreground">
                No attachments yet.
              </td>
            </tr>
          ) : (
            attachments.map((attachment) => {
              // Format author to "FirstName L." using same logic as tasks table
              const teamUser = findTeamUserByCreatedBy(attachment.author);
              let displayAuthor = "";
              if (teamUser?.fullName) {
                displayAuthor = formatFirstNameLastInitial(teamUser.fullName);
              } else if (teamUser?.name) {
                displayAuthor = formatFirstNameLastInitial(teamUser.name);
              } else if (attachment.author) {
                displayAuthor = formatFirstNameLastInitial(attachment.author);
              } else {
                displayAuthor = "Unknown";
              }

              return (
                <tr
                  key={attachment.id}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  <td className="px-3 py-2 max-w-[200px] truncate w-[50%]">
                    <span className="inline-block align-middle mr-2">📄</span>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline cursor-pointer truncate"
                      title={attachment.name}
                      download={attachment.name}
                    >
                      {attachment.name}
                    </a>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-[12%] text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-[16%] text-muted-foreground">{attachment.dateCreated}</td>
                  <td className="px-2 py-2 w-[12%]">
                    <span className="truncate max-w-[90px] text-xs text-muted-foreground block text-ellipsis">
                      {displayAuthor}
                    </span>
                  </td>
                  {onRemove && (
                    <td className="px-2 py-2 text-right w-[10%]">
                      <button
                        onClick={() => onRemove(attachment.id)}
                        className="p-1 hover:bg-accent rounded"
                        aria-label="Remove attachment"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskAttachmentTable;
