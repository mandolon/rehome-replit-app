import React from 'react';
import SchedulesContent from '@/components/schedules/SchedulesContent';
import PageSectionHeader from '@/components/shared/PageSectionHeader';

const SchedulesPage = React.memo(() => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageSectionHeader title="Schedules" />
      <div className="flex-1 min-h-0 overflow-hidden">
        <SchedulesContent />
      </div>
    </div>
  );
});

SchedulesPage.displayName = "SchedulesPage";
export default SchedulesPage;