import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  hideRowNumbers?: boolean;
  autoNumberField?: string;
  numberPrefix?: string;
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
  className = "",
  hideRowNumbers = false,
  autoNumberField = "",
  numberPrefix = ""
}) => {
  const [columns, setColumns] = useState(initialColumns);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [enterPressCount, setEnterPressCount] = useState<{[key: string]: number}>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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
    
    // Check for duplicate numbers if this is the auto-number field
    if (autoNumberField && field === autoNumberField && value) {
      const duplicates = newData.filter(row => row[field] === value && row.id !== rowId);
      if (duplicates.length > 0) {
        // Don't update if it would create a duplicate
        return;
      }
    }
    
    onDataChange(newData);
  };

  const generateNextNumber = () => {
    if (!autoNumberField || !numberPrefix) return '';
    
    const existingNumbers = data
      .map(row => row[autoNumberField])
      .filter((num): num is string => Boolean(num && num.startsWith(numberPrefix)))
      .map(num => {
        const match = num.match(new RegExp(`^${numberPrefix}-(\\d+)$`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => !isNaN(num) && num > 0);
    
    if (existingNumbers.length === 0) {
      return `${numberPrefix}-1`;
    }
    
    // Find the highest number and add 1
    const maxNumber = Math.max(...existingNumbers);
    return `${numberPrefix}-${maxNumber + 1}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, currentIndex: number, column: string) => {
    const currentColumn = columns.find(col => col.key === column);
    const isSelectColumn = currentColumn?.type === 'select';
    const isInputColumn = currentColumn?.type === 'input';
    const isCheckboxColumn = currentColumn?.type === 'checkbox';
    const cellKey = `${rowId}-${column}`;
    const isInEditMode = editingCell === cellKey;
    const dropdownKey = `${currentIndex}-${column}`;
    const isDropdownOpen = openDropdown === dropdownKey;
    
    // Check if any dropdown is currently open
    const hasOpenDropdown = document.querySelector('[data-state="open"]') !== null;
    
    // Arrow key navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // If dropdown is open, let it handle navigation internally
      if (hasOpenDropdown && isSelectColumn) {
        return; // Don't prevent default, let dropdown handle it
      }
      
      // Otherwise handle cell navigation
      e.preventDefault();
      const newIndex = e.key === 'ArrowUp' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(data.length - 1, currentIndex + 1);
      
      setFocusedRowIndex(newIndex);
      setTimeout(() => {
        const nextInput = document.querySelector(`[data-row="${newIndex}"][data-column="${column}"]`) as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
      return;
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Allow text cursor movement in edit mode
      if (isInEditMode && isInputColumn) {
        return; // Don't prevent default, allow text cursor movement
      }
      
      // Otherwise handle column navigation
      e.preventDefault();
      const currentColumnIndex = columns.findIndex(col => col.key === column);
      const newColumnIndex = e.key === 'ArrowLeft'
        ? Math.max(0, currentColumnIndex - 1)
        : Math.min(columns.length - 1, currentColumnIndex + 1);
      const newColumn = columns[newColumnIndex];
      
      setTimeout(() => {
        const nextInput = document.querySelector(`[data-row="${currentIndex}"][data-column="${newColumn.key}"]`) as HTMLElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
      return;
    }
    
    // Enter key handling
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // For checkboxes - toggle directly
      if (isCheckboxColumn) {
        const currentRow = data[currentIndex];
        const currentValue = !!currentRow[column];
        const newValue = !currentValue;
        
        if (column === 'existing' || column === 'new') {
          const otherKey = column === 'existing' ? 'new' : 'existing';
          updateRowData(rowId, otherKey, false);
        }
        updateRowData(rowId, column, newValue);
        return;
      }
      
      // For dropdowns - activate dropdown
      if (isSelectColumn) {
        setOpenDropdown(dropdownKey);
        
        // The cell element IS the button trigger for select columns
        setTimeout(() => {
          const selectTrigger = document.querySelector(`[data-row="${currentIndex}"][data-column="${column}"]`) as HTMLButtonElement;
          
          if (selectTrigger && selectTrigger.tagName === 'BUTTON') {
            selectTrigger.focus();
            selectTrigger.click();
          }
        }, 10);
        return;
      }
      
      // For inputs - handle edit mode and double enter
      if (isInputColumn) {
        const enterKey = `${rowId}-${column}`;
        const currentCount = enterPressCount[enterKey] || 0;
        
        if (!isInEditMode) {
          // First enter - activate edit mode
          setEditingCell(cellKey);
          setEnterPressCount({ ...enterPressCount, [enterKey]: 1 });
          setTimeout(() => {
            setEnterPressCount(prev => {
              const newCount = { ...prev };
              delete newCount[enterKey];
              return newCount;
            });
          }, 1000);
        } else {
          // In edit mode - check for double enter
          if (currentCount === 1) {
            // Second enter - move to next column or add row
            const currentValue = (e.target as HTMLInputElement).value;
            
            // Apply dimension formatting
            if (currentColumn && (currentColumn.key === 'width' || currentColumn.key === 'height')) {
              const formatDimension = (value: string) => {
                const cleanValue = value.trim();
                let match = cleanValue.match(/^(\d+)\s+(\d+)$/);
                if (match) return `${match[1]}'-${match[2]}"`;
                match = cleanValue.match(/^(\d+)$/);
                if (match) return `${match[1]}'-0"`;
                match = cleanValue.match(/^(\d+)\.(\d+)$/);
                if (match) {
                  const wholeFeet = match[1];
                  const decimal = parseFloat('0.' + match[2]);
                  const inches = Math.round(decimal * 12);
                  return `${wholeFeet}'-${inches}"`;
                }
                return value;
              };
              const formattedValue = formatDimension(currentValue);
              if (formattedValue !== currentValue) {
                updateRowData(rowId, column, formattedValue);
              }
            }
            
            const currentColumnIndex = columns.findIndex(col => col.key === column);
            const isLastColumn = currentColumnIndex === columns.length - 1;
            
            setEditingCell(null);
            setEnterPressCount({});
            
            if (isLastColumn) {
              onAddRow();
            } else {
              moveToNextField(currentIndex, column);
            }
          } else {
            // First enter in edit mode - track for double enter
            setEnterPressCount({ ...enterPressCount, [enterKey]: 1 });
            setTimeout(() => {
              setEnterPressCount(prev => {
                const newCount = { ...prev };
                delete newCount[enterKey];
                return newCount;
              });
            }, 1000);
          }
        }
      }
      return;
    }
    
    // Escape key - exit edit mode and close dropdowns
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEnterPressCount({});
      setOpenDropdown(null);
      return;
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
            disabled={isExistingNewPair && isOtherChecked}
            onChange={(e) => {
              const checked = e.target.checked;
              if (isExistingNewPair) {
                // Always uncheck the other box first
                updateRowData(row.id, otherKey, false);
                // Then set this box to the checked state
                updateRowData(row.id, column.key, checked);
              } else {
                updateRowData(row.id, column.key, checked);
              }
            }}
            className={`w-4 h-4 ${isHalfTone ? 'opacity-40' : ''} ${isExistingNewPair && isOtherChecked ? 'cursor-not-allowed opacity-50' : ''}`}
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

      const dropdownKey = `${rowIndex}-${column.key}`;
      
      return (
        <Select 
          value={row[column.key]} 
          onValueChange={(value) => {
            handleSelectChange(row.id, column.key, value, column.allowCustomInput);
            setOpenDropdown(null);
          }}
          onOpenChange={(open) => {
            if (open) {
              setOpenDropdown(dropdownKey);
            } else {
              setOpenDropdown(null);
            }
          }}
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
      // Auto-format dimension inputs for width and height columns
      if (column.key === 'width' || column.key === 'height') {
        // Handle various input patterns
        const cleanValue = value.trim();
        
        // Pattern: "1 0", "3 4", "12 6", etc. (feet and inches separated by space)
        let match = cleanValue.match(/^(\d+)\s+(\d+)$/);
        if (match) {
          const feet = match[1];
          const inches = match[2];
          return `${feet}'-${inches}"`;
        }
        
        // Pattern: single number (treat as feet)
        match = cleanValue.match(/^(\d+)$/);
        if (match) {
          const feet = match[1];
          return `${feet}'-0"`;
        }
        
        // Pattern: decimal number (convert to feet and inches)
        match = cleanValue.match(/^(\d+)\.(\d+)$/);
        if (match) {
          const wholeFeet = match[1];
          const decimal = parseFloat('0.' + match[2]);
          const inches = Math.round(decimal * 12);
          return `${wholeFeet}'-${inches}"`;
        }
      }
      return value;
    };

    // Special handling for number field with fixed prefix
    if (column.key === 'number' && (numberPrefix === 'W' || numberPrefix === 'D')) {
      const currentValue = row[column.key] || '';
      const prefix = numberPrefix + '-';
      const numberPart = currentValue.replace(prefix, '');
      
      return (
        <div className="flex items-center h-6">
          <span className="text-xs text-muted-foreground mr-1">{prefix}</span>
          <Input 
            value={numberPart} 
            onChange={(e) => {
              const newValue = prefix + e.target.value;
              updateRowData(row.id, column.key, newValue);
            }}
            onBlur={() => {
              setEditingCell(null);
            }}
            onFocus={() => {
              setEditingCell(`${row.id}-${column.key}`);
            }}
            className="h-6 border-0 shadow-none bg-transparent focus:bg-muted/30 px-0 w-full"
            style={{ fontSize: '0.75rem' }}
            placeholder="1"
            data-row={rowIndex}
            data-column={column.key}
            onKeyDown={(e) => handleKeyDown(e, row.id, rowIndex, column.key)}
          />
        </div>
      );
    }

    return (
      <Input 
        value={row[column.key] || ''} 
        onChange={(e) => {
          updateRowData(row.id, column.key, e.target.value);
        }}
        onBlur={(e) => {
          // Apply formatting on blur
          const formattedValue = formatDimension(e.target.value);
          if (formattedValue !== e.target.value) {
            updateRowData(row.id, column.key, formattedValue);
          }
          setEditingCell(null);
        }}
        onFocus={() => {
          setEditingCell(`${row.id}-${column.key}`);
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
          <ScrollArea className="h-[400px] w-full">
            <div className="min-w-fit">
              {/* Table Header */}
              <div className="flex py-2 px-0 text-xs font-medium text-muted-foreground sticky top-0 z-10 bg-background" style={{ borderBottom: '1px solid #bbbbbb' }}>
                {!hideRowNumbers && <div className="w-12 flex-shrink-0 pl-3 pr-2">#</div>}
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
              {!hideRowNumbers && (
                <div className="w-12 flex-shrink-0 pl-3 pr-2 text-xs text-muted-foreground flex items-center">
                  {index + 1}
                </div>
              )}
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
            </div>
          </ScrollArea>

          {/* Add Button */}
          {showAddButton && (
            <div className="flex py-2 px-0">
              {!hideRowNumbers && <div className="w-12 flex-shrink-0 pl-3"></div>}
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