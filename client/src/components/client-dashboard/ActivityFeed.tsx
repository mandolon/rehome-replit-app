
import React from "react";
import { Clock } from "lucide-react";

const activities = [
  { user: "Matthew P.", text: "Uploaded revised Floor Plan (v2.4)", time: "1h ago" },
  { user: "You", text: "Approved design revisions", time: "3h ago" },
  { user: "Armando L.", text: "Added meeting minutes from last site visit", time: "1d ago" },
  { user: "Matthew P.", text: "Shared Construction Docs – Sheet A200.pdf", time: "2d ago" }
];

const ActivityFeed: React.FC = () => (
  <div>
    <h3 className="font-semibold mb-2">Recent Activity</h3>
    <ul className="divide-y divide-border text-xs">
      {activities.map((a, i) => (
        <li key={i} className="flex justify-between items-center py-2">
          <div>
            <span className="font-medium">{a.user}: </span>
            {a.text}
          </div>
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="w-3 h-3" /> {a.time}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default ActivityFeed;
