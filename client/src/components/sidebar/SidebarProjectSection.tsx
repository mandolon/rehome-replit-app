
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getProjectDisplayName } from '@/data/projectClientData';
import ProjectItem from './ProjectItem';

interface SidebarProjectSectionProps {
  title: string;
  projects: string[];
  isOpen: boolean;
  onToggle: () => void;
  isActive?: boolean;
  refreshTrigger?: number;
}

interface Project {
  id: number;
  projectId: string;
  title: string;
  status: 'in_progress' | 'on_hold' | 'completed';
}

const SidebarProjectSection = React.memo(({ 
  title, 
  projects, 
  isOpen, 
  onToggle, 
  isActive = false,
  refreshTrigger 
}: SidebarProjectSectionProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [projectDisplayNames, setProjectDisplayNames] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<'name' | 'address' | 'date-modified'>('name');

  // Fetch all projects to get projectId mapping
  const { data: allProjects = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
  });

  // Create a mapping from project title to projectId
  const projectTitleToId = useMemo(() => {
    const mapping: Record<string, string> = {};
    allProjects.forEach((project: Project) => {
      mapping[project.title] = project.projectId;
    });
    return mapping;
  }, [allProjects]);

  // Mutation for updating project status
  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: 'in_progress' | 'on_hold' | 'completed' }) => {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
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

  // Mutation for deleting project
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

  // Update project display names when refresh trigger changes
  useEffect(() => {
    const updatedNames: Record<string, string> = {};
    projects.forEach(project => {
      const projectIdFromName = project.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      updatedNames[project] = getProjectDisplayName(projectIdFromName) || project;
    });
    setProjectDisplayNames(updatedNames);
  }, [projects, refreshTrigger]);

  const handleProjectClick = useCallback((projectName: string) => {
    // Convert project name to URL-friendly format
    const projectIdFromName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    navigate(`/project/${projectIdFromName}`);
  }, [navigate]);

  const handleMenuAction = useCallback((action: string, projectName: string) => {
    const projectId = projectTitleToId[projectName];
    
    if (!projectId) {
      toast({
        variant: "destructive",
        title: "Project not found.",
        description: "Could not find the project to update.",
      });
      return;
    }
    
    switch (action) {
      case 'rename':
        // TODO: Implement rename functionality
        break;
      case 'duplicate':
        // TODO: Implement duplicate functionality
        break;
      case 'archive':
        // TODO: Implement archive functionality
        break;
      case 'delete':
        deleteProjectMutation.mutate(projectId);
        break;
      case 'move-to-progress':
        updateProjectStatusMutation.mutate({ projectId, status: 'in_progress' });
        break;
      case 'move-to-hold':
        updateProjectStatusMutation.mutate({ projectId, status: 'on_hold' });
        break;
      case 'move-to-completed':
        updateProjectStatusMutation.mutate({ projectId, status: 'completed' });
        break;
    }
  }, [projectTitleToId, updateProjectStatusMutation, deleteProjectMutation, toast]);

  const handleSortAction = useCallback((sortType: string) => {
    setSortBy(sortType as 'name' | 'address' | 'date-modified');
  }, []);

  // Sort projects based on current sort criteria
  const sortedProjects = useMemo(() => {
    const projectsWithDetails = projects.map(projectTitle => {
      const projectData = allProjects.find((p: Project) => p.title === projectTitle);
      return {
        title: projectTitle,
        address: projectData?.projectAddress || '',
        dateModified: projectData?.updatedAt || projectData?.createdAt || '',
        displayName: projectDisplayNames[projectTitle] || projectTitle
      };
    });

    return projectsWithDetails.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'address':
          return a.address.localeCompare(b.address);
        case 'date-modified':
          return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }, [projects, allProjects, projectDisplayNames, sortBy]);

  const projectItems = useMemo(() => 
    sortedProjects.map((project, index) => {
      return (
        <ProjectItem
          key={index}
          project={project.title}
          displayName={project.displayName}
          currentSection={title}
          onProjectClick={handleProjectClick}
          onMenuAction={handleMenuAction}
          onSortAction={handleSortAction}
        />
      );
    }), [sortedProjects, title, handleProjectClick, handleMenuAction, handleSortAction]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="ml-2 mt-1">
        <CollapsibleTrigger className={cn(
          "flex items-center gap-2 px-2 py-1.5 w-full text-left rounded",
          "hover:bg-sidebar-accent/50"
        )}>
          {isOpen ? (
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
          )}
          <span className="text-sm truncate">{title}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-2 mt-1 space-y-1">
            {projectItems}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});

SidebarProjectSection.displayName = 'SidebarProjectSection';

export default SidebarProjectSection;
