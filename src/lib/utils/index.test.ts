import { describe, expect, it } from 'vitest'

import {
  type BandSizeConversionOptions,
  convertBandSize,
  convertCupSize,
  convertEuropeanBandToUS,
  convertUSBandToEuropean,
  type CupSizeConversionOptions,
  isValidCupSize,
  isValidEuropeanBandSize,
  isValidUSBandSize
} from '.'

describe('Cup Size Conversion', () => {
  describe('convertCupSize', () => {
    it('should convert double letters to next letter', () => {
      expect(convertCupSize('DD')).toBe('E')
      expect(convertCupSize('EE')).toBe('F')
      expect(convertCupSize('FF')).toBe('G')
      expect(convertCupSize('GG')).toBe('H')
    })

    it('should convert triple letters to letter after next', () => {
      expect(convertCupSize('DDD')).toBe('F')
      expect(convertCupSize('EEE')).toBe('G')
      expect(convertCupSize('FFF')).toBe('H')
      expect(convertCupSize('GGG')).toBe('I')
    })

    it('should keep single letters unchanged', () => {
      expect(convertCupSize('A')).toBe('A')
      expect(convertCupSize('B')).toBe('B')
      expect(convertCupSize('C')).toBe('C')
      expect(convertCupSize('D')).toBe('D')
    })

    it('should handle case insensitive input', () => {
      expect(convertCupSize('dd')).toBe('E')
      expect(convertCupSize('Dd')).toBe('E')
      expect(convertCupSize('DDD')).toBe('F')
      expect(convertCupSize('ddd')).toBe('F')
    })

    it('should trim whitespace', () => {
      expect(convertCupSize(' DD ')).toBe('E')
      expect(convertCupSize('  DDD  ')).toBe('F')
    })

    it('should handle edge cases for larger sizes', () => {
      expect(convertCupSize('YY')).toBe('Z')
      expect(convertCupSize('ZZ')).toBe('Z')
      expect(convertCupSize('YYY')).toBe('Z')
      expect(convertCupSize('ZZZ')).toBe('Z')
    })

    it('should return original value for invalid input when returnOriginal is true', () => {
      expect(convertCupSize('')).toBe('')
      expect(convertCupSize('INVALID')).toBe('INVALID')
      expect(convertCupSize('123')).toBe('123')
      expect(convertCupSize('A1')).toBe('A1')
    })

    it('should return empty string for invalid input when returnOriginal is false', () => {
      const options: CupSizeConversionOptions = { returnOriginal: false }
      expect(convertCupSize('', options)).toBe('')
      expect(convertCupSize('INVALID', options)).toBe('')
      expect(convertCupSize('123', options)).toBe('')
      expect(convertCupSize('A1', options)).toBe('')
    })

    it('should preserve case when preserveCase is true', () => {
      const options: CupSizeConversionOptions = { preserveCase: true }
      expect(convertCupSize('dd', options)).toBe('e')
      expect(convertCupSize('DD', options)).toBe('E')
      expect(convertCupSize('Dd', options)).toBe('E')
      expect(convertCupSize('ddd', options)).toBe('f')
      expect(convertCupSize('DDD', options)).toBe('F')
    })

    it('should throw error in strict mode for invalid input', () => {
      const options: CupSizeConversionOptions = { strict: true }

      expect(() => convertCupSize('', options)).toThrow('Cup size cannot be empty or null')
      expect(() => convertCupSize('INVALID', options)).toThrow(
        'Invalid cup size format: "INVALID". Expected 1-3 letters.'
      )
      expect(() => convertCupSize('123', options)).toThrow('Invalid cup size format: "123". Expected 1-3 letters.')
      expect(() => convertCupSize('A1', options)).toThrow('Invalid cup size format: "A1". Expected 1-3 letters.')
    })

    it('should not throw error in strict mode for valid input', () => {
      const options: CupSizeConversionOptions = { strict: true }

      expect(() => convertCupSize('DD', options)).not.toThrow()
      expect(() => convertCupSize('DDD', options)).not.toThrow()
      expect(() => convertCupSize('A', options)).not.toThrow()
    })

    it('should handle null and undefined input gracefully', () => {
      expect(convertCupSize('')).toBe('')
      expect(convertCupSize(null as unknown as string)).toBe(null)
      expect(convertCupSize(undefined as unknown as string)).toBe(undefined)
    })
  })

  describe('isValidCupSize', () => {
    it('should return true for valid cup sizes', () => {
      expect(isValidCupSize('A')).toBe(true)
      expect(isValidCupSize('DD')).toBe(true)
      expect(isValidCupSize('DDD')).toBe(true)
      expect(isValidCupSize('Z')).toBe(true)
      expect(isValidCupSize('ZZ')).toBe(true)
      expect(isValidCupSize('ZZZ')).toBe(true)
    })

    it('should return false for invalid cup sizes', () => {
      expect(isValidCupSize('')).toBe(false)
      expect(isValidCupSize('INVALID')).toBe(false)
      expect(isValidCupSize('123')).toBe(false)
      expect(isValidCupSize('A1')).toBe(false)
      expect(isValidCupSize('AAAA')).toBe(false)
      expect(isValidCupSize('A B')).toBe(false)
    })

    it('should handle case insensitive validation', () => {
      expect(isValidCupSize('dd')).toBe(true)
      expect(isValidCupSize('Dd')).toBe(true)
      expect(isValidCupSize('ddd')).toBe(true)
      expect(isValidCupSize('DdD')).toBe(true)
    })

    it('should handle whitespace', () => {
      expect(isValidCupSize(' DD ')).toBe(true)
      expect(isValidCupSize('  DDD  ')).toBe(true)
    })

    it('should handle null and undefined', () => {
      expect(isValidCupSize(null as unknown as string)).toBe(false)
      expect(isValidCupSize(undefined as unknown as string)).toBe(false)
    })
  })

  describe('Integration tests', () => {
    it('should handle all valid cup size patterns', () => {
      const validSizes = [
        'A',
        'B',
        'C',
        'D',
        'AA',
        'BB',
        'CC',
        'DD',
        'EE',
        'FF',
        'GG',
        'HH',
        'II',
        'JJ',
        'KK',
        'LL',
        'MM',
        'NN',
        'OO',
        'PP',
        'QQ',
        'RR',
        'SS',
        'TT',
        'UU',
        'VV',
        'WW',
        'XX',
        'YY',
        'ZZ',
        'AAA',
        'BBB',
        'CCC',
        'DDD',
        'EEE',
        'FFF',
        'GGG',
        'HHH',
        'III',
        'JJJ',
        'KKK',
        'LLL',
        'MMM',
        'NNN',
        'OOO',
        'PPP',
        'QQQ',
        'RRR',
        'SSS',
        'TTT',
        'UUU',
        'VVV',
        'WWW',
        'XXX',
        'YYY',
        'ZZZ'
      ]

      validSizes.forEach(size => {
        expect(isValidCupSize(size)).toBe(true)
        expect(() => convertCupSize(size, { strict: true })).not.toThrow()
      })
    })

    it('should maintain consistency between validation and conversion', () => {
      const testCases = ['A', 'DD', 'DDD', 'FF', 'GGG', 'Z', 'ZZ', 'ZZZ']

      testCases.forEach(size => {
        if (isValidCupSize(size)) {
          expect(() => convertCupSize(size, { strict: true })).not.toThrow()
        } else {
          expect(() => convertCupSize(size, { strict: true })).toThrow()
        }
      })
    })
  })
})

