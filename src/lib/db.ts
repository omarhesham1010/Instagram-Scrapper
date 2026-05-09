import Dexie, { Table } from "dexie";
import { cryptoLayer } from "../core/security/crypto";

// Types
export interface Friend {
  id: string;
  instagramId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  lastSyncAt: number;
  syncCursor?: string; // Pagination cursor for fetching more activities
}

export interface Activity {
  id: string; // unique internal ID
  instagramId: string; // ID from Instagram
  friendId: string; // Foreign key to Friend
  type: "like" | "repost" | "watch";
  timestamp: number;
  contentUrl: string;
  thumbnailUrl: string;
  authorUsername: string;
  authorAvatar: string;
  caption: string;
  isDeleted?: boolean; // Support soft deletes or background compaction
  encryptedPayload?: string; // Stores the fully encrypted version of sensitive fields
}

export class IgTrackDatabase extends Dexie {
  friends!: Table<Friend, string>;
  activities!: Table<Activity, string>;

  constructor() {
    super("IgTrackDatabase");
    
    // Define schema with Advanced Indexing for fast queries
    this.version(2).stores({
      friends: "id, instagramId, username, lastSyncAt",
      activities: "id, friendId, type, timestamp, [friendId+type], [friendId+timestamp]",
    }).upgrade(tx => {
      console.log("Upgraded DB to version 2");
    });

    // Hooks for Encryption & Tamper Detection
    this.activities.hook("creating", (primKey, obj, trans) => {
      // Encrypt sensitive fields (like caption) before saving
      const sensitiveData = JSON.stringify({ caption: obj.caption });
      obj.encryptedPayload = cryptoLayer.encrypt(sensitiveData);
      // We clear the raw caption in the DB to keep it secure, but keep it in memory for UI
      obj.caption = "[ENCRYPTED]";
    });

    this.activities.hook("reading", (obj) => {
      if (obj.encryptedPayload) {
        const decrypted = cryptoLayer.decrypt(obj.encryptedPayload);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          obj.caption = parsed.caption;
        } else {
          obj.caption = "[TAMPER DETECTED / DECRYPTION FAILED]";
        }
      }
      return obj;
    });
  }

  // Helper for background compaction (removing soft deleted items and old data)
  async compactDatabase() {
    try {
      // 1. Delete soft deleted items
      const deletedCount = await this.activities.where("isDeleted").equals("true").delete();
      
      // 2. Adaptive Cache Eviction: Keep only the latest 2000 activities per friend to avoid memory explosions
      let staleCount = 0;
      const friends = await this.friends.toArray();
      
      for (const friend of friends) {
        const count = await this.activities.where("friendId").equals(friend.id).count();
        const LIMIT = 2000;
        if (count > LIMIT) {
          const itemsToDelete = await this.activities
            .where("friendId")
            .equals(friend.id)
            .sortBy("timestamp")
            .then(arr => arr.slice(0, count - LIMIT)); // get the oldest items
            
          const idsToDelete = itemsToDelete.map(i => i.id);
          await this.activities.bulkDelete(idsToDelete);
          staleCount += idsToDelete.length;
        }
      }

      const totalRemoved = deletedCount + staleCount;
      if (totalRemoved > 0) {
        console.log(`[Cache Engine] Compacted ${totalRemoved} stale/deleted records.`);
        
        // Use dynamic import to avoid circular dependency issues with EventBus and DB during init
        import("../core/events/EventBus").then(({ eventBus }) => {
          eventBus.emit("cache:compacted", { itemsRemoved: totalRemoved });
        });
      }
    } catch (e) {
      console.error("[Cache Engine] Compaction failed", e);
    }
  }
}

export const db = new IgTrackDatabase();
