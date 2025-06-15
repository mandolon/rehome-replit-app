
import React, { useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import InvoiceActionsMenu from './InvoiceActionsMenu';

interface Invoice {
  id: string;
  lastName: string;
  projectAddress: string;
  status: string;
  amount: string;
  dateCreated: string;
}

interface InvoiceRowProps {
  invoice: Invoice;
  onOpenPDF: (invoiceId: string, e: React.MouseEvent) => void;
  onDownloadPDF: (invoiceId: string, e: React.MouseEvent) => void;
  showStatus?: boolean;
  showEditIcon?: boolean;
}

const InvoiceRow = React.memo(({ invoice, onOpenPDF, onDownloadPDF, showStatus = false, showEditIcon = false }: InvoiceRowProps) => {
  const calculateOverdueDays = useCallback((dateCreated: string) => {
    const created = new Date(dateCreated);
    const today = new Date();
    const diffTime = today.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Assuming invoices are due 30 days after creation
    const overdueDays = diffDays - 30;
    
    if (overdueDays <= 0) {
      return "Not overdue";
    }
    
    return `${overdueDays} days`;
  }, []);

  const handleMove = useCallback((invoiceId: string) => {
    console.log(`Moving invoice ${invoiceId}`);
    // Add move logic here
  }, []);

  const handleDelete = useCallback((invoiceId: string) => {
    console.log(`Deleting invoice ${invoiceId}`);
    // Add delete logic here
  }, []);

  const handleOpenPDF = useCallback((e: React.MouseEvent) => {
    onOpenPDF(invoice.id, e);
  }, [onOpenPDF, invoice.id]);

  const handleDownloadPDF = useCallback((e: React.MouseEvent) => {
    onDownloadPDF(invoice.id, e);
  }, [onDownloadPDF, invoice.id]);

  const overdueDisplay = useMemo(() => 
    showStatus ? invoice.status : calculateOverdueDays(invoice.dateCreated),
    [showStatus, invoice.status, invoice.dateCreated, calculateOverdueDays]
  );

  return (
    <div className="grid grid-cols-12 gap-3 text-xs py-2 hover:bg-accent/50 rounded cursor-pointer border-b border-border/30 group px-4">
      <div className="col-span-2 text-muted-foreground">{invoice.lastName}</div>
      <div className="col-span-3 text-muted-foreground">{invoice.projectAddress}</div>
      <div className="col-span-2 text-muted-foreground">{invoice.amount}</div>
      <div className="col-span-2 text-muted-foreground">{invoice.dateCreated}</div>
      <div className="col-span-2 text-muted-foreground">
        {overdueDisplay}
      </div>
      <div className="col-span-1 flex items-center justify-between pr-2">
        <button 
          onClick={handleOpenPDF}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          {invoice.id}
        </button>
        {showEditIcon ? (
          <InvoiceActionsMenu 
            invoiceId={invoice.id}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        ) : (
          <button 
            onClick={handleDownloadPDF}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          >
            <Download className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
});

InvoiceRow.displayName = 'InvoiceRow';

export default InvoiceRow;
