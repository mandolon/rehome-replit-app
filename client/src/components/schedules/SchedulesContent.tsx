import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Download, Upload, X, Camera, Home, ArrowLeft, Grid, ChefHat, ShowerHead, Bed, List } from 'lucide-react';

interface ScheduleItem {
  id: string;
  room: string;
  type: 'fixture' | 'appliance' | 'lighting';
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

  const addNewItem = (category?: 'fixture' | 'appliance' | 'lighting') => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      room: selectedRoom || '',
      type: category || 'fixture',
      item: '',
      manufacturer: '',
      model: '',
      finish: '',
      comments: ''
    };
    setScheduleItems([...scheduleItems, newItem]);
  };

  const addNewItemForCategory = (category: 'fixture' | 'appliance' | 'lighting') => () => {
    addNewItem(category);
  };

  // Group items by category for display
  const groupItemsByCategory = (items: ScheduleItem[]) => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, ScheduleItem[]>);

    return grouped;
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
    const groupedItems = groupItemsByCategory(roomItems);
    const categoryOrder: ('fixture' | 'appliance' | 'lighting')[] = ['fixture', 'appliance', 'lighting'];
    const categoryLabels = {
      fixture: 'Fixtures',
      appliance: 'Appliances', 
      lighting: 'Lighting'
    };

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
                    onClick={() => addNewItem()}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
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
            <div className="px-6 py-2">
              {/* Single Table with Category Sections */}
              <div className="space-y-1">
                {roomItems.length > 0 && (
                  <>
                    {/* Single Table Header */}
                    <div className="grid grid-cols-7 gap-2 py-2 px-3 bg-muted/50 rounded-md text-xs font-medium text-muted-foreground sticky top-0 z-10">
                      <div>Type</div>
                      <div>Item</div>
                      <div>Manufacturer</div>
                      <div>Model</div>
                      <div>Finish</div>
                      <div>Comments</div>
                      <div className="w-8"></div>
                    </div>

                    {/* Category Sections */}
                    {categoryOrder.map((category, categoryIndex) => {
                      const categoryItems = groupedItems[category] || [];
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category}>
                          {/* Category Divider */}
                          {categoryIndex > 0 && (
                            <div className="py-1">
                              <div className="border-t border-border"></div>
                            </div>
                          )}
                          
                          {/* Category Label with Add Button */}
                          <div className="grid grid-cols-7 gap-2 py-1 px-3">
                            <div className="col-span-7 flex items-center justify-between">
                              <div className="text-xs font-medium text-muted-foreground">
                                {categoryLabels[category]}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={addNewItemForCategory(category)}
                                className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>

                          {/* Category Items */}
                          {categoryItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-7 gap-2 py-2 px-3 bg-background border rounded-md hover:bg-muted/30 transition-colors">
                              <div>
                                <Select 
                                  value={item.type} 
                                  onValueChange={(value: 'fixture' | 'appliance' | 'lighting') => 
                                    updateItem(item.id, 'type', value)
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fixture">Fixture</SelectItem>
                                    <SelectItem value="appliance">Appliance</SelectItem>
                                    <SelectItem value="lighting">Lighting</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Input 
                                  value={item.item} 
                                  onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Item name"
                                />
                              </div>
                              <div>
                                <Input 
                                  value={item.manufacturer} 
                                  onChange={(e) => updateItem(item.id, 'manufacturer', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Manufacturer"
                                />
                              </div>
                              <div>
                                <Input 
                                  value={item.model} 
                                  onChange={(e) => updateItem(item.id, 'model', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Model"
                                />
                              </div>
                              <div>
                                <Input 
                                  value={item.finish} 
                                  onChange={(e) => updateItem(item.id, 'finish', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Finish"
                                />
                              </div>
                              <div>
                                <Input 
                                  value={item.comments} 
                                  onChange={(e) => updateItem(item.id, 'comments', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Comments"
                                />
                              </div>
                              <div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteItem(item.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}

                {roomItems.length === 0 && (
                  <div className="text-center text-muted-foreground italic py-8 text-sm">
                    No items scheduled for this room yet. Click "Add Item" to get started.
                  </div>
                )}
              </div>
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
                const groupedItems = groupItemsByCategory(roomItems);
                const categoryCount = {
                  fixtures: groupedItems.fixture?.length || 0,
                  appliances: groupedItems.appliance?.length || 0,
                  lighting: groupedItems.lighting?.length || 0
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