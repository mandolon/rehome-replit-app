
import React from 'react';
import TeamMemberRow from './TeamMemberRow';
import { TeamMember } from '@/utils/teamUsers';

interface TeamMembersTableProps {
  members: TeamMember[];
  roles: string[];
  onRoleChange: (memberId: string, newTitleRole: string) => void;
  isMobile?: boolean;
  visibleCount?: number;
  totalCount?: number;
  projectId: string;
}

const TeamMembersTable = ({
  members,
  roles,
  onRoleChange,
  isMobile,
  visibleCount,
  totalCount,
  projectId
}: TeamMembersTableProps) => {
  if (isMobile) {
    // Mobile: stack list vertically, shows all
    return (
      <div className="flex flex-col gap-2 mb-2">
        {members.map(member => (
          <TeamMemberRow
            key={member.id}
            member={member}
            roles={roles}
            onRoleChange={onRoleChange}
            isMobile={true}
            projectId={projectId}
          />
        ))}
      </div>
    );
  }

  // Determine if all members are clients
  const allClients = members.every(member => member.crmRole === 'Client');

  // Desktop: Use table header/row layout with sticky header
  return (
    <div className="space-y-0.5">
      <div
        className={`grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-1.5 border-b sticky top-0 z-10 bg-background`}
        style={{ backgroundClip: "padding-box" }}
      >
        <div className="col-span-3">Name / CRM Role</div>
        <div className="col-span-3">Email</div>
        {!allClients && <div className="col-span-2">Title Role</div>}
        <div className={allClients ? "col-span-3" : "col-span-2"}>Last Active</div>
        <div className="col-span-2">Status</div>
      </div>
      {members.map((member) => (
        <TeamMemberRow
          key={member.id}
          member={member}
          roles={roles}
          onRoleChange={onRoleChange}
          isMobile={false}
          projectId={projectId}
        />
      ))}
      {/* Loader handled by parent */}
    </div>
  );
};

export default TeamMembersTable;
