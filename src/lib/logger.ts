import 'server-only'

import pino from 'pino'

import { env } from '@/env/server'

export default pino({ level: env.LOG_LEVEL })
