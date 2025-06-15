
// Centralized project status data - matches the sidebar structure
export const projectStatusData = {
  inProgress: [
    'Adams - 1063 40th Street',
    'Ogden - Thew - 2709 T Street',
    'Henderson - 1524 Tiverton',
    'Peterson - 2015 10th Street',
    'Johnson - 2200 I Street',
    'Adamo - 6605 S. Land Park Dr.',
    'McVarish - Salmina - 6251 El Dorado Street',
    'Andre - 2119 H Street',
    'Fleming - Veisze - 1111 33rd Street',
    'Ganson - 2125 I Street',
    'DeCarlo - 1141 Swanston Dr',
    'Green - 920 U Street',
    'Kubein - Plymouth Project',
    'McLeod - Joffe - 2436 59th Street',
    'Piner - Piner Haus Garage',
    'Rathbun - USFS Cabin',
    'Vasquez - Gutierrez - 2508 55th Street',
    'Wilcox - 1808 U Street',
    'Donaldson - 2717 58th Street',
    'Unknown - 14401 Grand Island Road'
  ],
  onHold: [
    'Project Alpha',
    'Project Beta'
  ],
  completed: [
    'Finished Project 1',
    'Finished Project 2',
    'Finished Project 3'
  ]
};

// Convert display name to project ID format
export const convertDisplayNameToProjectId = (displayName: string): string => {
  return displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

// Get all available projects for task creation (only In Progress)
export const getAvailableProjectsForTasks = () => {
  return projectStatusData.inProgress.map(displayName => ({
    displayName,
    projectId: convertDisplayNameToProjectId(displayName)
  }));
};
