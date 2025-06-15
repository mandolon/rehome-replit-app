import { Client } from "@/data/projectClientData";
import { getAllClients } from "@/data/projectClientHelpers";

// Generate unique client ID like "C0001", "C0002", etc.
// Looks at all clients and generates the next available number.
export function generateClientId() {
  const allClients = getAllClients();
  // Look for max numeric part in IDs like "C0001"
  let maxNum = 0;
  for (const client of allClients) {
    // Match IDs like "Cxxxx" where xxxx is a number
    const match = client.clientId && client.clientId.match(/^C(\d{4,})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  // Next ID is one higher
  const nextNum = maxNum + 1;
  // Pad with zeros to 4 digits
  return `C${nextNum.toString().padStart(4, "0")}`;
}

// Get initials for avatar use
export function getClientInitials(client: Client) {
  return (
    (client.firstName?.[0] ?? "") + (client.lastName?.[0] ?? "")
  ).toUpperCase();
}
