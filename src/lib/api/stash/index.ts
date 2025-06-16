import { env } from '@/env/server'
import { graphql } from '@/generated/stash'
import {
  type AllPerformersQuery,
  type AllPerformersQueryVariables,
  CriterionModifier,
  type FindPerformerQuery,
  type FindPerformerQueryVariables,
  type FindScenesQuery,
  FindScenesQueryVariables
} from '@/generated/stash/graphql'

import { fetchGraphQL } from '../common/utils'
import { Performer, performerSchema, Scene, sceneSchema } from './schema'

export const getPerformers = async (): Promise<Performer[]> => {
  const query = graphql(`
    query AllPerformers {
      allPerformers {
        id
        name
        aliases: alias_list
        imageUrl: image_path
        country
        birthdate
        measurements
        breastType: fake_tits
        isFavorite: favorite
        stashes: stash_ids {
          id: stash_id
          endpoint
        }
      }
    }
  `)

  const { allPerformers } = await fetchGraphQL<AllPerformersQuery, AllPerformersQueryVariables>({
    apiBaseUrl: env.STASH_BASE_URL,
    apiKey: env.STASH_API_KEY,
    query
  })

  return allPerformers.map(performer => performerSchema.parse(performer))
}

export const getPerformer = async (id: number): Promise<Performer | undefined> => {
  const query = graphql(`
    query FindPerformer($id: ID!) {
      findPerformer(id: $id) {
        id
        name
        aliases: alias_list
        imageUrl: image_path
        country
        birthdate
        measurements
        breastType: fake_tits
        isFavorite: favorite
        stashes: stash_ids {
          id: stash_id
          endpoint
        }
      }
    }
  `)

  const { findPerformer } = await fetchGraphQL<FindPerformerQuery, FindPerformerQueryVariables>({
    apiBaseUrl: env.STASH_BASE_URL,
    apiKey: env.STASH_API_KEY,
    query,
    variables: { id: String(id) }
  })

  if (!findPerformer) return undefined

  return performerSchema.parse(findPerformer)
}

export const getPerformerScenes = async (id: number): Promise<Scene[]> => {
  const query = graphql(`
    query FindScenes($sceneFilter: SceneFilterType, $sceneIds: [Int!], $ids: [ID!], $filter: FindFilterType) {
      findScenes(scene_filter: $sceneFilter, scene_ids: $sceneIds, ids: $ids, filter: $filter) {
        scenes {
          id
          title
          paths {
            screenshot
          }
          stashes: stash_ids {
            id: stash_id
            endpoint
          }
          files {
            basename
            fingerprints {
              type
              value
            }
          }
          performers {
            id
            name
            aliases: alias_list
            imageUrl: image_path
            country
            birthdate
            measurements
            breastType: fake_tits
            isFavorite: favorite
            stashes: stash_ids {
              id: stash_id
              endpoint
            }
          }
          releasedAt: date
        }
      }
    }
  `)

  const { findScenes } = await fetchGraphQL<FindScenesQuery, FindScenesQueryVariables>({
    apiBaseUrl: env.STASH_BASE_URL,
    apiKey: env.STASH_API_KEY,
    query,
    variables: {
      sceneFilter: { performers: { value: [String(id)], modifier: CriterionModifier.Includes } },
      filter: { per_page: -1 }
    }
  })

  return findScenes.scenes.map(scene => sceneSchema.parse(scene))
}
