import { env } from '@/env/server'
import { graphql } from '@/generated/stashdb'
import { CriterionModifier, QueryScenesQuery, QueryScenesQueryVariables } from '@/generated/stashdb/graphql'

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
      scenes.push(...queryScenes.scenes.map(scene => sceneSchema.parse(scene)))

      currentPage++
      if (currentPage <= totalPages) {
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay))
      }
    }

    return scenes
  } catch (error) {
    throw new StashDBError('Failed to fetch performer scenes', error)
  }
}
