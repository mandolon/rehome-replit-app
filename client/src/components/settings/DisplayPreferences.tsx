
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface DisplayPreferencesProps {
  showOnlineStatus: boolean;
  showLastActive: boolean;
  onShowOnlineStatusChange: (value: boolean) => void;
  onShowLastActiveChange: (value: boolean) => void;
}

const DisplayPreferences = ({ 
  showOnlineStatus, 
  showLastActive, 
  onShowOnlineStatusChange, 
  onShowLastActiveChange 
}: DisplayPreferencesProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Display Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-online-status" className="text-sm">
            Show online status
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {showOnlineStatus ? 'Enabled' : 'Disabled'}
            </span>
            <Switch
              id="show-online-status"
              checked={showOnlineStatus}
              onCheckedChange={onShowOnlineStatusChange}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-last-active" className="text-sm">
            Show last active
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {showLastActive ? 'Enabled' : 'Disabled'}
            </span>
            <Switch
              id="show-last-active"
              checked={showLastActive}
              onCheckedChange={onShowLastActiveChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayPreferences;
