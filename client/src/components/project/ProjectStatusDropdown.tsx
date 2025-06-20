import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Play, Pause, CheckCircle } from 'lucide-react';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ProjectStatusDropdownProps {
  projectId: string;
  currentStatus: 'in_progress' | 'on_hold' | 'completed';
  disabled?: boolean;
}

export const ProjectStatusDropdown = ({ projectId, currentStatus, disabled }: ProjectStatusDropdownProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'in_progress' | 'on_hold' | 'completed') => {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      
      const statusLabels: Record<string, string> = {
        'in_progress': 'In Progress',
        'on_hold': 'On Hold',
        'completed': 'Completed'
      };
      
      toast({
        title: "Project status updated.",
        description: `Project moved to ${statusLabels[data.status] || data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update project status.",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleStatusChange = (newStatus: 'in_progress' | 'on_hold' | 'completed') => {
    if (newStatus !== currentStatus) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Play className="w-3 h-3 mr-2" />;
      case 'on_hold':
        return <Pause className="w-3 h-3 mr-2" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-2" />;
      default:
        return null;
    }
  };

  const statusOptions = [
    { value: 'in_progress', label: 'In Progress', description: 'Project is actively being worked on' },
    { value: 'on_hold', label: 'On Hold', description: 'Project is temporarily paused' },
    { value: 'completed', label: 'Completed', description: 'Project has been finished' },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={disabled || updateStatusMutation.isPending}
          className="h-auto p-1 hover:bg-accent"
        >
          <div className="flex items-center gap-2">
            <ProjectStatusBadge status={currentStatus} />
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={option.value === currentStatus || updateStatusMutation.isPending}
            className="flex flex-col items-start py-3"
          >
            <div className="flex items-center w-full">
              {getStatusIcon(option.value)}
              <span className="font-medium">{option.label}</span>
              {option.value === currentStatus && (
                <CheckCircle className="w-3 h-3 ml-auto text-primary" />
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {option.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};