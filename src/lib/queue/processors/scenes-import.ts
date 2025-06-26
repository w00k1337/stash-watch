import { Job } from 'bullmq'

import logger from '@/lib/logger'
import prisma from '@/lib/prisma'

import { ScenesImportJobData, ScenesImportJobResult } from '../types'

export const processScenesImport = async (
  job: Job<ScenesImportJobData, ScenesImportJobResult>
): Promise<ScenesImportJobResult> => {
  const { performerId, source } = job.data

  const performer = await prisma.performer.findUnique({
    where: { id: performerId },
    include: {
      scenes: true
    }
  })

  if (!performer) throw new Error('Performer not found')

  switch (source) {
    case 'stashdb':
      {
        const { performerStashDbId } = job.data
        logger.info({ jobId: job.id, performerId, performerStashDbId }, 'Importing scenes from StashDB')
      }
      break
    case 'theporndb':
      {
        const { performerPornDbId } = job.data
        logger.info({ jobId: job.id, performerId, performerPornDbId }, 'Importing scenes from PornDB')
      }
      break
  }

  const result = await Promise.resolve({
    success: true,
    performerId,
    source
  })

  return result
}
