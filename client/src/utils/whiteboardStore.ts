
import { projectClientData } from "@/data/projectClientStaticData";

// Types
export interface Whiteboard {
  id: string;
  title: string;
  type: string;
  lastModified: string;
  thumbnail: string;
  projectId: string;
  createdBy: string; // userId
  sharedWithClient: boolean;
}

// Simple mock DB for whiteboards (in-memory)
let whiteboards: Whiteboard[] = [
  {
    id: "1",
    title: "Project Requirements.pdf",
    type: "pdf",
    lastModified: "2 hours ago",
    thumbnail: "/placeholder.svg",
    projectId: "adams-1063-40th-street",
    createdBy: "t1", // Alice Dale
    sharedWithClient: true,
  },
  {
    id: "2",
    title: "Design Mockups.pdf",
    type: "pdf",
    lastModified: "1 day ago",
    thumbnail: "/placeholder.svg",
    projectId: "ogden-thew-2709-t-street",
    createdBy: "t1",
    sharedWithClient: true,
  },
  {
    id: "3",
    title: "Client Feedback.pdf",
    type: "pdf",
    lastModified: "3 days ago",
    thumbnail: "/placeholder.svg",
    projectId: "henderson-1524-tiverton",
    createdBy: "t1",
    sharedWithClient: false,
  },
  {
    id: "4",
    title: "Technical Specifications.pdf",
    type: "pdf",
    lastModified: "1 week ago",
    thumbnail: "/placeholder.svg",
    projectId: "peterson-2015-10th-street",
    createdBy: "t1",
    sharedWithClient: true
  }
];

// UTILS
export function getAllWhiteboards() {
  return whiteboards;
}

// Team: see all; Client: see shared for their project(s)
// Updated: add email as an optional field on the user object param
export function getVisibleWhiteboardsForUser(user: { role: string; id: string; email?: string }) {
  if (!user) return [];
  if (user.role === "Client") {
    // find project IDs where user is a client
    const projectIds = Object.keys(projectClientData).filter(pid =>
      projectClientData[pid].clients.some(
        c => c.clientId === user.id || (user.email && c.email === user.email)
      )
    );
    return whiteboards.filter(
      wb => wb.sharedWithClient && projectIds.includes(wb.projectId)
    );
  }
  // Team users see all
  return whiteboards;
}

// Add new whiteboard
export function createWhiteboard({
  title,
  type,
  projectId,
  createdBy,
  sharedWithClient,
}: {
  title: string;
  type: string;
  projectId: string;
  createdBy: string;
  sharedWithClient: boolean;
}) {
  const id = Date.now().toString();
  whiteboards.unshift({
    id,
    title,
    type,
    lastModified: "just now",
    thumbnail: "/placeholder.svg",
    projectId,
    createdBy,
    sharedWithClient,
  });
}

// Toggle client sharing
export function toggleShareWithClient(whiteboardId: string, value: boolean) {
  const wb = whiteboards.find(w => w.id === whiteboardId);
  if (wb) wb.sharedWithClient = value;
}

