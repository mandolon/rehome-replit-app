
import React from 'react';
import { FileText, Plus, Settings, CheckCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceDetails from './InvoiceDetails';
import InvoiceLineItems from './InvoiceLineItems';
import InvoiceTotals from './InvoiceTotals';
import InvoiceSendButton from './InvoiceSendButton';
import InvoiceTable from './InvoiceTable';
import { invoicesData } from '@/data/invoiceData';

interface InvoiceTabsProps {
  lineItems: any[];
  onAddLineItem: () => void;
  onUpdateLineItem: (index: number, field: string, value: string) => void;
  subtotal: number;
  processingFee: number;
  total: number;
}

const InvoiceTabs = ({ 
  lineItems, 
  onAddLineItem, 
  onUpdateLineItem, 
  subtotal, 
  processingFee, 
  total 
}: InvoiceTabsProps) => {
  const handleOpenPDF = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open PDF in new tab - replace with actual PDF URL
    window.open(`/invoices/${invoiceId}.pdf`, '_blank');
    console.log(`Opening PDF for invoice ${invoiceId}`);
  };

  const handleDownloadPDF = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Download PDF - replace with actual download logic
    const link = document.createElement('a');
    link.href = `/invoices/${invoiceId}.pdf`;
    link.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Downloading PDF for invoice ${invoiceId}`);
  };

  return (
    <Tabs defaultValue="invoices" className="flex-1 flex flex-col">
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

      {/* Tab Contents */}
      <div className="px-4 pt-3 flex-1 overflow-hidden">
        <TabsContent value="invoices" className="mt-0 h-full">
          <InvoiceTable
            invoices={invoicesData}
            onOpenPDF={handleOpenPDF}
            onDownloadPDF={handleDownloadPDF}
            showStatus={true}
            showEditIcon={true}
          />
        </TabsContent>

        <TabsContent value="paid" className="mt-0 h-full">
          <InvoiceTable
            invoices={invoicesData.filter(invoice => invoice.status === "Paid")}
            onOpenPDF={handleOpenPDF}
            onDownloadPDF={handleDownloadPDF}
            showStatus={false}
            showEditIcon={false}
          />
        </TabsContent>

        <TabsContent value="unpaid" className="mt-0 h-full">
          <InvoiceTable
            invoices={invoicesData.filter(invoice => invoice.status === "Unpaid")}
            onOpenPDF={handleOpenPDF}
            onDownloadPDF={handleDownloadPDF}
            showStatus={false}
            showEditIcon={false}
          />
        </TabsContent>

        <TabsContent value="new-invoice" className="mt-0 h-full overflow-y-auto">
          <div className="space-y-4 pb-4">
            <InvoiceDetails total={total} />

            <div className="bg-card border rounded-lg p-4">
              <InvoiceLineItems
                lineItems={lineItems}
                onAddLineItem={onAddLineItem}
                onUpdateLineItem={onUpdateLineItem}
              />
              <InvoiceTotals
                subtotal={subtotal}
                processingFee={processingFee}
                total={total}
              />
            </div>

            <InvoiceSendButton />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0 h-full">
          <div className="text-center text-muted-foreground text-xs">Invoice settings coming soon...</div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default InvoiceTabs;
