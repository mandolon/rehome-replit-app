
import React from "react";
import { FileText } from "lucide-react";

const files = [
  { name: "FloorPlan_v2.4.pdf", type: "Drawing", updated: "Jun 13", url: "#" },
  { name: "Specs_Bathroom.pdf", type: "Specs", updated: "Jun 11", url: "#" },
  { name: "A200.pdf", type: "Drawing", updated: "Jun 8", url: "#" }
];

const DocumentsGallery: React.FC = () => (
  <div>
    <h3 className="font-semibold mb-2">Latest Documents</h3>
    <div className="flex flex-wrap gap-3">
      {files.map((file, i) => (
        <a
          key={i}
          href={file.url}
          className="group flex flex-col items-center p-3 bg-accent rounded border border-border w-28 hover:bg-accent/80 transition"
          title={`Download ${file.name}`}
          download
        >
          <FileText className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="mt-2 text-xs font-medium text-center truncate w-20">{file.name}</span>
          <span className="text-[10px] text-muted-foreground">{file.updated}</span>
        </a>
      ))}
    </div>
    <div className="text-xs text-blue-600 mt-2 cursor-pointer hover:underline">See all files</div>
  </div>
);

export default DocumentsGallery;
