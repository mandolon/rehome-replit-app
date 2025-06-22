import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableTable, type TableColumn, type TableRow } from '@/components/ui/resizable-table';
import { Plus, Download, Upload, X, Camera, Home, ArrowLeft, Grid, ChefHat, ShowerHead, Bed, List, DoorOpen, Square } from 'lucide-react';

interface ScheduleItem {
  id: string;
  room: string;
  type: 'fixture' | 'appliance' | 'lighting' | 'window' | 'door';
  item?: string;
  manufacturer?: string;
  model?: string;
  finish?: string;
  comments?: string;
  image?: string;
  // Window-specific fields
  number?: string;
  style?: string;
  location?: string;
  orientation?: string;
  windowType?: string;
  width?: string;
  height?: string;
  openingArea?: string;
  headHeight?: string;
  sillHeight?: string;
  material?: string;
  glassType?: string;
  egress?: string;
  // Door-specific fields
  doorType?: string;
  function?: string;
  swing?: string;
  panel?: string;
}

interface RoomCardProps {
  room: string;
  itemCount: number;
  onClick: () => void;
  onDelete?: () => void;
  isDeletable?: boolean;
}

const getRoomIcon = (room: string) => {
  switch (room.toLowerCase()) {
    case 'kitchen':
      return <ChefHat className="w-12 h-12 text-muted-foreground mb-2" />;
    case 'bathroom':
      return <ShowerHead className="w-12 h-12 text-muted-foreground mb-2" />;
    case 'bedroom 1':
      return <Bed className="w-12 h-12 text-muted-foreground mb-2" />;
    default:
      return <Home className="w-12 h-12 text-muted-foreground mb-2" />;
  }
};

