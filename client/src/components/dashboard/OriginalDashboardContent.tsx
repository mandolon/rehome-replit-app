import React from 'react';
import { LayoutGrid, Users, ClipboardList, FileText, Settings, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const OriginalDashboardContent = () => {

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
    id: 'business-overview',
    title: 'Business Overview',
    subtitle: 'Financial & Security Dashboard',
    description: 'Track payments, security status, and spending insights all in one place.',
    metrics: [
      { label: 'Monthly Revenue', value: '$24.5k', trend: 'up' },
      { label: 'Security Status', value: 'All Secure', trend: 'stable' },
      { label: 'Spending Growth', value: '+15%', trend: 'up' }
    ],
    href: '/dashboard'
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

  const handleCardClick = (href: string) => {
    if (href) {
      window.location.href = href;
    }
  };

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
        onClick={() => handleCardClick(card.href)}
        className={cn(
          "border-0 shadow-none bg-muted/30 cursor-pointer transition-all duration-300 hover:shadow-lg group",
          className
        )}
      >
        <CardHeader className="pb-2 space-y-1">
          <CardTitle className="text-sm font-semibold group-hover:text-foreground/80 transition-colors line-clamp-1">
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
                  className="flex-[1.8] min-h-[200px] border-0 shadow-none bg-muted/30 cursor-pointer transition-all duration-300 hover:shadow-lg group"
                  onClick={() => handleCardClick(column1Cards[0].href)}
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
                
                {/* Secondary Cards */}
                <div className="flex-1 space-y-3 min-h-0">
                  {renderCard(column1Cards[1], 'h-[105px] min-h-[105px]')}
                  {renderCard(column1Cards[2], 'h-[105px] min-h-[105px]')}
                </div>
              </div>

              {/* Column 2: Mixed height cards */}
              <div className="flex flex-col gap-3">
                {/* Small card */}
                {renderCard(column2FirstCard, 'h-[105px] min-h-[105px]')}
                
                {/* Large Business Overview card */}
                <Card 
                  className="flex-1 border-0 shadow-none bg-muted/30 cursor-pointer transition-all duration-300 hover:shadow-lg group"
                  onClick={() => handleCardClick(column2CombinedCard.href)}
                >
                  <CardHeader className="pb-2 space-y-1">
                    <CardTitle className="text-sm font-semibold group-hover:text-foreground/80 transition-colors">
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
                    {column2CombinedCard.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{metric.label}</span>
                        <span className={`text-xs font-medium ${
                          metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                          metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                          'text-foreground'
                        }`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Column 3: Analytics Overview */}
              <Card 
                className="h-full border-0 shadow-none bg-muted/30 cursor-pointer transition-all duration-300 hover:shadow-lg group flex flex-col"
                onClick={() => handleCardClick(column3Card.href)}
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

export default OriginalDashboardContent;