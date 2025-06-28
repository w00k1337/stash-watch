import { ConnectionOptions, Job, Queue, QueueEvents, Worker } from 'bullmq'

import logger from '@/lib/logger'

import { processPerformerImport, processScenesImport } from './processors'
import { PerformerImportJobData, PerformerImportJobResult, ScenesImportJobData, ScenesImportJobResult } from './types'

class QueueManager {
  private options: ConnectionOptions
  private performerImportQueue!: Queue<PerformerImportJobData, PerformerImportJobResult>
  private performerImportWorker!: Worker<PerformerImportJobData, PerformerImportJobResult>
  private scenesImportQueue!: Queue<ScenesImportJobData, ScenesImportJobResult>
  private scenesImportWorker!: Worker<ScenesImportJobData, ScenesImportJobResult>
  private performerImportQueueEvents!: QueueEvents
  private scenesImportQueueEvents!: QueueEvents
  private isInitialized = false

  constructor(options: ConnectionOptions) {
    this.options = options
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('QueueManager already initialized')
      return
    }

    logger.info('Initializing QueueManager')

    const defaultJobOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 100,
      removeOnFail: 50
    }

    // Create queues
    this.performerImportQueue = new Queue('performer-import', {
      connection: this.options,
      defaultJobOptions
    })

    this.scenesImportQueue = new Queue('scenes-import', {
      connection: this.options,
      defaultJobOptions
    })

    // Create queue events
    this.performerImportQueueEvents = new QueueEvents(this.performerImportQueue.name, { connection: this.options })
    this.scenesImportQueueEvents = new QueueEvents(this.scenesImportQueue.name, { connection: this.options })

    // Create workers
    this.performerImportWorker = new Worker(this.performerImportQueue.name, processPerformerImport, {
      connection: this.options,
      concurrency: 5 // Process up to 5 jobs concurrently
    })

    this.scenesImportWorker = new Worker(this.scenesImportQueue.name, processScenesImport, {
      connection: this.options,
      concurrency: 3 // Process up to 3 jobs concurrently
    })

    // Set up event handlers
    this.performerImportQueueEvents.on('completed', (jobId, result) => {
      logger.info({ jobId, result }, 'Job completed')
    })
    this.performerImportQueueEvents.on('failed', (jobId, error) => {
      logger.error({ jobId, error }, 'Job failed')
    })

    // Wait a moment to ensure connections are established
    await new Promise(resolve => setTimeout(resolve, 100))

    this.isInitialized = true
    logger.info('QueueManager initialized successfully')
  }

  async close(): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('QueueManager not initialized, nothing to close')
      return
    }

    logger.info('Closing QueueManager')

    try {
      // Close workers first
      await Promise.all([this.performerImportWorker.close(), this.scenesImportWorker.close()])

      // Close queues
      await Promise.all([
        this.performerImportQueue.close(),
        this.scenesImportQueue.close(),
        this.performerImportQueueEvents.close(),
        this.scenesImportQueueEvents.close()
      ])

      this.isInitialized = false
      logger.info('QueueManager closed successfully')
    } catch (error) {
      logger.error({ error }, 'Error closing QueueManager')
      throw error
    }
  }

  addPerformerImportJob = async (
    performerStashId: number
  ): Promise<Job<PerformerImportJobData, PerformerImportJobResult>> => {
    if (!this.isInitialized) {
      throw new Error('QueueManager not initialized. Call initialize() first.')
    }

    logger.debug({ performerStashId }, 'Adding performer import job')

    const job = await this.performerImportQueue.add('performer-import', { performerStashId })

    logger.debug({ jobId: job.id }, 'Performer import job added')
    return job
  }

  addScenesImportJob = async (data: ScenesImportJobData): Promise<Job<ScenesImportJobData, ScenesImportJobResult>> => {
    if (!this.isInitialized) {
      throw new Error('QueueManager not initialized. Call initialize() first.')
    }

    logger.debug({ data }, 'Adding scenes import job')

    const job = await this.scenesImportQueue.add('scenes-import', data)

    logger.debug({ jobId: job.id }, 'Scenes import job added')
    return job
  }

  async getQueueStats(): Promise<{
    performerImport: Record<string, number>
    scenesImport: Record<string, number>
  }> {
    if (!this.isInitialized) {
      throw new Error('QueueManager not initialized. Call initialize() first.')
    }

    return {
      performerImport: await this.performerImportQueue.getJobCounts(),
      scenesImport: await this.scenesImportQueue.getJobCounts()
    }
  }
}

// Singleton instance
let queueManagerInstance: QueueManager | null = null

export const createQueueManager = (connectionOptions: ConnectionOptions): QueueManager => {
  queueManagerInstance ??= new QueueManager(connectionOptions)
  return queueManagerInstance
}

export const getQueueManager = (): QueueManager | null => {
  return queueManagerInstance
}

export const closeQueueManager = async (): Promise<void> => {
  if (queueManagerInstance) {
    await queueManagerInstance.close()
    queueManagerInstance = null
  }
}

// For testing purposes
export const resetQueueManager = (): void => {
  queueManagerInstance = null
}
