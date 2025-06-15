
import React from "react";

type CRMRoles = "admin" | "team" | "client";

interface RoleSwitcherProps {
  role: CRMRoles;
  setRole: (role: CRMRoles) => void;
}

const RoleSwitcher = ({ role, setRole }: RoleSwitcherProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-muted-foreground">View as:</span>
      <button
        className={`px-2 py-1 rounded text-xs ${role === 'admin' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => setRole('admin')}
      >
        Admin
      </button>
      <button
        className={`px-2 py-1 rounded text-xs ${role === 'team' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => setRole('team')}
      >
        Team
      </button>
      <button
        className={`px-2 py-1 rounded text-xs ${role === 'client' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => setRole('client')}
      >
        Client
      </button>
    </div>
  );
};

export default RoleSwitcher;
