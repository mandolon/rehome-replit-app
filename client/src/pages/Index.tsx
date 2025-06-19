
// Make all headers consistent and use identical layout, padding, and section-header component

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Index = () => {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
};

export default Index;
