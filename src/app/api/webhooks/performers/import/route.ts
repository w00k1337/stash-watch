import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/env/server'
import { getPerformers as getStashPerformers } from '@/lib/api/stash'
import logger from '@/lib/logger'
import { QueueManager } from '@/lib/queue'

const bodySchema = z.object({
  secret: z.string()
})

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const unparsedBody = await (request.json() as unknown)
  const { secret } = bodySchema.parse(unparsedBody)

  if (secret !== env.WEBHOOK_SECRET) {
    logger.error({ secret }, 'Unauthorized')
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stashPerformers = await getStashPerformers()
    logger.debug({ count: stashPerformers.length }, 'Fetched Stash performers')

    await QueueManager.defaultManager().importStashPerformers(stashPerformers.map(({ id }) => id))

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    logger.error({ error }, 'Failed to import performers')
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
