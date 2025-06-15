
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DashboardStats = () => {
  const stats = [
    { label: 'Total Projects', value: '24', change: '+12%' },
    { label: 'Active Tasks', value: '156', change: '+8%' },
    { label: 'Completed This Month', value: '89', change: '+23%' },
    { label: 'Team Members', value: '12', change: '+2%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
