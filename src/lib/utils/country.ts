import { Country } from '@/generated/prisma'

/**
 * Validates if a string is a valid ISO 3166-1 alpha-2 country code
 * @param code - The country code to validate
 * @returns True if the code is valid, false otherwise
 */
export const isValidCountryCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') return false

  const upperCode = code.toUpperCase()
  if (upperCode.length !== 2 || !/^[A-Z]{2}$/.test(upperCode)) return false

  try {
    const locale = new Intl.Locale('en', { region: upperCode })
    // Additional check: ensure the region is actually a valid country code
    // Some codes like 'XX' are technically valid regions but not real countries
    return locale.maximize().region === upperCode && upperCode !== 'XX'
  } catch {
    return false
  }
}

/**
 * Converts a country string to a valid Country enum value
 * @param country - The country string to convert
 * @returns The Country enum value or undefined if invalid
 */
export const convertStashCountry = (country: string): Country | undefined => {
  if (!country || typeof country !== 'string') return undefined

  const upperCountry = country.toUpperCase()
  // Validate that it's a valid country code by checking if it exists in the Country enum
  // This is a runtime check since we can't easily access the enum values at runtime
  if (upperCountry.length === 2 && /^[A-Z]{2}$/.test(upperCountry)) {
    // Additional validation: check if it's a valid ISO country code
    if (isValidCountryCode(upperCountry)) {
      return upperCountry as Country
    }
    return undefined
  }
  return undefined
}

/**
 * Options for country conversion
 */
export interface CountryConversionOptions {
  /** Whether to return the original value if no conversion is found (default: true) */
  returnOriginal?: boolean
  /** Whether to throw an error for invalid input (default: false) */
  strict?: boolean
}

/**
 * Converts and validates a country code with options
 * @param country - The country string to convert
 * @param options - Conversion options
 * @returns The converted country code or original/undefined based on options
 * @throws Error if strict mode is enabled and input is invalid
 */
export const convertCountry = (country: string, options: CountryConversionOptions = {}): string | undefined => {
  const { returnOriginal = true, strict = false } = options

  if (!country) {
    if (strict) throw new Error('Country code cannot be empty or null')
    return returnOriginal ? country : undefined
  }

  const converted = convertStashCountry(country)
  if (converted) return converted

  if (strict) {
    throw new Error(`Invalid country code: "${country}". Must be a valid ISO 3166-1 alpha-2 code.`)
  }

  return returnOriginal ? country : undefined
}
