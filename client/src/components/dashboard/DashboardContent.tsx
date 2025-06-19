import React from 'react';
import { LayoutGrid, Users, ClipboardList, FileText, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardContent = () => {

  // Column 1: Different sized cards
  const column1Cards = [
    {
      id: 'project-management',
      title: 'Project Management',
      subtitle: '24 active projects',
      description: 'Manage and track all your projects',
      icon: LayoutGrid,
      href: '/tasks'
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
    icon: any;
    href: string;
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
        <div className="h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              {card.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {card.subtitle}
            </p>
            
            {card.description && (
              <p className="text-gray-500 dark:text-gray-500 text-xs leading-relaxed">
                {card.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-background pl-2 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="px-4 pt-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Column 1: Different sized cards */}
            <div className="flex flex-col gap-4">
              {renderCard(column1Cards[0], 'h-64')}
              {renderCard(column1Cards[1], 'h-40')}
              {renderCard(column1Cards[2], 'flex-1')}
            </div>

            {/* Column 2: Uniform smaller cards */}
            <div className="grid grid-cols-1 gap-4 content-start">
              {column2Cards.map((card) => renderCard(card, 'h-32'))}
            </div>

            {/* Column 3: Full height card */}
            <div className="h-full">
              <div
                onClick={() => handleCardClick(column3Card.href)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 group h-full"
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <BarChart3 className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-xl group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      {column3Card.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-base mb-6">
                      {column3Card.subtitle}
                    </p>
                    
                    <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed mb-6">
                      {column3Card.description}
                    </p>

                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-gray-900 dark:text-white font-medium text-sm mb-1">Project Completion</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs">78% average across all projects</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-gray-900 dark:text-white font-medium text-sm mb-1">Team Efficiency</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs">+15% improvement this quarter</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-gray-900 dark:text-white font-medium text-sm mb-1">Revenue Growth</div>
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
  );
};

export default DashboardContent;
