import { Activity, db } from "@/lib/db";
import { logger } from "@/core/observability/logger";

export interface BehavioralVector {
  userId: string;
  engagementScore: number;     // 0-100 indicating how active the user is recently
  topInterests: string[];      // extracted keywords or categories
  creatorAffinity: Record<string, number>; // username -> affinity score (0-100)
  bingeSessionCount: number;
}

export class IntelligenceEngine {
  /**
   * Generates an AI-ready behavioral vector for a given friend based on their local activity cache.
   */
  public async generateVector(friendId: string): Promise<BehavioralVector | null> {
    try {
      const activities = await db.activities
        .where("friendId")
        .equals(friendId)
        .sortBy("timestamp");

      if (activities.length === 0) return null;

      const vector: BehavioralVector = {
        userId: friendId,
        engagementScore: this.calculateEngagement(activities),
        topInterests: this.extractInterests(activities),
        creatorAffinity: this.calculateAffinity(activities),
        bingeSessionCount: this.calculateBingeSessions(activities)
      };

      logger.debug("Intelligence", `Generated Vector for ${friendId}`, vector);
      return vector;
    } catch (e) {
      logger.error("Intelligence", "Failed to generate vector", e);
      return null;
    }
  }

  private calculateEngagement(activities: Activity[]): number {
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    // Weight recent activities higher
    let score = 0;
    for (const act of activities) {
      const age = now - act.timestamp;
      if (age < oneWeekMs) {
        score += 2; // high weight for recent
      } else if (age < oneWeekMs * 4) {
        score += 1; // normal weight for past month
      } else {
        score += 0.5; // low weight for old
      }
    }

    // Normalize 0-100 (assuming 100 activities a week is max engagement)
    return Math.min(Math.round((score / 200) * 100), 100);
  }

  private calculateAffinity(activities: Activity[]): Record<string, number> {
    const affinity: Record<string, number> = {};
    
    for (const act of activities) {
      if (!act.authorUsername || act.authorUsername === "unknown") continue;
      
      const weight = act.type === "repost" ? 3 : act.type === "watch" ? 1 : 2;
      affinity[act.authorUsername] = (affinity[act.authorUsername] || 0) + weight;
    }

    // Normalize to 0-100 relative to the top creator
    const maxScore = Math.max(...Object.values(affinity), 1);
    for (const author in affinity) {
      affinity[author] = Math.round((affinity[author] / maxScore) * 100);
    }

    return affinity;
  }

  private calculateBingeSessions(activities: Activity[]): number {
    let bingeCount = 0;
    for (let i = 0; i < activities.length - 2; i++) {
      const t1 = activities[i].timestamp;
      const t3 = activities[i + 2].timestamp;
      if (Math.abs(t1 - t3) <= 600000) { // 10 mins
        bingeCount++;
        i += 2; // skip to end of this detected binge
      }
    }
    return bingeCount;
  }

  private extractInterests(activities: Activity[]): string[] {
    // A primitive placeholder for semantic tagging until NLP is added
    const textCorpus = activities.map(a => a.caption || "").join(" ").toLowerCase();
    const interests = new Set<string>();
    
    if (textCorpus.match(/\b(tech|code|ai|programming)\b/)) interests.add("Technology");
    if (textCorpus.match(/\b(music|song|album|concert)\b/)) interests.add("Music");
    if (textCorpus.match(/\b(food|restaurant|recipe|cooking)\b/)) interests.add("Food");
    if (textCorpus.match(/\b(travel|trip|flight|hotel)\b/)) interests.add("Travel");
    
    return Array.from(interests);
  }
}

export const intelligenceEngine = new IntelligenceEngine();
