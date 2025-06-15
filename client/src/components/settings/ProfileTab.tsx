import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { ARCHITECTURE_ROLES, ROLE_DISPLAY_NAMES } from '@/types/roles';
import AvatarUpload from './AvatarUpload';
import DisplayPreferences from './DisplayPreferences';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
];

const ProfileTab = () => {
  const { currentUser, updateUser } = useUser();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    bio: currentUser.bio || '',
    company: currentUser.company || '',
    role: currentUser.role,
    showOnlineStatus: currentUser.showOnlineStatus,
    showLastActive: currentUser.showLastActive,
    avatarColor: currentUser.avatarColor || 'bg-blue-500', // new
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (file: File) => {
    console.log('Avatar file selected:', file);
    // In a real app, this would upload the file and update the avatar URL
  };

  const handleAvatarColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, avatarColor: color }));
  };

  const handleSave = () => {
    updateUser(formData);
    console.log('Profile updated:', formData);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="space-y-6">
        <AvatarUpload user={currentUser} onAvatarChange={handleAvatarChange} />

        <div className="space-y-4">
          {/* Avatar color picker */}
          <div>
            <Label>Avatar Color</Label>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition
                    ${formData.avatarColor === color ? 'border-black' : 'border-transparent'}
                    ${color}`}
                  aria-label={color}
                  onClick={() => handleAvatarColorChange(color)}
                >
                  {formData.avatarColor === color &&
                    <span className="w-3 h-3 rounded-full border-2 border-white bg-white block" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ARCHITECTURE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_DISPLAY_NAMES[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="mt-1"
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
        <DisplayPreferences
          showOnlineStatus={formData.showOnlineStatus}
          showLastActive={formData.showLastActive}
          onShowOnlineStatusChange={(value) => handleInputChange('showOnlineStatus', value)}
          onShowLastActiveChange={(value) => handleInputChange('showLastActive', value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
