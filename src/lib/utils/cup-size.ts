import { CupSize as PrismaCupSize } from '@/generated/prisma'

/**
 * Converts various cup size formats to Prisma cup size format
 *
 * Prisma only supports single letters A-Z, so:
 * - Single letters (A, B, C, D) remain unchanged
 * - Double letters (DD, EE, FF) convert to the next letter (E, F, G)
 * - Triple letters (DDD, EEE, FFF) convert to the letter after that (F, G, H)
 * - This pattern continues through the alphabet
 *
 * @param cupSize - The cup size to convert (e.g., "DD", "DDD", "FF")
 * @returns The converted cup size as PrismaCupSize or undefined if invalid
 *
 * @example
 * ```typescript
 * convertToPrismaCupSize("DD") // returns "E"
 * convertToPrismaCupSize("DDD") // returns "F"
 * convertToPrismaCupSize("FF") // returns "G"
 * convertToPrismaCupSize("A") // returns "A"
 * ```
 */
export const convertToPrismaCupSize = (cupSize: string): PrismaCupSize | undefined => {
  if (!cupSize || typeof cupSize !== 'string') return undefined

  const normalized = cupSize.trim().toUpperCase()
  if (!/^[A-Z]{1,3}$/.test(normalized)) return undefined

  // Single letter (no conversion needed)
  if (normalized.length === 1) {
    return normalized as PrismaCupSize
  }

  // Double letters convert to next letter
  // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
  if (normalized.length === 2 && normalized[0] === normalized[1]) {
    const letter = normalized[0]
    const charCode = letter.charCodeAt(0)
    if (charCode >= 65 && charCode < 90) {
      // A-Y
      return String.fromCharCode(charCode + 1) as PrismaCupSize
    }
    return 'Z' as PrismaCupSize // Z is the maximum
  }

  // Triple letters convert to letter after next
  // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
  if (normalized.length === 3 && normalized[0] === normalized[1] && normalized[1] === normalized[2]) {
    const letter = normalized[0]
    const charCode = letter.charCodeAt(0)
    if (charCode >= 65 && charCode < 89) {
      // A-X
      return String.fromCharCode(charCode + 2) as PrismaCupSize
    }
    return 'Z' as PrismaCupSize // Z is the maximum
  }

  return undefined
}
