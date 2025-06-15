
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Reminder {
  id: number;
  title: string;
  date: string;
  time: string;
}

const CalendarTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 1,
      title: 'Note #1',
      date: '10.12.24',
      time: '12:00 PM'
    },
    {
      id: 2,
      title: 'Note #2',
      date: '11.24.24',
      time: '1:00 PM'
    }
  ]);

  const handleCreateReminder = () => {
    const newReminder: Reminder = {
      id: reminders.length + 1,
      title: `Note #${reminders.length + 1}`,
      date: new Date().toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit' 
      }),
      time: '12:00 PM'
    };
    setReminders([...reminders, newReminder]);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="p-4 space-y-6">
      {/* Calendar Section */}
      <div className="bg-background rounded-lg border p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{monthYear}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Component */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full"
        />
      </div>

      {/* Reminders Section */}
      <div className="space-y-4">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-1.5 border-b">
              <div className="col-span-6">Reminder</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-3">Time</div>
            </div>
            
            {/* Reminder Rows */}
            {reminders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No reminders found
              </div>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30">
                  <div className="col-span-6 text-foreground">{reminder.title}</div>
                  <div className="col-span-3 text-muted-foreground">{reminder.date}</div>
                  <div className="col-span-3 text-muted-foreground">{reminder.time}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Reminder Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleCreateReminder}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            Create Reminder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
