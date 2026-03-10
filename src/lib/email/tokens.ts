import crypto from 'crypto'

/**
 * Generate a cryptographically secure random hex token.
 * Default 32 bytes = 64 hex chars (256-bit entropy).
 */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
export function safeTokenCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
