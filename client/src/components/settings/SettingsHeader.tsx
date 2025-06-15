
import React from 'react';

interface SettingsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsHeader = ({ activeTab, onTabChange }: SettingsHeaderProps) => {
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
    { id: 'trash', label: 'Trash' },
  ];

  return (
    <div className="border-b border-border">
      <div className="px-4 py-3">
        <h1 className="text-lg font-semibold mb-4">Settings</h1>
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
