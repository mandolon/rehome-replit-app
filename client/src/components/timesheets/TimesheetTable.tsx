import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TimesheetTableProps {
  selectedWeek: Date;
  refreshTrigger: number;
}

const TimesheetTable = ({ selectedWeek, refreshTrigger }: TimesheetTableProps) => {
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock time entries data
  const timeEntries = [
    {
      id: 1,
      project: 'Ogden • Thew • 2709 T Street',
      task: 'Schematic Design Review',
      monday: 2.5,
      tuesday: 0,
      wednesday: 3.0,
      thursday: 2.0,
      friday: 1.5,
      saturday: 0,
      sunday: 0,
      billable: true
    },
    {
      id: 2,
      project: 'Acme Corp Headquarters',
      task: 'Site Analysis',
      monday: 4.0,
      tuesday: 4.0,
      wednesday: 3.5,
      thursday: 4.0,
      friday: 4.0,
      saturday: 0,
      sunday: 0,
      billable: true
    },
    {
      id: 3,
      project: 'Internal - Training',
      task: 'Software Training',
      monday: 1.0,
      tuesday: 0,
      wednesday: 0,
      thursday: 1.0,
      friday: 0,
      saturday: 0,
      sunday: 0,
      billable: false
    }
  ];

  const getDayValue = (entry: typeof timeEntries[0], dayIndex: number) => {
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return entry[dayKeys[dayIndex] as keyof typeof entry] as number;
  };

  const getTotalForEntry = (entry: typeof timeEntries[0]) => {
    return entry.monday + entry.tuesday + entry.wednesday + entry.thursday + entry.friday + entry.saturday + entry.sunday;
  };

  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold">Time Entries</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="w-[180px] text-xs font-medium text-muted-foreground h-8">Project</TableHead>
              <TableHead className="w-[160px] text-xs font-medium text-muted-foreground h-8">Phase</TableHead>
              {weekDays.map((day, index) => (
                <TableHead key={index} className="text-center w-[70px] h-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">
                      {format(day, 'EEE')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(day, 'M/d')}
                    </span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-center w-[70px] text-xs font-medium text-muted-foreground h-8">Total</TableHead>
              <TableHead className="w-[100px] text-xs font-medium text-muted-foreground h-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id} className="border-0 hover:bg-muted/50">
                <TableCell className="font-medium py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${entry.billable ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs truncate">{entry.project}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-xs text-muted-foreground">{entry.task}</span>
                </TableCell>
                {weekDays.map((_, dayIndex) => (
                  <TableCell key={dayIndex} className="text-center py-2">
                    <span className="text-xs">
                      {getDayValue(entry, dayIndex) > 0 ? `${getDayValue(entry, dayIndex)}h` : '-'}
                    </span>
                  </TableCell>
                ))}
                <TableCell className="text-center font-medium py-2">
                  <span className="text-xs">{getTotalForEntry(entry)}h</span>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TimesheetTable;
