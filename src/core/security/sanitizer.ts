/**
 * Security: Data Sanitizer
 * Ensures no sensitive tokens, session IDs, or private user data 
 * accidentally leak into internal logs or developer tools.
 */

export class DataSanitizer {
  private readonly SENSITIVE_KEYS = [
    "csrftoken", 
    "sessionid", 
    "ds_user_id", 
    "authorization",
    "password",
    "cookie"
  ];

  /**
   * Deeply sanitizes an object by masking sensitive keys.
   */
  public sanitize(data: any): any {
    if (!data) return data;
    
    // Primitive types
    if (typeof data !== "object") {
      if (typeof data === "string" && this.looksLikeToken(data)) {
        return "[REDACTED_TOKEN]";
      }
      return data;
    }

    // Arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    // Objects
    const sanitizedObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (this.isSensitiveKey(key)) {
          sanitizedObj[key] = "[REDACTED_SECURE_FIELD]";
        } else {
          sanitizedObj[key] = this.sanitize(data[key]);
        }
      }
    }

    return sanitizedObj;
  }

  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey));
  }

  private looksLikeToken(value: string): boolean {
    // Basic heuristic for JWTs or long opaque tokens
    return (value.startsWith("eyJ") && value.length > 30) || (value.length > 50 && /^[a-zA-Z0-9_-]+$/.test(value));
  }
}

export const sanitizer = new DataSanitizer();
