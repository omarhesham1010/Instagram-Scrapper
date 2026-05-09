import Dexie, { Table } from "dexie";

// Types
export interface Friend {
  id: string;
  instagramId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  lastSyncAt: number;
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
}

export class IgTrackDatabase extends Dexie {
  friends!: Table<Friend, string>;
  activities!: Table<Activity, string>;

  constructor() {
    super("IgTrackDatabase");
    
    // Define schema
    this.version(1).stores({
      friends: "id, instagramId, username, lastSyncAt",
      activities: "id, friendId, type, timestamp, [friendId+type]",
    });
  }
}

export const db = new IgTrackDatabase();
