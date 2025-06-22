import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SchedulesContent from '@/components/schedules/SchedulesContent';
import PageSectionHeader from '@/components/shared/PageSectionHeader';

const SchedulesPage = React.memo(() => {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <PageSectionHeader title="Schedules" />
        <div className="flex-1 min-h-0">
          <SchedulesContent />
        </div>
      </div>
    </AppLayout>
  );
});

SchedulesPage.displayName = "SchedulesPage";
export default SchedulesPage;