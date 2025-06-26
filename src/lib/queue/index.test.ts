import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueueManager, getQueueManager, resetQueueManager } from './index'

// Mock BullMQ
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: 'test-job-id' }),
    close: vi.fn().mockResolvedValue(undefined),
    getJobCounts: vi.fn().mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 })
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined)
  }))
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}))

describe('QueueManager', () => {
  const mockConnectionOptions = {
    host: 'localhost',
    port: 6379,
    password: 'test',
    username: 'test'
  }

  beforeEach(() => {
    resetQueueManager()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    const manager = getQueueManager()
    if (manager) {
      await manager.close()
    }
  })

  describe('Singleton Pattern', () => {
    it('should create only one instance', () => {
      const manager1 = createQueueManager(mockConnectionOptions)
      const manager2 = createQueueManager({ host: 'different' })

      expect(manager1).toBe(manager2)
    })

    it('should return existing instance when getQueueManager is called', () => {
      const manager1 = createQueueManager(mockConnectionOptions)
      const manager2 = getQueueManager()

      expect(manager2).toBe(manager1)
    })

    it('should return null when no instance exists', () => {
      const manager = getQueueManager()
      expect(manager).toBeNull()
    })
  })

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const manager = createQueueManager(mockConnectionOptions)
      await expect(manager.initialize()).resolves.not.toThrow()
    })

    it('should not initialize twice', async () => {
      const manager = createQueueManager(mockConnectionOptions)
      await manager.initialize()
      await manager.initialize() // Should not throw
    })

    it('should throw error when adding jobs before initialization', async () => {
      const manager = createQueueManager(mockConnectionOptions)

      await expect(manager.addPerformerImportJob(123)).rejects.toThrow(
        'QueueManager not initialized. Call initialize() first.'
      )
    })
  })

  describe('Job Management', () => {
    it('should add performer import job successfully', async () => {
      const manager = createQueueManager(mockConnectionOptions)
      await manager.initialize()

      const job = await manager.addPerformerImportJob(123)
      expect(job.id).toBe('test-job-id')
    })

    it('should add scenes import job successfully', async () => {
      const manager = createQueueManager(mockConnectionOptions)
      await manager.initialize()

      const job = await manager.addScenesImportJob({
        performerId: 123,
        source: 'stashdb',
        performerStashDbId: '456'
      })
      expect(job.id).toBe('test-job-id')
    })
  })

  describe('Queue Stats', () => {
    it('should get queue stats successfully', async () => {
      const manager = createQueueManager(mockConnectionOptions)
      await manager.initialize()

      const stats = await manager.getQueueStats()
      expect(stats).toHaveProperty('performerImport')
      expect(stats).toHaveProperty('scenesImport')
    })

    it('should throw error when getting stats before initialization', async () => {
      const manager = createQueueManager(mockConnectionOptions)

      await expect(manager.getQueueStats()).rejects.toThrow('QueueManager not initialized. Call initialize() first.')
    })
  })

  describe('Cleanup', () => {
    it('should close successfully', async () => {
      const manager = createQueueManager(mockConnectionOptions)
      await manager.initialize()
      await expect(manager.close()).resolves.not.toThrow()
    })

    it('should handle closing when not initialized', async () => {
      const manager = createQueueManager(mockConnectionOptions)
      await expect(manager.close()).resolves.not.toThrow()
    })
  })
})
