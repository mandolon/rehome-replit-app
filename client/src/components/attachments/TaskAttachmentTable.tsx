
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
            <th className="py-2 px-3 text-left font-medium w-[60%] min-w-[130px]">Name</th>
            <th className="py-2 px-2 text-left font-medium whitespace-nowrap w-[16%] min-w-[90px]">Date Created</th>
            <th className="py-2 px-2 text-left font-medium whitespace-nowrap w-[14%] min-w-[80px]">Created by</th>
            {onRemove && <th className="py-2 px-2 text-right font-medium w-[10%] min-w-[56px]">Action</th>}
          </tr>
        </thead>
        <tbody>
          {attachments.length === 0 ? (
            <tr>
              <td colSpan={onRemove ? 4 : 3} className="px-3 py-4 text-center text-muted-foreground">
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
                  <td className="px-3 py-2 max-w-[220px] truncate w-[60%]">
                    <span className="inline-block align-middle mr-2">📄</span>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline cursor-pointer truncate"
                      title={attachment.name}
                      download={attachment.name}
                    >
                      {attachment.name}
                    </a>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap w-[16%] text-muted-foreground">{attachment.dateCreated}</td>
                  <td className="px-2 py-2 w-[14%]">
                    <span className="truncate max-w-[110px] text-xs text-muted-foreground block text-ellipsis">
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
