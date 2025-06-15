
import React from "react";

interface ProjectHeroProps {
  imageUrl: string;
  address: string;
  projectName: string;
  status: string;
}

const ProjectHero: React.FC<ProjectHeroProps> = ({ imageUrl, address, projectName, status }) => (
  <div className="relative w-full h-48 rounded-lg overflow-hidden shadow">
    <img
      src={imageUrl}
      alt="Project Hero"
      className="object-cover w-full h-full"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
      <h2 className="text-lg text-white font-bold drop-shadow">{projectName}</h2>
      <div className="text-sm text-blue-200">{address}</div>
      <span className="inline-block py-0.5 px-2 bg-blue-600/80 text-xs text-white rounded mt-2">{status}</span>
    </div>
  </div>
);

export default ProjectHero;
