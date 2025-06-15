import React from 'react';
import { MoreHorizontal, Mail, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInitials } from '@/utils/taskUtils';
import { getAvatarColor } from '@/utils/avatarColors';
import { AVATAR_INITIALS_CLASSNAMES } from "@/utils/avatarStyles";
import TeamMemberContextMenu from './TeamMemberContextMenu';
import { TeamMember } from '@/utils/teamUsers';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface TeamMemberRowDesktopProps {
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

const TeamMemberRowDesktop: React.FC<TeamMemberRowDesktopProps> = ({
  member,
  roles,
  onRoleChange,
  projectId,
}) => {
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

  // Navigate to client tab in project page if client row clicked (excluding action buttons)
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
        className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30 group"
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
      >
        <div className="col-span-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${getAvatarColor(member)} rounded-full ${AVATAR_INITIALS_CLASSNAMES} text-white`}>
              {getInitials(member.fullName ?? member.name)}
            </div>
            <span className="font-medium">{member.fullName ?? member.name}</span>
          </div>
        </div>
        <div className="col-span-3 flex items-center gap-1 text-muted-foreground">
          <Mail className="w-3 h-3" />
          <span className="text-blue-600 hover:underline">{member.email}</span>
        </div>
        {/* Only show Title Role column if member is NOT a client */}
        {member.crmRole !== 'Client' && (
          <div className="col-span-2 flex flex-col">
            <Select value={member.titleRole} onValueChange={(value) => onRoleChange(member.id, value)}>
              <SelectTrigger className="h-6 text-xs border-0 shadow-none focus:ring-0 bg-transparent p-0">
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
        {/* Adjust the spans to keep the grid lining up */}
        <div className={member.crmRole === 'Client' ? "col-span-3 flex items-center text-muted-foreground" : "col-span-2 flex items-center text-muted-foreground"}>
          <span>{member.lastActive}</span>
        </div>
        <div className="col-span-2 flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status as any)}`}>
            {member.status}
          </span>
          {(member.crmRole !== 'Client') ? (
            <button
              className="opacity-80 hover:opacity-100 transition-opacity p-1 rounded"
              title="View as user"
              onClick={e => {
                e.stopPropagation();
                handleViewAsUser();
              }}
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <span className="w-3 h-3" /> /* Just spacing for grid */
          )}
        </div>
      </div>
    </TeamMemberContextMenu>
  );
};

export default TeamMemberRowDesktop;
