import React, { useState, createContext, useContext } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageSectionHeader from '@/components/shared/PageSectionHeader';
import TeamsContent from '@/components/teams/TeamsContent';
import SelectUserDropdown from "@/components/teams/SelectUserDropdown";
// import ClientViewContent from "@/components/teams/ClientViewContent"; // Remove, now using TeamsContent

// Provide CRM role through context
export type CRMRoles = "admin" | "team" | "client";
export const CRMRoleContext = createContext<CRMRoles>('admin');
export const useCRMRole = () => useContext(CRMRoleContext);

const tabs = [
  { key: "admin", label: "Admin" },
  { key: "team", label: "Team" },
  { key: "client", label: "Client" }
];

const TeamsPage = () => {
  const [role, setRole] = useState<CRMRoles>("admin");
  const [activeTab, setActiveTab] = useState<CRMRoles>("admin");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  return (
    <CRMRoleContext.Provider value={role}>
      <AppLayout>
        <div className="flex flex-col h-full">
          <PageSectionHeader title="Teams CRM">
            <div className="flex items-center gap-4">
              {/* Removed RoleSwitcher */}
              <SelectUserDropdown
                selectedUserId={selectedUserId}
                onChange={setSelectedUserId}
              />
            </div>
          </PageSectionHeader>
          {/* Tabs */}
          <div className="flex w-full border-b border-border mb-2 px-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`py-2 px-4 -mb-px border-b-2 text-sm font-medium focus:outline-none transition-colors ${
                  activeTab === tab.key 
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.key as CRMRoles)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
            {(activeTab === "admin" || activeTab === "team" || activeTab === "client") && (
              <TeamsContent tab={activeTab} selectedUserId={selectedUserId} />
            )}
          </div>
        </div>
      </AppLayout>
    </CRMRoleContext.Provider>
  );
};

export default TeamsPage;
