import { z } from 'zod'

import { isValidCountryCode } from '@/lib/utils'

export const breastTypeSchema = z.enum(['Fake', 'Natural'])
export const fingerprintTypeSchema = z.enum(['oshash', 'phash'])

export const countrySchema = z
  .string()
  .refine(
    val => val === '' || isValidCountryCode(val),
    'Must be a valid 2-letter country code (e.g. US, DE, FR) or empty'
  )
  .transform(val => (val === '' ? undefined : val))

export const cupSizeSchema = z.enum([
  'A',
  'B',
  'C',
  'D',
  'DD',
  'DDD',
  'E',
  'EE',
  'F',
  'FF',
  'FFF',
  'G',
  'GG',
  'H',
  'HH',
  'I',
  'J',
  'K',
  'KK',
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
  'Z'
])

export const measurementsSchema = z
  .object({
    bust: z.number().int().positive().optional(),
    cup: cupSizeSchema,
    waist: z.number().int().positive().optional(),
    hips: z.number().int().positive().optional()
  })
  .refine(data => data.bust !== undefined || data.waist !== undefined || data.hips !== undefined, {
    message: 'At least one measurement (bust, cup, waist, or hips) must be provided'
  })

export const measurementsResponseSchema = z
  .string()
  .transform(val => {
    if (!val) return undefined

    const parts = val.split('-')
    const [bustPart, waist, hips] = parts

    // Extract bust and cup size from first part
    const bustMatch = /^(\d+)([A-Z]+)?$/.exec(bustPart)
    if (!bustMatch) return undefined

    const [, bust, cup] = bustMatch
    const parsedBust = parseInt(bust)

    // Validate bust is a positive number
    if (isNaN(parsedBust) || parsedBust <= 0) return undefined

    // Parse and validate optional measurements
    const parsedWaist = waist ? parseInt(waist) : undefined
    const parsedHips = hips ? parseInt(hips) : undefined

    if (
      (parsedWaist !== undefined && (isNaN(parsedWaist) || parsedWaist <= 0)) ||
      (parsedHips !== undefined && (isNaN(parsedHips) || parsedHips <= 0))
    ) {
      return undefined
    }

    return {
      bust: parsedBust,
      cup: cup || undefined,
      waist: parsedWaist,
      hips: parsedHips
    }
  })
  .pipe(measurementsSchema.optional())

export const breastTypeResponseSchema = z
  .string()
  .transform(val => {
    if (val === '') return undefined
    if (val === 'Fake' || val === 'Natural') return val
    return undefined
  })
  .pipe(breastTypeSchema.optional())

export const stashSchema = z.object({
  id: z.string().uuid(),
  endpoint: z.string().url()
})

export const scenePathsSchema = z.object({
  screenshot: z.string().url().optional()
})

export const fingerprintSchema = z.object({
  type: fingerprintTypeSchema,
  value: z.string()
})

export const sceneFileSchema = z.object({
  basename: z.string(),
  fingerprints: z.array(fingerprintSchema)
})

export const performerSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string(),
  aliases: z.array(z.string()),
  imageUrl: z.string().url().optional(),
  country: countrySchema.optional(),
  birthdate: z.coerce.date().optional(),
  measurements: measurementsResponseSchema.optional(),
  breastType: breastTypeResponseSchema.optional(),
  isFavorite: z.boolean(),
  stashes: z.array(stashSchema).default([])
})

export const sceneSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string(),
  paths: scenePathsSchema,
  files: z.array(sceneFileSchema),
  stashes: z.array(stashSchema),
  performers: z.array(performerSchema),
  releasedAt: z.coerce.date()
})

export type Measurements = z.infer<typeof measurementsSchema>
export type Scene = z.infer<typeof sceneSchema>
export type Performer = z.infer<typeof performerSchema>
