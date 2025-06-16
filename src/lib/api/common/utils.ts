import logger from '@/lib/logger'

interface GraphQLResponse<T> {
  data: T
}

interface FetchGraphQLOptions<TVariables> {
  apiBaseUrl: string
  apiKey: string
  query: { toString(): string }
  variables?: TVariables
}

export const fetchGraphQL = async <TResult, TVariables>({
  apiBaseUrl,
  apiKey,
  query,
  variables
}: FetchGraphQLOptions<TVariables>): Promise<TResult> => {
  logger.debug(
    {
      apiBaseUrl,
      queryPreview: String(query).slice(0, 100) + '...', // Safely convert to string
      hasVariables: !!variables
    },
    'Making GraphQL request'
  )

  try {
    const response = await fetch(`${apiBaseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/graphql-response+json',
        ApiKey: apiKey
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      const error = new Error('Network response was not ok')
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          error: error.message
        },
        'GraphQL request failed'
      )
      throw error
    }

    const { data } = (await response.json()) as GraphQLResponse<TResult>
    return data
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'GraphQL request failed with error'
    )
    throw error
  }
}
