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
          "bg-white dark:bg-gray-800 border border-border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 group",
          className
        )}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {!card.isWelcome && Icon && (
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground/80 transition-colors" />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-foreground mb-2 text-base group-hover:text-foreground/80 transition-colors line-clamp-2">
              {card.title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2">
              {card.subtitle}
            </p>
            
            {card.description && !card.isWelcome && (
              <p className="text-muted-foreground text-xs leading-relaxed mt-2 line-clamp-2">
                {card.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header Section with improved spacing */}
        <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-border/50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{getGreeting()}, Armando</h1>
            <p className="text-muted-foreground mt-2 text-sm">Here's what's happening with your projects today</p>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 h-full min-h-[600px]">
              {/* Column 1: Featured Welcome Card + Secondary Cards */}
              <div className="flex flex-col gap-5 min-h-0">
                {/* Welcome Card - Larger, more prominent */}
                <div className="flex-[2.5] min-h-[280px]">
                  <div
                    onClick={() => handleCardClick(column1Cards[0].href)}
                    className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 group"
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {column1Cards[0].title}
                        </h2>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 mb-6">
                          {column1Cards[0].subtitle}
                        </p>
                      </div>

                      <div className="mt-auto pt-6 border-t border-blue-200/50 dark:border-blue-800/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">24</div>
                            <div className="text-xs text-muted-foreground font-medium">Active Projects</div>
                          </div>
                          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">156</div>
                            <div className="text-xs text-muted-foreground font-medium">Open Tasks</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Secondary Cards with improved spacing */}
                <div className="flex-1 space-y-4">
                  {renderCard(column1Cards[1], 'h-[140px]')}
                  {renderCard(column1Cards[2], 'h-[140px]')}
                </div>
              </div>

              {/* Column 2: Quick Action Cards */}
              <div className="grid grid-cols-1 gap-4 content-start">
                {column2Cards.map((card) => renderCard(card, 'h-[128px] min-h-[128px]'))}
              </div>

              {/* Column 3: Analytics Overview */}
              <div className="h-full min-h-[500px] lg:min-h-0">
                <div
                  onClick={() => handleCardClick(column3Card.href)}
                  className="bg-white dark:bg-gray-800 border border-border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 group h-full"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 space-y-6">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2 text-xl group-hover:text-foreground/80 transition-colors">
                          {column3Card.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4">
                          {column3Card.subtitle}
                        </p>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {column3Card.description}
                        </p>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-foreground font-semibold text-sm">Project Completion</div>
                            <div className="text-green-600 dark:text-green-400 font-bold text-lg">78%</div>
                          </div>
                          <div className="text-muted-foreground text-xs">Average across all projects</div>
                          <div className="mt-3 bg-green-200 dark:bg-green-800 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-foreground font-semibold text-sm">Team Efficiency</div>
                            <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">+15%</div>
                          </div>
                          <div className="text-muted-foreground text-xs">Improvement this quarter</div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-foreground font-semibold text-sm">Revenue Growth</div>
                            <div className="text-purple-600 dark:text-purple-400 font-bold text-lg">$24.5k</div>
                          </div>
                          <div className="text-muted-foreground text-xs">Generated this month</div>
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
