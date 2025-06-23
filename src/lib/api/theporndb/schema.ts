import { z } from 'zod'

export const siteSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  logo: z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .pipe(z.string().url().optional())
})

export const hashTypeSchema = z.enum(['OSHASH', 'PHASH'])

export const hashSchema = z.object({
  hash: z.string(),
  type: hashTypeSchema,
  duration: z.number()
})

export const sceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.coerce.date(),
  image: z
    .string()
    .nullable()
    .transform(val => (val === '' || val === null ? undefined : val))
    .pipe(z.string().url().optional()),
  site: siteSchema,
  hashes: z.array(hashSchema)
})

export type Scene = z.infer<typeof sceneSchema>
