/**
 * Feature Flags System
 * Supports local overrides and future remote environment configs.
 */

type FlagKey = 
  | "debugMode" 
  | "recordRequests" 
  | "mockData" 
  | "virtualizedTimelines" 
  | "advancedHeatmaps";

class FeatureFlags {
  // Default values for flags
  private flags: Record<FlagKey, boolean> = {
    debugMode: process.env.NODE_ENV === "development",
    recordRequests: process.env.NODE_ENV === "development",
    mockData: true, // Use mock data until Instagram Integration is fully active
    virtualizedTimelines: true,
    advancedHeatmaps: false, // Experimental feature
  };

  constructor() {
    this.loadLocalOverrides();
  }

  /**
   * Load any developer overrides from localStorage
   * (Useful for testing specific features without changing code)
   */
  private loadLocalOverrides() {
    if (typeof window === "undefined") return;
    
    try {
      const overrides = localStorage.getItem("igTrack_featureFlags");
      if (overrides) {
        const parsed = JSON.parse(overrides);
        this.flags = { ...this.flags, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to load feature flag overrides", e);
    }
  }

  public isEnabled(key: FlagKey): boolean {
    return this.flags[key] ?? false;
  }

  public setFlag(key: FlagKey, value: boolean) {
    this.flags[key] = value;
    if (typeof window !== "undefined") {
      localStorage.setItem("igTrack_featureFlags", JSON.stringify(this.flags));
    }
  }

  public getAllFlags() {
    return { ...this.flags };
  }
}

export const featureFlags = new FeatureFlags();
