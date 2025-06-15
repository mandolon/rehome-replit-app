
import React from 'react';
import { Bell, Settings, HelpCircle, Users } from 'lucide-react';

interface DashboardPageHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardPageHeader = ({ activeTab, onTabChange }: DashboardPageHeaderProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'notes', label: 'Notes' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <div className="border-b border-border">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="text-xs">Agents</span>
              <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs font-medium">2</span>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700">Ask AI</button>
            <button className="text-xs text-gray-600 hover:text-gray-700">Share</button>
            <button className="text-xs text-gray-600 hover:text-gray-700">Chat</button>
            <Bell className="w-4 h-4 text-muted-foreground cursor-pointer" />
            <Settings className="w-4 h-4 text-muted-foreground cursor-pointer" />
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-pointer" />
          </div>
        </div>
      </div>
      
      <div className="px-3">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPageHeader;
