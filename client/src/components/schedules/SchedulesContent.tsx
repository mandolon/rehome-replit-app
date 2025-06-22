import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Download, Upload, X, Camera, Home, ArrowLeft, Grid } from 'lucide-react';

interface ScheduleItem {
  id: string;
  room: string;
  type: 'fixture' | 'appliance' | 'material';
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
}

const RoomCard = ({ room, itemCount, onClick }: RoomCardProps) => {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-square bg-muted rounded-lg mb-2 flex flex-col items-center justify-center group-hover:bg-muted/80 transition-colors">
        <Home className="w-12 h-12 text-muted-foreground mb-2" />
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
  );
};

const SchedulesContent = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
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
      room: 'Master Bathroom',
      type: 'fixture',
      item: 'Vanity Faucet',
      manufacturer: 'Delta',
      model: 'Trinsic 559LF',
      finish: 'Champagne Bronze',
      comments: 'Single handle, 1.2 GPM'
    },
    {
      id: '4',
      room: 'Master Bathroom',
      type: 'fixture',
      item: 'Shower Head',
      manufacturer: 'Grohe',
      model: 'Rainshower 310',
      finish: 'Chrome',
      comments: 'Rain shower with handheld'
    },
    {
      id: '5',
      room: 'Living Room',
      type: 'fixture',
      item: 'Ceiling Fan',
      manufacturer: 'Hunter',
      model: 'Builder Plus 52"',
      finish: 'Brushed Nickel',
      comments: 'Remote control included'
    },
    {
      id: '6',
      room: 'Guest Bathroom',
      type: 'fixture',
      item: 'Toilet',
      manufacturer: 'American Standard',
      model: 'Champion 4',
      finish: 'White',
      comments: 'Water efficient model'
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

  // Get unique rooms and their item counts
  const roomData = scheduleItems.reduce((acc, item) => {
    if (!acc[item.room]) {
      acc[item.room] = 0;
    }
    acc[item.room]++;
    return acc;
  }, {} as Record<string, number>);

  const rooms = Object.keys(roomData);

  const saveItem = (item: ScheduleItem) => {
    if (editingItem) {
      setScheduleItems(scheduleItems.map(i => i.id === item.id ? item : i));
    } else {
      const newItem = { ...item, id: Date.now().toString() };
      setScheduleItems([...scheduleItems, newItem]);
    }
    setEditingItem(null);
    setIsAddingNew(false);
    setNewItemData({
      room: selectedRoom || '',
      type: 'fixture',
      item: '',
      manufacturer: '',
      model: '',
      finish: '',
      comments: ''
    });
  };

  const deleteItem = (id: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
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
                    onClick={() => setIsAddingNew(true)}
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
            <div className="px-6 py-4 space-y-4">
              {/* Add New Item Form */}
              {isAddingNew && (
                <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">Add New Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Type</label>
                        <Select 
                          value={newItemData.type} 
                          onValueChange={(value: 'fixture' | 'appliance' | 'material') => 
                            setNewItemData({...newItemData, type: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixture">Fixture</SelectItem>
                            <SelectItem value="appliance">Appliance</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Item</label>
                        <Input 
                          value={newItemData.item || ''} 
                          onChange={(e) => setNewItemData({...newItemData, item: e.target.value})}
                          placeholder="e.g., Kitchen Sink"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Manufacturer</label>
                        <Input 
                          value={newItemData.manufacturer || ''} 
                          onChange={(e) => setNewItemData({...newItemData, manufacturer: e.target.value})}
                          placeholder="e.g., Kohler"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Model</label>
                        <Input 
                          value={newItemData.model || ''} 
                          onChange={(e) => setNewItemData({...newItemData, model: e.target.value})}
                          placeholder="e.g., K-6489"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Finish</label>
                        <Input 
                          value={newItemData.finish || ''} 
                          onChange={(e) => setNewItemData({...newItemData, finish: e.target.value})}
                          placeholder="e.g., Stainless Steel"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Comments</label>
                      <Textarea 
                        value={newItemData.comments || ''} 
                        onChange={(e) => setNewItemData({...newItemData, comments: e.target.value})}
                        placeholder="Additional notes or specifications"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => saveItem(newItemData as ScheduleItem)}
                        disabled={!newItemData.item || !newItemData.manufacturer}
                      >
                        Save Item
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsAddingNew(false);
                          setNewItemData({
                            room: selectedRoom || '',
                            type: 'fixture',
                            item: '',
                            manufacturer: '',
                            model: '',
                            finish: '',
                            comments: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Items */}
              {roomItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Item</div>
                          <div className="font-medium">{item.item}</div>
                          <div className="text-xs text-muted-foreground mt-1 capitalize">
                            {item.type}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Specifications</div>
                          <div className="text-sm">{item.manufacturer}</div>
                          <div className="text-sm text-muted-foreground">{item.model}</div>
                          <div className="text-sm text-muted-foreground">{item.finish}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Comments</div>
                          <div className="text-sm">{item.comments || 'No comments'}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {roomItems.length === 0 && (
                <div className="text-center text-muted-foreground italic py-8">
                  No items scheduled for this room yet.
                </div>
              )}
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
          <div className="flex items-center space-x-6">
            <button className="text-sm pb-2 border-b-2 border-primary text-foreground font-medium">
              All Rooms
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room}
                room={room}
                itemCount={roomData[room]}
                onClick={() => setSelectedRoom(room)}
              />
            ))}
          </div>
          {rooms.length === 0 && (
            <div className="text-center text-muted-foreground italic py-8">
              No rooms with scheduled items found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulesContent;