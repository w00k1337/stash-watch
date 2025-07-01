import { Queue } from 'bullmq'

import logger from '../logger'
import { connection } from './config'
import { ImportStashPerformerJobData, ImportStashPerformerJobResult } from './types'

export const QUEUE_NAME_STASH_PERFORMER_IMPORT = 'stash-performer-import'
export const JOB_NAME_IMPORT_STASH_PERFORMER = 'import-stash-performer'

export class QueueManager {
  private readonly performerImportQueue: Queue<ImportStashPerformerJobData, ImportStashPerformerJobResult>
  private static instance: QueueManager | undefined

  private constructor() {
    this.performerImportQueue = new Queue<ImportStashPerformerJobData, ImportStashPerformerJobResult>(
      QUEUE_NAME_STASH_PERFORMER_IMPORT,
      {
        connection,
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: 10 // Keep failed jobs for debugging, but limit to 10
        }
      }
    )
  }

  static defaultManager(): QueueManager {
    QueueManager.instance ??= new QueueManager()

    return QueueManager.instance
  }

  async importStashPerformers(ids: number[]): Promise<void> {
    logger.debug({ count: ids.length }, 'Adding Stash performers to import queue')

    // Check for existing jobs to avoid duplicates
    const existingJobs = await this.performerImportQueue.getJobs(['waiting', 'active', 'delayed'])
    const existingStashIds = new Set(existingJobs.map(job => job.data.stashId))

    const newIds = ids.filter(id => !existingStashIds.has(id))

    if (newIds.length === 0) {
      logger.debug('All performers already in queue, skipping')
      return
    }

    if (newIds.length < ids.length) {
      logger.debug({ skipped: ids.length - newIds.length, added: newIds.length }, 'Some performers already in queue')
    }

    const jobs = await this.performerImportQueue.addBulk(
      newIds.map(id => ({
        name: JOB_NAME_IMPORT_STASH_PERFORMER,
        data: { stashId: id },
        opts: {
          jobId: `${JOB_NAME_IMPORT_STASH_PERFORMER}-${String(id)}`,
          delay: 1000, // 1 second delay to prevent immediate duplicate processing
          attempts: 3, // Retry failed jobs up to 3 times
          backoff: {
            type: 'exponential',
            delay: 2000 // Start with 2 seconds, then exponential backoff
          }
        }
      }))
    )

    logger.debug({ count: jobs.length }, 'Added Stash performers to import queue')
  }

  async close(): Promise<void> {
    await this.performerImportQueue.close()

    QueueManager.instance = undefined
  }

  async getQueueStatus(): Promise<{
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.performerImportQueue.getWaiting(),
      this.performerImportQueue.getActive(),
      this.performerImportQueue.getCompleted(),
      this.performerImportQueue.getFailed(),
      this.performerImportQueue.getDelayed()
    ])

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length
    }
  }

  async clearQueue(): Promise<void> {
    await this.performerImportQueue.obliterate()
    logger.info('Cleared all jobs from performer import queue')
  }
}
