import logger from '@/lib/logger'
import prisma from '@/lib/prisma'

import { QUEUE_NAME_SCENE_IMPORT } from '..'
import type { ImportSceneJobData, ImportSceneJobResult } from '../types'
import { BaseWorker } from './base'

export class SceneImportWorker extends BaseWorker<ImportSceneJobData, ImportSceneJobResult> {
  private static instance: SceneImportWorker | undefined

  private constructor() {
    super()
  }

  static getInstance(): SceneImportWorker {
    SceneImportWorker.instance ??= new SceneImportWorker()
    return SceneImportWorker.instance
  }

  run(): void {
    this.runWorker(
      QUEUE_NAME_SCENE_IMPORT,
      async job => {
        const { performerId } = job.data

        logger.debug({ jobId: job.id, performerId }, 'Processing scene import job')

        const existingPerformer = await prisma.performer.findUnique({
          where: { id: performerId }
        })

        if (!existingPerformer) {
          logger.error({ jobId: job.id, performerId }, 'Performer not found')
          throw new Error(`Performer not found for performerId: ${String(performerId)}`)
        }

        // TODO: Implement scene import logic
        // This is a placeholder for the actual scene import implementation
        logger.debug({ jobId: job.id, performerId }, 'Scene import job completed (placeholder)')

        return {
          performerId
        }
      },
      'Scene import'
    )
  }
}

process.on('SIGTERM', () => {
  SceneImportWorker.getInstance().cleanup()
})
