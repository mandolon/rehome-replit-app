import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Clock, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkRecord {
  id: string;
  name: string;
  dateCreated: string;
  timeLogged: string;
  dateClosed: string;
  createdBy: string;
  status: 'complete' | 'in-progress' | 'pending';
}

interface WorkRecordsTableProps {
  searchTerm: string;
  filters: {
    status: string;
    project: string;
    dateRange: string;
  };
  refreshTrigger: number;
}

const WorkRecordsTable = ({ searchTerm, filters, refreshTrigger }: WorkRecordsTableProps) => {
  // Mock data that matches the provided image structure
  const workRecords: WorkRecord[] = [
    {
      id: '1',
      name: 'Update',
      dateCreated: '6/28/22',
      timeLogged: '2h',
      dateClosed: '11/1/22',
      createdBy: 'Add time',
      status: 'complete'
    },
    {
      id: '2',
      name: 'Plan Check corrections - 10 foot wall',
      dateCreated: '6/27/23',
      timeLogged: 'Add time',
      dateClosed: '10/1/22',
      createdBy: 'Add time',
      status: 'complete'
    },
    {
      id: '3',
      name: 'Update',
      dateCreated: '8/18/23',
      timeLogged: 'Add time',
      dateClosed: '8/10/22',
      createdBy: 'Add time',
      status: 'complete'
    },
    {
      id: '4',
      name: 'Subpenal move - minor revision',
      dateCreated: '8/17/22',
      timeLogged: 'Add time',
      dateClosed: '8/16/22',
      createdBy: 'Add time',
      status: 'complete'
    },
    {
      id: '5',
      name: 'Update',
      dateCreated: '8/16/22',
      timeLogged: 'Add time',
      dateClosed: '8/16/22',
      createdBy: 'Add time',
      status: 'complete'
    },
    {
      id: '6',
      name: 'Update 06.15.22',
      dateCreated: '6/14/22',
      timeLogged: 'Add time',
      dateClosed: '8/14/22',
      createdBy: 'Add time',
      status: 'complete'
    }
  ];

  const filteredRecords = workRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || record.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">COMPLETE</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">IN PROGRESS</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PENDING</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-background rounded-lg border border-border">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-border" />
          <span className="text-sm font-medium text-muted-foreground">Tasks</span>
          <span className="text-xs text-muted-foreground">({filteredRecords.length})</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium w-8"></th>
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium w-24">Date created</th>
              <th className="text-left py-3 px-4 font-medium w-24">Time logged</th>
              <th className="text-left py-3 px-4 font-medium w-24">Date closed</th>
              <th className="text-left py-3 px-4 font-medium w-24">Created by</th>
              <th className="text-left py-3 px-4 font-medium w-24">Status</th>
              <th className="text-right py-3 px-4 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record, index) => (
              <tr 
                key={record.id} 
                className="border-b border-border hover:bg-muted/30 transition-colors text-sm"
              >
                <td className="py-3 px-4">
                  <input type="checkbox" className="rounded border-border" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded text-xs flex items-center justify-center text-blue-600 font-medium">
                      {record.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{record.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{record.dateCreated}</td>
                <td className="py-3 px-4">
                  {record.timeLogged === 'Add time' ? (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                      <Clock className="w-3 h-3 mr-1" />
                      Add time
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">{record.timeLogged}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground">{record.dateClosed}</td>
                <td className="py-3 px-4">
                  {record.createdBy === 'Add time' ? (
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                      <User className="w-3 h-3 mr-1" />
                      Add time
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">{record.createdBy}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {getStatusBadge(record.status)}
                </td>
                <td className="py-3 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Mark other options:</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 text-xs">Done</Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs">Date</Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs">Done</Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs">Date</Button>
            </div>
          </div>
          <span>{filteredRecords.length} items</span>
        </div>
      </div>
    </div>
  );
};

export default WorkRecordsTable;