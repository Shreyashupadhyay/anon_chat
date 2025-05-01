/**
 * Represents a user in the matchmaking system.
 */
export interface User {
  /**
   * A unique identifier for the user.
   */
  id: string;
}

/**
 * Asynchronously simulates matching two random users and returning identifiers.
 * In a real application, this would involve server-side logic.
 *
 * @returns A promise that resolves to an array containing mock IDs of the two matched users.
 */
export async function matchUsers(): Promise<[string, string]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock user IDs
  const user1Id = `user-${Math.random().toString(36).substring(2, 9)}`;
  const user2Id = `user-${Math.random().toString(36).substring(2, 9)}`;

  console.log(`Simulated match: ${user1Id} and ${user2Id}`);

  // Return mock IDs
  return [user1Id, user2Id];
}

/**
 * Creates a unique chat room ID.
 * In a real app, this might be generated server-side upon successful matching.
 * @returns A unique string representing the chat room ID.
 */
export function createRoomId(): string {
   return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
