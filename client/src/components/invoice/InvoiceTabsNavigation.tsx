
import React from 'react';
import { FileText, Plus, Settings, CheckCircle, Clock } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const InvoiceTabsNavigation = () => {
  return (
    <div className="border-b border-border px-4 flex-shrink-0">
      <TabsList className="h-auto p-0 bg-transparent">
        <TabsTrigger 
          value="invoices" 
          className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent"
        >
          <FileText className="w-3 h-3" />
          Invoices
        </TabsTrigger>
        <TabsTrigger 
          value="paid" 
          className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent"
        >
          <CheckCircle className="w-3 h-3" />
          Paid
        </TabsTrigger>
        <TabsTrigger 
          value="unpaid" 
          className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent"
        >
          <Clock className="w-3 h-3" />
          Unpaid
        </TabsTrigger>
        <TabsTrigger 
          value="new-invoice" 
          className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent"
        >
          <Plus className="w-3 h-3" />
          New Invoice
        </TabsTrigger>
        <TabsTrigger 
          value="settings" 
          className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none bg-transparent"
        >
          <Settings className="w-3 h-3" />
          Settings
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default InvoiceTabsNavigation;
