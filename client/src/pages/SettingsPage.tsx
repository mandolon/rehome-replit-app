
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import SettingsHeader from '@/components/settings/SettingsHeader';
import ProfileTab from '@/components/settings/ProfileTab';
import AccountTab from '@/components/settings/AccountTab';
import TrashTab from '@/components/settings/TrashTab';

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'account', 'trash'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <SettingsHeader activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'trash' && <TrashTab />}
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
