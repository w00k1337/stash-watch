/**
 * Band size conversion utilities
 *
 * Converts between US and European band size formats.
 * - US band sizes: 28-46 (even numbers only)
 * - European band sizes: divisible by 5
 *
 * Conversion formulas:
 * - US to EU: 70 + (US_band - 32) * 2.5
 * - EU to US: 32 + (EU_band - 70) / 2.5
 */

/**
 * Valid US band sizes (even numbers from 28 to 46)
 */
export type USBandSize = 28 | 30 | 32 | 34 | 36 | 38 | 40 | 42 | 44 | 46

/**
 * Valid European band sizes (divisible by 5, typically 65-120)
 */
export type EuropeanBandSize = 65 | 70 | 75 | 80 | 85 | 90 | 95 | 100 | 105 | 110 | 115 | 120

/**
 * Options for band size conversion
 */
export interface BandSizeConversionOptions {
  /** Whether to round the result to nearest valid size (default: true) */
  roundToValid?: boolean
  /** Whether to return the original value if no conversion is found (default: true) */
  returnOriginal?: boolean
  /** Whether to throw an error for invalid input (default: false) */
  strict?: boolean
}

/**
 * Valid US band sizes array
 */
const VALID_US_BAND_SIZES: USBandSize[] = [28, 30, 32, 34, 36, 38, 40, 42, 44, 46]

/**
 * Valid European band sizes array
 */
const VALID_EUROPEAN_BAND_SIZES: EuropeanBandSize[] = [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120]

/**
 * Validates if a number is a valid US band size
 */
export const isValidUSBandSize = (band: number): band is USBandSize => {
  return VALID_US_BAND_SIZES.includes(band as USBandSize)
}

/**
 * Validates if a number is a valid European band size
 */
export const isValidEuropeanBandSize = (band: number): band is EuropeanBandSize => {
  return VALID_EUROPEAN_BAND_SIZES.includes(band as EuropeanBandSize)
}

/**
 * Finds the nearest valid US band size
 */
const findNearestUSBandSize = (band: number): USBandSize => {
  return VALID_US_BAND_SIZES.reduce((prev, curr) => (Math.abs(curr - band) < Math.abs(prev - band) ? curr : prev))
}

/**
 * Finds the nearest valid European band size
 */
const findNearestEuropeanBandSize = (band: number): EuropeanBandSize => {
  return VALID_EUROPEAN_BAND_SIZES.reduce((prev, curr) => (Math.abs(curr - band) < Math.abs(prev - band) ? curr : prev))
}

/**
 * Converts US band size to European format
 *
 * @param usBand - The US band size (28-46, even numbers)
 * @param options - Conversion options
 * @returns The European band size or original value based on options
 * @throws Error if strict mode is enabled and input is invalid
 *
 * @example
 * ```typescript
 * convertUSBandToEuropean(32) // returns 70
 * convertUSBandToEuropean(34) // returns 75
 * convertUSBandToEuropean(36) // returns 80
 * ```
 */
export const convertUSBandToEuropean = (usBand: number, options: BandSizeConversionOptions = {}): number => {
  const { roundToValid = true, returnOriginal = true, strict = false } = options

  // Check if it's a valid US band size
  if (isValidUSBandSize(usBand)) {
    const europeanBand = 70 + (usBand - 32) * 2.5
    return roundToValid ? findNearestEuropeanBandSize(europeanBand) : europeanBand
  }

  // Check if it's already a European band size
  if (isValidEuropeanBandSize(usBand)) {
    return usBand
  }

  if (strict) {
    throw new Error(`Invalid US band size: ${usBand.toString()}. Must be an even number between 28 and 46.`)
  }

  return returnOriginal ? usBand : 0
}

/**
 * Converts European band size to US format
 *
 * @param euBand - The European band size (divisible by 5)
 * @param options - Conversion options
 * @returns The US band size or original value based on options
 * @throws Error if strict mode is enabled and input is invalid
 *
 * @example
 * ```typescript
 * convertEuropeanBandToUS(70) // returns 32
 * convertEuropeanBandToUS(75) // returns 34
 * convertEuropeanBandToUS(80) // returns 36
 * ```
 */
export const convertEuropeanBandToUS = (euBand: number, options: BandSizeConversionOptions = {}): number => {
  const { roundToValid = true, returnOriginal = true, strict = false } = options

  // Check if it's a valid European band size
  if (isValidEuropeanBandSize(euBand)) {
    const usBand = 32 + (euBand - 70) / 2.5
    return roundToValid ? findNearestUSBandSize(usBand) : usBand
  }

  // Check if it's already a US band size
  if (isValidUSBandSize(euBand)) {
    return euBand
  }

  if (strict) {
    throw new Error(`Invalid European band size: ${euBand.toString()}. Must be divisible by 5.`)
  }

  return returnOriginal ? euBand : 0
}

/**
 * Detects the band size format and converts to the target format
 *
 * @param band - The band size to convert
 * @param targetFormat - The target format ('US' or 'EU')
 * @param options - Conversion options
 * @returns The converted band size
 *
 * @example
 * ```typescript
 * convertBandSize(32, 'EU') // returns 70
 * convertBandSize(70, 'US') // returns 32
 * ```
 */
export const convertBandSize = (
  band: number,
  targetFormat: 'US' | 'EU',
  options: BandSizeConversionOptions = {}
): number => {
  if (targetFormat === 'EU') {
    return convertUSBandToEuropean(band, options)
  } else {
    return convertEuropeanBandToUS(band, options)
  }
}
