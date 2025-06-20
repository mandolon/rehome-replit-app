import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Plus, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeLogSectionProps {
  taskId: string;
  currentTimeLogged: string;
  onTimeUpdated: (newTime: string) => void;
}

const TimeLogSection = ({ taskId, currentTimeLogged, onTimeUpdated }: TimeLogSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [timeInput, setTimeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatTime = (timeStr: string) => {
    const hours = parseFloat(timeStr || '0');
    if (hours === 0) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours % 1 === 0) return `${hours}h`;
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const parseTimeInput = (input: string): number => {
    const cleanInput = input.toLowerCase().trim();
    let totalHours = 0;

    // Match patterns like "2h 30m", "1.5h", "90m", "2h", "30m"
    const hourMinuteMatch = cleanInput.match(/(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m)?/);
    const minutesOnlyMatch = cleanInput.match(/^(\d+(?:\.\d+)?)\s*m$/);
    const decimalMatch = cleanInput.match(/^(\d+(?:\.\d+)?)$/);

    if (hourMinuteMatch) {
      const hours = parseFloat(hourMinuteMatch[1]);
      const minutes = hourMinuteMatch[2] ? parseInt(hourMinuteMatch[2]) : 0;
      totalHours = hours + (minutes / 60);
    } else if (minutesOnlyMatch) {
      totalHours = parseFloat(minutesOnlyMatch[1]) / 60;
    } else if (decimalMatch) {
      totalHours = parseFloat(decimalMatch[1]);
    }

    return totalHours;
  };

  const handleAddTime = async () => {
    if (!timeInput.trim()) return;

    setLoading(true);
    try {
      const additionalHours = parseTimeInput(timeInput);
      const currentHours = parseFloat(currentTimeLogged || '0');
      const newTotalHours = currentHours + additionalHours;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeLogged: newTotalHours.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update time');
      }

      onTimeUpdated(newTotalHours.toString());
      setTimeInput('');
      setIsEditing(false);
      
      toast({
        title: "Time logged",
        description: `Added ${formatTime(additionalHours.toString())} to this task`,
      });
    } catch (error) {
      console.error('Error updating time:', error);
      toast({
        title: "Error",
        description: "Failed to log time",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetTime = async () => {
    if (!timeInput.trim()) return;

    setLoading(true);
    try {
      const newHours = parseTimeInput(timeInput);

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeLogged: newHours.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update time');
      }

      onTimeUpdated(newHours.toString());
      setTimeInput('');
      setIsEditing(false);
      
      toast({
        title: "Time updated",
        description: `Set total time to ${formatTime(newHours.toString())}`,
      });
    } catch (error) {
      console.error('Error updating time:', error);
      toast({
        title: "Error",
        description: "Failed to update time",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time Logged
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsEditing(!isEditing);
            setTimeInput('');
          }}
          className="text-xs h-6 px-2"
        >
          {isEditing ? 'Cancel' : <Edit2 className="w-3 h-3" />}
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Time:</span>
          <span className="text-lg font-bold">{formatTime(currentTimeLogged)}</span>
        </div>

        {isEditing && (
          <div className="space-y-2">
            <Input
              placeholder="e.g., 2h 30m, 1.5h, 90m"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTime();
                }
              }}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddTime}
                disabled={loading || !timeInput.trim()}
                className="flex-1 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Time
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSetTime}
                disabled={loading || !timeInput.trim()}
                className="flex-1 text-xs"
              >
                Set Total
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Formats: 2h 30m, 1.5h, 90m, or just 2 (hours)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeLogSection;