
export { getAvatarColor } from './avatarColors';

export const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  // First letter of first and last word
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  } catch {
    return dateString; // fallback to original string if parsing fails
  }
};

// Format "FirstName L." from "FirstName LastName"
export const formatFirstNameLastInitial = (fullNameOrName: string): string => {
  if (!fullNameOrName || typeof fullNameOrName !== "string") return "";
  const parts = fullNameOrName.trim().split(" ").filter(Boolean);
  if (parts.length === 1) {
    // Single word: just return, capitalized
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
};

// Now consistently use 'avatarColor' for color property (for all available people)
// 'avatar' property is for displaying initials only (for legacy fallback).
export const availablePeople = [
  { name: "MP", avatar: "MP", fullName: "Marcus Pierce", avatarColor: "bg-blue-500" },
  { name: "JD", avatar: "JD", fullName: "Jennifer Davis", avatarColor: "bg-green-500" },
  { name: "SK", avatar: "SK", fullName: "Sarah Kim", avatarColor: "bg-purple-500" },
  { name: "AL", avatar: "AL", fullName: "Alex Lopez", avatarColor: "bg-orange-500" },
  { name: "RT", avatar: "RT", fullName: "Ryan Taylor", avatarColor: "bg-red-500" }
];

