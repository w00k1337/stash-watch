export interface ImportStashPerformerJobData {
  stashId: number
}

export interface ImportStashPerformerJobResult {
  stashId: number
  slug: string
  name: string
}

export interface BaseImportSceneJobData {
  type: 'stash' | 'stashdb' | 'theporndb'
  performerId: number
}

export interface ImportStashDbSceneJobData extends BaseImportSceneJobData {
  type: 'stashdb'
  stashDbId: string
}

export interface ImportThePornDbSceneJobData extends BaseImportSceneJobData {
  type: 'theporndb'
  pornDbId: string
}

export interface ImportStashSceneJobData extends BaseImportSceneJobData {
  type: 'stash'
  stashId: number
}

export interface ImportSceneJobResult {
  performerId: number
}

export type ImportSceneJobData = ImportStashDbSceneJobData | ImportThePornDbSceneJobData | ImportStashSceneJobData
