/**
 * Request Fingerprinting & Endpoint Auto-Detection
 * Identifies if an intercepted request contains Activity, Reel, or Profile data
 * without relying on hardcoded Endpoint IDs.
 */

import { logger } from "@/core/observability/logger";

export type DetectedEndpointType = 
  | "UNKNOWN"
  | "USER_PROFILE"
  | "USER_FOLLOWING"
  | "ACTIVITY_FEED"
  | "REEL_DATA";

interface DetectionResult {
  type: DetectedEndpointType;
  confidence: number; // 0.0 to 1.0
  operationName?: string;
}

export class EndpointFingerprinter {
  
  /**
   * Analyzes the URL, Payload, and Response structure to guess what data this is.
   */
  public detect(url: string, payload: any, response: any): DetectionResult {
    let type: DetectedEndpointType = "UNKNOWN";
    let confidence = 0;
    const operationName = this.extractOperationName(payload) || this.extractOperationNameFromUrl(url);

    // 1. Check Operation Names (High Confidence)
    if (operationName) {
      if (operationName.toLowerCase().includes("following")) {
        type = "USER_FOLLOWING";
        confidence = 0.9;
      } else if (operationName.toLowerCase().includes("profile")) {
        type = "USER_PROFILE";
        confidence = 0.8;
      } else if (operationName.toLowerCase().includes("reels") || operationName.toLowerCase().includes("clips")) {
        type = "REEL_DATA";
        confidence = 0.9;
      } else if (operationName.toLowerCase().includes("activity") || operationName.toLowerCase().includes("news")) {
        type = "ACTIVITY_FEED";
        confidence = 0.8;
      }
    }

    // 2. Structural/Payload Matching (Fallback)
    if (confidence < 0.7 && response?.data) {
      const dataStr = JSON.stringify(response.data);
      
      // Look for telltale structures of an activity feed
      if (dataStr.includes("edge_activity") || dataStr.includes("news_surface")) {
        type = "ACTIVITY_FEED";
        confidence = Math.max(confidence, 0.85);
      }
      
      // Look for reel structures
      if (dataStr.includes("video_versions") || dataStr.includes("has_audio")) {
        type = "REEL_DATA";
        confidence = Math.max(confidence, 0.85);
      }
    }

    if (confidence > 0.5) {
      logger.debug("Fingerprinter", `Detected ${type} with ${confidence*100}% confidence. Op: ${operationName}`);
    }

    return { type, confidence, operationName };
  }

  private extractOperationName(payload: any): string | undefined {
    if (!payload) return undefined;
    
    // GraphQL POST body often has `operationName` or `doc_id`
    if (payload.operationName) return payload.operationName;
    if (payload.fb_api_req_friendly_name) return payload.fb_api_req_friendly_name;
    
    return undefined;
  }

  private extractOperationNameFromUrl(url: string): string | undefined {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://instagram.com${url}`);
      return urlObj.searchParams.get("doc_id") || undefined;
    } catch {
      return undefined;
    }
  }
}

export const fingerprinter = new EndpointFingerprinter();
