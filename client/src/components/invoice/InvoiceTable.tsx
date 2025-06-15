
import React from 'react';
import InvoiceRow from './InvoiceRow';

interface Invoice {
  id: string;
  lastName: string;
  projectAddress: string;
  status: string;
  amount: string;
  dateCreated: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onOpenPDF: (invoiceId: string, e: React.MouseEvent) => void;
  onDownloadPDF: (invoiceId: string, e: React.MouseEvent) => void;
  showStatus?: boolean;
  showEditIcon?: boolean;
}

const InvoiceTable = ({ invoices, onOpenPDF, onDownloadPDF, showStatus = false, showEditIcon = false }: InvoiceTableProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header Row - positioned at the top border */}
      <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground py-1.5 border-b px-4 bg-background sticky top-0">
        <div className="col-span-2">Last Name</div>
        <div className="col-span-3">Project Address</div>
        <div className="col-span-2">Amount</div>
        <div className="col-span-2">Date Created</div>
        <div className="col-span-2">{showStatus ? 'Status' : 'Overdue'}</div>
        <div className="col-span-1">Invoice</div>
      </div>
      
      {/* Invoice Rows - no padding wrapper */}
      <div className="space-y-0.5">
        {invoices.map((invoice, index) => (
          <InvoiceRow
            key={index}
            invoice={invoice}
            onOpenPDF={onOpenPDF}
            onDownloadPDF={onDownloadPDF}
            showStatus={showStatus}
            showEditIcon={showEditIcon}
          />
        ))}
        {invoices.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No invoices found</div>
        )}
      </div>
    </div>
  );
};

export default InvoiceTable;
