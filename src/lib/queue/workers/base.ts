import { Worker } from 'bullmq'

import logger from '@/lib/logger'

import { connection } from '../config'

/**
 * Base class for all queue workers to eliminate code duplication.
 *
 * Provides common functionality for:
 * - Singleton pattern implementation
 * - Worker lifecycle management
 * - Event handling and logging
 * - Graceful cleanup
 */
export abstract class BaseWorker<TData, TResult> {
  protected worker: Worker<TData, TResult> | undefined
  protected isRunning = false

  protected constructor() {
    // Protected constructor to prevent direct instantiation
  }

  /**
   * Starts the worker if it's not already running.
   *
   * @param queueName - Name of the queue to process
   * @param processor - Function to process jobs
   * @param workerName - Human-readable name for logging
   */
  protected runWorker(
    queueName: string,
    processor: (job: { id?: string | number; data: TData }) => Promise<TResult>,
    workerName: string
  ): void {
    if (this.isRunning || this.worker) {
      return
    }

    this.isRunning = true

    this.worker = new Worker<TData, TResult>(queueName, processor, {
      connection,
      concurrency: 5
    })

    this.setupEventHandlers(workerName)
  }

  /**
   * Sets up standard event handlers for the worker.
   *
   * @param workerName - Human-readable name for logging
   */
  private setupEventHandlers(workerName: string): void {
    if (!this.worker) return

    this.worker.on('completed', job => {
      logger.info({ jobId: job.id, workerName }, `Successfully completed ${workerName} job`)
    })

    this.worker.on('failed', (job, error) => {
      logger.error({ jobId: job?.id, workerName, error: error.message }, `Failed to process ${workerName} job`)
    })

    this.worker.on('error', error => {
      logger.error({ error, workerName }, `${workerName} worker error`)
    })

    this.worker.on('stalled', jobId => {
      logger.warn({ jobId, workerName }, `${workerName} job stalled`)
    })

    this.worker.on('closed', () => {
      logger.info(`${workerName} worker closed`)
      this.isRunning = false
    })
  }

  /**
   * Cleans up the worker and resets its state.
   */
  cleanup(): void {
    if (this.worker) {
      this.worker.removeAllListeners()
      void this.worker.close()
      this.worker = undefined
      this.isRunning = false
    }
  }

  /**
   * Checks if the worker is currently active.
   *
   * @returns True if the worker is running and has an active worker instance
   */
  isActive(): boolean {
    return this.isRunning && this.worker !== undefined
  }

  /**
   * Abstract method that must be implemented by subclasses to start the worker.
   */
  abstract run(): void
}
