
import React from 'react';
import { HelpCircle } from 'lucide-react';
import InviteDialog from './InviteDialog';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const SidebarFooter = () => {
  const navigate = useNavigate();
  const { currentUser, isImpersonating, impersonatedUser } = useUser();

  // Helper to determine correct help page path for current user
  const getHelpPagePath = () => {
    if (currentUser.role === 'Admin') return '/help/admin';
    if (
      currentUser.role === 'Team Lead' ||
      currentUser.role === 'Project Manager' ||
      currentUser.role === 'Engineer' ||
      currentUser.role === 'Designer' ||
      currentUser.role === 'Operations' ||
      currentUser.role === 'QA Tester' ||
      currentUser.role === 'Consultant' ||
      currentUser.role === 'CAD Tech' ||
      currentUser.role === 'Jr Designer' ||
      currentUser.role === 'Developer' ||
      currentUser.role === 'Marketing Manager' ||
      currentUser.role === 'Customer Support' ||
      currentUser.role === 'Interior Designer' ||
      currentUser.role === 'Contractor'
    ) {
      return '/help/team';
    }
    if (currentUser.role === 'Client') return '/help/client';
    return '/help/client';
  };

  // Impersonated client cannot leave dashboard; disable Help button
  const helpDisabled =
    isImpersonating && impersonatedUser && impersonatedUser.role === "Client";

  const handleNavigateHelp = () => {
    if (helpDisabled) return;
    const helpPath = getHelpPagePath();
    console.log(`[SidebarFooter] Navigating to help: ${helpPath}`);
    navigate(helpPath);
  };

  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center justify-between">
        <InviteDialog triggerButtonClassName="flex items-center gap-2 text-sm text-sidebar-foreground hover:text-foreground" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`flex items-center gap-2 text-sm text-sidebar-foreground hover:text-foreground transition-opacity
                  ${helpDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                `}
                onClick={handleNavigateHelp}
                type="button"
                disabled={helpDisabled}
                tabIndex={helpDisabled ? -1 : 0}
                aria-disabled={helpDisabled}
              >
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Help</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {helpDisabled
                ? "Help is not available when viewing as client."
                : "Open help docs"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default SidebarFooter;

