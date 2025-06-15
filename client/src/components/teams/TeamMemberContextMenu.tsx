
import React from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { User, Eye, Edit, Trash, Mail } from "lucide-react";

interface TeamMemberContextMenuProps {
  children: React.ReactNode;
  onViewAsUser: () => void;
  onEditUser: () => void;
  onRemoveUser: () => void;
  onSendMessage: () => void;
}

const TeamMemberContextMenu: React.FC<TeamMemberContextMenuProps> = ({
  children,
  onViewAsUser,
  onEditUser,
  onRemoveUser,
  onSendMessage,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 z-[99]">
        <ContextMenuLabel>CRM Actions</ContextMenuLabel>
        <ContextMenuItem onClick={onViewAsUser}>
          <Eye className="mr-2 h-4 w-4" />
          View as this user
        </ContextMenuItem>
        <ContextMenuItem onClick={onEditUser}>
          <Edit className="mr-2 h-4 w-4" />
          Edit user
        </ContextMenuItem>
        <ContextMenuItem onClick={onSendMessage}>
          <Mail className="mr-2 h-4 w-4" />
          Send message
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onRemoveUser} className="text-red-500 focus:text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          Remove user from team
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TeamMemberContextMenu;