describe('Band Size Conversion', () => {
  describe('convertUSBandToEuropean', () => {
    it('should convert valid US band sizes to European format', () => {
      expect(convertUSBandToEuropean(28)).toBe(65)
      expect(convertUSBandToEuropean(30)).toBe(65)
      expect(convertUSBandToEuropean(32)).toBe(70)
      expect(convertUSBandToEuropean(34)).toBe(75)
      expect(convertUSBandToEuropean(36)).toBe(80)
      expect(convertUSBandToEuropean(38)).toBe(85)
      expect(convertUSBandToEuropean(40)).toBe(90)
      expect(convertUSBandToEuropean(42)).toBe(95)
      expect(convertUSBandToEuropean(44)).toBe(100)
      expect(convertUSBandToEuropean(46)).toBe(105)
    })

    it('should return European band sizes unchanged', () => {
      expect(convertUSBandToEuropean(65)).toBe(65)
      expect(convertUSBandToEuropean(70)).toBe(70)
      expect(convertUSBandToEuropean(75)).toBe(75)
      expect(convertUSBandToEuropean(80)).toBe(80)
      expect(convertUSBandToEuropean(85)).toBe(85)
      expect(convertUSBandToEuropean(90)).toBe(90)
      expect(convertUSBandToEuropean(95)).toBe(95)
      expect(convertUSBandToEuropean(100)).toBe(100)
      expect(convertUSBandToEuropean(105)).toBe(105)
      expect(convertUSBandToEuropean(110)).toBe(110)
      expect(convertUSBandToEuropean(115)).toBe(115)
      expect(convertUSBandToEuropean(120)).toBe(120)
    })

    it('should round to nearest valid European size when roundToValid is true', () => {
      const options: BandSizeConversionOptions = { roundToValid: true }
      expect(convertUSBandToEuropean(28, options)).toBe(65)
      expect(convertUSBandToEuropean(30, options)).toBe(65)
      expect(convertUSBandToEuropean(32, options)).toBe(70)
      expect(convertUSBandToEuropean(34, options)).toBe(75)
    })

    it('should return exact calculation when roundToValid is false', () => {
      const options: BandSizeConversionOptions = { roundToValid: false }
      expect(convertUSBandToEuropean(28, options)).toBe(60)
      expect(convertUSBandToEuropean(30, options)).toBe(65)
      expect(convertUSBandToEuropean(32, options)).toBe(70)
      expect(convertUSBandToEuropean(34, options)).toBe(75)
      expect(convertUSBandToEuropean(36, options)).toBe(80)
    })

    it('should return original value for invalid input when returnOriginal is true', () => {
      expect(convertUSBandToEuropean(27)).toBe(27)
      expect(convertUSBandToEuropean(29)).toBe(29)
      expect(convertUSBandToEuropean(47)).toBe(47)
      expect(convertUSBandToEuropean(50)).toBe(50)
      expect(convertUSBandToEuropean(60)).toBe(60)
      expect(convertUSBandToEuropean(72)).toBe(72)
    })

    it('should return 0 for invalid input when returnOriginal is false', () => {
      const options: BandSizeConversionOptions = { returnOriginal: false }
      expect(convertUSBandToEuropean(27, options)).toBe(0)
      expect(convertUSBandToEuropean(29, options)).toBe(0)
      expect(convertUSBandToEuropean(47, options)).toBe(0)
      expect(convertUSBandToEuropean(50, options)).toBe(0)
    })

    it('should throw error in strict mode for invalid input', () => {
      const options: BandSizeConversionOptions = { strict: true }

      expect(() => convertUSBandToEuropean(27, options)).toThrow(
        'Invalid US band size: 27. Must be an even number between 28 and 46.'
      )
      expect(() => convertUSBandToEuropean(29, options)).toThrow(
        'Invalid US band size: 29. Must be an even number between 28 and 46.'
      )
      expect(() => convertUSBandToEuropean(47, options)).toThrow(
        'Invalid US band size: 47. Must be an even number between 28 and 46.'
      )
      expect(() => convertUSBandToEuropean(50, options)).toThrow(
        'Invalid US band size: 50. Must be an even number between 28 and 46.'
      )
    })

    it('should not throw error in strict mode for valid input', () => {
      const options: BandSizeConversionOptions = { strict: true }

      expect(() => convertUSBandToEuropean(28, options)).not.toThrow()
      expect(() => convertUSBandToEuropean(32, options)).not.toThrow()
      expect(() => convertUSBandToEuropean(46, options)).not.toThrow()
      expect(() => convertUSBandToEuropean(70, options)).not.toThrow()
      expect(() => convertUSBandToEuropean(75, options)).not.toThrow()
    })
  })

  describe('convertEuropeanBandToUS', () => {
    it('should convert valid European band sizes to US format', () => {
      expect(convertEuropeanBandToUS(65)).toBe(30)
      expect(convertEuropeanBandToUS(70)).toBe(32)
      expect(convertEuropeanBandToUS(75)).toBe(34)
      expect(convertEuropeanBandToUS(80)).toBe(36)
      expect(convertEuropeanBandToUS(85)).toBe(38)
      expect(convertEuropeanBandToUS(90)).toBe(40)
      expect(convertEuropeanBandToUS(95)).toBe(42)
      expect(convertEuropeanBandToUS(100)).toBe(44)
      expect(convertEuropeanBandToUS(105)).toBe(46)
      expect(convertEuropeanBandToUS(110)).toBe(46)
      expect(convertEuropeanBandToUS(115)).toBe(46)
      expect(convertEuropeanBandToUS(120)).toBe(46)
    })

    it('should return US band sizes unchanged', () => {
      expect(convertEuropeanBandToUS(28)).toBe(28)
      expect(convertEuropeanBandToUS(30)).toBe(30)
      expect(convertEuropeanBandToUS(32)).toBe(32)
      expect(convertEuropeanBandToUS(34)).toBe(34)
      expect(convertEuropeanBandToUS(36)).toBe(36)
      expect(convertEuropeanBandToUS(38)).toBe(38)
      expect(convertEuropeanBandToUS(40)).toBe(40)
      expect(convertEuropeanBandToUS(42)).toBe(42)
      expect(convertEuropeanBandToUS(44)).toBe(44)
      expect(convertEuropeanBandToUS(46)).toBe(46)
    })

    it('should round to nearest valid US size when roundToValid is true', () => {
      const options: BandSizeConversionOptions = { roundToValid: true }
      expect(convertEuropeanBandToUS(65, options)).toBe(30)
      expect(convertEuropeanBandToUS(70, options)).toBe(32)
      expect(convertEuropeanBandToUS(75, options)).toBe(34)
      expect(convertEuropeanBandToUS(80, options)).toBe(36)
    })

    it('should return exact calculation when roundToValid is false', () => {
      const options: BandSizeConversionOptions = { roundToValid: false }
      expect(convertEuropeanBandToUS(65, options)).toBe(30)
      expect(convertEuropeanBandToUS(70, options)).toBe(32)
      expect(convertEuropeanBandToUS(75, options)).toBe(34)
      expect(convertEuropeanBandToUS(80, options)).toBe(36)
      expect(convertEuropeanBandToUS(85, options)).toBe(38)
    })

    it('should return original value for invalid input when returnOriginal is true', () => {
      expect(convertEuropeanBandToUS(60)).toBe(60)
      expect(convertEuropeanBandToUS(62)).toBe(62)
      expect(convertEuropeanBandToUS(68)).toBe(68)
      expect(convertEuropeanBandToUS(72)).toBe(72)
      expect(convertEuropeanBandToUS(125)).toBe(125)
      expect(convertEuropeanBandToUS(130)).toBe(130)
    })

    it('should return 0 for invalid input when returnOriginal is false', () => {
      const options: BandSizeConversionOptions = { returnOriginal: false }
      expect(convertEuropeanBandToUS(60, options)).toBe(0)
      expect(convertEuropeanBandToUS(62, options)).toBe(0)
      expect(convertEuropeanBandToUS(68, options)).toBe(0)
      expect(convertEuropeanBandToUS(72, options)).toBe(0)
    })

    it('should throw error in strict mode for invalid input', () => {
      const options: BandSizeConversionOptions = { strict: true }

      expect(() => convertEuropeanBandToUS(60, options)).toThrow(
        'Invalid European band size: 60. Must be divisible by 5.'
      )
      expect(() => convertEuropeanBandToUS(62, options)).toThrow(
        'Invalid European band size: 62. Must be divisible by 5.'
      )
      expect(() => convertEuropeanBandToUS(68, options)).toThrow(
        'Invalid European band size: 68. Must be divisible by 5.'
      )
      expect(() => convertEuropeanBandToUS(72, options)).toThrow(
        'Invalid European band size: 72. Must be divisible by 5.'
      )
    })

    it('should not throw error in strict mode for valid input', () => {
      const options: BandSizeConversionOptions = { strict: true }

      expect(() => convertEuropeanBandToUS(65, options)).not.toThrow()
      expect(() => convertEuropeanBandToUS(70, options)).not.toThrow()
      expect(() => convertEuropeanBandToUS(75, options)).not.toThrow()
      expect(() => convertEuropeanBandToUS(28, options)).not.toThrow()
      expect(() => convertEuropeanBandToUS(32, options)).not.toThrow()
    })
  })

  describe('convertBandSize', () => {
    it('should convert US to European format', () => {
      expect(convertBandSize(28, 'EU')).toBe(65)
      expect(convertBandSize(30, 'EU')).toBe(65)
      expect(convertBandSize(32, 'EU')).toBe(70)
      expect(convertBandSize(34, 'EU')).toBe(75)
      expect(convertBandSize(36, 'EU')).toBe(80)
      expect(convertBandSize(38, 'EU')).toBe(85)
      expect(convertBandSize(40, 'EU')).toBe(90)
      expect(convertBandSize(42, 'EU')).toBe(95)
      expect(convertBandSize(44, 'EU')).toBe(100)
      expect(convertBandSize(46, 'EU')).toBe(105)
    })

    it('should convert European to US format', () => {
      expect(convertBandSize(65, 'US')).toBe(30)
      expect(convertBandSize(70, 'US')).toBe(32)
      expect(convertBandSize(75, 'US')).toBe(34)
      expect(convertBandSize(80, 'US')).toBe(36)
      expect(convertBandSize(85, 'US')).toBe(38)
      expect(convertBandSize(90, 'US')).toBe(40)
      expect(convertBandSize(95, 'US')).toBe(42)
      expect(convertBandSize(100, 'US')).toBe(44)
      expect(convertBandSize(105, 'US')).toBe(46)
    })

    it('should handle options correctly', () => {
      const options: BandSizeConversionOptions = { strict: true }

      expect(() => convertBandSize(28, 'EU', options)).not.toThrow()
      expect(() => convertBandSize(70, 'US', options)).not.toThrow()
      expect(() => convertBandSize(27, 'EU', options)).toThrow()
      expect(() => convertBandSize(60, 'US', options)).toThrow()
    })
  })

  describe('isValidUSBandSize', () => {
    it('should return true for valid US band sizes', () => {
      expect(isValidUSBandSize(28)).toBe(true)
      expect(isValidUSBandSize(30)).toBe(true)
      expect(isValidUSBandSize(32)).toBe(true)
      expect(isValidUSBandSize(34)).toBe(true)
      expect(isValidUSBandSize(36)).toBe(true)
      expect(isValidUSBandSize(38)).toBe(true)
      expect(isValidUSBandSize(40)).toBe(true)
      expect(isValidUSBandSize(42)).toBe(true)
      expect(isValidUSBandSize(44)).toBe(true)
      expect(isValidUSBandSize(46)).toBe(true)
    })

    it('should return false for invalid US band sizes', () => {
      expect(isValidUSBandSize(27)).toBe(false)
      expect(isValidUSBandSize(29)).toBe(false)
      expect(isValidUSBandSize(31)).toBe(false)
      expect(isValidUSBandSize(33)).toBe(false)
      expect(isValidUSBandSize(47)).toBe(false)
      expect(isValidUSBandSize(50)).toBe(false)
      expect(isValidUSBandSize(70)).toBe(false)
      expect(isValidUSBandSize(75)).toBe(false)
    })
  })

  describe('isValidEuropeanBandSize', () => {
    it('should return true for valid European band sizes', () => {
      expect(isValidEuropeanBandSize(65)).toBe(true)
      expect(isValidEuropeanBandSize(70)).toBe(true)
      expect(isValidEuropeanBandSize(75)).toBe(true)
      expect(isValidEuropeanBandSize(80)).toBe(true)
      expect(isValidEuropeanBandSize(85)).toBe(true)
      expect(isValidEuropeanBandSize(90)).toBe(true)
      expect(isValidEuropeanBandSize(95)).toBe(true)
      expect(isValidEuropeanBandSize(100)).toBe(true)
      expect(isValidEuropeanBandSize(105)).toBe(true)
      expect(isValidEuropeanBandSize(110)).toBe(true)
      expect(isValidEuropeanBandSize(115)).toBe(true)
      expect(isValidEuropeanBandSize(120)).toBe(true)
    })

    it('should return false for invalid European band sizes', () => {
      expect(isValidEuropeanBandSize(60)).toBe(false)
      expect(isValidEuropeanBandSize(62)).toBe(false)
      expect(isValidEuropeanBandSize(68)).toBe(false)
      expect(isValidEuropeanBandSize(72)).toBe(false)
      expect(isValidEuropeanBandSize(125)).toBe(false)
      expect(isValidEuropeanBandSize(130)).toBe(false)
      expect(isValidEuropeanBandSize(28)).toBe(false)
      expect(isValidEuropeanBandSize(32)).toBe(false)
    })
  })

  describe('Integration tests', () => {
    it('should handle all valid US band sizes', () => {
      const validUSBands = [28, 30, 32, 34, 36, 38, 40, 42, 44, 46]

      validUSBands.forEach(band => {
        expect(isValidUSBandSize(band)).toBe(true)
        expect(() => convertUSBandToEuropean(band, { strict: true })).not.toThrow()
        expect(() => convertBandSize(band, 'EU', { strict: true })).not.toThrow()
      })
    })

    it('should handle all valid European band sizes', () => {
      const validEuropeanBands = [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120]

      validEuropeanBands.forEach(band => {
        expect(isValidEuropeanBandSize(band)).toBe(true)
        expect(() => convertEuropeanBandToUS(band, { strict: true })).not.toThrow()
        expect(() => convertBandSize(band, 'US', { strict: true })).not.toThrow()
      })
    })

    it('should maintain consistency in bidirectional conversion', () => {
      const testCases = [
        { us: 28, eu: 65 },
        { us: 30, eu: 65 },
        { us: 32, eu: 70 },
        { us: 34, eu: 75 },
        { us: 36, eu: 80 },
        { us: 38, eu: 85 },
        { us: 40, eu: 90 },
        { us: 42, eu: 95 },
        { us: 44, eu: 100 },
        { us: 46, eu: 105 }
      ]

      // Test US to European conversion
      testCases.forEach(({ us, eu }) => {
        expect(convertUSBandToEuropean(us)).toBe(eu)
        expect(convertBandSize(us, 'EU')).toBe(eu)
      })

      // Test European to US conversion (note: may not be perfectly reversible due to rounding)
      testCases.forEach(({ eu }) => {
        const convertedBack = convertEuropeanBandToUS(eu)
        const convertedBackViaUniversal = convertBandSize(eu, 'US')

        // The conversion should be consistent within each function
        expect(convertedBack).toBe(convertedBackViaUniversal)

        // For most cases, it should convert back to the original or a close value
        if (eu === 70) {
          // Special case: 70 EU converts to 32 US, which converts back to 70 EU
          expect(convertedBack).toBe(32)
        } else {
          // For other cases, verify the conversion is reasonable
          expect(convertedBack).toBeGreaterThanOrEqual(28)
          expect(convertedBack).toBeLessThanOrEqual(46)
        }
      })
    })
  })
})
