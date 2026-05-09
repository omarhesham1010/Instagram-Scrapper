import { db } from "./db";
import { logger } from "../core/observability/logger";

const MOCK_FRIENDS = [
  { id: "1", instagramId: "ig_1", username: "ahmed.y", fullName: "Ahmed Youssef", profilePicUrl: "https://i.pravatar.cc/150?u=ahmed", lastSyncAt: Date.now() },
  { id: "2", instagramId: "ig_2", username: "sara.design", fullName: "Sara Ahmed", profilePicUrl: "https://i.pravatar.cc/150?u=sara", lastSyncAt: Date.now() - 3600000 },
  { id: "3", instagramId: "ig_3", username: "omar.dev", fullName: "Omar Hesham", profilePicUrl: "https://i.pravatar.cc/150?u=omar", lastSyncAt: Date.now() - 7200000 },
  { id: "4", instagramId: "ig_4", username: "nour.a", fullName: "Nour Ali", profilePicUrl: "https://i.pravatar.cc/150?u=nour", lastSyncAt: Date.now() - 86400000 },
];

export async function seedDatabase() {
  try {
    const friendCount = await db.friends.count();
    if (friendCount === 0) {
      logger.info("DBSeeder", "Seeding database with mock data...");
      
      // Seed Friends
      await db.friends.bulkAdd(MOCK_FRIENDS);

      // Seed Activities
      const activities = [];
      const types = ["like", "repost", "watch"] as const;
      
      for (const friend of MOCK_FRIENDS) {
        // Generate 50-200 activities per friend
        const numActivities = Math.floor(Math.random() * 150) + 50;
        for (let i = 0; i < numActivities; i++) {
          activities.push({
            id: `act_${friend.id}_${i}`,
            instagramId: `ig_act_${friend.id}_${i}`,
            friendId: friend.id,
            type: types[i % 3],
            timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // random within last 7 days
            contentUrl: "https://instagram.com/p/mock",
            thumbnailUrl: `https://picsum.photos/seed/${friend.id}_${i}/200/200`,
            authorUsername: `user_${Math.floor(Math.random() * 1000)}`,
            authorAvatar: `https://i.pravatar.cc/150?u=${Math.floor(Math.random() * 1000)}`,
            caption: `Mock activity ${i} for ${friend.username}`,
          });
        }
      }

      await db.activities.bulkAdd(activities);
      logger.info("DBSeeder", "Seeding complete!");
    } else {
      logger.debug("DBSeeder", "Database already seeded. Skipping.");
    }
  } catch (error) {
    logger.error("DBSeeder", "Failed to seed database", error);
  }
}
