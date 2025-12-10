/**
 * Media signature utilities for generating and verifying signed URLs for R2 media objects.
 * These signatures ensure that only our Worker can generate valid URLs for accessing media.
 */

/**
 * Generate a signature for a media storage key with expiration.
 * @param signingSecret - The secret key from environment variables
 * @param storageKey - The R2 storage key for the media object
 * @param expiresAt - Unix timestamp when the URL expires
 * @returns The signature string (first 32 characters of SHA-256 hash)
 * @throws Error if signature generation fails
 */
export async function generateMediaSignature(
  signingSecret: string,
  storageKey: string,
  expiresAt: number
): Promise<string> {
  try {
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${signingSecret}:${storageKey}:${expiresAt}`)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32); // Use first 32 chars as signature
  } catch (error) {
    console.error('Error generating media signature:', error);
    throw new Error('Failed to generate signature');
  }
}

/**
 * Verify a signature for a media storage key with expiration.
 * @param signingSecret - The secret key from environment variables
 * @param storageKey - The R2 storage key for the media object
 * @param expiresAt - Unix timestamp when the URL expires
 * @param providedSignature - The signature to verify
 * @returns True if the signature is valid, false otherwise
 */
export async function verifyMediaSignature(
  signingSecret: string,
  storageKey: string,
  expiresAt: number,
  providedSignature: string
): Promise<boolean> {
  try {
    const expectedSignature = await generateMediaSignature(signingSecret, storageKey, expiresAt);
    return expectedSignature === providedSignature;
  } catch (error) {
    console.error('Error verifying media signature:', error);
    return false;
  }
}
