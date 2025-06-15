import React from 'react';
import { Mail, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInitials } from '@/utils/taskUtils';
import { getAvatarColor } from '@/utils/avatarColors';
import { AVATAR_INITIALS_CLASSNAMES } from "@/utils/avatarStyles";
import TeamMemberContextMenu from './TeamMemberContextMenu';
import { TeamMember } from '@/utils/teamUsers';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface TeamMemberRowMobileProps {
  member: TeamMember;
  roles: string[];
  onRoleChange: (memberId: string, newTitleRole: string) => void;
  projectId: string;
}

const getStatusColor = (status: 'Active' | 'Inactive' | 'Pending') => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700';
    case 'Inactive':
      return 'bg-gray-100 text-gray-500';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const TeamMemberRowMobile: React.FC<TeamMemberRowMobileProps> = ({ member, roles, onRoleChange, projectId }) => {
  const navigate = useNavigate();
  const { impersonateAs, isImpersonating, impersonatedUser, currentUser } = useUser();

  // Handlers
  const handleViewAsUser = () => {
    if (!isImpersonating || (impersonatedUser && impersonatedUser.id !== member.id)) {
      impersonateAs(member.id);
    }
  };
  const handleEditUser = () => {
    console.log(`Edit user: ${member.fullName ?? member.name}`);
  };
  const handleRemoveUser = () => {
    console.log(`Remove user from team: ${member.fullName ?? member.name}`);
  };
  const handleSendMessage = () => {
    console.log(`Send message to user: ${member.fullName ?? member.name}`);
  };

  // Click client row to go to project client tab
  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (member.crmRole === 'Client') {
      navigate(`/project/${projectId}`, { state: { returnToTab: "client" } });
    }
  };

  return (
    <TeamMemberContextMenu
      onViewAsUser={handleViewAsUser}
      onEditUser={handleEditUser}
      onRemoveUser={handleRemoveUser}
      onSendMessage={handleSendMessage}
    >
      <div
        className="rounded border shadow px-3 py-2 bg-card flex flex-col gap-2"
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${getAvatarColor(member)} rounded-full ${AVATAR_INITIALS_CLASSNAMES} text-white`}>
            {getInitials(member.fullName ?? member.name)}
          </div>
          <div>
            <div className="font-medium">{member.fullName ?? member.name}</div>
            <div className="text-xs text-muted-foreground">{member.crmRole}</div>
          </div>
          {/* If Admin/Team, show Eye button; Clients get spacing only */}
          {member.crmRole !== 'Client' ? (
            <button
              className="ml-auto p-1 opacity-80 hover:opacity-100"
              title="View as user"
              onClick={e => {
                e.stopPropagation();
                handleViewAsUser();
              }}
            >
              <Eye className="w-4 h-4" />
            </button>
          ) : (
            <span className="ml-auto w-4 h-4" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Mail className="w-3 h-3" />
          <span className="text-blue-600 break-all">{member.email}</span>
        </div>
        {/* Only show Role selection if NOT a client */}
        {member.crmRole !== 'Client' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Role:</span>
            <Select value={member.titleRole} onValueChange={(value) => onRoleChange(member.id, value)}>
              <SelectTrigger className="h-7 text-xs border border-border bg-accent/30 px-2 py-1 rounded shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="text-xs">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-muted-foreground">Last Active: </span>
            {member.lastActive}
          </div>
          <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(member.status as any)}`}>
            {member.status}
          </span>
        </div>
      </div>
    </TeamMemberContextMenu>
  );
};

export default TeamMemberRowMobile;
