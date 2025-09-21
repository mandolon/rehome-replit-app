import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarNavigationProps {
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarNavigation = React.memo(({ isCollapsed, isOpen, onToggle }: SidebarNavigationProps) => {
  const navigate = useNavigate();

  const handleNavigateTasks = useCallback(() => navigate('/tasks'), [navigate]);

  // Only Task Board available
  const mainNavItems = useMemo(() => {
    return [
      { icon: ClipboardList, label: 'Task Board', active: false, onClick: handleNavigateTasks },
    ];
  }, [handleNavigateTasks]);

  // Show collapsible nav
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="px-2 mb-2">
        <CollapsibleTrigger className="flex items-center gap-2 px-2 py-1.5 w-full text-left hover:bg-sidebar-accent/50 rounded">
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            Navigation
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav className="space-y-0 mt-2">
            {mainNavItems.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors my-0",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                onClick={item.onClick}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{item.label}</span>
              </div>
            ))}
          </nav>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});

SidebarNavigation.displayName = 'SidebarNavigation';

export default SidebarNavigation;
