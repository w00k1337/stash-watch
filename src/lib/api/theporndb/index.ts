import { getPerformerScenes as getPerformerScenesApi } from '@/generated/theporndb/sdk.gen'
import logger from '@/lib/logger'

import { Scene, sceneSchema } from './schema'

export class ThePornDBError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'ThePornDBError'
  }
}

interface FetchScenesOptions {
  pageSize: number
  rateLimitDelay: number
}

export const getPerformerScenes = async (
  performerId: string,
  options: FetchScenesOptions = { pageSize: 100, rateLimitDelay: 100 }
): Promise<Scene[]> => {
  const { pageSize, rateLimitDelay } = options

  logger.debug(
    {
      performerId,
      pageSize,
      rateLimitDelay
    },
    'Starting to fetch performer scenes from ThePornDB'
  )

  const scenes: Scene[] = []
  let currentPage = 1
  let totalPages = 1

  try {
    while (currentPage <= totalPages) {
      logger.debug(
        {
          performerId,
          currentPage,
          totalPages,
          scenesCount: scenes.length
        },
        'Fetching performer scenes page'
      )

      const { data } = await getPerformerScenesApi({
        path: { identifier: performerId },
        query: {
          page: currentPage,
          per_page: pageSize
        }
      })

      const pageScenes = data?.data?.map(scene => sceneSchema.parse(scene)) ?? []
      scenes.push(...pageScenes)

      logger.debug(
        {
          performerId,
          currentPage,
          totalPages,
          pageScenesCount: pageScenes.length,
          totalScenesCount: scenes.length,
          hasData: !!data?.data,
          totalFromMeta: data?.meta?.total
        },
        'Received performer scenes page response'
      )

      // Update total pages based on the response
      if (currentPage === 1 && data?.meta?.total) {
        totalPages = Math.ceil(data.meta.total / pageSize)
        logger.debug(
          {
            performerId,
            totalScenes: data.meta.total,
            calculatedTotalPages: totalPages
          },
          'Updated total pages from first response from ThePornDB'
        )
      }

      currentPage++
      if (currentPage <= totalPages) {
        logger.debug(
          {
            performerId,
            nextPage: currentPage,
            delayMs: rateLimitDelay
          },
          'Applying rate limit delay before next request'
        )
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay))
      }
    }

    logger.debug(
      {
        performerId,
        totalScenes: scenes.length,
        totalPages: currentPage - 1
      },
      'Successfully fetched all performer scenes from ThePornDB'
    )

    return scenes
  } catch (error) {
    logger.error(
      {
        performerId,
        currentPage,
        totalPages,
        scenesCount: scenes.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      },
      'Failed to fetch performer scenes from ThePornDB'
    )
    throw new ThePornDBError('Failed to fetch performer scenes', error)
  }
}