const RoomCard = ({ room, itemCount, onClick, onDelete, isDeletable }: RoomCardProps) => {
  return (
    <div className="group cursor-pointer relative">
      <div onClick={onClick}>
        <div className="relative aspect-square bg-muted rounded-lg mb-2 flex flex-col items-center justify-center group-hover:bg-muted/80 transition-colors">
          {getRoomIcon(room)}
          <div className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
            {room}
          </div>
        </div>
      </div>
      {isDeletable && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

const SchedulesContent = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [customRooms, setCustomRooms] = useState<string[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'fixture' | 'appliance' | 'lighting'>('all');
  const [activeTab, setActiveTab] = useState<'appliances-fixtures-lighting' | 'windows-doors'>('appliances-fixtures-lighting');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: '1',
      room: 'Kitchen',
      type: 'appliance',
      item: 'Refrigerator',
      manufacturer: 'Sub-Zero',
      model: 'BI-42SD/S/TH',
      finish: 'Stainless Steel',
      comments: 'Built-in side-by-side with ice maker'
    },
    {
      id: '2',
      room: 'Kitchen',
      type: 'fixture',
      item: 'Kitchen Sink',
      manufacturer: 'Kohler',
      model: 'Whitehaven K-6489',
      finish: 'White Cast Iron',
      comments: 'Farmhouse style, undermount'
    },
    {
      id: '3',
      room: 'Bathroom',
      type: 'fixture',
      item: 'Vanity Faucet',
      manufacturer: 'Delta',
      model: 'Trinsic 559LF',
      finish: 'Champagne Bronze',
      comments: 'Single handle, 1.2 GPM'
    },
    {
      id: '4',
      room: 'Bathroom',
      type: 'fixture',
      item: 'Shower Head',
      manufacturer: 'Grohe',
      model: 'Rainshower 310',
      finish: 'Chrome',
      comments: 'Rain shower with handheld'
    },
    {
      id: '5',
      room: 'Bedroom 1',
      type: 'lighting',
      item: 'Pendant Light',
      manufacturer: 'Progress Lighting',
      model: 'Inspire Collection',
      finish: 'Brushed Nickel',
      comments: 'Dimmable LED compatible'
    },
    {
      id: '6',
      room: 'Living Room',
      type: 'window',
      number: 'W-1',
      style: 'E',
      location: 'LIVING ROOM',
      orientation: 'E',
      windowType: 'DOUBLE HUNG',
      width: "3'-0\"",
      height: "3'-11 3/4\"",
      openingArea: '12 SF',
      headHeight: "7'-7 3/4\"",
      sillHeight: "3'-8\"",
      manufacturer: 'Pella',
      model: 'Architect Series',
      material: 'Vinyl',
      glassType: 'TEMPERED GLASS',
      egress: 'NO',
      comments: 'TEMPERED GLASS'
    },
    {
      id: '7',
      room: 'Kitchen',
      type: 'door',
      number: 'D-1',
      style: 'Exterior',
      function: '',
      swing: '',
      doorType: 'Single',
      panel: '',
      width: "3'-0\"",
      height: "7'-0\"",
      material: 'Wood',
      manufacturer: 'Marvin',
      finish: 'Mahogany',
      comments: ''
    },
    {
      id: '8',
      room: 'Kitchen',
      type: 'lighting',
      item: 'Under Cabinet LED',
      manufacturer: 'Kichler',
      model: 'Design Pro 3000K',
      finish: 'White',
      comments: 'Linkable strips'
    }
  ]);
  
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemData, setNewItemData] = useState<Partial<ScheduleItem>>({
    room: selectedRoom || '',
    type: 'fixture',
    item: '',
    manufacturer: '',
    model: '',
    finish: '',
    comments: ''
  });

  // Define default rooms and get item counts
  const defaultRooms = ['Kitchen', 'Bathroom', 'Bedroom 1'];
  const allRooms = [...defaultRooms, ...customRooms];
  const roomData = scheduleItems.reduce((acc, item) => {
    if (!acc[item.room]) {
      acc[item.room] = 0;
    }
    acc[item.room]++;
    return acc;
  }, {} as Record<string, number>);

  // Ensure all rooms are included even if they have no items
  allRooms.forEach(room => {
    if (!roomData[room]) {
      roomData[room] = 0;
    }
  });

  const rooms = allRooms;

  const updateItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setScheduleItems(scheduleItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Define table columns for the resizable table
  const getTableColumns = (tableType?: 'window' | 'door'): TableColumn[] => {
    if (tableType === 'window') {
      return [
        {
          key: 'number',
          title: 'Window Number',
          width: 120,
          minWidth: 100,
          maxWidth: 150,
          type: 'input',
          placeholder: 'W-1'
        },
        {
          key: 'style',
          title: 'Style',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'select',
          options: ['E', 'S', 'N', 'W'],
          placeholder: 'Style'
        },
        {
          key: 'location',
          title: 'Location',
          width: 120,
          minWidth: 100,
          maxWidth: 150,
          type: 'input',
          placeholder: 'LIVING ROOM'
        },
        {
          key: 'orientation',
          title: 'Orientation (E,S,W,N)',
          width: 140,
          minWidth: 120,
          maxWidth: 180,
          type: 'select',
          options: ['E', 'S', 'W', 'N'],
          placeholder: 'E'
        },
        {
          key: 'windowType',
          title: 'Type',
          width: 120,
          minWidth: 100,
          maxWidth: 150,
          type: 'select',
          options: ['DOUBLE HUNG', 'CASEMENT', 'AWNING', 'SLIDING', 'FIXED', 'BAY', 'BOW'],
          placeholder: 'DOUBLE HUNG'
        },
        {
          key: 'width',
          title: 'Width',
          width: 80,
          minWidth: 70,
          maxWidth: 100,
          type: 'input',
          placeholder: "3'-0\""
        },
        {
          key: 'height',
          title: 'Height',
          width: 80,
          minWidth: 70,
          maxWidth: 100,
          type: 'input',
          placeholder: "3'-11 3/4\""
        },
        {
          key: 'openingArea',
          title: 'Opening Area',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: '12 SF'
        },
        {
          key: 'headHeight',
          title: 'Head Height',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: "7'-7 3/4\""
        },
        {
          key: 'sillHeight',
          title: 'Sill Height',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: "3'-8\""
        },
        {
          key: 'manufacturer',
          title: 'Manufacturer',
          width: 120,
          minWidth: 100,
          maxWidth: 150,
          type: 'input',
          placeholder: 'Manufacturer'
        },
        {
          key: 'model',
          title: 'Model',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: 'Model'
        },
        {
          key: 'material',
          title: 'Material',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: 'Material'
        },
        {
          key: 'glassType',
          title: 'Glass Type',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'select',
          options: ['TEMPERED GLASS', 'LAMINATED GLASS', 'INSULATED GLASS', 'LOW-E GLASS'],
          placeholder: 'TEMPERED GLASS'
        },
        {
          key: 'egress',
          title: 'Egress',
          width: 80,
          minWidth: 70,
          maxWidth: 100,
          type: 'select',
          options: ['YES', 'NO'],
          placeholder: 'NO'
        },
        {
          key: 'comments',
          title: 'Comments',
          width: 200,
          minWidth: 150,
          type: 'input',
          placeholder: 'Comments'
        }
      ];
    } else if (tableType === 'door') {
      return [
        {
          key: 'number',
          title: 'Door Number',
          width: 120,
          minWidth: 100,
          maxWidth: 150,
          type: 'input',
          placeholder: 'D-1'
        },
        {
          key: 'style',
          title: 'Style',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'select',
          options: ['Exterior', 'Interior'],
          placeholder: 'Exterior'
        },
        {
          key: 'function',
          title: 'Function',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: 'Function'
        },
        {
          key: 'swing',
          title: 'Hinge/Swing',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: 'Swing'
        },
        {
          key: 'doorType',
          title: 'Type',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'select',
          options: ['Single', 'Double', 'French', 'Sliding', 'Bi-fold', 'Pocket'],
          placeholder: 'Single'
        },
        {
          key: 'panel',
          title: 'Panel',
          width: 80,
          minWidth: 70,
          maxWidth: 100,
          type: 'input',
          placeholder: 'Panel'
        },
        {
          key: 'width',
          title: 'Width',
          width: 80,
          minWidth: 70,
          maxWidth: 100,
          type: 'input',
          placeholder: "3'-0\""
        },
        {
          key: 'height',
          title: 'Height',
          width: 80,
          minWidth: 70,
          maxWidth: 100,
          type: 'input',
          placeholder: "7'-0\""
        },
        {
          key: 'material',
          title: 'Material',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: 'Material'
        },
        {
          key: 'manufacturer',
          title: 'Manufacturer',
          width: 120,
          minWidth: 100,
          maxWidth: 150,
          type: 'input',
          placeholder: 'Manufacturer'
        },
        {
          key: 'finish',
          title: 'Finish',
          width: 100,
          minWidth: 80,
          maxWidth: 120,
          type: 'input',
          placeholder: 'Finish'
        },
        {
          key: 'comments',
          title: 'Comments',
          width: 200,
          minWidth: 150,
          type: 'input',
          placeholder: 'Comments'
        }
      ];
    } else {
      // Original appliances, fixtures & lighting columns
      return [
        {
          key: 'type',
          title: 'Type',
          width: 96,
          minWidth: 80,
          maxWidth: 120,
          type: 'select',
          options: ['fixture', 'appliance', 'lighting'],
          placeholder: 'Select type...'
        },
        {
          key: 'item',
          title: 'Item',
          width: 160,
          minWidth: 120,
          maxWidth: 250,
          type: 'select',
          options: (rowData: any) => {
            const baseOptions = (() => {
              switch (rowData.type) {
                case 'fixture':
                  return ['Kitchen Sink', 'Bathroom Sink', 'Vanity Faucet', 'Shower Head', 'Bathtub', 'Toilet', 'Kitchen Faucet', 'Shower Valve', 'Towel Bar', 'Grab Bar'];
                case 'appliance':
                  return ['Refrigerator', 'Dishwasher', 'Range', 'Cooktop', 'Oven', 'Microwave', 'Range Hood', 'Garbage Disposal', 'Wine Cooler', 'Ice Maker'];
                case 'lighting':
                  return ['Pendant Light', 'Chandelier', 'Recessed Light', 'Under Cabinet LED', 'Vanity Light', 'Ceiling Fan', 'Wall Sconce', 'Track Light', 'Floor Lamp', 'Table Lamp'];
                default:
                  return [];
              }
            })();
            return baseOptions;
          },
          allowCustomInput: true,
          customInputPlaceholder: 'Enter custom item name...',
          placeholder: 'Select item...'
        },
        {
          key: 'manufacturer',
          title: 'Manufacturer',
          width: 128,
          minWidth: 100,
          maxWidth: 200,
          type: 'input',
          placeholder: 'Manufacturer'
        },
        {
          key: 'model',
          title: 'Model',
          width: 128,
          minWidth: 100,
          maxWidth: 200,
          type: 'input',
          placeholder: 'Model'
        },
        {
          key: 'finish',
          title: 'Finish',
          width: 112,
          minWidth: 80,
          maxWidth: 150,
          type: 'input',
          placeholder: 'Finish'
        },
        {
          key: 'comments',
          title: 'Comments',
          width: 200,
          minWidth: 150,
          type: 'input',
          placeholder: 'Comments'
        }
      ];
    }
  };

  const addNewItem = (itemType: ScheduleItem['type'] = 'fixture') => {
    if (!selectedRoom) return;
    
    // For Windows and Doors, use a generic room assignment since they're category-based
    const roomAssignment = selectedRoom === 'Windows' || selectedRoom === 'Doors' ? 'Various' : selectedRoom;
    
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      room: roomAssignment,
      type: itemType,
      item: '',
      manufacturer: '',
      model: '',
      finish: '',
      comments: ''
    };
    
    setScheduleItems([...scheduleItems, newItem]);
  };



  const deleteItem = (id: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
  };

  const addRoom = () => {
    const trimmedName = newRoomName.trim();
    if (trimmedName && ![...defaultRooms, ...customRooms].includes(trimmedName)) {
      setCustomRooms([...customRooms, trimmedName]);
      setNewRoomName('');
      setIsAddingRoom(false);
    }
  };

  const deleteRoom = (roomToDelete: string) => {
    // Don't allow deletion of default rooms
    if (!defaultRooms.includes(roomToDelete)) {
      setCustomRooms(customRooms.filter(room => room !== roomToDelete));
      // Remove all items from this room
      setScheduleItems(scheduleItems.filter(item => item.room !== roomToDelete));
      // If currently viewing this room, go back to room list
      if (selectedRoom === roomToDelete) {
        setSelectedRoom(null);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Room', 'Type', 'Item', 'Manufacturer', 'Model', 'Finish', 'Comments'];
    const csvContent = [
      headers.join(','),
      ...scheduleItems.map(item => 
        [item.room, item.type, item.item, item.manufacturer, item.model, item.finish, item.comments]
          .map(field => `"${field}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-schedule.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedRoom) {
    const roomItems = selectedRoom === 'Windows' 
      ? scheduleItems.filter(item => item.type === 'window')
      : selectedRoom === 'Doors'
      ? scheduleItems.filter(item => item.type === 'door')
      : scheduleItems.filter(item => item.room === selectedRoom);

    return (
      <div className="flex-1 bg-background overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="border-b border-border">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedRoom(null)}
                    className="p-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-lg font-semibold">{selectedRoom} Schedule</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => addNewItem(
                      selectedRoom === 'Windows' ? 'window' :
                      selectedRoom === 'Doors' ? 'door' : 'fixture'
                    )}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add {selectedRoom === 'Windows' ? 'Window' : selectedRoom === 'Doors' ? 'Door' : 'Item'}
                  </Button>
                  <Button 
                    onClick={exportToCSV}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4">
              {/* Category Filter Controls - only show for regular rooms, not Windows/Doors */}
              {!['Windows', 'Doors'].includes(selectedRoom) && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Filter by:</span>
                  <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                    className="h-7 px-3 text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={categoryFilter === 'fixture' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('fixture')}
                    className="h-7 px-3 text-xs"
                  >
                    Fixtures
                  </Button>
                  <Button
                    variant={categoryFilter === 'appliance' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('appliance')}
                    className="h-7 px-3 text-xs"
                  >
                    Appliances
                  </Button>
                  <Button
                    variant={categoryFilter === 'lighting' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('lighting')}
                    className="h-7 px-3 text-xs"
                  >
                    Lighting
                  </Button>
                </div>
              )}

              {/* Resizable Table */}
              <ResizableTable
                columns={getTableColumns(
                  selectedRoom === 'Windows' ? 'window' : 
                  selectedRoom === 'Doors' ? 'door' : 
                  undefined
                )}
                data={(() => {
                  if (['Windows', 'Doors'].includes(selectedRoom)) {
                    return roomItems;
                  }
                  const filteredItems = categoryFilter === 'all' 
                    ? roomItems 
                    : roomItems.filter(item => item.type === categoryFilter);
                  return filteredItems;
                })()}
                onDataChange={(newData) => {
                  if (selectedRoom === 'Windows') {
                    const otherItems = scheduleItems.filter(item => item.type !== 'window');
                    setScheduleItems([...otherItems, ...newData as ScheduleItem[]]);
                  } else if (selectedRoom === 'Doors') {
                    const otherItems = scheduleItems.filter(item => item.type !== 'door');
                    setScheduleItems([...otherItems, ...newData as ScheduleItem[]]);
                  } else {
                    const otherRoomItems = scheduleItems.filter(item => item.room !== selectedRoom);
                    setScheduleItems([...otherRoomItems, ...newData as ScheduleItem[]]);
                  }
                }}
                onAddRow={() => addNewItem(
                  selectedRoom === 'Windows' ? 'window' :
                  selectedRoom === 'Doors' ? 'door' : 'fixture'
                )}
                onDeleteRow={(id) => {
                  setScheduleItems(scheduleItems.filter(item => item.id !== id));
                }}
                addButtonText={`Add ${selectedRoom === 'Windows' ? 'Window' : selectedRoom === 'Doors' ? 'Door' : 'Item'}`}
                emptyStateText={
                  selectedRoom === 'Windows' ? 'No windows scheduled yet. Click "Add Window" to get started.' :
                  selectedRoom === 'Doors' ? 'No doors scheduled yet. Click "Add Door" to get started.' :
                  categoryFilter === 'all' 
                    ? 'No items scheduled for this room yet. Click "Add Item" to get started.'
                    : `No ${categoryFilter} items found. Add some items or change the filter.`
                }
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">Project Schedules</h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsAddingRoom(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </Button>
              <Button 
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                className={`text-sm pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'appliances-fixtures-lighting' 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('appliances-fixtures-lighting')}
              >
                Appliances, Fixtures & Lighting
              </button>
              <button 
                className={`text-sm pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'windows-doors' 
                    ? 'border-primary text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('windows-doors')}
              >
                Windows & Doors
              </button>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded">
              <Button
                variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          {/* Appliances, Fixtures & Lighting Tab */}
          {activeTab === 'appliances-fixtures-lighting' && (
            <>
              {/* Add Room Dialog */}
              {isAddingRoom && (
                <Card className="mb-4 border-2 border-dashed border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Enter room name (e.g., Master Bedroom, Office)"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addRoom()}
                      />
                      <Button onClick={addRoom} size="sm">
                        Add
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsAddingRoom(false);
                          setNewRoomName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Card View */}
              {viewMode === 'card' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room}
                      room={room}
                      itemCount={roomData[room]}
                      onClick={() => setSelectedRoom(room)}
                      onDelete={() => deleteRoom(room)}
                      isDeletable={!defaultRooms.includes(room)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-2">
                  {rooms.map((room) => {
                    const roomItems = scheduleItems.filter(item => item.room === room);
                    const categoryCount = {
                      fixtures: roomItems.filter(item => item.type === 'fixture').length,
                      appliances: roomItems.filter(item => item.type === 'appliance').length,
                      lighting: roomItems.filter(item => item.type === 'lighting').length
                    };
                    const lastUpdated = "Recently"; // Could be calculated from actual data

                    return (
                      <div 
                        key={room} 
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 rounded-lg cursor-pointer border bg-background"
                        onClick={() => setSelectedRoom(room)}
                      >
                        <div className="flex-shrink-0">
                          {getRoomIcon(room)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm flex gap-2 items-center">
                            {room}
                            {!defaultRooms.includes(room) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteRoom(room);
                                }}
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {categoryCount.fixtures > 0 && `${categoryCount.fixtures} fixtures`}
                            {categoryCount.appliances > 0 && `${categoryCount.fixtures > 0 ? ', ' : ''}${categoryCount.appliances} appliances`}
                            {categoryCount.lighting > 0 && `${(categoryCount.fixtures > 0 || categoryCount.appliances > 0) ? ', ' : ''}${categoryCount.lighting} lighting`}
                            {roomData[room] === 0 && 'No items'}
                          </div>
                          <div className="text-xs text-muted-foreground">{lastUpdated}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {roomData[room]} {roomData[room] === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {rooms.length === 0 && (
                <div className="text-center text-muted-foreground italic py-8">
                  No rooms found. Click "Add Room" to create your first room.
                </div>
              )}
            </>
          )}

          {/* Windows & Doors Tab */}
          {activeTab === 'windows-doors' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Windows Card */}
              <div className="group cursor-pointer relative">
                <div onClick={() => setSelectedRoom('Windows')}>
                  <div className="relative aspect-square bg-muted rounded-lg mb-2 flex flex-col items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <Square className="w-12 h-12 text-muted-foreground mb-2" />
                    <div className="text-xs text-muted-foreground">
                      {scheduleItems.filter(item => item.type === 'window').length} {scheduleItems.filter(item => item.type === 'window').length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      Windows
                    </div>
                  </div>
                </div>
              </div>

              {/* Doors Card */}
              <div className="group cursor-pointer relative">
                <div onClick={() => setSelectedRoom('Doors')}>
                  <div className="relative aspect-square bg-muted rounded-lg mb-2 flex flex-col items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <DoorOpen className="w-12 h-12 text-muted-foreground mb-2" />
                    <div className="text-xs text-muted-foreground">
                      {scheduleItems.filter(item => item.type === 'door').length} {scheduleItems.filter(item => item.type === 'door').length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      Doors
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulesContent;