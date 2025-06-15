import { projectClientData } from '@/data/projectClientStaticData';
import { getAvailableProjectsForTasks, convertDisplayNameToProjectId } from '@/data/projectStatus';

// Get project ID from display name
export const getProjectIdFromDisplayName = (displayName: string): string => {
  console.log('Converting display name to project ID:', displayName);
  
  // Convert display name to project ID format using the centralized function
  const projectId = convertDisplayNameToProjectId(displayName);
  console.log('Converted project ID:', projectId);
  
  // Check if this project exists in our client data
  if (projectClientData[projectId]) {
    console.log('Found project in client data:', projectId);
    return projectId;
  }
  
  // Fallback: try to find by partial match in projectClientData
  const fallbackId = Object.keys(projectClientData).find(id => {
    const clientData = projectClientData[id];
    const primaryClient = clientData.clients?.find(c => c.isPrimary) || clientData.clients?.[0];
    const generatedDisplayName = `${primaryClient?.lastName ?? ''} - ${clientData.projectAddress}`;
    return generatedDisplayName === displayName;
  });
  
  if (fallbackId) {
    console.log('Found fallback project ID:', fallbackId);
    return fallbackId;
  }
  
  console.warn('No project ID found for display name, using converted ID:', displayName, projectId);
  return projectId;
};

// Get display name from project ID
export const getDisplayNameFromProjectId = (projectId: string): string => {
  const availableProjects = getAvailableProjectsForTasks();
  const project = availableProjects.find(p => p.projectId === projectId);
  
  if (project) {
    return project.displayName;
  }
  
  // Fallback to client data
  if (projectClientData[projectId]) {
    const clientData = projectClientData[projectId];
    const primaryClient = clientData.clients?.find(c => c.isPrimary) || clientData.clients?.[0];
    return `${primaryClient?.lastName ?? ''} - ${clientData.projectAddress}`;
  }
  
  return projectId;
};

// Get all available projects for dropdowns (only In Progress projects)
export const getAvailableProjects = () => {
  return getAvailableProjectsForTasks();
};
