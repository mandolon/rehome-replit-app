
import React from "react";
const team = [
  { name: "Matthew P.", title: "Architect", email: "matthew@firm.com", avatar: "MP" },
  { name: "Armando L.", title: "Project Manager", email: "armando@firm.com", avatar: "AL" }
];

const ProjectTeam: React.FC = () => (
  <div>
    <h3 className="font-semibold mb-2">Your Project Team</h3>
    <ul className="flex flex-col gap-2">
      {team.map((m) => (
        <li key={m.email} className="flex items-center gap-3 text-xs">
          <span className="w-8 h-8 bg-blue-100 text-blue-700 font-bold flex items-center justify-center rounded-full">{m.avatar}</span>
          <div>
            <div className="font-medium">{m.name} <span className="ml-1 text-gray-400 font-light text-xs">({m.title})</span></div>
            <a href={`mailto:${m.email}`} className="text-blue-600 hover:underline">{m.email}</a>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default ProjectTeam;
