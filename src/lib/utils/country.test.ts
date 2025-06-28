import { describe, expect, it } from 'vitest'

import { convertCountry, convertStashCountry, isValidCountryCode } from './country'

describe('Country utilities', () => {
  describe('isValidCountryCode', () => {
    it('should validate valid ISO country codes', () => {
      expect(isValidCountryCode('US')).toBe(true)
      expect(isValidCountryCode('DE')).toBe(true)
      expect(isValidCountryCode('FR')).toBe(true)
      expect(isValidCountryCode('GB')).toBe(true)
      expect(isValidCountryCode('CA')).toBe(true)
    })

    it('should reject invalid country codes', () => {
      expect(isValidCountryCode('XX')).toBe(false)
      expect(isValidCountryCode('123')).toBe(false)
      expect(isValidCountryCode('')).toBe(false)
      expect(isValidCountryCode('USA')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      expect(isValidCountryCode('us')).toBe(true)
      expect(isValidCountryCode('Us')).toBe(true)
    })
  })

  describe('convertStashCountry', () => {
    it('should convert valid country codes', () => {
      expect(convertStashCountry('US')).toBe('US')
      expect(convertStashCountry('us')).toBe('US')
      expect(convertStashCountry('de')).toBe('DE')
    })

    it('should return undefined for invalid country codes', () => {
      expect(convertStashCountry('XX')).toBeUndefined()
      expect(convertStashCountry('123')).toBeUndefined()
      expect(convertStashCountry('')).toBeUndefined()
      expect(convertStashCountry('USA')).toBeUndefined()
    })
  })

  describe('convertCountry', () => {
    it('should convert valid country codes', () => {
      expect(convertCountry('US')).toBe('US')
      expect(convertCountry('us')).toBe('US')
    })

    it('should return original value when returnOriginal is true', () => {
      expect(convertCountry('XX', { returnOriginal: true })).toBe('XX')
      expect(convertCountry('', { returnOriginal: true })).toBe('')
    })

    it('should return undefined when returnOriginal is false', () => {
      expect(convertCountry('XX', { returnOriginal: false })).toBeUndefined()
      expect(convertCountry('', { returnOriginal: false })).toBeUndefined()
    })

    it('should throw error in strict mode for invalid codes', () => {
      expect(() => convertCountry('XX', { strict: true })).toThrow('Invalid country code: "XX"')
      expect(() => convertCountry('', { strict: true })).toThrow('Country code cannot be empty or null')
    })

    it('should handle non-string inputs gracefully', () => {
      expect(convertCountry(123, { returnOriginal: true })).toBe('123')
      expect(convertCountry(null, { returnOriginal: true })).toBe('')
      expect(convertCountry(undefined, { returnOriginal: true })).toBe('')
      expect(convertCountry({}, { returnOriginal: true })).toBe('[object Object]')
    })

    it('should throw error in strict mode for non-string inputs', () => {
      expect(() => convertCountry(123, { strict: true })).toThrow('Country code must be a string, got number')
      expect(() => convertCountry(null, { strict: true })).toThrow('Country code cannot be empty or null')
      expect(() => convertCountry({}, { strict: true })).toThrow('Country code must be a string, got object')
    })

    it('should return undefined for non-string inputs when returnOriginal is false', () => {
      expect(convertCountry(123, { returnOriginal: false })).toBeUndefined()
      expect(convertCountry(null, { returnOriginal: false })).toBeUndefined()
      expect(convertCountry({}, { returnOriginal: false })).toBeUndefined()
    })
  })
})
