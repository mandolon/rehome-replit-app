
export type UserCustomizations = {
  avatarColor?: string;
};

const CUSTOMIZATIONS_KEY = "user-customizations";

function getAllCustomizations(): Record<string, UserCustomizations> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CUSTOMIZATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getUserCustomizations(userId: string): UserCustomizations {
  const all = getAllCustomizations();
  return all[userId] || {};
}

export function saveUserCustomizations(userId: string, updates: UserCustomizations) {
  if (typeof window === "undefined") return;
  const all = getAllCustomizations();
  all[userId] = { ...all[userId], ...updates };
  window.localStorage.setItem(CUSTOMIZATIONS_KEY, JSON.stringify(all));
}
