import { Job } from 'bullmq'
import slugify from 'slugify'

import { Prisma } from '@/generated/prisma'
import { getPerformer } from '@/lib/api/stash'
import logger from '@/lib/logger'
import prisma from '@/lib/prisma'
import { convertStashCountry, convertToPrismaCupSize, convertUSBandToEuropean } from '@/lib/utils'

import { PerformerImportJobData, PerformerImportJobResult } from '../types'

export const processPerformerImport = async (
  job: Job<PerformerImportJobData, PerformerImportJobResult>
): Promise<PerformerImportJobResult> => {
  const { performerStashId } = job.data

  logger.info({ jobId: job.id, performerStashId }, 'Starting performer import from Stash')

  const stashPerformer = await getPerformer(performerStashId)

  if (!stashPerformer) {
    logger.error({ jobId: job.id, performerStashId }, 'Performer not found in Stash')
    throw new Error(`Performer not found with Stash ID: ${String(performerStashId)}`)
  }

  logger.debug(
    {
      jobId: job.id,
      performerStashId,
      performerName: stashPerformer.name,
      hasImage: !!stashPerformer.imageUrl,
      hasMeasurements: !!stashPerformer.measurements,
      hasStashDbId: !!stashPerformer.stashes.find(({ endpoint }) => endpoint.includes('stashdb')),
      hasPornDbId: !!stashPerformer.stashes.find(({ endpoint }) => endpoint.includes('theporndb'))
    },
    'Retrieved performer data from Stash'
  )

  const commonPerformerData = {
    name: stashPerformer.name,
    aliases: stashPerformer.aliases,
    imageUrl: stashPerformer.imageUrl ?? '',
    ...(stashPerformer.measurements?.bust && { bandSize: convertUSBandToEuropean(stashPerformer.measurements.bust) }),
    ...(stashPerformer.measurements?.cup && { cupSize: convertToPrismaCupSize(stashPerformer.measurements.cup) }),
    ...(stashPerformer.breastType && { hasNaturalBreasts: stashPerformer.breastType === 'Natural' }),
    birthdate: stashPerformer.birthdate,
    ...(stashPerformer.country && { country: convertStashCountry(stashPerformer.country) }),
    isFavorite: stashPerformer.isFavorite,
    stashId: performerStashId,
    stashDbId: stashPerformer.stashes.find(({ endpoint }) => endpoint.includes('stashdb'))?.id,
    pornDbId: stashPerformer.stashes.find(({ endpoint }) => endpoint.includes('theporndb'))?.id
  }

  logger.debug(
    {
      jobId: job.id,
      performerStashId,
      performerData: {
        name: commonPerformerData.name,
        hasAliases: !!commonPerformerData.aliases.length,
        hasImage: !!commonPerformerData.imageUrl,
        bandSize: commonPerformerData.bandSize,
        cupSize: commonPerformerData.cupSize,
        hasNaturalBreasts: commonPerformerData.hasNaturalBreasts,
        hasBirthdate: !!commonPerformerData.birthdate,
        country: commonPerformerData.country,
        isFavorite: commonPerformerData.isFavorite,
        stashDbId: commonPerformerData.stashDbId,
        pornDbId: commonPerformerData.pornDbId
      }
    },
    'Prepared performer data for database'
  )

  const baseSlug = slugify(stashPerformer.name, { lower: true })
  let suffix = 0
  const maxRetries = 100 // Safety limit to prevent infinite loops

  logger.debug({ jobId: job.id, performerStashId, baseSlug }, 'Starting slug generation process')

  while (suffix < maxRetries) {
    const currentSlug = suffix === 0 ? baseSlug : `${baseSlug}-${String(suffix)}`

    try {
      logger.debug(
        { jobId: job.id, performerStashId, currentSlug, attempt: suffix + 1 },
        'Attempting to upsert performer'
      )

      const performer = await prisma.performer.upsert({
        where: { stashId: performerStashId },
        update: {
          ...commonPerformerData
        },
        create: {
          ...commonPerformerData,
          slug: currentSlug
        }
      })

      logger.info(
        {
          jobId: job.id,
          performerStashId,
          performerId: performer.id,
          performerName: performer.name,
          slug: performer.slug
        },
        'Successfully imported performer'
      )

      return {
        performerId: performer.id,
        performerStashId,
        performerName: performer.name
      }
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002' && Array.isArray(e.meta?.target) && e.meta.target.includes('slug')) {
          logger.debug(
            {
              jobId: job.id,
              performerStashId,
              currentSlug,
              attempt: suffix + 1
            },
            'Slug collision detected, trying with incremented suffix'
          )
          suffix++
          continue // try again with a bumped suffix
        }
      }

      logger.error(
        {
          jobId: job.id,
          performerStashId,
          currentSlug,
          attempt: suffix + 1,
          error: e instanceof Error ? e.message : String(e)
        },
        'Unexpected error during performer upsert'
      )
      throw e
    }
  }

  logger.error(
    {
      jobId: job.id,
      performerStashId,
      baseSlug,
      maxRetries
    },
    'Failed to create performer with unique slug after maximum attempts'
  )

  throw new Error(`Failed to create performer with unique slug after ${String(maxRetries)} attempts`)
}
