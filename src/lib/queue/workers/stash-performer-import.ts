import { getPerformer } from '@/lib/api/stash'
import logger from '@/lib/logger'
import prisma from '@/lib/prisma'
import { convertStashPerformer } from '@/lib/utils'

import { QUEUE_NAME_STASH_PERFORMER_IMPORT } from '..'
import type { ImportStashPerformerJobData, ImportStashPerformerJobResult } from '../types'
import { BaseWorker } from './base'

/**
 * Worker for importing performers from Stash into the local database
 *
 * This worker processes background jobs that import performer data from the Stash API.
 * It handles both creating new performers and updating existing ones, with proper
 * data conversion and validation. The worker uses a singleton pattern to ensure
 * only one instance runs at a time.
 *
 * Features:
 * - Singleton pattern for single instance management
 * - Automatic duplicate detection and upsert logic
 * - Data conversion from Stash format to database format
 * - Comprehensive logging and error handling
 * - Graceful shutdown handling
 */
export class StashPerformerImportWorker extends BaseWorker<ImportStashPerformerJobData, ImportStashPerformerJobResult> {
  private static instance: StashPerformerImportWorker | undefined

  private constructor() {
    super()
  }

  /**
   * Returns the singleton instance of the Stash performer import worker
   *
   * Creates a new instance if one doesn't exist, ensuring only one
   * worker instance exists throughout the application lifecycle.
   *
   * @returns The singleton StashPerformerImportWorker instance
   */
  static getInstance(): StashPerformerImportWorker {
    StashPerformerImportWorker.instance ??= new StashPerformerImportWorker()
    return StashPerformerImportWorker.instance
  }

  /**
   * Starts the Stash performer import worker
   *
   * This method initializes the worker to process jobs from the Stash performer
   * import queue. Each job processes a single performer by:
   * 1. Checking if the performer already exists in the database
   * 2. Fetching performer data from the Stash API
   * 3. Converting the data to the internal format
   * 4. Upserting the performer in the database
   * 5. Returning the processing result
   */
  run(): void {
    this.runWorker(
      QUEUE_NAME_STASH_PERFORMER_IMPORT,
      async job => {
        const { stashId } = job.data

        logger.debug({ jobId: job.id, stashId }, 'Processing Stash performer import job')

        // Check if performer already exists in database
        const existingPerformer = await prisma.performer.findUnique({
          where: { stashId }
        })

        if (existingPerformer) {
          logger.debug(
            { jobId: job.id, stashId, performerId: existingPerformer.id },
            'Performer already exists, updating'
          )
        }

        // Fetch performer data from Stash API
        const stashPerformer = await getPerformer(stashId)

        if (!stashPerformer) {
          logger.error({ jobId: job.id, stashId }, 'Stash performer not found')
          throw new Error(`Stash performer not found for stashId: ${String(stashId)}`)
        }

        // Convert Stash performer data to database format
        const { slug, ...convertedPerformer } = convertStashPerformer(stashPerformer)

        // Upsert performer in database (create if new, update if exists)
        const performer = await prisma.$transaction(async tx => {
          return tx.performer.upsert({
            where: { stashId: stashPerformer.id },
            create: { ...convertedPerformer, slug },
            update: { ...convertedPerformer }
          })
        })

        logger.debug({ jobId: job.id, stashId, performerId: performer.id }, 'Successfully processed performer')

        return {
          stashId: stashPerformer.id,
          slug: performer.slug,
          name: performer.name
        }
      },
      'Stash performer import'
    )
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  StashPerformerImportWorker.getInstance().cleanup()
})
