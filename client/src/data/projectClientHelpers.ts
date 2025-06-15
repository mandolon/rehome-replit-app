import { projectClientData } from './projectClientStaticData';

// Interfaces/types
export interface Client {
  clientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  isPrimary: boolean;
}

export type ProjectClientMap = Record<string, {
  clients: Client[];
  projectAddress: string;
  city: string;
  state: string;
  projectId: string;
}>;

// Generate deterministic clientId based on first/last (real app should use uuid, for now just simple)
function makeClientId(firstName: string, lastName: string) {
  return (
    firstName.toLowerCase().replace(/[^a-z0-9]/g, "") +
    "-" +
    lastName.toLowerCase().replace(/[^a-z0-9]/g, "")
  );
}

// Helper functions (all unchanged and moved from the original file)

export const getClientData = (projectId?: string) => {
  if (projectId && projectClientData[projectId]) {
    return projectClientData[projectId];
  }
  // Default fallback
  return {
    clients: [
      {
        clientId: "default-johndoe",
        firstName: "John",
        lastName: "Doe",
        isPrimary: true
      }
    ],
    projectAddress: "Unknown Address",
    city: "Sacramento",
    state: "CA",
    projectId: "00000"
  };
};

export const getAllClients = (): Client[] => {
  return Object.values(projectClientData).flatMap(p => p.clients);
};

export const updateClientData = (
  projectId: string,
  updatedClients?: Client[],
  updatedAddress?: string,
  updatedCity?: string,
  updatedState?: string
) => {
  if (projectId && projectClientData[projectId]) {
    if (updatedClients) {
      projectClientData[projectId].clients = updatedClients;
    }
    if (updatedAddress !== undefined) {
      projectClientData[projectId].projectAddress = updatedAddress;
    }
    if (updatedCity !== undefined) {
      projectClientData[projectId].city = updatedCity;
    }
    if (updatedState !== undefined) {
      projectClientData[projectId].state = updatedState;
    }
  }
};

export const addClientToProject = (projectId: string, newClient: Client) => {
  if (projectId && projectClientData[projectId]) {
    projectClientData[projectId].clients.push(newClient);
  }
};

export const setPrimaryClient = (projectId: string, clientId: string) => {
  if (projectId && projectClientData[projectId]) {
    projectClientData[projectId].clients.forEach(c => {
      c.isPrimary = c.clientId === clientId;
    });
  }
};

export const getProjectDisplayName = (projectId?: string) => {
  const project = getClientData(projectId);
  const primary = project.clients.find(c => c.isPrimary) || project.clients[0];
  return `${primary.lastName} - ${project.projectAddress}`;
};
