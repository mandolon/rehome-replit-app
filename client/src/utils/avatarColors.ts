
import { getUserCustomizations } from '@/utils/userCustomizations';

/**
 * Maps user initials to default Tailwind color classes, matching CRM palette.
 */
export const AVATAR_COLOR_PALETTE: Record<string, string> = {
  AL: 'bg-blue-600',
  ALD: 'bg-cyan-500',
  MP: 'bg-orange-500',
  JH: 'bg-purple-500',
  SS: 'bg-blue-500',
  JJ: 'bg-orange-500',
  RH: 'bg-pink-500',
  JD: 'bg-emerald-500',
  SK: 'bg-indigo-500',
  RT: 'bg-red-500',
  // Add/adjust as needed.
};

/**
 * Return avatar color class for a given user (by id, initials, or name), checking localStorage customizations first.
 */
export function getAvatarColor(user: { id?: string; name?: string; avatar?: string; fullName?: string }): string {
  if (!user) return 'bg-gray-400';

  // Priority: custom color -> hardcoded palette -> fallback
  // Try customizations first (localStorage), by id
  if (user.id) {
    const custom = getUserCustomizations(user.id);
    if (custom?.avatarColor) return custom.avatarColor;
  }

  // Next priority: initials in palette
  const key = user.name || user.avatar || '';
  if (key && AVATAR_COLOR_PALETTE[key]) {
    return AVATAR_COLOR_PALETTE[key];
  }
  return 'bg-gray-400';
}
