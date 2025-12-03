import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

/**
 * Get encryption key from environment variable
 * @throws {Error} If ENCRYPTION_KEY is not set or invalid length
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Ensure key is exactly 32 bytes for AES-256
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must be exactly 32 characters for AES-256-GCM"
    );
  }

  return Buffer.from(key, "utf-8");
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 *
 * @param plaintext - The plaintext string to encrypt
 * @returns Base64-encoded string containing IV, auth tag, and ciphertext separated by colons
 *
 * @example
 * ```typescript
 * const encrypted = encryptApiKey("sk-1234567890abcdef");
 * // Returns: "base64_iv:base64_authTag:base64_ciphertext"
 * ```
 */
export function encryptApiKey(plaintext: string): string {
  if (!plaintext) {
    throw new Error("Cannot encrypt empty plaintext");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:ciphertext (all base64 encoded)
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string using AES-256-GCM
 *
 * @param encrypted - The encrypted string (format: "iv:authTag:ciphertext")
 * @returns The decrypted plaintext string
 *
 * @throws {Error} If decryption fails or format is invalid
 *
 * @example
 * ```typescript
 * const decrypted = decryptApiKey("base64_iv:base64_authTag:base64_ciphertext");
 * // Returns: "sk-1234567890abcdef"
 * ```
 */
export function decryptApiKey(encrypted: string): string {
  if (!encrypted) {
    throw new Error("Cannot decrypt empty string");
  }

  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted format. Expected format: iv:authTag:ciphertext"
    );
  }

  const [ivBase64, authTagBase64, ciphertextBase64] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");
  const ciphertext = Buffer.from(ciphertextBase64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}
