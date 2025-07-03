import slugify from 'slugify'

import { Performer } from '@/generated/prisma'
import { Performer as StashPerformer } from '@/lib/api/stash'

import { convertUSBandToEuropean } from './band-size'
import { convertStashCountry } from './country'
import { convertToCupSize } from './cup-size'

/**
 * Converts a Stash performer object to a database performer object
 *
 * This function transforms performer data from the Stash API format to the
 * internal database format, performing various conversions and normalizations:
 * - Creates a URL-friendly slug from the performer name
 * - Converts US band sizes to European measurements
 * - Converts cup size measurements to standardized format
 * - Maps country codes to standardized country names
 * - Extracts StashDB and PornDB IDs from stash endpoints
 * - Handles optional fields with appropriate fallbacks
 *
 * @param performer - The Stash performer object to convert
 * @returns A partial Performer object with converted and normalized data
 */
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

  // Extract StashDB and PornDB IDs from stash endpoints
  const stashDbId = stashes.find(({ endpoint }) => endpoint.includes('stashdb'))?.id
  const pornDbId = stashes.find(({ endpoint }) => endpoint.includes('porndb'))?.id

  return {
    // Create URL-friendly slug from performer name
    slug: slugify(name, { lower: true, strict: true }),
    name,
    aliases,
    imageUrl: imageUrl ?? '',
    // Convert US band size to European measurement if available
    bandSize: measurements?.bust ? convertUSBandToEuropean(measurements.bust) : null,
    // Convert cup size to standardized format if available
    cupSize: measurements?.cup ? (convertToCupSize(measurements.cup) ?? null) : null,
    // Determine if breasts are natural based on breast type
    hasNaturalBreasts: breastType ? breastType === 'Natural' : null,
    // Convert country code to standardized country name if available
    country: country ? (convertStashCountry(country) ?? null) : null,
    birthdate: birthdate ?? null,
    isFavorite,
    stashId: id,
    stashDbId: stashDbId ?? null,
    pornDbId: pornDbId ?? null
  }
}
