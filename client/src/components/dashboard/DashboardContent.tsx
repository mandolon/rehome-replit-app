import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import DashboardStats from './DashboardStats';
import OpenTasksListSummary from "./OpenTasksListSummary";

const DashboardContent = () => {
  const monthlyData = [
    { name: 'Jan', projects: 4, tasks: 24 },
    { name: 'Feb', projects: 3, tasks: 18 },
    { name: 'Mar', projects: 6, tasks: 32 },
    { name: 'Apr', projects: 8, tasks: 45 },
    { name: 'May', projects: 5, tasks: 28 },
    { name: 'Jun', projects: 7, tasks: 38 },
  ];

  const projectStatusData = [
    { name: 'In Progress', value: 12, color: '#3b82f6' },
    { name: 'On Hold', value: 3, color: '#f59e0b' },
    { name: 'Completed', value: 9, color: '#10b981' },
  ];

  const recentActivities = [
    { action: 'Project "Piner Haus Garage" updated', time: '2 hours ago', user: 'Matthew P.' },
    { action: 'New task assigned to Armando L.', time: '4 hours ago', user: 'System' },
    { action: 'Invoice #RH15465 sent to client', time: '6 hours ago', user: 'Kenneth A.' },
    { action: 'Team meeting scheduled for tomorrow', time: '1 day ago', user: 'Matthew P.' },
  ];

  return (
    <div className="space-y-4">
      <OpenTasksListSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="projects" fill="#3b82f6" />
                <Bar dataKey="tasks" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Status</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex justify-between items-start p-2 bg-muted/50 rounded text-xs">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground text-xs">{activity.user}</p>
                  </div>
                  <span className="text-muted-foreground text-xs whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              <button className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded text-xs font-medium text-blue-700">
                Create New Project
              </button>
              <button className="w-full text-left p-2 bg-green-50 hover:bg-green-100 rounded text-xs font-medium text-green-700">
                Add Task
              </button>
              <button className="w-full text-left p-2 bg-purple-50 hover:bg-purple-100 rounded text-xs font-medium text-purple-700">
                Generate Invoice
              </button>
              <button className="w-full text-left p-2 bg-orange-50 hover:bg-orange-100 rounded text-xs font-medium text-orange-700">
                Schedule Meeting
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
