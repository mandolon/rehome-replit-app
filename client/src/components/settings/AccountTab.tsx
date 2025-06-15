
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/contexts/UserContext';

const AccountTab = () => {
  const { currentUser, updateUser } = useUser();

  return (
    <div className="p-6 max-w-2xl">
      <div className="space-y-8">
        {/* Email Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email</h3>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={currentUser.email}
              onChange={(e) => updateUser({ email: e.target.value })}
            />
          </div>
          <Button variant="outline" size="sm">Change email</Button>
        </div>

        <Separator />

        {/* Password Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Password</h3>
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button variant="outline" size="sm">Update password</Button>
        </div>

        <Separator />

        {/* Security Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Security</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-factor authentication</span>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active sessions</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Data Management</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Export your data</span>
              <Button variant="outline" size="sm">Request export</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Delete account</span>
              <Button variant="destructive" size="sm">Delete account</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
