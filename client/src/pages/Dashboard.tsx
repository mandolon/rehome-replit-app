
import React, { useState, useEffect } from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  // Redirect client users to the client dashboard
  useEffect(() => {
    if (currentUser && currentUser.role === 'Client') {
      navigate('/client/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log(`Tab changed to: ${tab}`);
  };
  
  // Optionally render nothing while redirecting for clients
  if (currentUser && currentUser.role === 'Client') {
    return null;
  }

  return (
    <div className="flex-1 bg-background p-4">
      <div className="h-full flex flex-col max-w-6xl mx-auto">
        <DashboardPageHeader activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 pt-4 overflow-y-auto">
          <DashboardContent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

