import { z } from 'zod'

export const imageSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
})

export const hashAlgorithmSchema = z.enum(['OSHASH', 'PHASH', 'MD5'])

export const hashSchema = z.object({
  hash: z.string(),
  algorithm: hashAlgorithmSchema,
  duration: z.number()
})

export const sceneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  releasedAt: z.coerce.date(),
  images: z.array(imageSchema),
  fingerprints: z.array(hashSchema)
})

export type Scene = z.infer<typeof sceneSchema>
export type HashAlgorithm = z.infer<typeof hashAlgorithmSchema>
