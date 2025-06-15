
import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

interface TeamMembersSummaryProps {
  filteredMembers: TeamMember[];
  totalMembers: number;
  isMobile?: boolean;
}

const TeamMembersSummary = ({ filteredMembers, totalMembers, isMobile }: TeamMembersSummaryProps) => {
  return (
    <div className={`mt-6 p-3 bg-accent/30 rounded border ${isMobile ? "text-xs p-2 mt-4" : ""}`}>
      <div className={`flex ${isMobile ? "flex-col gap-1 items-start" : "items-center justify-between"} text-xs`}>
        <span className="text-muted-foreground">
          Total: {filteredMembers.length} of {totalMembers} members
        </span>
        <div className={`flex items-center gap-4 ${isMobile ? "gap-2 mt-1" : ""}`}>
          <span className="text-green-600">
            Active: {filteredMembers.filter(m => m.status === 'Active').length}
          </span>
          <span className="text-yellow-600">
            Pending: {filteredMembers.filter(m => m.status === 'Pending').length}
          </span>
          <span className="text-gray-600">
            Inactive: {filteredMembers.filter(m => m.status === 'Inactive').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersSummary;
