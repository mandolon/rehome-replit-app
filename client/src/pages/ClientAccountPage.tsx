
import React from "react";
import AppLayout from "@/components/layout/AppLayout";

const ClientAccountPage = () => {
  // This would be connected to the client's profile data in a real app
  // For now, use dummy data — could be improved if you have actual user data
  const client = {
    name: "Sample Client",
    email: "client@email.com",
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1">Name</label>
            <input
              type="text"
              value={client.name}
              readOnly
              className="border px-3 py-2 rounded w-full bg-gray-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Email</label>
            <input
              type="text"
              value={client.email}
              readOnly
              className="border px-3 py-2 rounded w-full bg-gray-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Password</label>
            <input
              type="password"
              value="***"
              readOnly
              className="border px-3 py-2 rounded w-full bg-gray-100 text-sm"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClientAccountPage;
