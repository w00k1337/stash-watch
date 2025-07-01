import { ConnectionOptions } from 'bullmq'

import { env } from '@/env/server'

export const connection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD
}
