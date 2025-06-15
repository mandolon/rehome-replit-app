
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import WhiteboardsGrid from "@/components/whiteboards/WhiteboardsGrid";
import { useUser } from "@/contexts/UserContext";

const ClientWhiteboards = () => {
  const { currentUser } = useUser();

  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto py-6 px-4">
        <h2 className="text-xl font-bold mb-4">Project Whiteboards</h2>
        <WhiteboardsGrid viewMode="grid" />
      </div>
    </AppLayout>
  );
};

export default ClientWhiteboards;
