import { Job } from 'bullmq'

import logger from '@/lib/logger'

import { PerformerImportJobData, PerformerImportJobResult } from '../types'

export const processPerformerImport = async (
  job: Job<PerformerImportJobData, PerformerImportJobResult>
): Promise<PerformerImportJobResult> => {
  const { performerStashId } = job.data

  logger.info({ jobId: job.id, performerStashId }, 'Importing performer from Stash')

  const result = await Promise.resolve({
    success: true,
    performerStashId,
    performerId: 123,
    performerName: 'Stub Performer'
  })

  return result
}
