/**
 * Data Intelligence Pipeline
 * Separates Operational Data from Analytics/AI Data.
 * Phases: Ingestion -> Normalization -> Enrichment -> Vectorization
 */

import { Activity } from "@/lib/db";
import { logger } from "@/core/observability/logger";
import { eventBus } from "@/core/events/EventBus";

export interface EnrichedActivity extends Activity {
  semanticScore: number;
  tags: string[];
  engagementClassification: "passive" | "active" | "viral";
  vectorReadyText: string;
}

export class DataPipeline {
  
  /**
   * Phase 1 & 2 are handled by the NetworkInterceptor & Normalizers.
   * This method takes a normalized activity and processes it for the Analytics/AI layer.
   */
  public process(normalizedData: Activity): EnrichedActivity | null {
    try {
      const enriched = this.enrich(normalizedData);
      const vectorReady = this.vectorize(enriched);
      
      // Emit event for the UI/Analytics stores to consume
      eventBus.emit("cache:hit", { key: `processed_${enriched.id}`, context: "DataPipeline" });
      
      return vectorReady;
    } catch (error) {
      logger.error("DataPipeline", "Failed to process activity", { error, dataId: normalizedData.id });
      return null;
    }
  }

  /**
   * Phase 3: Enrichment
   * Adds metadata, scores, and behavioral classifications.
   */
  private enrich(activity: Activity): Omit<EnrichedActivity, 'vectorReadyText'> {
    let semanticScore = 1.0;
    const tags: string[] = [];
    let classification: "passive" | "active" | "viral" = "passive";

    // Basic heuristic enrichment (To be replaced by real NLP/ML models later)
    if (activity.type === "repost") {
      semanticScore = 2.0;
      classification = "viral";
      tags.push("high-intent");
    } else if (activity.type === "watch") {
      semanticScore = 0.5;
      classification = "passive";
      tags.push("consumption");
    } else {
      classification = "active";
      tags.push("engagement");
    }

    const captionLower = activity.caption.toLowerCase();
    if (captionLower.includes("tech") || captionLower.includes("code")) tags.push("technology");
    if (captionLower.includes("design") || captionLower.includes("ui")) tags.push("design");

    return {
      ...activity,
      semanticScore,
      tags,
      engagementClassification: classification,
    };
  }

  /**
   * Phase 4: Vectorization Prep
   * Converts the structured data into a format suitable for Embedding Models.
   */
  private vectorize(enriched: Omit<EnrichedActivity, 'vectorReadyText'>): EnrichedActivity {
    // We create a dense semantic string that represents this interaction
    const vectorText = `User interaction: ${enriched.type}. Target Author: ${enriched.authorUsername}. Context: ${enriched.caption}. Semantic Tags: ${enriched.tags.join(", ")}.`;
    
    return {
      ...enriched,
      vectorReadyText: vectorText
    };
  }

  /**
   * Future Phase: Anomaly Detection
   * Compares the current interaction against historical baseline.
   */
  public detectAnomaly(activity: EnrichedActivity, userBaseline: any): boolean {
    // Stub for advanced Behavioral Intelligence
    return false;
  }
}

export const dataPipeline = new DataPipeline();
