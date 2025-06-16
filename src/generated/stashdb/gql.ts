/* eslint-disable */
import * as types from './graphql'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n    query QueryScenes($input: SceneQueryInput!) {\n      queryScenes(input: $input) {\n        count\n        scenes {\n          id\n          title\n          releasedAt: release_date\n          images {\n            id\n            url\n            width\n            height\n          }\n          fingerprints {\n            hash\n            algorithm\n            duration\n          }\n        }\n      }\n    }\n  ': typeof types.QueryScenesDocument
}
const documents: Documents = {
  '\n    query QueryScenes($input: SceneQueryInput!) {\n      queryScenes(input: $input) {\n        count\n        scenes {\n          id\n          title\n          releasedAt: release_date\n          images {\n            id\n            url\n            width\n            height\n          }\n          fingerprints {\n            hash\n            algorithm\n            duration\n          }\n        }\n      }\n    }\n  ':
    types.QueryScenesDocument
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n    query QueryScenes($input: SceneQueryInput!) {\n      queryScenes(input: $input) {\n        count\n        scenes {\n          id\n          title\n          releasedAt: release_date\n          images {\n            id\n            url\n            width\n            height\n          }\n          fingerprints {\n            hash\n            algorithm\n            duration\n          }\n        }\n      }\n    }\n  '
): typeof import('./graphql').QueryScenesDocument

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}
