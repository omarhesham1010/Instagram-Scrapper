/**
 * Anti-Fragility: Endpoint Reliability Scorer
 * Tracks the success rate of various endpoints and fallback parsers.
 * Implements Confidence Decay over time.
 */

import { eventBus } from "../../core/events/EventBus";
import { logger } from "../../core/observability/logger";

interface EndpointScore {
  endpointId: string;
  successes: number;
  failures: number;
  lastAttempt: number;
  confidence: number; // 0.0 to 1.0
}

export class EndpointReliabilityScorer {
  private scores: Map<string, EndpointScore> = new Map();
  private readonly DECAY_RATE_PER_DAY = 0.05; // Confidence decays slightly over time if unused
  private readonly FAILURE_PENALTY = 0.2; // Massive penalty for a parser failure
  private readonly SUCCESS_REWARD = 0.05;

  constructor() {
    this.listenToEvents();
  }

  private listenToEvents() {
    eventBus.on("parser:success", ({ schemaName }) => {
      this.recordAttempt(schemaName, true);
    });

    eventBus.on("parser:drift_detected", ({ schemaName }) => {
      this.recordAttempt(schemaName, false);
    });
  }

  private recordAttempt(endpointId: string, success: boolean) {
    let score = this.scores.get(endpointId) || {
      endpointId,
      successes: 0,
      failures: 0,
      lastAttempt: Date.now(),
      confidence: 1.0 // Start optimistic
    };

    if (success) {
      score.successes += 1;
      score.confidence = Math.min(1.0, score.confidence + this.SUCCESS_REWARD);
    } else {
      score.failures += 1;
      score.confidence = Math.max(0.0, score.confidence - this.FAILURE_PENALTY);
    }

    score.lastAttempt = Date.now();
    this.scores.set(endpointId, score);

    if (score.confidence < 0.3) {
      logger.warn("AntiFragility", `Endpoint ${endpointId} confidence critically low (${score.confidence}). Triggering Quarantine.`);
      // In a full implementation, this would tell the RequestManager to switch to a fallback endpoint.
    }
  }

  public getConfidence(endpointId: string): number {
    const score = this.scores.get(endpointId);
    if (!score) return 1.0;

    // Calculate time decay
    const daysSinceLastAttempt = (Date.now() - score.lastAttempt) / (1000 * 60 * 60 * 24);
    const decayedConfidence = Math.max(0.0, score.confidence - (daysSinceLastAttempt * this.DECAY_RATE_PER_DAY));
    
    return decayedConfidence;
  }
}

export const endpointScorer = new EndpointReliabilityScorer();

/**
 * AI-Ready Data Pipeline Stub
 * Demonstrates separation of Ingestion, Normalization, Enrichment, and Vectorization.
 */
export class AIDataPipeline {
  // 1. Raw Ingestion -> Done by Interceptor
  // 2. Normalization -> Done by parsers/normalizer.ts
  
  // 3. Enrichment (e.g., adding Semantic Categories)
  public static enrichActivity(normalizedActivity: any) {
    // Stub: Determine if this activity is "Tech", "Entertainment", etc. based on caption keywords
    return {
      ...normalizedActivity,
      semanticTags: ["uiux", "tech"], // Example
      engagementWeight: normalizedActivity.type === "repost" ? 1.5 : 1.0
    };
  }

  // 4. Vectorization (Ready for Embeddings)
  public static createVectorPayload(enrichedActivity: any) {
    // Converts the activity into a string optimized for an embedding model
    return `[USER_INTERACTION] User engaged with content by ${enrichedActivity.authorUsername}. Caption: ${enrichedActivity.caption}. Tags: ${enrichedActivity.semanticTags?.join(",")}`;
  }
}
