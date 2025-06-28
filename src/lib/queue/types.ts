/**
 * Data required to import a performer from Stash into the local database
 */
export interface PerformerImportJobData {
  /** The unique identifier of the performer in Stash */
  performerStashId: number
}

/**
 * Result of a performer import job operation
 */
export interface PerformerImportJobResult {
  /** The local database ID of the imported performer */
  performerId: number
  /** The original Stash ID of the performer */
  performerStashId?: number
  /** The name of the performer (if available) */
  performerName?: string
}

/**
 * Base interface for scene import job data
 * Contains common properties shared between different import sources
 */
interface BaseScenesImportJobData {
  /** The local database ID of the performer to import scenes for */
  performerId: number
  /** The source system to import scenes from */
  source: 'stashdb' | 'theporndb'
}

/**
 * Data required to import scenes from StashDB for a specific performer
 */
export interface StashDbScenesImportJobData extends BaseScenesImportJobData {
  /** The StashDB identifier for the performer */
  performerStashDbId: string
  /** Must be 'stashdb' for this interface */
  source: 'stashdb'
}

/**
 * Data required to import scenes from PornDB for a specific performer
 */
export interface PornDbScenesImportJobData extends BaseScenesImportJobData {
  /** The PornDB identifier for the performer */
  performerPornDbId: string
  /** Must be 'theporndb' for this interface */
  source: 'theporndb'
}

/**
 * Union type representing scene import job data from either StashDB or PornDB
 * Use type guards or discriminated unions to safely access source-specific properties
 */
export type ScenesImportJobData = StashDbScenesImportJobData | PornDbScenesImportJobData

/**
 * Result of a scenes import job operation
 */
export interface ScenesImportJobResult {
  /** Total number of scenes found for the performer */
  totalScenes?: number
  /** Number of scenes successfully imported */
  totalScenesImported?: number
}
