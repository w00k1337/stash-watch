import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/env/server'
import logger from '@/lib/logger'

interface WebhookAuthResult {
  success: boolean
  response?: NextResponse<{ success: boolean; error: string }>
}

/**
 * Validates webhook authentication from Authorization header.
 *
 * Supports one authentication method:
 * 1. Bearer token in Authorization header
 *
 * @param request - The incoming webhook request
 * @returns Object with success status and error response if authentication failed
 */
export const validateWebhookAuth = (request: NextRequest): WebhookAuthResult => {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  const headerSecret = authHeader?.replace('Bearer ', '')

  // Check if either authentication method is valid
  const isValidAuth = headerSecret && headerSecret === env.WEBHOOK_SECRET

  if (!isValidAuth) {
    logger.error('Unauthorized webhook request')
    return {
      success: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  return { success: true }
}
