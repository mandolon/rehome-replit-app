
// Ensure consistent spacing/title by using only PageSectionHeader

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import InvoiceTabs from '@/components/invoice/InvoiceTabs';
import PageSectionHeader from '@/components/shared/PageSectionHeader';

const InvoicePage = () => {
  const [lineItems, setLineItems] = useState([
    { phase: '', workDescription: '', amount: '' }
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, { phase: '', workDescription: '', amount: '' }]);
  };

  const updateLineItem = (index: number, field: string, value: string) => {
    const updatedItems = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const subtotal = calculateSubtotal();
  const processingFee = subtotal * 0.035;
  const total = subtotal + processingFee;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <PageSectionHeader title="Invoices" />
        <div className="flex-1 flex flex-col max-w-6xl mx-auto pt-0">
          <InvoiceTabs
            lineItems={lineItems}
            onAddLineItem={addLineItem}
            onUpdateLineItem={updateLineItem}
            subtotal={subtotal}
            processingFee={processingFee}
            total={total}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default InvoicePage;
