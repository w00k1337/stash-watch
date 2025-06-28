import { Country } from '@/generated/prisma'

/**
 * Valid ISO 3166-1 alpha-2 country codes from Prisma schema
 * This ensures we only accept codes that are actually defined in our database
 */
const VALID_COUNTRY_CODES = new Set([
  'AF',
  'AL',
  'DZ',
  'AS',
  'AD',
  'AO',
  'AI',
  'AQ',
  'AG',
  'AR',
  'AM',
  'AW',
  'AU',
  'AT',
  'AZ',
  'BS',
  'BH',
  'BD',
  'BB',
  'BY',
  'BE',
  'BZ',
  'BJ',
  'BM',
  'BT',
  'BO',
  'BA',
  'BW',
  'BV',
  'BR',
  'IO',
  'BN',
  'BG',
  'BF',
  'BI',
  'KH',
  'CM',
  'CA',
  'CV',
  'KY',
  'CF',
  'TD',
  'CL',
  'CN',
  'CX',
  'CC',
  'CO',
  'KM',
  'CG',
  'CD',
  'CK',
  'CR',
  'CI',
  'HR',
  'CU',
  'CY',
  'CZ',
  'DK',
  'DJ',
  'DM',
  'DO',
  'EC',
  'EG',
  'SV',
  'GQ',
  'ER',
  'EE',
  'ET',
  'FK',
  'FO',
  'FJ',
  'FI',
  'FR',
  'GF',
  'PF',
  'TF',
  'GA',
  'GM',
  'GE',
  'DE',
  'GH',
  'GI',
  'GR',
  'GL',
  'GD',
  'GP',
  'GU',
  'GT',
  'GG',
  'GN',
  'GW',
  'GY',
  'HT',
  'HM',
  'VA',
  'HN',
  'HK',
  'HU',
  'IS',
  'IN',
  'ID',
  'IR',
  'IQ',
  'IE',
  'IM',
  'IL',
  'IT',
  'JM',
  'JP',
  'JE',
  'JO',
  'KZ',
  'KE',
  'KI',
  'KP',
  'KR',
  'KW',
  'KG',
  'LA',
  'LV',
  'LB',
  'LS',
  'LR',
  'LY',
  'LI',
  'LT',
  'LU',
  'MO',
  'MK',
  'MG',
  'MW',
  'MY',
  'MV',
  'ML',
  'MT',
  'MH',
  'MQ',
  'MR',
  'MU',
  'YT',
  'MX',
  'FM',
  'MD',
  'MC',
  'MN',
  'ME',
  'MS',
  'MA',
  'MZ',
  'MM',
  'NA',
  'NR',
  'NP',
  'NL',
  'NC',
  'NZ',
  'NI',
  'NE',
  'NG',
  'NU',
  'NF',
  'MP',
  'NO',
  'OM',
  'PK',
  'PW',
  'PS',
  'PA',
  'PG',
  'PY',
  'PE',
  'PH',
  'PN',
  'PL',
  'PT',
  'PR',
  'QA',
  'RE',
  'RO',
  'RU',
  'RW',
  'BL',
  'SH',
  'KN',
  'LC',
  'MF',
  'PM',
  'VC',
  'WS',
  'SM',
  'ST',
  'SA',
  'SN',
  'RS',
  'SC',
  'SL',
  'SG',
  'SK',
  'SI',
  'SB',
  'SO',
  'ZA',
  'GS',
  'ES',
  'LK',
  'SD',
  'SR',
  'SJ',
  'SZ',
  'SE',
  'CH',
  'SY',
  'TW',
  'TJ',
  'TZ',
  'TH',
  'TL',
  'TG',
  'TK',
  'TO',
  'TT',
  'TN',
  'TR',
  'TM',
  'TC',
  'TV',
  'UG',
  'UA',
  'AE',
  'GB',
  'US',
  'UM',
  'UY',
  'UZ',
  'VU',
  'VE',
  'VN',
  'VG',
  'VI',
  'WF',
  'EH',
  'YE',
  'ZM',
  'ZW'
])

/**
 * Validates if a string is a valid ISO 3166-1 alpha-2 country code
 * @param code - The country code to validate
 * @returns True if the code is valid, false otherwise
 */
export const isValidCountryCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') return false

  const upperCode = code.toUpperCase()
  return VALID_COUNTRY_CODES.has(upperCode)
}

/**
 * Converts a country string to a valid Country enum value
 * @param country - The country string to convert
 * @returns The Country enum value or undefined if invalid
 */
export const convertStashCountry = (country: string): Country | undefined => {
  if (!country || typeof country !== 'string') return undefined

  const upperCountry = country.toUpperCase()
  if (isValidCountryCode(upperCountry)) {
    return upperCountry as Country
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
export const convertCountry = (country: unknown, options: CountryConversionOptions = {}): string | undefined => {
  const { returnOriginal = true, strict = false } = options

  if (!country) {
    if (strict) throw new Error('Country code cannot be empty or null')
    return returnOriginal ? '' : undefined
  }

  if (typeof country !== 'string') {
    if (strict) throw new Error(`Country code must be a string, got ${typeof country}`)
    return returnOriginal ? `[${typeof country}]` : undefined
  }

  const converted = convertStashCountry(country)
  if (converted) return converted

  if (strict) {
    throw new Error(`Invalid country code: "${country}". Must be a valid ISO 3166-1 alpha-2 code.`)
  }

  return returnOriginal ? country : undefined
}
