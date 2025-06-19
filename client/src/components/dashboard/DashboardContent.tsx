import React from 'react';
import { LayoutGrid, Users, ClipboardList, FileText, Settings, BarChart3, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardContent = () => {
  const dashboardCards = [
    {
      id: 'projects',
      title: 'Project Management',
      subtitle: '24 active projects',
      description: 'Manage and track all your projects',
      icon: LayoutGrid,
      gradient: 'from-purple-600 to-purple-700',
      size: 'large',
      href: '/tasks'
    },
    {
      id: 'tasks',
      title: 'Task & Updates',
      subtitle: '156 pending tasks',
      description: 'View and manage task assignments',
      icon: ClipboardList,
      gradient: 'from-blue-600 to-blue-700',
      size: 'medium',
      href: '/tasks'
    },
    {
      id: 'team',
      title: 'Team Management',
      subtitle: '12 team members',
      description: 'Manage team roles and permissions',
      icon: Users,
      gradient: 'from-indigo-600 to-indigo-700',
      size: 'medium',
      href: '/teams'
    },
    {
      id: 'invoices',
      title: 'Invoices & Billing',
      subtitle: '8 pending invoices',
      description: 'Handle client billing and payments',
      icon: FileText,
      gradient: 'from-emerald-600 to-emerald-700',
      size: 'medium',
      href: '/invoices'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      subtitle: 'Performance insights',
      description: 'View project and team analytics',
      icon: BarChart3,
      gradient: 'from-violet-600 to-violet-700',
      size: 'large',
      href: '/dashboard'
    },
    {
      id: 'calendar',
      title: 'Calendar & Schedule',
      subtitle: '5 meetings today',
      description: 'Manage appointments and deadlines',
      icon: Calendar,
      gradient: 'from-orange-600 to-orange-700',
      size: 'medium',
      href: '/calendar'
    },
    {
      id: 'messages',
      title: 'Messages & Communication',
      subtitle: '12 unread messages',
      description: 'Team chat and notifications',
      icon: MessageSquare,
      gradient: 'from-pink-600 to-pink-700',
      size: 'medium',
      href: '/inbox'
    },
    {
      id: 'settings',
      title: 'Settings & Preferences',
      subtitle: 'System configuration',
      description: 'Manage account and system settings',
      icon: Settings,
      gradient: 'from-slate-600 to-slate-700',
      size: 'medium',
      href: '/settings'
    }
  ];

  const handleCardClick = (href: string) => {
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Projects</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Open Tasks</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">$24.5k</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
        </div>
      </div>

      {/* Main card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.href)}
              className={cn(
                "relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group",
                "bg-gradient-to-br text-white",
                card.gradient,
                card.size === 'large' ? 'md:col-span-2 md:row-span-2 p-8' : 'p-6',
                card.size === 'medium' ? 'row-span-1' : ''
              )}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-12 -translate-x-12"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={cn(
                    "text-white/90",
                    card.size === 'large' ? 'w-12 h-12' : 'w-8 h-8'
                  )} />
                </div>

                <div className="flex-1">
                  <h3 className={cn(
                    "font-bold text-white mb-2 group-hover:text-white/90 transition-colors",
                    card.size === 'large' ? 'text-2xl' : 'text-lg'
                  )}>
                    {card.title}
                  </h3>
                  
                  <p className={cn(
                    "text-white/80 mb-3",
                    card.size === 'large' ? 'text-lg' : 'text-sm'
                  )}>
                    {card.subtitle}
                  </p>
                  
                  {card.size === 'large' && (
                    <p className="text-white/70 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-end mt-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardContent;
