import { env } from '@/env/server'
import { graphql } from '@/generated/stashdb'
import { CriterionModifier, QueryScenesQuery, QueryScenesQueryVariables } from '@/generated/stashdb/graphql'
import logger from '@/lib/logger'

import { fetchGraphQL } from '../common/utils'
import { Scene, sceneSchema } from './schema'

export class StashDBError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'StashDBError'
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
    'Starting to fetch performer scenes from StashDB'
  )

  const query = graphql(`
    query QueryScenes($input: SceneQueryInput!) {
      queryScenes(input: $input) {
        count
        scenes {
          id
          title
          releasedAt: release_date
          images {
            id
            url
            width
            height
          }
          fingerprints {
            hash
            algorithm
            duration
          }
        }
      }
    }
  `)

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
        'Fetching performer scenes page from StashDB'
      )

      const { queryScenes } = await fetchGraphQL<QueryScenesQuery, QueryScenesQueryVariables>({
        apiBaseUrl: env.STASHDB_BASE_URL,
        apiKey: env.STASHDB_API_KEY,
        query,
        variables: {
          input: {
            performers: { value: [performerId], modifier: CriterionModifier.Includes },
            per_page: pageSize,
            page: currentPage
          }
        }
      })

      totalPages = Math.ceil(queryScenes.count / pageSize)
      const pageScenes = queryScenes.scenes.map(scene => sceneSchema.parse(scene))
      scenes.push(...pageScenes)

      logger.debug(
        {
          performerId,
          currentPage,
          totalPages,
          pageScenesCount: pageScenes.length,
          totalScenesCount: scenes.length,
          totalFromResponse: queryScenes.count
        },
        'Received performer scenes page response from StashDB'
      )

      // Update total pages on first page if we have a count
      if (currentPage === 1 && queryScenes.count) {
        logger.debug(
          {
            performerId,
            totalScenes: queryScenes.count,
            calculatedTotalPages: totalPages
          },
          'Updated total pages from first StashDB response'
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
          'Applying rate limit delay before next StashDB request'
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
      'Successfully fetched all performer scenes from StashDB'
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
      'Failed to fetch performer scenes from StashDB'
    )
    throw new StashDBError('Failed to fetch performer scenes', error)
  }
}
