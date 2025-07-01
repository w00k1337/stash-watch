import logger from '@/lib/logger'

export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { StashPerformerImportWorker } = await import('@/lib/queue/workers/stash-performer-import')

    // Run Stash performer import worker
    StashPerformerImportWorker.getInstance().run()

    logger.info('Registered workers')
  }
}
