
import React from 'react';
import { TEAM_USERS } from "@/utils/teamUsers";
import { formatFirstNameLastInitial } from "@/utils/taskUtils";
import { Task } from "@/types/task";

/**
 * Maps createdBy string (name/email) to a TEAM_USERS object (if possible)
 */
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

interface TaskRowCreatedByProps {
  createdBy: string;
}

const TaskRowCreatedBy: React.FC<TaskRowCreatedByProps> = ({ createdBy }) => {
  const userObj = findTeamUserByCreatedBy(createdBy);

  let display = "";
  if (userObj?.fullName) {
    display = formatFirstNameLastInitial(userObj.fullName);
  } else if (userObj?.name) {
    display = formatFirstNameLastInitial(userObj.name);
  } else if (createdBy) {
    display = formatFirstNameLastInitial(createdBy);
  } else {
    display = "Unknown";
  }

  return (
    <span className="truncate max-w-[110px] text-xs text-muted-foreground block text-ellipsis">
      {display}
    </span>
  );
};

export default TaskRowCreatedBy;
