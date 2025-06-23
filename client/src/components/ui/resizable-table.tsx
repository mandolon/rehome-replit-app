import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

export interface TableColumn {
  key: string;
  title: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  type: 'input' | 'select' | 'custom' | 'checkbox';
  options?: string[] | ((rowData: any) => string[]);
  placeholder?: string;
  allowCustomInput?: boolean;
  customInputPlaceholder?: string;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

interface ResizableTableProps {
  columns: TableColumn[];
  data: TableRow[];
  onDataChange: (data: TableRow[]) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  showAddButton?: boolean;
  addButtonText?: string;
  emptyStateText?: string;
  className?: string;
}

export const ResizableTable: React.FC<ResizableTableProps> = ({
  columns: initialColumns,
  data,
  onDataChange,
  onAddRow,
  onDeleteRow,
  showAddButton = true,
  addButtonText = "Add Item",
  emptyStateText = "No items yet. Click 'Add Item' to get started.",
  className = ""
}) => {
  const [columns, setColumns] = useState(initialColumns);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const tableRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Load saved column widths from localStorage
  useEffect(() => {
    const savedWidths = localStorage.getItem('table-column-widths');
    if (savedWidths) {
      try {
        const widths = JSON.parse(savedWidths);
        setColumns(prev => prev.map(col => ({
          ...col,
          width: widths[col.key] || col.width
        })));
      } catch (e) {
        console.warn('Failed to load saved column widths');
      }
    }
  }, []);

  // Save column widths to localStorage
  const saveColumnWidths = (newColumns: TableColumn[]) => {
    const widths = newColumns.reduce((acc, col) => {
      acc[col.key] = col.width;
      return acc;
    }, {} as Record<string, number>);
    localStorage.setItem('table-column-widths', JSON.stringify(widths));
  };

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setIsResizing(columnKey);
    startXRef.current = e.clientX;
    const column = columns.find(col => col.key === columnKey);
    startWidthRef.current = column?.width || 0;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(
      50, // Minimum width
      Math.min(400, startWidthRef.current + deltaX) // Maximum width
    );

    setColumns(prev => {
      const newColumns = prev.map(col => 
        col.key === isResizing 
          ? { ...col, width: newWidth }
          : col
      );
      saveColumnWidths(newColumns);
      return newColumns;
    });
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const updateRowData = (rowId: string, field: string, value: any) => {
    const newData = data.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    );
    onDataChange(newData);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, currentIndex: number, column: string) => {
    const currentColumn = columns.find(col => col.key === column);
    const isSelectColumn = currentColumn?.type === 'select';
    const isInputColumn = currentColumn?.type === 'input';
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.max(0, currentIndex - 1);
      setFocusedRowIndex(newIndex);
      setTimeout(() => {
        const nextInput = document.querySelector(`[data-row="${newIndex}"][data-column="${column}"]`) as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    } else if (e.key === 'ArrowDown') {
      // For select columns, let the dropdown open naturally
      if (isSelectColumn) {
        return; // Don't prevent default, let select handle it
      }
      
      // For input columns, enter edit mode (focus)
      if (isInputColumn) {
        const input = e.target as HTMLInputElement;
        if (input && document.activeElement !== input) {
          input.focus();
          return;
        }
      }
      
      // Navigate to next row
      e.preventDefault();
      const newIndex = Math.min(data.length - 1, currentIndex + 1);
      setFocusedRowIndex(newIndex);
      setTimeout(() => {
        const nextInput = document.querySelector(`[data-row="${newIndex}"][data-column="${column}"]`) as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentColumnIndex = columns.findIndex(col => col.key === column);
      const prevColumnIndex = Math.max(0, currentColumnIndex - 1);
      const prevColumn = columns[prevColumnIndex];
      setTimeout(() => {
        const prevInput = document.querySelector(`[data-row="${currentIndex}"][data-column="${prevColumn.key}"]`) as HTMLElement;
        if (prevInput) {
          prevInput.focus();
        }
      }, 10);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currentColumnIndex = columns.findIndex(col => col.key === column);
      const nextColumnIndex = Math.min(columns.length - 1, currentColumnIndex + 1);
      const nextColumn = columns[nextColumnIndex];
      setTimeout(() => {
        const nextInput = document.querySelector(`[data-row="${currentIndex}"][data-column="${nextColumn.key}"]`) as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentColumnIndex = columns.findIndex(col => col.key === column);
      const isLastColumn = currentColumnIndex === columns.length - 1;
      
      if (isLastColumn) {
        onAddRow();
      } else {
        moveToNextField(currentIndex, column);
      }
    }
  };

  const moveToNextField = (rowIndex: number, currentColumn: string) => {
    const currentColumnIndex = columns.findIndex(col => col.key === currentColumn);
    const nextColumnIndex = currentColumnIndex + 1;
    
    if (nextColumnIndex < columns.length) {
      const nextColumn = columns[nextColumnIndex];
      setTimeout(() => {
        const nextInput = document.querySelector(`[data-row="${rowIndex}"][data-column="${nextColumn.key}"]`) as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    }
  };

  const handleSelectChange = (rowId: string, columnKey: string, value: string, hasCustomInput?: boolean) => {
    if (value === 'Other' && hasCustomInput) {
      updateRowData(rowId, columnKey, '');
      setCustomInputs({ ...customInputs, [`${rowId}-${columnKey}`]: 'custom' });
    } else {
      updateRowData(rowId, columnKey, value);
      const newCustomInputs = { ...customInputs };
      delete newCustomInputs[`${rowId}-${columnKey}`];
      setCustomInputs(newCustomInputs);
    }
  };

  const renderCell = (row: TableRow, column: TableColumn, rowIndex: number) => {
    const cellKey = `${row.id}-${column.key}`;
    const isCustomInput = customInputs[cellKey] === 'custom';

    if (column.type === 'checkbox') {
      const isChecked = !!row[column.key];
      const isExistingNewPair = column.key === 'existing' || column.key === 'new';
      const otherKey = column.key === 'existing' ? 'new' : 'existing';
      const isOtherChecked = isExistingNewPair && !!row[otherKey];
      const isHalfTone = isExistingNewPair && !isChecked && isOtherChecked;

      return (
        <div className="flex items-center justify-center h-full py-1">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              const checked = e.target.checked;
              // For mutually exclusive checkboxes (existing/new), uncheck the other
              if (checked && isExistingNewPair) {
                updateRowData(row.id, otherKey, false);
              }
              updateRowData(row.id, column.key, checked);
            }}
            className={`w-4 h-4 ${isHalfTone ? 'opacity-40' : ''}`}
            style={isHalfTone ? { filter: 'contrast(0.5)' } : {}}
            data-row={rowIndex}
            data-column={column.key}
            onKeyDown={(e) => handleKeyDown(e, row.id, rowIndex, column.key)}
          />
        </div>
      );
    }

    if (column.type === 'select' && !isCustomInput) {
      const options = typeof column.options === 'function' 
        ? column.options(row) 
        : column.options || [];

      return (
        <Select 
          value={row[column.key]} 
          onValueChange={(value) => handleSelectChange(row.id, column.key, value, column.allowCustomInput)}
        >
          <SelectTrigger 
            className="h-6 border-0 shadow-none bg-transparent focus:bg-muted/30 px-0 w-full" 
            style={{ fontSize: '0.75rem' }}
            data-row={rowIndex}
            data-column={column.key}
            onKeyDown={(e) => handleKeyDown(e, row.id, rowIndex, column.key)}
          >
            <SelectValue placeholder={column.placeholder}>
              {row[column.key] && column.key === 'type' 
                ? row[column.key].charAt(0).toUpperCase() + row[column.key].slice(1)
                : row[column.key]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {column.key === 'type' ? option.charAt(0).toUpperCase() + option.slice(1) : option}
              </SelectItem>
            ))}
            {column.allowCustomInput && (
              <SelectItem value="Other">Other</SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    }

    const formatDimension = (value: string) => {
      // Auto-format dimension inputs like "1 0" to "1'-0""
      if (column.key === 'width' || column.key === 'height') {
        // Match patterns like "1 0", "3 4", "12 6", etc.
        const match = value.match(/^(\d+)\s+(\d+)$/);
        if (match) {
          const feet = match[1];
          const inches = match[2];
          return `${feet}'-${inches}"`;
        }
      }
      return value;
    };

    return (
      <Input 
        value={row[column.key] || ''} 
        onChange={(e) => {
          const formattedValue = formatDimension(e.target.value);
          updateRowData(row.id, column.key, formattedValue);
        }}
        onBlur={(e) => {
          // Apply formatting on blur as well
          const formattedValue = formatDimension(e.target.value);
          if (formattedValue !== e.target.value) {
            updateRowData(row.id, column.key, formattedValue);
          }
        }}
        className="h-6 border-0 shadow-none bg-transparent focus:bg-muted/30 px-0 w-full"
        style={{ fontSize: '0.75rem' }}
        placeholder={isCustomInput ? column.customInputPlaceholder : column.placeholder}
        data-row={rowIndex}
        data-column={column.key}
        onKeyDown={(e) => handleKeyDown(e, row.id, rowIndex, column.key)}
        autoFocus={isCustomInput}
      />
    );
  };

  return (
    <div className={`space-y-0 ${className}`} ref={tableRef}>
      {data.length > 0 ? (
        <>
          {/* Table Header */}
          <div className="flex py-2 px-0 text-xs font-medium text-muted-foreground sticky top-0 z-10 bg-background" style={{ borderBottom: '1px solid #bbbbbb' }}>
            <div className="w-12 flex-shrink-0 pl-3 pr-2">#</div>
            {columns.map((column, index) => (
              <div 
                key={column.key}
                className="flex-shrink-0 px-2 relative group"
                style={{ width: `${column.width}px` }}
              >
                {column.title}
                {index < columns.length - 1 && (
                  <div 
                    className="absolute -right-2 top-0 bottom-0 w-4 cursor-col-resize hover:bg-blue-500/20 flex items-center justify-center"
                    onMouseDown={(e) => handleMouseDown(e, column.key)}
                  >
                    <div className="w-0.5 h-full bg-gray-300 group-hover:bg-blue-500/30" />
                  </div>
                )}
              </div>
            ))}

            <div className="w-8 flex-shrink-0 pr-3"></div>
          </div>

          {/* Table Rows */}
          {data.map((row, index) => (
            <div 
              key={row.id} 
              className={`flex py-1 px-0 hover:bg-muted/30 transition-colors group ${
                focusedRowIndex === index ? 'bg-muted/50' : ''
              }`}
              style={{ borderBottom: '1px solid #bbbbbb' }}
              tabIndex={0}
            >
              <div className="w-12 flex-shrink-0 pl-3 pr-2 text-xs text-muted-foreground flex items-center">
                {index + 1}
              </div>
              {columns.slice(0, -1).map((column) => (
                <div key={column.key} className="flex-shrink-0 px-2 hover:bg-muted/50 dark:hover:bg-muted/70 transition-colors" style={{ width: `${column.width}px` }}>
                  {renderCell(row, column, index)}
                </div>
              ))}
              <div className="flex-1 min-w-0 px-2 hover:bg-muted/50 dark:hover:bg-muted/70 transition-colors">
                {renderCell(row, columns[columns.length - 1], index)}
              </div>
              <div className="w-8 flex-shrink-0 pr-3 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteRow(row.id)}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Button */}
          {showAddButton && (
            <div className="flex py-2 px-0">
              <div className="w-12 flex-shrink-0 pl-3"></div>
              <div className="flex-1 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddRow}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {addButtonText}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground italic py-8 text-sm">
          {emptyStateText}
        </div>
      )}
    </div>
  );
};