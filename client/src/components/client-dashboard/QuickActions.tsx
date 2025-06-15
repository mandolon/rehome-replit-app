
import React from "react";
import { Calendar, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Actions now wrap more elegantly and stay right on large screens.
 * On mobile, stack vertically.
 */
const QuickActions: React.FC = () => (
  <div className="flex flex-wrap gap-2 sm:gap-3 w-full justify-end lg:justify-end">
    <Button
      variant="outline"
      className="flex gap-2 items-center min-w-[140px] justify-center"
      size="sm"
    >
      <Calendar className="w-4 h-4" />
      Schedule Meeting
    </Button>
    <Button
      variant="outline"
      className="flex gap-2 items-center min-w-[140px] justify-center"
      size="sm"
    >
      <MessageSquare className="w-4 h-4" />
      Message Team
    </Button>
    <Button
      variant="outline"
      className="flex gap-2 items-center min-w-[140px] justify-center"
      size="sm"
    >
      <FileText className="w-4 h-4" />
      Download Package
    </Button>
  </div>
);

export default QuickActions;
