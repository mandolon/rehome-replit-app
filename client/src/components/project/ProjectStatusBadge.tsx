import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectStatusBadgeProps {
  status: 'in_progress' | 'on_hold' | 'completed';
  className?: string;
}

export const ProjectStatusBadge = ({ status, className }: ProjectStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in_progress':
        return {
          label: 'In Progress',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
        };
      case 'on_hold':
        return {
          label: 'On Hold',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
        };
      case 'completed':
        return {
          label: 'Completed',
          variant: 'outline' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
};