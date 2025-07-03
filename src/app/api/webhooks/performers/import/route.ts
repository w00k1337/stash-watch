import { NextRequest, NextResponse } from 'next/server'

import { getPerformers as getStashPerformers } from '@/lib/api/stash'
import logger from '@/lib/logger'
import { QueueManager } from '@/lib/queue'
import { validateWebhookAuth } from '@/lib/utils/webhook-auth'

/**
 * Response structure for the performer import webhook
 */
interface PerformerImportWebhookResponse {
  /** Whether the webhook processing was successful */
  success: boolean
  /** Number of performers queued for import (only present on success) */
  performersQueued?: number
  /** Error message (only present on failure) */
  error?: string
}

/**
 * Webhook endpoint for importing performers from Stash
 *
 * This endpoint:
 * 1. Validates the webhook authentication
 * 2. Fetches all performers from Stash
 * 3. Queues each performer for import processing
 *
 * @param request - The incoming webhook request
 * @returns Promise resolving to a NextResponse with import status
 */
export const POST = async (request: NextRequest): Promise<NextResponse<PerformerImportWebhookResponse>> => {
  try {
    // Validate webhook authentication
    const authResult = validateWebhookAuth(request)
    if (!authResult.success && authResult.response) {
      return authResult.response
    }

    // Fetch all performers from Stash
    const performers = await getStashPerformers()
    logger.info({ count: performers.length }, 'Fetched performers from Stash')

    if (performers.length > 0) {
      // Extract performer IDs for queuing
      const performerIds = performers.map(({ id }) => id)

      // Queue performers for background import processing
      await QueueManager.defaultManager().addImportStashPerformerJobs(performerIds)

      logger.info({ count: performerIds.length }, 'Queued performers for import')
    }

    return NextResponse.json({ success: true, performersQueued: performers.length })
  } catch (error) {
    logger.error({ error }, 'Failed to process performer import webhook')
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
