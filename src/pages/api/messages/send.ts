// src/pages/api/messages/send.ts
// Purpose: Send a message in a match
// Stores message in database and broadcasts via Socket.IO

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withAuth } from '@/middleware/auth'
import { MessageSchema } from '@/lib/validation'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return withAuth(async (req: any, res: NextApiResponse) => {
    const validation = MessageSchema.safeParse(req.body)
    if (!validation.success) {
      throw new ApiError(400, 'Validation failed', validation.error.flatten())
    }

    const { content, matchId } = validation.data

    // Verify user is part of match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match || (match.ownerId !== req.user.id && match.seekerId !== req.user.id)) {
      throw new ApiError(403, 'Forbidden - not part of this match')
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: req.user.id,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, email: true } },
      },
    })

    // Update match timestamp
    await prisma.match.update({
      where: { id: matchId },
      data: { updatedAt: new Date() },
    })

    // TODO: Emit via Socket.IO to other user
    // io.to(matchId).emit('message', message)

    // Notify recipient
    const recipientId = match.ownerId === req.user.id ? match.seekerId : match.ownerId
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_MESSAGE',
        message: 'You have a new message',
        relatedId: match.id,
      },
    })

    res.status(201).json(message)
  })(req, res)
}

export default withErrorHandler(handler)
