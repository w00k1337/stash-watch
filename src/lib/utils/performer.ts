import slugify from 'slugify'

import { Performer } from '@/generated/prisma'
import { Performer as StashPerformer } from '@/lib/api/stash'

import { convertUSBandToEuropean } from './band-size'
import { convertStashCountry } from './country'
import { convertToCupSize } from './cup-size'

export const convertStashPerformer = (
  performer: StashPerformer
): Pick<
  Performer,
  | 'slug'
  | 'name'
  | 'aliases'
  | 'imageUrl'
  | 'bandSize'
  | 'cupSize'
  | 'hasNaturalBreasts'
  | 'country'
  | 'birthdate'
  | 'isFavorite'
  | 'stashId'
  | 'stashDbId'
  | 'pornDbId'
> => {
  const { id, name, aliases, imageUrl, country, birthdate, measurements, breastType, isFavorite, stashes } = performer
  const stashDbId = stashes.find(({ endpoint }) => endpoint.includes('stashdb'))?.id
  const pornDbId = stashes.find(({ endpoint }) => endpoint.includes('porndb'))?.id
  return {
    slug: slugify(name, { lower: true, strict: true }),
    name,
    aliases,
    imageUrl: imageUrl ?? '',
    bandSize: measurements?.bust ? convertUSBandToEuropean(measurements.bust) : null,
    cupSize: measurements?.cup ? (convertToCupSize(measurements.cup) ?? null) : null,
    hasNaturalBreasts: breastType ? breastType === 'Natural' : null,
    country: country ? (convertStashCountry(country) ?? null) : null,
    birthdate: birthdate ?? null,
    isFavorite,
    stashId: id,
    stashDbId: stashDbId ?? null,
    pornDbId: pornDbId ?? null
  }
}
