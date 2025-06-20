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
}

const ProjectLogTab = ({ selectedWeek, refreshTrigger }: ProjectLogTabProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
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

      {/* Work Log Entries Table */}
      <Card className="border-0 shadow-none bg-muted/30">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm font-semibold">Work Log Entries</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No tasks found for the selected project
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-[100px] text-xs font-medium text-muted-foreground h-8">Task ID</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground h-8">Title</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium text-muted-foreground h-8">Status</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-muted-foreground h-8">Assignee</TableHead>
                  <TableHead className="w-[100px] text-xs font-medium text-muted-foreground h-8">Time Logged</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-muted-foreground h-8">Created</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-muted-foreground h-8">Last Update</TableHead>
                  <TableHead className="w-[120px] text-xs font-medium text-muted-foreground h-8">Estimated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="border-0 hover:bg-muted/50">
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        {task.taskId}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="max-w-[200px] truncate" title={task.title}>
                        {task.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(task.status)}`}>
                        {task.status || 'Todo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {task.assignee ? (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[80px]" title={task.assignee.name}>
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {formatTime(task.timeLogged || '0')}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yy') : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {task.updatedAt ? format(new Date(task.updatedAt), 'MMM d, yy') : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {task.estimatedCompletion || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectLogTab;