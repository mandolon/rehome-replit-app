
import React from "react";
import { TEAM_USERS } from "@/utils/teamUsers";

interface SelectUserDropdownProps {
  selectedUserId: string;
  onChange: (userId: string) => void;
}

const SelectUserDropdown: React.FC<SelectUserDropdownProps> = ({
  selectedUserId,
  onChange,
}) => {
  return (
    <select
      value={selectedUserId}
      onChange={e => onChange(e.target.value)}
      className="border border-border rounded px-2 py-1 text-xs min-w-[160px] bg-background"
    >
      <option value="">All Users</option>
      {TEAM_USERS.map(user => (
        <option key={user.id} value={user.id}>
          {user.fullName}
        </option>
      ))}
    </select>
  );
};

export default SelectUserDropdown;
