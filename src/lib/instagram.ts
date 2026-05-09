/**
 * Instagram API Abstraction Layer
 * Designed to be highly resilient against endpoint changes, rate limits, and network issues.
 */

// Custom Error classes for precise error handling
export class InstagramAuthError extends Error {
  constructor(message = "Session invalid or expired. Please login to Instagram.") {
    super(message);
    this.name = "InstagramAuthError";
  }
}

export class InstagramRateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Rate limited. Try again in ${retryAfter} seconds.`);
    this.name = "InstagramRateLimitError";
  }
}

interface RequestConfig {
  endpoint: string;
  method?: "GET" | "POST";
  body?: any;
  retries?: number;
}

class InstagramAPI {
  private readonly BASE_URL = "https://www.instagram.com/api/v1";
  private readonly DEFAULT_RETRIES = 3;
  
  // Rate limiting tracker
  private lastRequestTime: number = 0;
  private readonly MIN_DELAY_BETWEEN_REQUESTS = 1000; // 1 second

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleRateLimiting() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_DELAY_BETWEEN_REQUESTS) {
      await this.sleep(this.MIN_DELAY_BETWEEN_REQUESTS - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  private getCsrfToken(): string {
    // In a real extension context, we'd extract this from the document.cookie
    // This is a placeholder for the content script implementation.
    return "EXTRACTED_CSRF_TOKEN";
  }

  /**
   * Core request dispatcher with retry logic and error handling
   */
  private async request<T>(config: RequestConfig): Promise<T> {
    const { endpoint, method = "GET", body, retries = this.DEFAULT_RETRIES } = config;
    let attempt = 0;

    while (attempt < retries) {
      try {
        await this.handleRateLimiting();

        const url = endpoint.startsWith("http") ? endpoint : `${this.BASE_URL}${endpoint}`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCsrfToken(),
          "X-IG-App-ID": "936619743392459", // Instagram Web App ID
          // In a Chrome Extension background script, cookies are automatically sent
        };

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          throw new InstagramAuthError();
        }

        if (response.status === 429) {
          // Typically Instagram returns a retry-after header or we use exponential backoff
          const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
          throw new InstagramRateLimitError(retryAfter);
        }

        if (!response.ok) {
          throw new Error(`Instagram API Error: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        attempt++;
        
        if (error instanceof InstagramAuthError) {
          throw error; // Don't retry auth errors
        }

        if (error instanceof InstagramRateLimitError) {
          if (attempt >= retries) throw error;
          await this.sleep(error.retryAfter * 1000);
          continue;
        }

        if (attempt >= retries) {
          throw error;
        }
        
        // Exponential backoff for network/unknown errors
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }

    throw new Error("Maximum retries reached");
  }

  // --- Abstracted Business Methods ---

  public async validateSession(): Promise<boolean> {
    try {
      // Endpoint that requires auth but is lightweight
      await this.request({ endpoint: "/accounts/current_user/?edit=true", retries: 1 });
      return true;
    } catch {
      return false;
    }
  }

  public async getUserFollowing(userId: string, maxId?: string): Promise<any> {
    const endpoint = `/friendships/${userId}/following/?count=12${maxId ? `&max_id=${maxId}` : ""}`;
    return this.request({ endpoint });
  }

  public async getFriendRecentActivity(userId: string): Promise<any> {
    // This is highly dependent on Instagram's internal endpoints.
    // E.g., reading notifications, or scraping profiles.
    // Placeholder architecture.
    return this.request({ endpoint: `/feed/user/${userId}/` });
  }
}

export const igAPI = new InstagramAPI();
