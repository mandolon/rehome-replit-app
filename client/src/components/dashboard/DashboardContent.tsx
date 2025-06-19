import React from 'react';
import { LayoutGrid, Users, ClipboardList, FileText, Settings, BarChart3, Calendar, MessageSquare, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardContent = () => {
  // Get current time for greeting
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Column 1: Large cards with different sizes
  const column1Cards = [
    {
      id: 'project-management',
      title: 'Project Management',
      subtitle: '24 active projects',
      description: 'Manage and track all your architectural projects',
      icon: LayoutGrid,
      gradient: 'from-purple-600 to-purple-800',
      size: 'large',
      href: '/tasks'
    },
    {
      id: 'task-updates',
      title: 'Task & Updates',
      subtitle: '156 conversations',
      description: 'Review project updates and task progress',
      icon: ClipboardList,
      gradient: 'from-purple-500 to-purple-700',
      size: 'medium',
      href: '/tasks'
    },
    {
      id: 'team-management',
      title: 'Team Management',
      subtitle: '12 team members',
      description: 'Manage roles and permissions',
      icon: Users,
      gradient: 'from-purple-700 to-purple-900',
      size: 'small',
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
      gradient: 'from-purple-500 to-purple-700',
      href: '/settings'
    },
    {
      id: 'payments-transfers',
      title: 'Payments & Transfers',
      subtitle: '$24.5k this month',
      icon: FileText,
      gradient: 'from-purple-600 to-purple-800',
      href: '/invoices'
    },
    {
      id: 'fraud-security',
      title: 'Fraud & Security',
      subtitle: 'All systems secure',
      icon: Settings,
      gradient: 'from-purple-700 to-purple-900',
      href: '/settings'
    },
    {
      id: 'spending-insights',
      title: 'Spending Insights',
      subtitle: '15% increase',
      icon: BarChart3,
      gradient: 'from-purple-500 to-purple-700',
      href: '/dashboard'
    }
  ];

  // Column 3: Full height card
  const column3Card = {
    id: 'analytics-reports',
    title: 'Analytics & Reports',
    subtitle: 'Performance Dashboard',
    description: 'Comprehensive project analytics, team performance metrics, and detailed reports for all your architectural projects.',
    icon: BarChart3,
    gradient: 'from-purple-600 to-purple-800',
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
    gradient: string;
    href: string;
  }, className = '') => {
    const Icon = card.icon;
    return (
      <div
        key={card.id}
        onClick={() => handleCardClick(card.href)}
        className={cn(
          "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group",
          "bg-gradient-to-br text-white p-6",
          card.gradient,
          className
        )}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/20 -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/10 translate-y-8 -translate-x-8"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <Icon className="w-8 h-8 text-white/90" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white mb-2 text-lg group-hover:text-white/90 transition-colors">
              {card.title}
            </h3>
            
            <p className="text-white/80 text-sm mb-3">
              {card.subtitle}
            </p>
            
            {card.description && (
              <p className="text-white/70 text-xs leading-relaxed">
                {card.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, Admin
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back to your project dashboard
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Projects</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Open Tasks</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">$24.5k</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Column 1: Different sized cards */}
          <div className="flex flex-col gap-6">
            {/* Large card */}
            {renderCard(column1Cards[0], 'h-64')}
            
            {/* Medium card */}
            {renderCard(column1Cards[1], 'h-40')}
            
            {/* Small card */}
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
              className={cn(
                "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-full",
                "bg-gradient-to-br text-white p-8",
                column3Card.gradient
              )}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-12 -translate-x-12"></div>
                <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <BarChart3 className="w-12 h-12 text-white/90" />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-white mb-4 text-2xl group-hover:text-white/90 transition-colors">
                    {column3Card.title}
                  </h3>
                  
                  <p className="text-white/80 text-lg mb-6">
                    {column3Card.subtitle}
                  </p>
                  
                  <p className="text-white/70 text-sm leading-relaxed mb-8">
                    {column3Card.description}
                  </p>

                  {/* Additional content for full height card */}
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white/90 font-semibold mb-1">Project Completion</div>
                      <div className="text-white/70 text-sm">78% average across all projects</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white/90 font-semibold mb-1">Team Efficiency</div>
                      <div className="text-white/70 text-sm">+15% improvement this quarter</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white/90 font-semibold mb-1">Revenue Growth</div>
                      <div className="text-white/70 text-sm">$24.5k generated this month</div>
                    </div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-end mt-6">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
