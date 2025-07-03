import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getPerformerScenes as getStashDbPerformerScenes } from '@/lib/api/stashdb'
import logger from '@/lib/logger'
import prisma from '@/lib/prisma'
import { validateWebhookAuth } from '@/lib/utils/webhook-auth'

/**
 * Request body schema for the scene import webhook
 */
const bodySchema = z.object({
  /** ID of the performer to import scenes for */
  performerId: z.number().min(1)
})

/**
 * Response structure for the scene import webhook
 */
interface SceneImportWebhookResponse {
  /** Whether the webhook processing was successful */
  success: boolean
  /** ID of the performer being processed */
  performerId: number
  /** Number of scenes found for the performer */
  scenesFound: number
  /** Whether the performer has a StashDB ID */
  hasStashDbId: boolean
}

/**
 * Error response structure for the scene import webhook
 */
interface SceneImportErrorResponse {
  /** Error message */
  error: string
}

/**
 * Webhook endpoint for importing scenes for a specific performer
 *
 * This endpoint:
 * 1. Validates the webhook authentication and request body
 * 2. Looks up the performer in the database
 * 3. Fetches scenes from StashDB if the performer has a StashDB ID
 * 4. Returns scene count information
 *
 * @param request - The incoming webhook request containing performer ID and secret
 * @returns Promise resolving to a NextResponse with scene import status or error
 */
export const POST = async (
  request: NextRequest
): Promise<NextResponse<SceneImportWebhookResponse | SceneImportErrorResponse>> => {
  try {
    // Parse and validate request body
    const body = (await request.json()) as unknown
    const { performerId } = bodySchema.parse(body)

    // Validate webhook authentication
    const authResult = validateWebhookAuth(request)
    if (!authResult.success && authResult.response) {
      return authResult.response
    }

    // Look up performer in database
    const performer = await prisma.performer.findUnique({ where: { id: performerId } })
    if (!performer) {
      logger.error({ performerId }, 'Performer not found')
      return NextResponse.json({ error: 'Performer not found' }, { status: 404 })
    }

    // Fetch scenes from StashDB if performer has a StashDB ID
    let scenesFound = 0
    if (performer.stashDbId) {
      const scenes = await getStashDbPerformerScenes(performer.stashDbId)
      scenesFound = scenes.length
      logger.info({ performerId, count: scenesFound }, 'Fetched scenes from StashDB')
    }

    return NextResponse.json({
      success: true,
      performerId,
      scenesFound,
      hasStashDbId: !!performer.stashDbId
    })
  } catch (error) {
    logger.error({ error }, 'Failed to process scene import webhook')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
