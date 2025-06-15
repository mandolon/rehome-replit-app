export const ARCHITECTURE_ROLES = [
  'Architect',
  'Engineer', 
  'CAD Tech',
  'Designer',
  'Interior Designer',
  'Consultant',
  'Project Manager',
  'Admin',
  'Developer',
  'QA Tester',
  'Team Lead',
  'Marketing Manager',
  'Customer Support',
  'Operations',
  'Jr Designer',
  'Contractor',
  'Client'
] as const;

export type ArchitectureRole = typeof ARCHITECTURE_ROLES[number];

export const ROLE_DISPLAY_NAMES: Record<ArchitectureRole, string> = {
  'Architect': 'Architect',
  'Engineer': 'Engineer',
  'CAD Tech': 'CAD Tech',
  'Designer': 'Designer',
  'Interior Designer': 'Interior Designer',
  'Consultant': 'Consultant',
  'Project Manager': 'Project Manager',
  'Admin': 'Admin',
  'Developer': 'Developer',
  'QA Tester': 'QA Tester',
  'Team Lead': 'Team Lead',
  'Marketing Manager': 'Marketing Manager',
  'Customer Support': 'Customer Support',
  'Operations': 'Operations',
  'Jr Designer': 'Jr Designer',
  'Contractor': 'Contractor',
  'Client': 'Client'
};

// Add standard roles for CRM demo:
export type CRMRoles = "admin" | "team" | "client";
