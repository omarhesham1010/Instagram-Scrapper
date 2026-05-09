/**
 * Security Hardening: Encryption Layer
 * Provides an abstraction for encrypting local data.
 */

import CryptoJS from "crypto-js";
import { logger } from "../observability/logger";

export interface CryptoProvider {
  encrypt(data: string): string;
  decrypt(ciphertext: string): string | null;
  hash(data: string): string;
}

export class AESCryptoProvider implements CryptoProvider {
  private readonly secretKey: string;

  constructor() {
    // In a real production app, this would be derived from a user password or a native secure storage API.
    // For this architecture phase, we use an environment variable or a strong fallback.
    this.secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "IG_TRACK_SECURE_KEY_2026_FALLBACK";
  }

  public encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.secretKey).toString();
    } catch (e) {
      logger.error("CryptoLayer", "Encryption failed", e);
      throw new Error("Encryption failed");
    }
  }

  public decrypt(ciphertext: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if (!originalText) return null;
      return originalText;
    } catch (e) {
      logger.error("CryptoLayer", "Decryption failed (Tamper detected or wrong key)", e);
      return null; // Return null safely on tamper detection
    }
  }

  public hash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }
}

// Export a singleton instance of the chosen provider
export const cryptoLayer: CryptoProvider = new AESCryptoProvider();
