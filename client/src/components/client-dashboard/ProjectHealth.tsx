
import React from "react";

/**
 * Responsive grid for project health stats.
 * Even spacing, cards look better at all screen sizes.
 */
const stats = [
  {
    value: "60%",
    label: "Progress",
    color: "text-blue-600"
  },
  {
    value: "$105k",
    label: "Budget Remaining",
    color: "text-green-600"
  },
  {
    value: "Aug 15",
    label: "Next Milestone",
    color: "text-yellow-500"
  },
  {
    value: "2",
    label: "Actions Needed",
    color: "text-rose-600"
  }
];

const ProjectHealth: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
    {stats.map(stat => (
      <div key={stat.label} className="text-center bg-card rounded-xl shadow-sm px-2 py-4">
        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
        <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
      </div>
    ))}
  </div>
);

export default ProjectHealth;
