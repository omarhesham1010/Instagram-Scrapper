/**
 * Network Interception Engine
 * Injected into the Instagram page to monitor and capture XHR and Fetch requests.
 * Uses fingerprinting to auto-detect GraphQL payloads.
 */

import { logger } from "@/core/observability/logger";
import { fingerprinter, DetectedEndpointType } from "./fingerprint";
import { eventBus } from "@/core/events/EventBus";

export interface InterceptedPayload {
  url: string;
  payload: any;
  response: any;
  type: DetectedEndpointType;
  confidence: number;
}

type InterceptedCallback = (data: InterceptedPayload) => void;

class NetworkInterceptor {
  private callbacks: InterceptedCallback[] = [];
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    logger.info("NetworkInterceptor", "Initializing Fetch & XHR overrides");
    this.overrideFetch();
    this.overrideXHR();
  }

  public subscribe(cb: InterceptedCallback) {
    this.callbacks.push(cb);
  }

  private notifySubscribers(url: string, payload: any, responseBody: any) {
    const detection = fingerprinter.detect(url, payload, responseBody);
    
    // Only notify if we have a reasonable confidence it's Instagram data we care about
    if (detection.confidence > 0.5 && detection.type !== "UNKNOWN") {
      const interceptedData: InterceptedPayload = {
        url,
        payload,
        response: responseBody,
        type: detection.type,
        confidence: detection.confidence
      };

      // Broadcast to EventBus for Observability & DevTools
      eventBus.emit("network:intercepted", interceptedData);

      for (const cb of this.callbacks) {
        try {
          cb(interceptedData);
        } catch (e) {
          logger.error("NetworkInterceptor", "Callback error", e);
        }
      }
    }
  }

  private overrideFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      try {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
        
        if (url.includes("/api/v1/") || url.includes("/graphql/query")) {
          const clonedResponse = response.clone();
          const responseBody = await clonedResponse.json();
          
          let payload = null;
          if (args[1] && args[1].body) {
            try {
              payload = typeof args[1].body === "string" ? JSON.parse(args[1].body) : "FormData/Binary";
            } catch {
              payload = args[1].body;
            }
          }

          this.notifySubscribers(url, payload, responseBody);
        }
      } catch (e) {
        // Silently fail to not break the original request
      }
      
      return response;
    };
  }

  private overrideXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const interceptor = this;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
      (this as any)._url = url.toString();
      (this as any)._method = method;
      return originalOpen.apply(this, [method, url, ...rest] as any);
    };

    XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      this.addEventListener("load", function() {
        try {
          const url = (this as any)._url;
          if (url && (url.includes("/api/v1/") || url.includes("/graphql/query"))) {
            if (this.responseType === "" || this.responseType === "text") {
              const responseBody = JSON.parse(this.responseText);
              
              let payload = null;
              if (body && typeof body === "string") {
                try {
                  payload = JSON.parse(body);
                } catch {
                  payload = body;
                }
              }

              interceptor.notifySubscribers(url, payload, responseBody);
            }
          }
        } catch (e) {
          // Ignore
        }
      });
      return originalSend.apply(this, [body] as any);
    };
  }
}

export const networkInterceptor = new NetworkInterceptor();
