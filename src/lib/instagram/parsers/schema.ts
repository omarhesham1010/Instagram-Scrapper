/**
 * Zod Schemas for Instagram Raw Payloads
 * Helps detect "Schema Drift" if Instagram changes their internal APIs.
 */

import { z } from "zod";
import { logger } from "@/core/observability/logger";

// 1. Raw User Schema
export const IgRawUserSchema = z.object({
  pk: z.union([z.string(), z.number()]).transform(String),
  username: z.string(),
  full_name: z.string().optional(),
  profile_pic_url: z.string().url(),
  is_private: z.boolean().optional(),
}).passthrough(); // Passthrough allows other unknown fields without failing

// 2. Raw Media Schema (Reel / Post)
export const IgRawMediaSchema = z.object({
  id: z.string(),
  pk: z.union([z.string(), z.number()]).transform(String),
  media_type: z.number().optional(),
  code: z.string().optional(),
  caption: z.object({
    text: z.string()
  }).nullable().optional(),
  user: IgRawUserSchema.optional(),
  image_versions2: z.object({
    candidates: z.array(z.object({
      url: z.string()
    }))
  }).optional(),
  video_versions: z.array(z.object({
    url: z.string()
  })).optional(),
}).passthrough();

// 3. Raw Activity Schema
export const IgRawActivitySchema = z.object({
  timestamp: z.number().optional(),
  type: z.number().optional(),
  args: z.object({
    text: z.string().optional(),
    links: z.array(z.object({
      start: z.number(),
      end: z.number(),
      id: z.string().optional()
    })).optional(),
    media: z.array(z.object({
      id: z.string(),
      image: z.string().url().optional()
    })).optional()
  }).passthrough().optional()
}).passthrough();


/**
 * Safe Parsing wrapper with Schema Drift detection & Automatic Quarantine
 */

const parserHealthTracker: Record<string, { errors: number; quarantined: boolean }> = {};

export function safeParse<T>(schema: z.ZodType<T>, data: any, context: string): T | null {
  if (!parserHealthTracker[context]) {
    parserHealthTracker[context] = { errors: 0, quarantined: false };
  }

  const tracker = parserHealthTracker[context];

  if (tracker.quarantined) {
    // If quarantined, don't burn CPU attempting full validation. 
    // Just try a very dirty, primitive fallback or return null.
    logger.warn("SchemaDrift", `Parser ${context} is quarantined. Attempting graceful degradation.`);
    return data as T; // Fallback: return raw data blindly as any (dangerous but keeps app alive)
  }

  const result = schema.safeParse(data);
  
  if (!result.success) {
    tracker.errors++;
    
    // Dynamic import of EventBus to prevent SSR/circular dep issues
    import("@/core/events/EventBus").then(({ eventBus }) => {
      eventBus.emit("parser:drift_detected", { schemaName: context, errors: result.error.format() });
    });

    logger.warn("SchemaDrift", `Schema validation failed for ${context}`, result.error.format());

    // Auto-quarantine if it fails continuously (e.g., 3 consecutive errors)
    if (tracker.errors >= 3) {
      tracker.quarantined = true;
      logger.error("SchemaDrift", `Parser ${context} quarantined after ${tracker.errors} failures.`);
    }

    return null;
  }
  
  // Success! Reset error tracker.
  tracker.errors = 0;
  
  // Only trace success if it's not spammy, or just sample it.
  if (Math.random() > 0.9) {
    import("@/core/events/EventBus").then(({ eventBus }) => {
      eventBus.emit("parser:success", { schemaName: context, durationMs: 1 });
    });
  }

  return result.data;
}
