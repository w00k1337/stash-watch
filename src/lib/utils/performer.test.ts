import { describe, expect, it } from 'vitest'

import { Performer as StashPerformer } from '@/lib/api/stash'

import { convertStashPerformer } from './performer'

describe('Performer utilities', () => {
  describe('convertStashPerformer', () => {
    const createMockPerformer = (overrides: Partial<StashPerformer> = {}): StashPerformer => ({
      id: 1,
      name: 'Test Performer',
      aliases: ['Test Alias 1', 'Test Alias 2'],
      imageUrl: 'https://example.com/image.jpg',
      country: 'US',
      birthdate: new Date('1990-01-01'),
      measurements: {
        bust: 34,
        cup: 'C',
        waist: 24,
        hips: 36
      },
      breastType: 'Natural',
      isFavorite: true,
      stashes: [
        { id: 'stashdb-uuid', endpoint: 'https://stashdb.org' },
        { id: 'porndb-uuid', endpoint: 'https://theporndb.net' }
      ],
      ...overrides
    })

    it('should convert a complete performer with all fields', () => {
      const performer = createMockPerformer()
      const result = convertStashPerformer(performer)

      expect(result).toEqual({
        slug: 'test-performer',
        name: 'Test Performer',
        aliases: ['Test Alias 1', 'Test Alias 2'],
        imageUrl: 'https://example.com/image.jpg',
        bandSize: 75, // 34 US converts to 75 EU
        cupSize: 'C',
        hasNaturalBreasts: true,
        country: 'US',
        birthdate: new Date('1990-01-01'),
        isFavorite: true,
        stashId: 1,
        stashDbId: 'stashdb-uuid',
        pornDbId: 'porndb-uuid'
      })
    })

    it('should handle performer with minimal fields', () => {
      const performer = createMockPerformer({
        aliases: [],
        imageUrl: undefined,
        country: undefined,
        birthdate: undefined,
        measurements: undefined,
        breastType: undefined,
        isFavorite: false,
        stashes: []
      })
      const result = convertStashPerformer(performer)

      expect(result).toEqual({
        slug: 'test-performer',
        name: 'Test Performer',
        aliases: [],
        imageUrl: '',
        bandSize: null,
        cupSize: null,
        hasNaturalBreasts: null,
        country: null,
        birthdate: null,
        isFavorite: false,
        stashId: 1,
        stashDbId: null,
        pornDbId: null
      })
    })

    it('should generate correct slug from name', () => {
      const testCases = [
        { name: 'Simple Name', expected: 'simple-name' },
        { name: 'Complex Name with Spaces', expected: 'complex-name-with-spaces' },
        { name: 'Name with Special Chars!@#', expected: 'name-with-special-chars' },
        { name: 'UPPERCASE NAME', expected: 'uppercase-name' },
        { name: 'Mixed Case Name', expected: 'mixed-case-name' }
      ]

      testCases.forEach(({ name, expected }) => {
        const performer = createMockPerformer({ name })
        const result = convertStashPerformer(performer)
        expect(result.slug).toBe(expected)
      })
    })

    it('should handle imageUrl correctly', () => {
      const performerWithUrl = createMockPerformer({ imageUrl: 'https://example.com/photo.jpg' })
      const performerWithoutUrl = createMockPerformer({ imageUrl: undefined })

      expect(convertStashPerformer(performerWithUrl).imageUrl).toBe('https://example.com/photo.jpg')
      expect(convertStashPerformer(performerWithoutUrl).imageUrl).toBe('')
    })

    it('should convert band size correctly', () => {
      const testCases = [
        { bust: 28, expected: 65 },
        { bust: 30, expected: 65 },
        { bust: 32, expected: 70 },
        { bust: 34, expected: 75 },
        { bust: 36, expected: 80 },
        { bust: 38, expected: 85 },
        { bust: 40, expected: 90 },
        { bust: 42, expected: 95 },
        { bust: 44, expected: 100 },
        { bust: 46, expected: 105 }
      ]

      testCases.forEach(({ bust, expected }) => {
        const performer = createMockPerformer({
          measurements: { bust, cup: 'C', waist: 24, hips: 36 }
        })
        const result = convertStashPerformer(performer)
        expect(result.bandSize).toBe(expected)
      })
    })

    it('should handle missing bust measurement', () => {
      const performer = createMockPerformer({
        measurements: { cup: 'C', waist: 24, hips: 36 }
      })
      const result = convertStashPerformer(performer)
      expect(result.bandSize).toBe(null)
    })

    it('should convert cup size correctly', () => {
      const testCases = [
        { cup: 'A' as const, expected: 'A' },
        { cup: 'DD' as const, expected: 'E' },
        { cup: 'DDD' as const, expected: 'F' },
        { cup: 'FF' as const, expected: 'G' },
        { cup: 'FFF' as const, expected: 'H' }
      ]

      testCases.forEach(({ cup, expected }) => {
        const performer = createMockPerformer({
          measurements: { bust: 34, cup, waist: 24, hips: 36 }
        })
        const result = convertStashPerformer(performer)
        expect(result.cupSize).toBe(expected)
      })
    })

    it('should handle breast type correctly', () => {
      const naturalPerformer = createMockPerformer({ breastType: 'Natural' })
      const fakePerformer = createMockPerformer({ breastType: 'Fake' })
      const undefinedPerformer = createMockPerformer({ breastType: undefined })

      expect(convertStashPerformer(naturalPerformer).hasNaturalBreasts).toBe(true)
      expect(convertStashPerformer(fakePerformer).hasNaturalBreasts).toBe(false)
      expect(convertStashPerformer(undefinedPerformer).hasNaturalBreasts).toBe(null)
    })

    it('should convert country correctly', () => {
      const testCases = [
        { country: 'US', expected: 'US' },
        { country: 'us', expected: 'US' },
        { country: 'DE', expected: 'DE' },
        { country: 'de', expected: 'DE' },
        { country: 'FR', expected: 'FR' }
      ]

      testCases.forEach(({ country, expected }) => {
        const performer = createMockPerformer({ country })
        const result = convertStashPerformer(performer)
        expect(result.country).toBe(expected)
      })
    })

    it('should handle invalid country', () => {
      const performer = createMockPerformer({ country: 'INVALID' })
      const result = convertStashPerformer(performer)
      expect(result.country).toBe(null)
    })

    it('should handle missing country', () => {
      const performer = createMockPerformer({ country: undefined })
      const result = convertStashPerformer(performer)
      expect(result.country).toBe(null)
    })

    it('should handle birthdate correctly', () => {
      const performerWithDate = createMockPerformer({ birthdate: new Date('1995-05-15') })
      const performerWithoutDate = createMockPerformer({ birthdate: undefined })

      expect(convertStashPerformer(performerWithDate).birthdate).toEqual(new Date('1995-05-15'))
      expect(convertStashPerformer(performerWithoutDate).birthdate).toBe(null)
    })

    it('should extract stashDbId correctly', () => {
      const performerWithStashDb = createMockPerformer({
        stashes: [
          { id: 'stashdb-uuid', endpoint: 'https://stashdb.org' },
          { id: 'other-uuid', endpoint: 'https://other.org' }
        ]
      })
      const performerWithoutStashDb = createMockPerformer({
        stashes: [{ id: 'other-uuid', endpoint: 'https://other.org' }]
      })

      expect(convertStashPerformer(performerWithStashDb).stashDbId).toBe('stashdb-uuid')
      expect(convertStashPerformer(performerWithoutStashDb).stashDbId).toBe(null)
    })

    it('should extract pornDbId correctly', () => {
      const performerWithPornDb = createMockPerformer({
        stashes: [
          { id: 'porndb-uuid', endpoint: 'https://theporndb.net' },
          { id: 'other-uuid', endpoint: 'https://other.org' }
        ]
      })
      const performerWithoutPornDb = createMockPerformer({
        stashes: [{ id: 'other-uuid', endpoint: 'https://other.org' }]
      })

      expect(convertStashPerformer(performerWithPornDb).pornDbId).toBe('porndb-uuid')
      expect(convertStashPerformer(performerWithoutPornDb).pornDbId).toBe(null)
    })

    it('should handle empty stashes array', () => {
      const performer = createMockPerformer({ stashes: [] })
      const result = convertStashPerformer(performer)

      expect(result.stashDbId).toBe(null)
      expect(result.pornDbId).toBe(null)
    })

    it('should handle missing measurements object', () => {
      const performer = createMockPerformer({ measurements: undefined })
      const result = convertStashPerformer(performer)

      expect(result.bandSize).toBe(null)
      expect(result.cupSize).toBe(null)
    })

    it('should preserve all required fields', () => {
      const performer = createMockPerformer()
      const result = convertStashPerformer(performer)

      expect(result.name).toBe(performer.name)
      expect(result.aliases).toBe(performer.aliases)
      expect(result.isFavorite).toBe(performer.isFavorite)
      expect(result.stashId).toBe(performer.id)
    })
  })
})
