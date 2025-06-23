/**
 * Cup size conversion utilities
 *
 * Converts between different cup size naming conventions used in various regions and brands.
 * The conversion follows a standardized mapping where:
 * - Single letters (A, B, C, D) remain unchanged
 * - Double letters (DD, EE, FF) convert to the next letter (E, F, G)
 * - Triple letters (DDD, EEE, FFF) convert to the letter after that (F, G, H)
 * - This pattern continues through the alphabet
 *
 * Examples:
 * - "DD" → "E"
 * - "DDD" → "F"
 * - "FF" → "G"
 * - "A" → "A" (no change)
 */

// Valid cup size patterns
export type CupSize =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'AA'
  | 'BB'
  | 'CC'
  | 'DD'
  | 'EE'
  | 'FF'
  | 'GG'
  | 'HH'
  | 'II'
  | 'JJ'
  | 'KK'
  | 'LL'
  | 'MM'
  | 'NN'
  | 'OO'
  | 'PP'
  | 'QQ'
  | 'RR'
  | 'SS'
  | 'TT'
  | 'UU'
  | 'VV'
  | 'WW'
  | 'XX'
  | 'YY'
  | 'ZZ'
  | 'AAA'
  | 'BBB'
  | 'CCC'
  | 'DDD'
  | 'EEE'
  | 'FFF'
  | 'GGG'
  | 'HHH'
  | 'III'
  | 'JJJ'
  | 'KKK'
  | 'LLL'
  | 'MMM'
  | 'NNN'
  | 'OOO'
  | 'PPP'
  | 'QQQ'
  | 'RRR'
  | 'SSS'
  | 'TTT'
  | 'UUU'
  | 'VVV'
  | 'WWW'
  | 'XXX'
  | 'YYY'
  | 'ZZZ'

/**
 * Options for cup size conversion
 */
export interface CupSizeConversionOptions {
  /** Whether to preserve the original case (default: false) */
  preserveCase?: boolean
  /** Whether to return the original value if no conversion is found (default: true) */
  returnOriginal?: boolean
  /** Whether to throw an error for invalid input (default: false) */
  strict?: boolean
}

/**
 * Standardized cup size mapping
 * Maps various cup size formats to a consistent standard
 */
const CUP_SIZE_MAP: Record<string, CupSize> = {
  // Single letters (no conversion needed)
  ...Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => [letter, letter as CupSize])),

  // Double letters convert to next letter
  ...Object.fromEntries(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => {
      const double = letter + letter
      const nextIndex = index + 1
      const nextLetter = nextIndex < 26 ? String.fromCharCode(65 + nextIndex) : 'Z'
      return [double, nextLetter as CupSize]
    })
  ),

  // Triple letters convert to letter after next
  ...Object.fromEntries(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => {
      const triple = letter + letter + letter
      const targetIndex = index + 2
      const targetLetter = targetIndex < 26 ? String.fromCharCode(65 + targetIndex) : 'Z'
      return [triple, targetLetter as CupSize]
    })
  )
} as const

/**
 * Validates if a string is a valid cup size format
 */
export const isValidCupSize = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false
  return input.trim().toUpperCase() in CUP_SIZE_MAP
}

/**
 * Normalizes a cup size string for consistent processing
 */
const normalizeCupSize = (input: string): string | null => {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed || !/^[A-Za-z]{1,3}$/.test(trimmed)) return null
  return trimmed.toUpperCase()
}

/**
 * Preserves the original case pattern of the input
 */
const preserveCase = (original: string, converted: string): string => {
  if (original === original.toUpperCase()) return converted
  if (original === original.toLowerCase()) return converted.toLowerCase()
  return converted
}

/**
 * Converts cup sizes between different naming conventions
 *
 * @param cupSize - The cup size to convert (e.g., "DD", "DDD", "FF")
 * @param options - Conversion options
 * @returns The converted cup size or original/empty string based on options
 * @throws Error if strict mode is enabled and input is invalid
 *
 * @example
 * ```typescript
 * convertCupSize("DD") // returns "E"
 * convertCupSize("DDD") // returns "F"
 * convertCupSize("FF") // returns "G"
 * convertCupSize("A") // returns "A" (no change)
 * ```
 */
export const convertCupSize = (cupSize: string, options: CupSizeConversionOptions = {}): string => {
  const { preserveCase: shouldPreserveCase = false, returnOriginal = true, strict = false } = options

  if (!cupSize) {
    if (strict) throw new Error('Cup size cannot be empty or null')
    return cupSize
  }

  const normalized = normalizeCupSize(cupSize)
  if (!normalized) {
    if (strict) throw new Error(`Invalid cup size format: "${cupSize}". Expected 1-3 letters.`)
    return returnOriginal ? cupSize : ''
  }

  const converted = CUP_SIZE_MAP[normalized]
  return shouldPreserveCase ? preserveCase(cupSize, converted) : converted
}
