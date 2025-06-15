import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Project phases remain the same
const projectPhases = [
  {
    id: "phase-1",
    title: "Measurements & Documentation",
    complete: true,
    milestones: [
      { id: "m1", name: "Initial site visit and measurements", complete: true },
      { id: "m2", name: "Photo documentation", complete: true },
      { id: "m3", name: "Existing conditions report", complete: true },
    ],
  },
  {
    id: "phase-2",
    title: "Architectural Drawings",
    complete: true,
    milestones: [
      { id: "m1", name: "Conceptual design sketches", complete: true },
      { id: "m2", name: "Detailed floor plans", complete: true },
      { id: "m3", name: "3D renderings & elevations", complete: true },
    ],
  },
  {
    id: "phase-3",
    title: "Planning (if required) and Building Review",
    complete: false,
    milestones: [
      { id: "m1", name: "City planning department consultation", complete: true },
      { id: "m2", name: "Building code review", complete: false },
      { id: "m3", name: "Structural engineering review", complete: false },
    ],
  },
  {
    id: "phase-4",
    title: "Permit and Approvals",
    complete: false,
    milestones: [
      { id: "m1", name: "Submit permit application", complete: false },
      { id: "m2", name: "City review period", complete: false },
      { id: "m3", name: "Final permit approval", complete: false },
    ],
  }
];

// Milestone list item – minimal, just text
const MilestoneListItem: React.FC<{ milestone: { name: string; complete: boolean } }> = ({
  milestone,
}) => (
  <li
    className={cn(
      "pl-2 py-1 text-xs",
      milestone.complete ? "text-foreground" : "text-muted-foreground"
    )}
  >
    {milestone.name}
  </li>
);

// Phase as compact, collapsible section with chevron
const PhaseCollapsibleItem: React.FC<{
  phase: typeof projectPhases[number];
  defaultOpen?: boolean;
}> = ({ phase, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen || false);

  // Status as text
  const completedCount = phase.milestones.filter((m) => m.complete).length;
  const isCurrent = completedCount > 0 && !phase.complete;
  const statusText = phase.complete
    ? "Complete"
    : isCurrent
    ? `${completedCount} of ${phase.milestones.length} done`
    : "Not started";

  return (
    <div className="border-b last:border-0">
      <button
        className="flex items-center w-full py-2 px-1 text-left focus:outline-none"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
        )}
        <span className="flex-1 truncate text-sm font-medium text-foreground">{phase.title}</span>
        <span className="text-xs text-muted-foreground ml-2">{statusText}</span>
      </button>
      {open && (
        <ul className="pl-6">
          {phase.milestones.map((milestone) => (
            <MilestoneListItem key={milestone.id} milestone={milestone} />
          ))}
        </ul>
      )}
    </div>
  );
};

const ProjectTimeline: React.FC = () => (
  <div>
    <h3 className="font-semibold mb-2">Project Timeline</h3>
    <div className="text-xs text-muted-foreground mb-2">
      Current and past project milestones
    </div>
    <div>
      {projectPhases.map((phase, idx) => (
        <PhaseCollapsibleItem
          key={phase.id}
          phase={phase}
          defaultOpen={idx === 0}
        />
      ))}
    </div>
  </div>
);

export default ProjectTimeline;
