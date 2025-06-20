
import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

interface TimesheetsHeaderProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  onAddTimeEntry: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TimesheetsHeader = ({ selectedWeek, onWeekChange, onAddTimeEntry, activeTab, onTabChange }: TimesheetsHeaderProps) => {
  const tabs = [
    { id: 'project-log', label: 'Project log', active: activeTab === 'project-log' },
    { id: 'timesheet', label: 'Timesheet', active: activeTab === 'timesheet' },
  ];

  return (
    <div className="border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Timesheets</h1>
          <button 
            onClick={onAddTimeEntry}
            className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent/50 transition-colors"
          >
            <Plus className="w-3 h-3" strokeWidth="2" />
            <span>Add Time Entry</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`text-sm pb-2 border-b-2 transition-colors ${
                  tab.active
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetsHeader;
