import React from 'react';
import { LayoutGrid, Users, ClipboardList, FileText, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardContent = () => {

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

  // Column 2: Smaller uniform cards
  const column2Cards = [
    {
      id: 'account-access',
      title: 'Account Access',
      subtitle: '3 new requests',
      icon: Settings,
      href: '/settings'
    },
    {
      id: 'payments-transfers',
      title: 'Payments & Transfers',
      subtitle: '$24.5k this month',
      icon: FileText,
      href: '/invoices'
    },
    {
      id: 'fraud-security',
      title: 'Fraud & Security',
      subtitle: 'All systems secure',
      icon: Settings,
      href: '/settings'
    },
    {
      id: 'spending-insights',
      title: 'Spending Insights',
      subtitle: '15% increase',
      icon: BarChart3,
      href: '/dashboard'
    }
  ];

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
      <div
        key={card.id}
        onClick={() => handleCardClick(card.href)}
        className={cn(
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group",
          className
        )}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {!card.isWelcome && Icon && (
            <div className="flex items-start justify-between mb-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <h3 className={cn(
              "font-medium text-foreground mb-1 group-hover:text-foreground/80 transition-colors line-clamp-2",
              card.isWelcome ? "text-sm" : "text-sm"
            )}>
              {card.title}
            </h3>
            
            <p className="text-muted-foreground text-xs leading-tight line-clamp-2">
              {card.subtitle}
            </p>
            
            {card.description && !card.isWelcome && (
              <p className="text-muted-foreground text-xs leading-tight mt-1 line-clamp-2">
                {card.description}
              </p>
            )}
            
            {card.description && card.isWelcome && (
              <p className="text-muted-foreground text-xs leading-tight mt-2 line-clamp-3">
                {card.description}
              </p>
            )}

            {card.isWelcome && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-900 dark:text-white font-medium">24</div>
                    <div className="text-gray-600 dark:text-gray-400">Active Projects</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-900 dark:text-white font-medium">156</div>
                    <div className="text-gray-600 dark:text-gray-400">Open Tasks</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-background pl-2 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4 overflow-auto">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">{getGreeting()}, Armando</h1>
          </div>
          
          <div className="h-full min-h-[500px] max-h-[calc(100vh-180px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {/* Column 1: Different sized cards */}
              <div className="flex flex-col gap-3 min-h-0">
                <div className="flex-[2] min-h-[200px]">
                  <div className="h-full p-6">
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-medium text-foreground mb-1 text-sm">
                          {column1Cards[0].title}
                        </h3>
                        
                        <p className="text-muted-foreground text-xs leading-tight line-clamp-3">
                          {column1Cards[0].subtitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="text-gray-900 dark:text-white font-medium">24</div>
                            <div className="text-gray-600 dark:text-gray-400">Active Projects</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="text-gray-900 dark:text-white font-medium">156</div>
                            <div className="text-gray-600 dark:text-gray-400">Open Tasks</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {renderCard(column1Cards[1], 'flex-1 min-h-[120px]')}
                {renderCard(column1Cards[2], 'flex-1 min-h-[100px]')}
              </div>

              {/* Column 2: Uniform smaller cards */}
              <div className="grid grid-cols-1 gap-3 content-start">
                {column2Cards.map((card) => renderCard(card, 'h-[110px] min-h-[110px]'))}
              </div>

              {/* Column 3: Full height card */}
              <div className="h-full min-h-[400px] lg:min-h-0">
                <div
                  onClick={() => handleCardClick(column3Card.href)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group h-full"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <BarChart3 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>

                    <div className="flex-1 min-h-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        {column3Card.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {column3Card.subtitle}
                      </p>
                      
                      <p className="text-gray-500 dark:text-gray-500 text-xs leading-relaxed mb-4">
                        {column3Card.description}
                      </p>

                      <div className="space-y-2 flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                          <div className="text-gray-900 dark:text-white font-medium text-xs mb-1">Project Completion</div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">78% average across all projects</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                          <div className="text-gray-900 dark:text-white font-medium text-xs mb-1">Team Efficiency</div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">+15% improvement this quarter</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                          <div className="text-gray-900 dark:text-white font-medium text-xs mb-1">Revenue Growth</div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">$24.5k generated this month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
