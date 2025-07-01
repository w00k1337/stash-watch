import { Worker } from 'bullmq'

import { getPerformer } from '@/lib/api/stash'
import logger from '@/lib/logger'
import prisma from '@/lib/prisma'
import { convertStashPerformer } from '@/lib/utils/performer'

import { QUEUE_NAME_STASH_PERFORMER_IMPORT } from '..'
import { connection } from '../config'
import type { ImportStashPerformerJobData, ImportStashPerformerJobResult } from '../types'

export class StashPerformerImportWorker {
  private static instance: StashPerformerImportWorker | undefined
  private worker: Worker<ImportStashPerformerJobData, ImportStashPerformerJobResult> | undefined
  private isRunning = false

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  static getInstance(): StashPerformerImportWorker {
    StashPerformerImportWorker.instance ??= new StashPerformerImportWorker()
    return StashPerformerImportWorker.instance
  }

  run(): void {
    if (this.isRunning || this.worker) {
      return
    }

    this.isRunning = true

    this.worker = new Worker<ImportStashPerformerJobData, ImportStashPerformerJobResult>(
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

        const stashPerformer = await getPerformer(stashId)

        if (!stashPerformer) {
          logger.error({ jobId: job.id, stashId }, 'Stash performer not found')
          throw new Error(`Stash performer not found for stashId: ${String(stashId)}`)
        }

        const { slug, ...convertedPerformer } = convertStashPerformer(stashPerformer)

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
      {
        connection,
        concurrency: 5
      }
    )

    this.worker.on('completed', (job, result) => {
      logger.info(
        { jobId: job.id, stashId: job.data.stashId, slug: result.slug, name: result.name },
        'Successfully imported Stash performer'
      )
    })

    this.worker.on('failed', (job, error) => {
      logger.error(
        { jobId: job?.id, stashId: job?.data.stashId, error: error.message },
        'Failed to import Stash performer'
      )
    })

    this.worker.on('error', error => {
      logger.error({ error }, 'Stash performer import worker error')
    })

    this.worker.on('stalled', jobId => {
      logger.warn({ jobId }, 'Stash performer import job stalled')
    })

    this.worker.on('closed', () => {
      logger.info('Stash performer import worker closed')
      this.isRunning = false
    })
  }

  cleanup(): void {
    if (this.worker) {
      this.worker.removeAllListeners()
      void this.worker.close()
      this.worker = undefined
      this.isRunning = false
    }
  }

  isActive(): boolean {
    return this.isRunning && this.worker !== undefined
  }
}

process.on('SIGTERM', () => {
  StashPerformerImportWorker.getInstance().cleanup()
})
