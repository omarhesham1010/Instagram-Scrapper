import { db, Activity } from "@/lib/db";
import { logger } from "@/core/observability/logger";
import { Normalizer } from "@/lib/instagram/parsers/normalizer";

const INTERVAL = 30000;
let timer: NodeJS.Timeout | null = null;

// Handle messages from the main thread
self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case "START":
      startPolling();
      break;
    case "STOP":
      stopPolling();
      break;
    case "PROCESS_PAYLOAD":
      await processPayload(payload);
      break;
  }
};

async function processPayload(interceptedData: any) {
  try {
    const { type, payload, response } = interceptedData;
    
    if (type === "ACTIVITY_FEED") {
      logger.info("Worker", "Processing intercepted ACTIVITY_FEED");
      
      // We don't have the current friend's ID from just the request easily, 
      // but in a real extension we'd map this to the logged-in user or the profile being viewed.
      // For now, let's assign it to a random friend to simulate data flow.
      const friends = await db.friends.toArray();
      if (friends.length === 0) return;
      
      const targetFriend = friends[Math.floor(Math.random() * friends.length)];
      
      // Let Normalizer do its job
      const activities = Normalizer.normalizeActivityFeed(response?.data || response, targetFriend.id);
      
      if (activities.length > 0) {
        await db.activities.bulkPut(activities);
        await db.friends.update(targetFriend.id, { lastSyncAt: Date.now() });
        logger.info("Worker", `Inserted ${activities.length} real parsed activities for ${targetFriend.username}`);
        self.postMessage({ type: "SYNC_COMPLETE", payload: { friendId: targetFriend.id } });
      }
    }
  } catch (error) {
    logger.error("Worker", "Failed to process intercepted payload", error);
  }
}

function startPolling() {
  if (timer) return;
  logger.info("Worker", "Starting background polling task...");

  timer = setInterval(async () => {
    await pollNewActivity();
  }, INTERVAL);

  pollNewActivity(); // Initial run
}

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logger.info("Worker", "Stopped background polling task.");
  }
}

async function pollNewActivity() {
  logger.debug("Worker", "Polling for new activities...");

  try {
    // Simulate network latency
    await new Promise((res) => setTimeout(res, 1500));

    const friends = await db.friends.toArray();
    if (friends.length === 0) return;

    // Simulate Instagram interception payload parsing
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const types = ["like", "repost", "watch"] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const newActivityId = `act_live_${Date.now()}`;

    const newActivity: Activity = {
      id: newActivityId,
      instagramId: `ig_${newActivityId}`,
      friendId: friend.id,
      type,
      timestamp: Date.now(),
      contentUrl: "https://instagram.com/p/live",
      thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
      authorUsername: `user_live_${Math.floor(Math.random() * 1000)}`,
      authorAvatar: `https://i.pravatar.cc/150?u=${Math.floor(Math.random() * 1000)}`,
      caption: `Worker generated activity: ${type}`,
    };

    await db.activities.add(newActivity);
    await db.friends.update(friend.id, { lastSyncAt: Date.now() });

    logger.info("Worker", `Inserted new ${type} activity for ${friend.username}`);

    // Notify main thread
    self.postMessage({ type: "SYNC_COMPLETE", payload: { friendId: friend.id } });

  } catch (error) {
    logger.error("Worker", "Failed to poll new activity", error);
  }
}
