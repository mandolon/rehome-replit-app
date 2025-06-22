import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableTable, type TableColumn, type TableRow } from '@/components/ui/resizable-table';
import { Plus, Download, Upload, X, Camera, Home, ArrowLeft, Grid, ChefHat, ShowerHead, Bed, List } from 'lucide-react';

interface ScheduleItem {
  id: string;
  room: string;
  type: 'fixture' | 'appliance' | 'lighting' | 'window' | 'door';
  item: string;
  manufacturer: string;
  model: string;
  finish: string;
  comments: string;
  image?: string;
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
      room: 'Kitchen',
      type: 'lighting',
      item: 'Under Cabinet LED',
      manufacturer: 'Kichler',
      model: 'Design Pro 3000K',
      finish: 'White',
      comments: 'Linkable strips'
    },
    {
      id: '7',
      room: 'Kitchen',
      type: 'window',
      item: 'Double Hung',
      manufacturer: 'Pella',
      model: 'Impervia',
      finish: 'White',
      comments: 'Energy Star rated'
    },
    {
      id: '8',
      room: 'Kitchen',
      type: 'door',
      item: 'Entry Door',
      manufacturer: 'Therma-Tru',
      model: 'Classic-Craft Canvas',
      finish: 'Cherry',
      comments: 'Fiberglass with decorative glass'
    },
    {
      id: '9',
      room: 'Bathroom',
      type: 'window',
      item: 'Casement',
      manufacturer: 'Andersen',
      model: '400 Series',
      finish: 'White',
      comments: 'Obscure glass for privacy'
    },
    {
      id: '10',
      room: 'Bathroom',
      type: 'door',
      item: 'Interior Door',
      manufacturer: 'Masonite',
      model: 'Heritage',
      finish: 'Primed',
      comments: 'Hollow core, ready for paint'
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

  // Define table columns for fixtures, appliances, and lighting
  const getMainTableColumns = (): TableColumn[] => [
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
      width: 200, // This will be flex-1 (full remaining width)
      minWidth: 150,
      type: 'input',
      placeholder: 'Comments'
    }
  ];

  // Define table columns for windows
  const getWindowTableColumns = (): TableColumn[] => [
    {
      key: 'item',
      title: 'Window Type',
      width: 160,
      minWidth: 120,
      maxWidth: 250,
      type: 'select',
      options: ['Single Hung', 'Double Hung', 'Casement', 'Awning', 'Sliding', 'Bay', 'Bow', 'Picture', 'Hopper', 'Jalousie'],
      allowCustomInput: true,
      customInputPlaceholder: 'Enter custom window type...',
      placeholder: 'Select window type...'
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

  // Define table columns for doors
  const getDoorTableColumns = (): TableColumn[] => [
    {
      key: 'item',
      title: 'Door Type',
      width: 160,
      minWidth: 120,
      maxWidth: 250,
      type: 'select',
      options: ['Entry Door', 'Interior Door', 'French Door', 'Sliding Door', 'Pocket Door', 'Bifold Door', 'Barn Door', 'Storm Door', 'Screen Door', 'Garage Door'],
      allowCustomInput: true,
      customInputPlaceholder: 'Enter custom door type...',
      placeholder: 'Select door type...'
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

  const addNewItem = (itemType: 'fixture' | 'appliance' | 'lighting' | 'window' | 'door' = 'fixture') => {
    if (!selectedRoom) return;
    
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      room: selectedRoom,
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
    const roomItems = scheduleItems.filter(item => item.room === selectedRoom);

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
              {/* Tabs for different item categories */}
              <Tabs defaultValue="fixtures" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fixtures">Fixtures & Appliances</TabsTrigger>
                  <TabsTrigger value="openings">Windows & Doors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fixtures" className="space-y-4">
                  <ResizableTable
                    columns={getMainTableColumns()}
                    data={roomItems.filter(item => ['fixture', 'appliance', 'lighting'].includes(item.type))}
                    onDataChange={(newData) => {
                      const otherItems = scheduleItems.filter(item => 
                        item.room !== selectedRoom || !['fixture', 'appliance', 'lighting'].includes(item.type)
                      );
                      setScheduleItems([...otherItems, ...newData as ScheduleItem[]]);
                    }}
                    onAddRow={() => addNewItem('fixture')}
                    onDeleteRow={(id) => {
                      setScheduleItems(scheduleItems.filter(item => item.id !== id));
                    }}
                    addButtonText="Add Fixture/Appliance"
                    emptyStateText="No fixtures, appliances, or lighting items scheduled for this room yet."
                  />
                </TabsContent>
                
                <TabsContent value="openings" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Windows Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Windows</CardTitle>
                        <CardDescription>Manage window specifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResizableTable
                          columns={getWindowTableColumns()}
                          data={roomItems.filter(item => item.type === 'window')}
                          onDataChange={(newData) => {
                            const otherItems = scheduleItems.filter(item => 
                              item.room !== selectedRoom || item.type !== 'window'
                            );
                            setScheduleItems([...otherItems, ...newData as ScheduleItem[]]);
                          }}
                          onAddRow={() => addNewItem('window')}
                          onDeleteRow={(id) => {
                            setScheduleItems(scheduleItems.filter(item => item.id !== id));
                          }}
                          addButtonText="Add Window"
                          emptyStateText="No windows scheduled for this room yet."
                          className="max-h-96"
                        />
                      </CardContent>
                    </Card>
                    
                    {/* Doors Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Doors</CardTitle>
                        <CardDescription>Manage door specifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResizableTable
                          columns={getDoorTableColumns()}
                          data={roomItems.filter(item => item.type === 'door')}
                          onDataChange={(newData) => {
                            const otherItems = scheduleItems.filter(item => 
                              item.room !== selectedRoom || item.type !== 'door'
                            );
                            setScheduleItems([...otherItems, ...newData as ScheduleItem[]]);
                          }}
                          onAddRow={() => addNewItem('door')}
                          onDeleteRow={(id) => {
                            setScheduleItems(scheduleItems.filter(item => item.id !== id));
                          }}
                          addButtonText="Add Door"
                          emptyStateText="No doors scheduled for this room yet."
                          className="max-h-96"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
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
              <button className="text-sm pb-2 border-b-2 border-primary text-foreground font-medium">
                All Rooms
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
        </div>
      </div>
    </div>
  );
};

export default SchedulesContent;