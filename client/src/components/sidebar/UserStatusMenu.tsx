
import React from 'react';
import { Circle } from 'lucide-react';
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/user';

interface UserStatusMenuProps {
  currentStatus: User['status'];
  onStatusChange: (status: User['status']) => void;
}

const UserStatusMenu = ({ currentStatus, onStatusChange }: UserStatusMenuProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const statusOptions: { value: User['status']; label: string }[] = [
    { value: 'online', label: 'Online' },
    { value: 'away', label: 'Away' },
    { value: 'busy', label: 'Busy' },
    { value: 'offline', label: 'Offline' },
  ];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Circle className={`w-4 h-4 mr-2 ${getStatusColor(currentStatus)} fill-current`} />
        Set status
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {statusOptions.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onStatusChange(option.value)}>
            <Circle className={`w-4 h-4 mr-2 ${getStatusColor(option.value)} fill-current`} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

export default UserStatusMenu;
