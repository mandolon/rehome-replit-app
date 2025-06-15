
import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

interface TimesheetsHeaderProps {
  selectedWeek: Date;
  onWeekChange: (date: Date) => void;
  onAddTimeEntry: () => void;
}

const TimesheetsHeader = ({ selectedWeek, onWeekChange, onAddTimeEntry }: TimesheetsHeaderProps) => {
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

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
          <div className="flex items-center gap-1">
            <button
              onClick={() => onWeekChange(subWeeks(selectedWeek, 1))}
              className="flex items-center justify-center w-7 h-7 text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent/50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
            </div>
            <button
              onClick={() => onWeekChange(addWeeks(selectedWeek, 1))}
              className="flex items-center justify-center w-7 h-7 text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent/50 transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onWeekChange(new Date())}
              className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded hover:bg-accent/50 transition-colors ml-2"
            >
              Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetsHeader;
