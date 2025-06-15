
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Field {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: 'input' | 'textarea';
  readOnly?: boolean;
  placeholder?: string;
  span?: 'full' | 'half';
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

interface InformationSectionProps {
  title: string;
  fields: Field[];
}

const InformationSection = ({ title, fields }: InformationSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((field, index) => (
          <div key={index} className={field.span === 'full' ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <Textarea
                value={field.value}
                onChange={(e) => field.onChange?.(e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                onKeyDown={field.onKeyDown}
                className="min-h-[60px] text-xs"
              />
            ) : (
              <Input
                value={field.value}
                onChange={(e) => field.onChange?.(e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                onKeyDown={field.onKeyDown}
                className="h-8 text-xs"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformationSection;
