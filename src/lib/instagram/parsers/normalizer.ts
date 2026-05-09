/**
 * Normalization Layer
 * Converts complex Instagram Raw Types into our clean internal Types.
 */

import { Activity } from "../../db";
import { IgRawActivitySchema, IgRawMediaSchema, safeParse } from "./schema";

export class Normalizer {
  
  public static normalizeActivityFeed(rawData: any, friendId: string): Activity[] {
    const activities: Activity[] = [];
    
    // This is highly specific to the endpoint structure
    // We assume rawData contains an array of raw activities
    const edges = rawData?.edge_activity?.edges || rawData?.news_surface?.items || [];

    for (const edge of edges) {
      const parsed = safeParse(IgRawActivitySchema, edge, "ActivityFeed");
      if (!parsed) continue;

      // Extract details intelligently
      const type = this.inferActivityType(parsed);
      const timestamp = parsed.timestamp ? parsed.timestamp * 1000 : Date.now();
      
      const mediaItem = parsed.args?.media?.[0];
      const linkItem = parsed.args?.links?.[0];

      activities.push({
        id: `act_${parsed.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        instagramId: mediaItem?.id || linkItem?.id || "unknown",
        friendId,
        type,
        timestamp,
        contentUrl: `https://instagram.com/p/${mediaItem?.id}/`,
        thumbnailUrl: mediaItem?.image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80",
        authorUsername: "unknown",
        authorAvatar: "https://i.pravatar.cc/150",
        caption: parsed.args?.text || "Interaction",
        isDeleted: false
      });
    }

    return activities;
  }

  private static inferActivityType(parsedData: any): "like" | "repost" | "watch" {
    const text = parsedData.args?.text?.toLowerCase() || "";
    if (text.includes("liked")) return "like";
    if (text.includes("reposted") || text.includes("shared")) return "repost";
    if (text.includes("watched")) return "watch";
    return "like"; // default fallback
  }

}
