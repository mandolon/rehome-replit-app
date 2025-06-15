
import { Task } from "@/types/task";
import { User } from "@/types/user";

export function isAdmin(user: User) {
  return (
    user.name === "Armando Lopez" ||
    user.name === "AL" ||
    user.email === "armando@company.com"
  );
}

export function isUserMatch(a: any, b: User | null) {
  if (!a || !b) return false;
  // Try id first, then name, then fullName, then email
  return (
    (!!a.id && a.id === b.id) ||
    (!!a.name && a.name === b.name) ||
    (!!a.fullName && a.fullName === b.name) ||
    (!!a.email && a.email === b.email)
  );
}

/**
 * Determines if a user can view a given task.
 * Returns { allowed: boolean, reason: string }
 */
export function canUserViewTask(task: Task, user: User | null): { allowed: boolean, reason: string } {
  if (!user) return { allowed: false, reason: 'No user' };
  if (isAdmin(user)) return { allowed: true, reason: 'Admin' };

  if (task.assignee && isUserMatch(task.assignee, user)) {
    return { allowed: true, reason: 'Assignee' };
  }
  if (task.collaborators && task.collaborators.some(c => isUserMatch(c, user))) {
    return { allowed: true, reason: 'Collaborator' };
  }
  if ((task.createdBy && (task.createdBy === user.name || task.createdBy === user.email))) {
    return { allowed: true, reason: 'Creator' };
  }
  return { allowed: false, reason: 'Not assigned, not collab, not creator' };
}

/**
 * Only show tasks assigned to, created by, or collaborated with the user,
 * unless the user is an admin.
 */
export function filterTasksForUser(tasks: Task[], user: User | null) {
  if (!user) return [];
  if (isAdmin(user)) return tasks;

  return tasks.filter(t => canUserViewTask(t, user).allowed);
}
