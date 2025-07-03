import { Queue } from 'bullmq'

import logger from '../logger'
import { connection } from './config'
import {
  ImportSceneJobData,
  ImportSceneJobResult,
  ImportStashPerformerJobData,
  ImportStashPerformerJobResult
} from './types'

/** Queue name for Stash performer import jobs */
export const QUEUE_NAME_STASH_PERFORMER_IMPORT = 'stash-performer-import'
/** Queue name for scene import jobs */
export const QUEUE_NAME_SCENE_IMPORT = 'scene-import'
/** Job name for importing a Stash performer */
export const JOB_NAME_IMPORT_STASH_PERFORMER = 'import-stash-performer'
/** Job name for importing a scene */
export const JOB_NAME_IMPORT_SCENE = 'import-scene'

/**
 * Default job options for all import jobs
 */
const defaultJobOptions = {
  removeOnComplete: true,
  removeOnFail: 10 // Keep failed jobs for debugging, but limit to 10
}

/**
 * Default retry configuration for import jobs
 */
const defaultRetryOptions = {
  attempts: 3, // Retry failed jobs up to 3 times
  backoff: {
    type: 'exponential' as const,
    delay: 2000 // Start with 2 seconds, then exponential backoff
  }
}

/**
 * Manages background job queues for importing data from external sources.
 *
 * This class provides a singleton pattern for managing BullMQ queues that handle
 * asynchronous import operations. It supports both Stash performer imports and
 * scene imports with built-in retry logic, duplicate prevention, and monitoring.
 *
 * Features:
 * - Singleton pattern ensures single queue instance across the application
 * - Automatic duplicate job prevention
 * - Configurable retry logic with exponential backoff
 * - Queue status monitoring and management
 * - Graceful cleanup on application shutdown
 */
export class QueueManager {
  private readonly performerImportQueue: Queue<ImportStashPerformerJobData, ImportStashPerformerJobResult>
  private readonly sceneImportQueue: Queue<ImportSceneJobData, ImportSceneJobResult>
  private static instance: QueueManager | undefined

  /**
   * Private constructor to enforce singleton pattern.
   *
   * Initializes two BullMQ queues:
   * - Performer import queue for processing Stash performer data
   * - Scene import queue for processing scene data
   *
   * Both queues are configured with automatic cleanup of completed jobs
   * and retention of failed jobs for debugging purposes.
   */
  private constructor() {
    this.performerImportQueue = new Queue<ImportStashPerformerJobData, ImportStashPerformerJobResult>(
      QUEUE_NAME_STASH_PERFORMER_IMPORT,
      {
        connection,
        defaultJobOptions: defaultJobOptions
      }
    )

    this.sceneImportQueue = new Queue<ImportSceneJobData, ImportSceneJobResult>(QUEUE_NAME_SCENE_IMPORT, {
      connection,
      defaultJobOptions: defaultJobOptions
    })
  }

  /**
   * Returns the singleton instance of QueueManager.
   *
   * Creates a new instance if one doesn't exist, ensuring only one
   * queue manager exists throughout the application lifecycle.
   *
   * @returns The singleton QueueManager instance
   */
  static defaultManager(): QueueManager {
    QueueManager.instance ??= new QueueManager()

    return QueueManager.instance
  }

  /**
   * Adds Stash performer import jobs to the queue.
   *
   * This method filters out performers that already have pending import jobs
   * to avoid duplicate processing. Each job is configured with retry logic
   * and exponential backoff for resilience.
   *
   * @param stashIds - Array of Stash performer IDs to import
   * @returns Promise that resolves when all jobs have been added to the queue
   */
  async addImportStashPerformerJobs(stashIds: number[]): Promise<void> {
    logger.debug({ count: stashIds.length }, 'Adding Stash performers to import queue')

    // Check for existing jobs to avoid duplicates
    const existingJobs = await this.performerImportQueue.getJobs(['waiting', 'active', 'delayed'])
    const existingStashIds = new Set(existingJobs.map(job => job.data.stashId))

    const newIds = stashIds.filter(id => !existingStashIds.has(id))

    if (newIds.length === 0) {
      logger.debug('All performers already in queue, skipping')
      return
    }

    if (newIds.length < stashIds.length) {
      logger.debug(
        { skipped: stashIds.length - newIds.length, added: newIds.length },
        'Some performers already in queue'
      )
    }

    const jobs = await this.performerImportQueue.addBulk(
      newIds.map(id => ({
        name: JOB_NAME_IMPORT_STASH_PERFORMER,
        data: { stashId: id },
        opts: {
          jobId: `${JOB_NAME_IMPORT_STASH_PERFORMER}-${String(id)}`,
          delay: 1000, // 1 second delay to prevent immediate duplicate processing
          ...defaultRetryOptions
        }
      }))
    )

    logger.debug({ count: jobs.length }, 'Added Stash performers to import queue')
  }

  /**
   * Gracefully closes all queue connections and resets the singleton instance.
   *
   * This method should be called during application shutdown to ensure
   * proper cleanup of Redis connections and prevent memory leaks.
   *
   * @returns Promise that resolves when all queues have been closed
   */
  async close(): Promise<void> {
    await this.performerImportQueue.close()
    await this.sceneImportQueue.close()

    QueueManager.instance = undefined
  }

  /**
   * Removes all jobs from both queues.
   *
   * This is a destructive operation that permanently deletes all jobs
   * (waiting, active, completed, failed, delayed) from both the performer
   * and scene import queues. Use with caution, typically only for testing
   * or emergency situations.
   *
   * @returns Promise that resolves when all jobs have been removed
   */
  async clearQueues(): Promise<void> {
    await this.performerImportQueue.obliterate()
    await this.sceneImportQueue.obliterate()

    logger.info('Cleared all jobs from performer and scene import queues')
  }
}
