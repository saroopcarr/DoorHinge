// src/pages/api/matches/index.ts
// Purpose: Get matches for current user
// Returns list of matched properties with seekers/owners

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withAuth } from '@/middleware/auth'
import { withErrorHandler } from '@/middleware/error'

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return withAuth(async (req: any, res: NextApiResponse) => {
    const userId = req.user.id
    const { page = '1', limit = '20' } = req.query

    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(100, parseInt(limit as string) || 20)
    const skip = (pageNum - 1) * limitNum

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ ownerId: userId }, { seekerId: userId }],
        status: 'ACTIVE',
      },
      include: {
        property: {
          include: {
            photos: { take: 1 },
            owner: { include: { user: { select: { id: true, email: true } } } },
          },
        },
        owner: { select: { id: true, email: true } },
        seeker: { select: { id: true, email: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      skip,
      take: limitNum,
      orderBy: { updatedAt: 'desc' },
    })

    const total = await prisma.match.count({
      where: {
        OR: [{ ownerId: userId }, { seekerId: userId }],
        status: 'ACTIVE',
      },
    })

    res.status(200).json({
      matches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  })(req, res)
}

export default withErrorHandler(handler)
