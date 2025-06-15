
import React from 'react';
import { Button } from '@/components/ui/button';

const InvoiceSendButton = () => {
  return (
    <div className="flex justify-end">
      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-8 text-xs">
        📧 Send Invoice
      </Button>
    </div>
  );
};

export default InvoiceSendButton;
