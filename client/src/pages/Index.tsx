
// Make all headers consistent and use identical layout, padding, and section-header component

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import OriginalDashboardContent from '@/components/dashboard/OriginalDashboardContent';

const Index = () => {
  return (
    <AppLayout>
      <OriginalDashboardContent />
    </AppLayout>
  );
};

export default Index;
