import Link from 'next/link'
import { ReactElement } from 'react'

import prisma from '@/lib/prisma'

const PerformersPage = async (): Promise<ReactElement> => {
  const performers = await prisma.performer.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <h1>Performers</h1>
      <ul>
        {performers.map(({ name, slug }) => (
          <li key={slug}>
            <Link href={`/performers/${slug}`}>{name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PerformersPage
