import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FolderOpen, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProjectStatusDropdown } from '@/components/project/ProjectStatusDropdown';
import { ProjectStatusBadge } from '@/components/project/ProjectStatusBadge';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/taskUtils';

interface Project {
  id: number;
  projectId: string;
  title: string;
  description?: string;
  status: 'in_progress' | 'on_hold' | 'completed';
  clientName?: string;
  projectAddress?: string;
  startDate?: string;
  dueDate?: string;
  estimatedCompletion?: string;
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project moved to trash.",
        description: "The project has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete project.",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const createSampleProjectsMutation = useMutation({
    mutationFn: async () => {
      const sampleProjects = [
        {
          projectId: 'PROJ-001',
          title: 'Modern Office Renovation',
          description: 'Complete renovation of downtown office space',
          status: 'in_progress',
          clientName: 'Acme Corporation',
          projectAddress: '123 Business Ave, Downtown',
          startDate: '2024-01-15',
          dueDate: '2024-06-30',
          priority: 'high',
          createdBy: 'system'
        },
        {
          projectId: 'PROJ-002',
          title: 'Residential Kitchen Remodel',
          description: 'Custom kitchen design and installation',
          status: 'on_hold',
          clientName: 'Johnson Family',
          projectAddress: '456 Maple Street, Suburbs',
          startDate: '2024-02-01',
          dueDate: '2024-04-15',
          priority: 'medium',
          createdBy: 'system'
        },
        {
          projectId: 'PROJ-003',
          title: 'Commercial Warehouse Build',
          description: 'New warehouse construction project',
          status: 'completed',
          clientName: 'LogiCorp Ltd',
          projectAddress: '789 Industrial Blvd, Industrial Park',
          startDate: '2023-09-01',
          dueDate: '2024-01-31',
          priority: 'high',
          createdBy: 'system'
        }
      ];

      for (const project of sampleProjects) {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        });
        if (!response.ok) {
          throw new Error(`Failed to create project ${project.title}`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Sample projects created.",
        description: "Three sample projects have been added to demonstrate status management.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create sample projects.",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch = !searchQuery.trim() || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: projects.length,
    in_progress: projects.filter((p: Project) => p.status === 'in_progress').length,
    on_hold: projects.filter((p: Project) => p.status === 'on_hold').length,
    completed: projects.filter((p: Project) => p.status === 'completed').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/50';
      case 'low':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/50';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-lg font-medium text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage project statuses and workflow</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage project statuses and workflow</p>
          </div>
          <div className="flex gap-2">
            {projects.length === 0 && (
              <Button
                onClick={() => createSampleProjectsMutation.mutate()}
                disabled={createSampleProjectsMutation.isPending}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Projects
              </Button>
            )}
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'All Projects', count: statusCounts.all },
              { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
              { key: 'on_hold', label: 'On Hold', count: statusCounts.on_hold },
              { key: 'completed', label: 'Completed', count: statusCounts.completed }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={selectedStatus === filter.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedStatus(filter.key)}
                className="h-8 px-3 text-xs"
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-auto">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {projects.length === 0 
                ? 'Create your first project to get started with project management.'
                : 'Try adjusting your search criteria or filters.'}
            </p>
            {projects.length === 0 && (
              <Button
                onClick={() => createSampleProjectsMutation.mutate()}
                disabled={createSampleProjectsMutation.isPending}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Projects
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</TableHead>
                <TableHead className="py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project: Project) => (
                <TableRow
                  key={project.id}
                  className="border-b border-border transition-colors hover:bg-accent/50 group"
                >
                  <TableCell className="py-3">
                    <ProjectStatusDropdown
                      projectId={project.projectId}
                      currentStatus={project.status}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <div className="font-medium text-sm text-foreground">{project.title}</div>
                      <div className="text-xs text-muted-foreground">{project.projectId}</div>
                      {project.description && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <div className="text-sm text-foreground">{project.clientName}</div>
                      {project.projectAddress && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {project.projectAddress}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-sm text-foreground">
                      {project.dueDate ? formatDate(project.dueDate) : '—'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => deleteProjectMutation.mutate(project.projectId)}
                          disabled={deleteProjectMutation.isPending}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Projects;