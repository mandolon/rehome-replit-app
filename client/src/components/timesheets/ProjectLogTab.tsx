import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, User, Calendar, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: number;
  taskId: string;
  title: string;
  projectId: string;
  project: string;
  status: string;
  assignee: any;
  createdAt: string;
  updatedAt: string;
  markedComplete: string | null;
  estimatedCompletion: string;
  description: string;
  timeLogged: string;
}

interface ProjectLogTabProps {
  selectedWeek: Date;
  refreshTrigger: number;
  onTaskClick?: (task: Task) => void;
}

const ProjectLogTab = ({ selectedWeek, refreshTrigger, onTaskClick }: ProjectLogTabProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/work-records');
      const data: Task[] = await response.json();
      setTasks(data);
      
      // Extract unique projects
      const projectMap = new Map<string, { id: string; name: string }>();
      data.forEach((task: Task) => {
        if (!projectMap.has(task.projectId)) {
          projectMap.set(task.projectId, {
            id: task.projectId,
            name: task.project || task.projectId
          });
        }
      });
      const uniqueProjects = Array.from(projectMap.values());
      setProjects(uniqueProjects);
      
      if (uniqueProjects.length > 0 && !selectedProject) {
        setSelectedProject(uniqueProjects[0].id);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in progress':
        return <Circle className="w-4 h-4 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'todo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject)
    : tasks;

  const formatTime = (timeStr: string) => {
    const hours = parseFloat(timeStr || '0');
    if (hours === 0) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours % 1 === 0) return `${hours}h`;
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const projectStats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(task => task.status?.toLowerCase() === 'completed').length,
    inProgress: filteredTasks.filter(task => task.status?.toLowerCase() === 'in progress').length,
    todo: filteredTasks.filter(task => task.status?.toLowerCase() === 'todo').length,
    totalTime: filteredTasks.reduce((sum, task) => sum + parseFloat(task.timeLogged || '0'), 0),
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Project Selector */}
      <div className="flex items-center gap-1 mb-4 h-[28px]">
        <span className="text-sm font-medium">Project:</span>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64 h-7">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="border-0 shadow-none bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Tasks</CardTitle>
            <Calendar className="w-3 h-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{projectStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All project tasks
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{projectStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {projectStats.total > 0 ? Math.round((projectStats.completed / projectStats.total) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="w-3 h-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{projectStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">To Do</CardTitle>
            <Circle className="w-3 h-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{projectStats.todo}</div>
            <p className="text-xs text-muted-foreground">
              Pending tasks
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Time</CardTitle>
            <Clock className="w-3 h-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{formatTime(projectStats.totalTime.toString())}</div>
            <p className="text-xs text-muted-foreground">
              Time logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Work Log Entries Table - ClickUp Style */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tasks <span className="text-gray-500">({filteredTasks.length})</span>
            </h3>
          </div>
        </div>

        {/* Table Content */}
        {filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No tasks found for the selected project
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                    Date created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                    Time tracked
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                    Created by
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    
                    {/* Task Name with Status Icon */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Status Circle */}
                        <div className="flex items-center gap-1">
                          {task.status?.toLowerCase() === 'completed' ? (
                            <>
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs text-green-600 font-medium">COMPLETE</span>
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                              <span className="text-xs text-gray-500 font-medium">TODO</span>
                            </>
                          )}
                        </div>
                        
                        {/* Task Title */}
                        <span 
                          className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() => onTaskClick?.(task)}
                        >
                          {task.title}
                        </span>
                      </div>
                      
                      {/* Subtitle/Description if available */}
                      {task.status?.toLowerCase() === 'completed' && (
                        <div className="text-xs text-gray-500 mt-1 ml-8">
                          Current status: complete
                        </div>
                      )}
                    </td>
                    
                    {/* Date Created */}
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {task.createdAt ? format(new Date(task.createdAt), 'M/d/yy') : '-'}
                    </td>
                    
                    {/* Time Tracked */}
                    <td className="px-4 py-3">
                      {task.timeLogged && parseFloat(task.timeLogged) > 0 ? (
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {formatTime(task.timeLogged)}
                        </span>
                      ) : (
                        <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                          Add time
                        </button>
                      )}
                    </td>
                    
                    {/* Created By */}
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {task.assignee.name?.charAt(0)?.toUpperCase() || 'A'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {task.assignee.name || 'AL'}
                          </span>
                        </div>
                      ) : (
                        <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                          Add time
                        </button>
                      )}
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {task.status?.toLowerCase() === 'completed' ? (
                          <>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">COMPLETE</span>
                            </div>
                            <span className="text-xs text-gray-500">Complete</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">TODO</span>
                            </div>
                            <span className="text-xs text-gray-500">To do</span>
                          </>
                        )}
                        <span className="text-xs text-gray-400">Current status: {task.status?.toLowerCase() || 'todo'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectLogTab;