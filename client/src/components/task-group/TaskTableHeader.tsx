
import React from 'react';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TaskTableHeader = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border">
          <TableHead className="text-xs py-1.5 w-[50%] pl-8 h-auto align-baseline font-medium text-muted-foreground">Name</TableHead>
          <TableHead className="text-xs py-1.5 w-[8%] h-auto align-baseline font-medium text-muted-foreground">Files</TableHead>
          <TableHead className="text-xs py-1.5 w-[17%] h-auto align-baseline font-medium text-muted-foreground">Date Created</TableHead>
          <TableHead className="text-xs py-1.5 w-[25%] h-auto align-baseline font-medium text-muted-foreground">Assigned to</TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  );
};

export default TaskTableHeader;
