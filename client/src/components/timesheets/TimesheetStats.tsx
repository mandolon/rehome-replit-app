
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react';

interface TimesheetStatsProps {
  selectedWeek: Date;
  refreshTrigger: number;
}

const TimesheetStats = ({ selectedWeek, refreshTrigger }: TimesheetStatsProps) => {
  // Mock data - in real app, this would be calculated from actual time entries
  const stats = {
    totalHours: 38.5,
    targetHours: 40,
    billableHours: 32.5,
    projectCount: 4
  };

  const completionPercentage = Math.round((stats.totalHours / stats.targetHours) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-0 shadow-none bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">Total Hours</CardTitle>
          <Clock className="w-3 h-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-lg font-bold">{stats.totalHours}h</div>
          <p className="text-xs text-muted-foreground">
            {completionPercentage}% of target
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">Target Hours</CardTitle>
          <Target className="w-3 h-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-lg font-bold">{stats.targetHours}h</div>
          <p className="text-xs text-muted-foreground">
            Weekly goal
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">Billable Hours</CardTitle>
          <TrendingUp className="w-3 h-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-lg font-bold">{stats.billableHours}h</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.billableHours / stats.totalHours) * 100)}% billable
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">Projects</CardTitle>
          <Calendar className="w-3 h-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="text-lg font-bold">{stats.projectCount}</div>
          <p className="text-xs text-muted-foreground">
            Active this week
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetStats;
