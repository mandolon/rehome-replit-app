
import React from 'react';

interface InvoiceTotalsProps {
  subtotal: number;
  processingFee: number;
  total: number;
}

const InvoiceTotals = ({ subtotal, processingFee, total }: InvoiceTotalsProps) => {
  return (
    <div className="border-t pt-3 mt-4 space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Processing Fee (3.5%)</span>
        <span className="font-medium">${processingFee.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm font-bold pt-2 border-t">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default InvoiceTotals;
