
import React from 'react';
import { Download } from 'lucide-react';

const InvoicesTab = () => {
  const invoices = [
    {
      id: "RH15465",
      phase: "Schematic Design",
      status: "Paid",
      amount: "$304.65",
      dateCreated: "Jan 12, 2023, 8:00 AM"
    },
    {
      id: "RH65842",
      phase: "June 15",
      status: "Sent",
      amount: "$304.65",
      dateCreated: "Jan 12, 2023, 8:00 AM"
    },
    {
      id: "RH15465",
      phase: "June 15",
      status: "June 15",
      amount: "$304.65",
      dateCreated: "Jan 12, 2023, 8:00 AM"
    },
    {
      id: "RH15465",
      phase: "June 15",
      status: "June 15",
      amount: "$304.65",
      dateCreated: "Jan 12, 2023, 8:00 AM"
    },
    {
      id: "RH15465",
      phase: "June 15",
      status: "June 15",
      amount: "$304.65",
      dateCreated: "Jan 12, 2023, 8:00 AM"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 mt-0">
      <div className="space-y-0.5">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-1.5 border-b">
          <div className="col-span-2">Invoice</div>
          <div className="col-span-3">Phase</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-3">Date Created</div>
        </div>
        
        {/* Invoice Rows */}
        {invoices.map((invoice, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30 group">
            <div className="col-span-2">
              <span className="text-blue-600 hover:underline">{invoice.id}</span>
            </div>
            <div className="col-span-3 text-muted-foreground">{invoice.phase}</div>
            <div className="col-span-2 text-muted-foreground">{invoice.status}</div>
            <div className="col-span-2 text-muted-foreground">{invoice.amount}</div>
            <div className="col-span-3 flex items-center justify-between">
              <span className="text-muted-foreground">{invoice.dateCreated}</span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                <Download className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicesTab;
