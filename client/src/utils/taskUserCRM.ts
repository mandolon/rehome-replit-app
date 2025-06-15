
import { TaskUser } from '@/types/task';
import { TEAM_USERS } from '@/utils/teamUsers';
import { getUserCustomizations } from '@/utils/userCustomizations';

/**
 * Returns the canonical CRM/TEAM_USERS user for consistent display, with avatarColor from customizations (localStorage) if present.
 * If a matching user is not found, falls back to the passed input
 */
export function getCRMUser(person?: TaskUser | null): TaskUser | null {
  if (!person) return null;
  const match = TEAM_USERS.find(
    u => u.name === person.name || u.fullName === person.fullName
  );
  if (match) {
    // Use CRM/TEAM_USERS properties, override with custom avatarColor from localStorage
    const custom = getUserCustomizations(match.id);
    return {
      ...match,
      avatar: match.avatar || person.avatar,
      avatarColor: custom.avatarColor || match.avatarColor,
    };
  }
  // If not a match, try to inject any custom color by id if possible
  if (person.id) {
    const custom = getUserCustomizations(person.id);
    return {
      ...person,
      avatarColor: custom.avatarColor || person.avatarColor,
    };
  }
  return person;
}
