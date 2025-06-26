import { describe, expect, it } from 'vitest'

import { convertCupSize, type CupSizeConversionOptions, isValidCupSize } from './cup-size'

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
