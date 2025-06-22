import React from 'react';
import { LayoutGrid, Users, ClipboardList, FileText, Settings, BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveTasks } from '@/hooks/useActiveTasks';

const DashboardContent = () => {
  // Get active tasks data
  const { activeTasks, isLoading: tasksLoading } = useActiveTasks();

  // Get current time for greeting
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Column 1: Different sized cards
  const column1Cards = [
    {
      id: 'project-management',
      title: 'Welcome back to your project dashboard',
      subtitle: 'You have 5 urgent tasks requiring attention, 3 projects with upcoming deadlines this week, and 2 team members waiting for your approval on design revisions.',
      description: undefined,
      href: '/tasks',
      isWelcome: true
    },
    {
      id: 'task-updates',
      title: 'Task & Updates',
      subtitle: '156 conversations',
      description: 'Review project updates and task progress',
      icon: ClipboardList,
      href: '/tasks'
    },
    {
      id: 'team-management',
      title: 'Team Management',
      subtitle: '12 team members',
      description: 'Manage roles and permissions',
      icon: Users,
      href: '/teams'
    }
  ];

  // Column 2: Mixed sized cards
  const column2FirstCard = {
    id: 'account-access',
    title: 'Account Access',
    subtitle: '3 new requests',
    icon: Settings,
    href: '/settings'
  };

  const column2CombinedCard = {
    id: 'my-tasks',
    title: 'My Tasks',
    subtitle: 'Active Task Summary',
    description: 'Overview of your current open tasks and upcoming deadlines.',
    href: '/tasks'
  };

  // Column 3: Full height card
  const column3Card = {
    id: 'analytics-reports',
    title: 'Analytics & Reports',
    subtitle: 'Performance Dashboard',
    description: 'Comprehensive project analytics, team performance metrics, and detailed reports for all your projects.',
    icon: BarChart3,
    href: '/dashboard'
  };

  // Cards are now static - no navigation functionality

  const renderCard = (card: {
    id: string;
    title: string;
    subtitle: string;
    description?: string;
    icon?: any;
    href: string;
    isWelcome?: boolean;
  }, className = '') => {
    const Icon = card.icon;
    return (
      <Card
        key={card.id}
        className={cn(
          "border-0 shadow-none bg-muted/30 transition-all duration-300",
          className
        )}
      >
        <CardHeader className="pb-2 space-y-1">
          <CardTitle className="text-sm font-semibold line-clamp-1">
            {card.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-1">
            {card.subtitle}
          </CardDescription>
        </CardHeader>
        {card.description && !card.isWelcome && (
          <CardContent className="pt-0 pb-4">
            <p className="text-muted-foreground text-xs line-clamp-1">
              {card.description}
            </p>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="flex-1 bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header Section with improved spacing */}
        <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-border/50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">{getGreeting()}, Armando</h1>
            <p className="text-muted-foreground mt-2 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 h-full max-h-[calc(100vh-140px)]">
              {/* Column 1: Featured Welcome Card + Secondary Cards */}
              <div className="flex flex-col gap-3 min-h-0">
                {/* Welcome Card - Keeping original layout with new colors */}
                <Card 
                  className="flex-[1.8] min-h-[200px] border-0 shadow-none bg-muted/30 transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-foreground/80 transition-colors">
                      Welcome back to your project dashboard
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-3">
                      You have 5 urgent tasks requiring attention, 3 projects with upcoming deadlines this week, and 2 team members waiting for your approval on design revisions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="text-lg font-bold mb-0.5">24</div>
                        <div className="text-xs text-muted-foreground font-medium">Active Projects</div>
                      </div>
                      <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="text-lg font-bold mb-0.5">156</div>
                        <div className="text-xs text-muted-foreground font-medium">Open Tasks</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Secondary Cards - Compact */}
                <div className="flex-1 space-y-3">
                  {renderCard(column1Cards[1], 'h-[110px]')}
                  {renderCard(column1Cards[2], 'h-[110px]')}
                </div>
              </div>

              {/* Column 2: Mixed Size Cards */}
              <div className="flex flex-col gap-3">
                {/* Small card */}
                {renderCard(column2FirstCard, 'h-[105px] min-h-[105px]')}
                
                {/* My Tasks card */}
                <Card 
                  className="flex-1 border-0 shadow-none bg-muted/30 transition-all duration-300"
                >
                  <CardHeader className="pb-2 space-y-1">
                    <CardTitle className="text-sm font-semibold">
                      {column2CombinedCard.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {column2CombinedCard.subtitle}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground leading-tight line-clamp-2 pt-1">
                      {column2CombinedCard.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {tasksLoading ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Loading tasks...</span>
                        </div>
                      </div>
                    ) : activeTasks.length === 0 ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-xs text-muted-foreground">No active tasks</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Total Active</span>
                          <span className="text-xs font-medium text-foreground">
                            {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">With Due Dates</span>
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            {activeTasks.filter(task => task.dueDate).length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Due This Week</span>
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            {activeTasks.filter(task => {
                              if (!task.dueDate) return false;
                              const dueDate = new Date(task.dueDate);
                              const now = new Date();
                              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                              return dueDate <= weekFromNow && dueDate >= now;
                            }).length}
                          </span>
                        </div>
                        {activeTasks.slice(0, 2).map((task, index) => (
                          <div key={task.taskId} className="bg-muted/50 rounded-lg p-2 space-y-1">
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-medium text-foreground line-clamp-1 flex-1 mr-2">
                                {task.title}
                              </span>
                              {task.dueDate && (
                                <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            {task.dueDate && (
                              <div className="text-xs text-muted-foreground">
                                Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                        ))}
                        {activeTasks.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center pt-1">
                            +{activeTasks.length - 2} more tasks
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Column 3: Analytics Overview */}
              <Card 
                className="h-full border-0 shadow-none bg-muted/30 transition-all duration-300 flex flex-col"
              >
                <CardHeader className="pb-2 space-y-2">
                  <CardTitle className="text-base font-semibold group-hover:text-foreground/80 transition-colors">
                    Analytics & Reports
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Performance Dashboard
                  </CardDescription>
                  <p className="text-muted-foreground text-xs leading-tight line-clamp-2">
                    Comprehensive project analytics, team performance metrics, and detailed reports for all your projects.
                  </p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 pt-0">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-foreground font-semibold text-xs">Project Completion</div>
                      <div className="text-foreground font-bold text-xs">78%</div>
                    </div>
                    <div className="text-muted-foreground text-xs">Average across all projects</div>
                    <div className="mt-1 bg-muted rounded-full h-1">
                      <div className="bg-foreground/60 h-1 rounded-full" style={{width: '78%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-foreground font-semibold text-xs">Team Efficiency</div>
                      <div className="text-foreground font-bold text-xs">+15%</div>
                    </div>
                    <div className="text-muted-foreground text-xs">Improvement this quarter</div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-foreground font-semibold text-xs">Revenue Growth</div>
                      <div className="text-foreground font-bold text-xs">$24.5k</div>
                    </div>
                    <div className="text-muted-foreground text-xs">Generated this month</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
