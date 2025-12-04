// src/pages/api/messages/index.ts
// Purpose: Get messages for a match
// Returns chat history with pagination

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withAuth } from '@/middleware/auth'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return withAuth(async (req: any, res: NextApiResponse) => {
    const { matchId, page = '1', limit = '50' } = req.query

    if (!matchId) {
      throw new ApiError(400, 'Match ID required')
    }

    // Verify user is part of this match
    const match = await prisma.match.findUnique({
      where: { id: matchId as string },
    })

    if (!match || (match.ownerId !== req.user.id && match.seekerId !== req.user.id)) {
      throw new ApiError(403, 'Forbidden - not part of this match')
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(200, parseInt(limit as string) || 50)
    const skip = (pageNum - 1) * limitNum

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { matchId: matchId as string },
        include: {
          sender: { select: { id: true, email: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.count({ where: { matchId: matchId as string } }),
    ])

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        matchId: matchId as string,
        senderId: { not: req.user.id },
        read: false,
      },
      data: { read: true, readAt: new Date() },
    })

    res.status(200).json({
      messages: messages.reverse(),
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
