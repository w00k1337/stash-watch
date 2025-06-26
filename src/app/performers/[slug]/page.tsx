import { ReactElement } from 'react'

import prisma from '@/lib/prisma'

interface PerformerPageProps {
  params: Promise<{ slug: string }>
}

const PerformerPage = async ({ params }: PerformerPageProps): Promise<ReactElement> => {
  const { slug } = await params

  const performer = await prisma.performer.findUnique({ where: { slug }, include: { scenes: true } })
  if (!performer) return <div>Performer not found</div>

  const { name } = performer

  return (
    <main>
      <h1>{name}</h1>
    </main>
  )
}

export default PerformerPage
