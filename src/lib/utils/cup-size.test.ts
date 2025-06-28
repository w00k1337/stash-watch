import { describe, expect, it } from 'vitest'

import { convertToPrismaCupSize } from './cup-size'

describe('Cup Size Conversion', () => {
  describe('convertToPrismaCupSize', () => {
    it('should convert double letters to next letter', () => {
      expect(convertToPrismaCupSize('DD')).toBe('E')
      expect(convertToPrismaCupSize('EE')).toBe('F')
      expect(convertToPrismaCupSize('FF')).toBe('G')
      expect(convertToPrismaCupSize('GG')).toBe('H')
    })

    it('should convert triple letters to letter after next', () => {
      expect(convertToPrismaCupSize('DDD')).toBe('F')
      expect(convertToPrismaCupSize('EEE')).toBe('G')
      expect(convertToPrismaCupSize('FFF')).toBe('H')
      expect(convertToPrismaCupSize('GGG')).toBe('I')
    })

    it('should keep single letters unchanged', () => {
      expect(convertToPrismaCupSize('A')).toBe('A')
      expect(convertToPrismaCupSize('B')).toBe('B')
      expect(convertToPrismaCupSize('C')).toBe('C')
      expect(convertToPrismaCupSize('D')).toBe('D')
    })

    it('should handle case insensitive input', () => {
      expect(convertToPrismaCupSize('dd')).toBe('E')
      expect(convertToPrismaCupSize('Dd')).toBe('E')
      expect(convertToPrismaCupSize('DDD')).toBe('F')
      expect(convertToPrismaCupSize('ddd')).toBe('F')
    })

    it('should trim whitespace', () => {
      expect(convertToPrismaCupSize(' DD ')).toBe('E')
      expect(convertToPrismaCupSize('  DDD  ')).toBe('F')
    })

    it('should handle edge cases for larger sizes', () => {
      expect(convertToPrismaCupSize('YY')).toBe('Z')
      expect(convertToPrismaCupSize('ZZ')).toBe('Z')
      expect(convertToPrismaCupSize('YYY')).toBe('Z')
      expect(convertToPrismaCupSize('ZZZ')).toBe('Z')
    })

    it('should return undefined for invalid input', () => {
      expect(convertToPrismaCupSize('')).toBeUndefined()
      expect(convertToPrismaCupSize('INVALID')).toBeUndefined()
      expect(convertToPrismaCupSize('123')).toBeUndefined()
      expect(convertToPrismaCupSize('A1')).toBeUndefined()
      expect(convertToPrismaCupSize('AAAA')).toBeUndefined()
      expect(convertToPrismaCupSize('A B')).toBeUndefined()
    })

    it('should handle null and undefined input gracefully', () => {
      expect(convertToPrismaCupSize('')).toBeUndefined()
      expect(convertToPrismaCupSize(null as unknown as string)).toBeUndefined()
      expect(convertToPrismaCupSize(undefined as unknown as string)).toBeUndefined()
    })

    it('should handle all valid cup size patterns', () => {
      const validSizes = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
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
        const result = convertToPrismaCupSize(size)
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        if (result) {
          expect(result.length).toBe(1)
        }
      })
    })

    it('should return single letter results for all valid inputs', () => {
      expect(convertToPrismaCupSize('DD')).toBe('E')
      expect(convertToPrismaCupSize('DDD')).toBe('F')
      expect(convertToPrismaCupSize('FF')).toBe('G')
      expect(convertToPrismaCupSize('GGG')).toBe('I')
      expect(convertToPrismaCupSize('A')).toBe('A')
      expect(convertToPrismaCupSize('Z')).toBe('Z')
    })
  })
})
