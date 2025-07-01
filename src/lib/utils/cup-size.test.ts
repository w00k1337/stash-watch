import { describe, expect, it } from 'vitest'

import { convertToCupSize } from './cup-size'

describe('Cup Size Conversion', () => {
  describe('convertToPrismaCupSize', () => {
    it('should convert double letters to next letter', () => {
      expect(convertToCupSize('DD')).toBe('E')
      expect(convertToCupSize('EE')).toBe('F')
      expect(convertToCupSize('FF')).toBe('G')
      expect(convertToCupSize('GG')).toBe('H')
    })

    it('should convert triple letters to letter after next', () => {
      expect(convertToCupSize('DDD')).toBe('F')
      expect(convertToCupSize('EEE')).toBe('G')
      expect(convertToCupSize('FFF')).toBe('H')
      expect(convertToCupSize('GGG')).toBe('I')
    })

    it('should keep single letters unchanged', () => {
      expect(convertToCupSize('A')).toBe('A')
      expect(convertToCupSize('B')).toBe('B')
      expect(convertToCupSize('C')).toBe('C')
      expect(convertToCupSize('D')).toBe('D')
    })

    it('should handle case insensitive input', () => {
      expect(convertToCupSize('dd')).toBe('E')
      expect(convertToCupSize('Dd')).toBe('E')
      expect(convertToCupSize('DDD')).toBe('F')
      expect(convertToCupSize('ddd')).toBe('F')
    })

    it('should trim whitespace', () => {
      expect(convertToCupSize(' DD ')).toBe('E')
      expect(convertToCupSize('  DDD  ')).toBe('F')
    })

    it('should handle edge cases for larger sizes', () => {
      expect(convertToCupSize('YY')).toBe('Z')
      expect(convertToCupSize('ZZ')).toBe('Z')
      expect(convertToCupSize('YYY')).toBe('Z')
      expect(convertToCupSize('ZZZ')).toBe('Z')
    })

    it('should return undefined for invalid input', () => {
      expect(convertToCupSize('')).toBeUndefined()
      expect(convertToCupSize('INVALID')).toBeUndefined()
      expect(convertToCupSize('123')).toBeUndefined()
      expect(convertToCupSize('A1')).toBeUndefined()
      expect(convertToCupSize('AAAA')).toBeUndefined()
      expect(convertToCupSize('A B')).toBeUndefined()
    })

    it('should handle null and undefined input gracefully', () => {
      expect(convertToCupSize('')).toBeUndefined()
      expect(convertToCupSize(null as unknown as string)).toBeUndefined()
      expect(convertToCupSize(undefined as unknown as string)).toBeUndefined()
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
        const result = convertToCupSize(size)
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        if (result) {
          expect(result.length).toBe(1)
        }
      })
    })

    it('should return single letter results for all valid inputs', () => {
      expect(convertToCupSize('DD')).toBe('E')
      expect(convertToCupSize('DDD')).toBe('F')
      expect(convertToCupSize('FF')).toBe('G')
      expect(convertToCupSize('GGG')).toBe('I')
      expect(convertToCupSize('A')).toBe('A')
      expect(convertToCupSize('Z')).toBe('Z')
    })
  })
})
