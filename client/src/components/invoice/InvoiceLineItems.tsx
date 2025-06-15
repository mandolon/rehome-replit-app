
import React from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LineItem {
  phase: string;
  workDescription: string;
  amount: string;
}

interface InvoiceLineItemsProps {
  lineItems: LineItem[];
  onAddLineItem: () => void;
  onUpdateLineItem: (index: number, field: string, value: string) => void;
}

const InvoiceLineItems = ({ lineItems, onAddLineItem, onUpdateLineItem }: InvoiceLineItemsProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-xs font-medium text-muted-foreground">Phase</div>
        <div className="text-xs font-medium text-muted-foreground">Work Description</div>
        <div className="text-xs font-medium text-muted-foreground">Amount</div>
      </div>

      {lineItems.map((item, index) => (
        <div key={index} className="grid grid-cols-3 gap-3">
          <Select 
            value={item.phase} 
            onValueChange={(value) => onUpdateLineItem(index, 'phase', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="schematic">Schematic Design</SelectItem>
              <SelectItem value="design-dev">Design Development</SelectItem>
              <SelectItem value="construction">Construction Documents</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Placeholder"
            value={item.workDescription}
            onChange={(e) => onUpdateLineItem(index, 'workDescription', e.target.value)}
            className="h-8 text-xs"
          />
          <Input 
            placeholder="Placeholder"
            value={item.amount}
            onChange={(e) => onUpdateLineItem(index, 'amount', e.target.value)}
            type="number"
            className="h-8 text-xs"
          />
        </div>
      ))}

      <button 
        onClick={onAddLineItem}
        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-3 h-3" />
        Add Line Item
      </button>
    </div>
  );
};

export default InvoiceLineItems;
