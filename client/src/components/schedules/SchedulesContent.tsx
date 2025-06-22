import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Download, Upload, X, Camera } from 'lucide-react';

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

const SchedulesContent = () => {
  const [rooms, setRooms] = useState(['Kitchen', 'Living Room', 'Bathroom']);
  const [newRoom, setNewRoom] = useState('');
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
    }
  ]);
  
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const addRoom = () => {
    if (newRoom.trim() && !rooms.includes(newRoom.trim())) {
      setRooms([...rooms, newRoom.trim()]);
      setNewRoom('');
    }
  };

  const removeRoom = (roomToRemove: string) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter(room => room !== roomToRemove));
      setScheduleItems(scheduleItems.filter(item => item.room !== roomToRemove));
    }
  };

  const addNewItem = () => {
    setEditingItem({
      id: Date.now().toString(),
      room: rooms[0],
      type: 'fixture',
      item: '',
      manufacturer: '',
      model: '',
      finish: '',
      comments: ''
    });
    setIsAddingNew(true);
  };

  const saveItem = (item: ScheduleItem) => {
    if (isAddingNew) {
      setScheduleItems([...scheduleItems, item]);
      setIsAddingNew(false);
    } else {
      setScheduleItems(scheduleItems.map(existing => 
        existing.id === item.id ? item : existing
      ));
    }
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
  };

  const downloadSchedule = () => {
    const content = scheduleItems.map(item => 
      `${item.room} - ${item.type.toUpperCase()}\n` +
      `Item: ${item.item}\n` +
      `Manufacturer: ${item.manufacturer}\n` +
      `Model: ${item.model}\n` +
      `Finish: ${item.finish}\n` +
      `Comments: ${item.comments}\n` +
      '-------------------\n'
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-schedule.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setScheduleItems(scheduleItems.map(item =>
          item.id === itemId ? { ...item, image: imageUrl } : item
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const groupedItems = rooms.reduce((acc, room) => {
    acc[room] = scheduleItems.filter(item => item.room === room);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  return (
    <div className="flex-1 bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="max-w-7xl mx-auto space-y-6 pb-8">
            
            {/* Header Card */}
            <Card className="border-0 shadow-none bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Fixture, Material & Appliance Schedules
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      Manage and track selections for residential projects. Add items, upload photos, and export schedules for construction documents.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addNewItem} size="sm" className="text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Item
                    </Button>
                    <Button onClick={downloadSchedule} variant="outline" size="sm" className="text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Download Schedule
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Room Management */}
            <Card className="border-0 shadow-none bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Manage Rooms</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  {rooms.map(room => (
                    <div key={room} className="flex items-center bg-muted/50 rounded-lg px-2 py-1">
                      <span className="text-xs font-medium mr-2">{room}</span>
                      {rooms.length > 1 && (
                        <button
                          onClick={() => removeRoom(room)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new room..."
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && addRoom()}
                  />
                  <Button onClick={addRoom} size="sm" variant="outline" className="text-xs">
                    Add Room
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Items by Room */}
            {rooms.map(room => (
              <Card key={room} className="border-0 shadow-none bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">{room}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {groupedItems[room]?.length || 0} items
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Photo</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Type</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Item</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Manufacturer</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Model</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Finish</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Comments</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground py-2 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedItems[room]?.map(item => (
                          <tr key={item.id} className="border-b border-border/20">
                            <td className="py-2 px-2">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.item}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-muted/50 rounded flex items-center justify-center">
                                  <Camera className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(item.id, e)}
                                className="hidden"
                                id={`image-${item.id}`}
                              />
                              <label
                                htmlFor={`image-${item.id}`}
                                className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 block mt-1"
                              >
                                {item.image ? 'Change' : 'Upload'}
                              </label>
                            </td>
                            <td className="py-2 px-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                item.type === 'fixture' ? 'bg-blue-100 text-blue-800' :
                                item.type === 'appliance' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-xs font-medium">{item.item}</td>
                            <td className="py-2 px-2 text-xs">{item.manufacturer}</td>
                            <td className="py-2 px-2 text-xs">{item.model}</td>
                            <td className="py-2 px-2 text-xs">{item.finish}</td>
                            <td className="py-2 px-2 text-xs">{item.comments}</td>
                            <td className="py-2 px-2">
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => setEditingItem(item)}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6 px-2"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => deleteItem(item.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6 px-2 text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!groupedItems[room] || groupedItems[room].length === 0) && (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        No items in {room} yet. Click "Add Item" to get started.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Edit/Add Item Modal */}
            {editingItem && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <Card className="border-0 shadow-lg bg-background w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      {isAddingNew ? 'Add New Item' : 'Edit Item'}
                    </CardTitle>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Room</label>
                      <Select
                        value={editingItem.room}
                        onValueChange={(value) => setEditingItem({...editingItem, room: value})}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map(room => (
                            <SelectItem key={room} value={room}>{room}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Type</label>
                      <Select
                        value={editingItem.type}
                        onValueChange={(value) => setEditingItem({...editingItem, type: value as 'fixture' | 'appliance' | 'material'})}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixture">Fixture</SelectItem>
                          <SelectItem value="appliance">Appliance</SelectItem>
                          <SelectItem value="material">Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Item</label>
                    <Input
                      value={editingItem.item}
                      onChange={(e) => setEditingItem({...editingItem, item: e.target.value})}
                      className="text-xs"
                      placeholder="e.g., Kitchen Sink, Refrigerator, Tile"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Manufacturer</label>
                      <Input
                        value={editingItem.manufacturer}
                        onChange={(e) => setEditingItem({...editingItem, manufacturer: e.target.value})}
                        className="text-xs"
                        placeholder="e.g., Kohler, Sub-Zero"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Model</label>
                      <Input
                        value={editingItem.model}
                        onChange={(e) => setEditingItem({...editingItem, model: e.target.value})}
                        className="text-xs"
                        placeholder="e.g., K-6489, BI-42SD/S/TH"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Finish</label>
                    <Input
                      value={editingItem.finish}
                      onChange={(e) => setEditingItem({...editingItem, finish: e.target.value})}
                      className="text-xs"
                      placeholder="e.g., Stainless Steel, Champagne Bronze"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Comments</label>
                    <Textarea
                      value={editingItem.comments}
                      onChange={(e) => setEditingItem({...editingItem, comments: e.target.value})}
                      className="text-xs"
                      placeholder="Additional notes or specifications"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => saveItem(editingItem)}
                      className="text-xs"
                      disabled={!editingItem.item || !editingItem.manufacturer}
                    >
                      {isAddingNew ? 'Add Item' : 'Save Changes'}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingItem(null);
                        setIsAddingNew(false);
                      }}
                      variant="outline"
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
                </Card>
              </div>
            )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SchedulesContent;