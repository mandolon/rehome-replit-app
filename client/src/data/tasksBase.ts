import { Task } from '@/types/task';
import { TEAM_USERS } from '@/utils/teamUsers';
import { getProjectDisplayName } from './projectClientHelpers';

// Get today's date in ISO format
const today = new Date().toISOString();

// Core exported tasks seeded for demo - fixed assignments only
export const baseTasks: Task[] = [
  {
    id: 1,
    taskId: "T0001",
    title: "Planning set finalized, set up CD's",
    projectId: "piner-piner-haus-garage",
    project: getProjectDisplayName("piner-piner-haus-garage"),
    estimatedCompletion: "—",
    dateCreated: "8/10/22",
    dueDate: "—",
    assignee: TEAM_USERS.find(u => u.name === "AL") || null, // Armando Lopez
    hasAttachment: true,
    collaborators: [],
    status: "redline",
    archived: false,
    createdBy: "AL",
    createdAt: today,
    updatedAt: today,
    deletedAt: null,
    deletedBy: null,
    description: null,
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: "0h"
  },
  {
    id: 2,
    taskId: "T0002",
    title: "Update - 12.27.23",
    projectId: "rathbun-usfs-cabin",
    project: getProjectDisplayName("rathbun-usfs-cabin"),
    estimatedCompletion: "—",
    dateCreated: "12/27/23",
    dueDate: "—",
    assignee: TEAM_USERS.find(u => u.name === "ALD") || null, // Alice Dale
    hasAttachment: true,
    collaborators: [TEAM_USERS.find(u => u.name === "MP")!], // Mark Pinsky
    status: "progress",
    archived: false,
    createdBy: "AL",
    createdAt: today,
    updatedAt: today,
    deletedAt: null,
    deletedBy: null,
    description: null,
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: "0h"
  },
  {
    id: 3,
    taskId: "T0003",
    title: "Update 12.9.23",
    projectId: "ogden-thew-2709-t-street",
    project: getProjectDisplayName("ogden-thew-2709-t-street"),
    estimatedCompletion: "—",
    dateCreated: "12/9/23",
    dueDate: "—",
    assignee: TEAM_USERS.find(u => u.name === "MP") || null, // Mark Pinsky
    hasAttachment: true,
    collaborators: [],
    status: "progress",
    archived: false,
    createdBy: "AL",
    createdAt: today,
    updatedAt: today,
    deletedAt: null,
    deletedBy: null,
    description: null,
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: "0h"
  },
  {
    id: 4,
    taskId: "T0004",
    title: "Alternate Cabin Design",
    projectId: "ogden-thew-2709-t-street",
    project: getProjectDisplayName("ogden-thew-2709-t-street"),
    estimatedCompletion: "—",
    dateCreated: "9/13/23",
    dueDate: "9/22/23, 5...",
    assignee: TEAM_USERS.find(u => u.name === "JH") || null, // James Hall
    hasAttachment: false,
    collaborators: [],
    status: "progress",
    archived: false,
    createdBy: "AL",
    createdAt: today,
    updatedAt: today,
    deletedAt: null,
    deletedBy: null,
    description: null,
    markedComplete: null,
    markedCompleteBy: null,
    timeLogged: "0h"
  }
];
