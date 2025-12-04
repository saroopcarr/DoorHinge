// src/pages/api/matches/create.ts
// Purpose: Owner likes back on a seeker
// Creates a match when owner likes a seeker who liked their property

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withAuth, withOwnerAuth } from '@/middleware/auth'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return withOwnerAuth(async (req: any, res: NextApiResponse) => {
    const { propertyId, seekerId } = req.body

    if (!propertyId || !seekerId) {
      throw new ApiError(400, 'Property ID and Seeker ID required')
    }

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    })

    if (!property) {
      throw new ApiError(404, 'Property not found')
    }

    if (property.owner.userId !== req.user.id) {
      throw new ApiError(403, 'Forbidden - you do not own this property')
    }

    // Verify seeker exists and liked this property
    const like = await prisma.like.findUnique({
      where: {
        userId_propertyId: {
          userId: seekerId,
          propertyId,
        },
      },
    })

    if (!like) {
      throw new ApiError(
        404,
        'This seeker has not liked your property'
      )
    }

    // Check if match already exists
    const existing = await prisma.match.findUnique({
      where: {
        propertyId_seekerId: {
          propertyId,
          seekerId,
        },
      },
    })

    if (existing) {
      throw new ApiError(409, 'Match already exists')
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        propertyId,
        ownerId: req.user.id,
        seekerId,
      },
      include: {
        property: true,
        seeker: { select: { id: true, email: true } },
      },
    })

    // Notify seeker
    await prisma.notification.create({
      data: {
        userId: seekerId,
        type: 'NEW_MATCH',
        message: `You matched with a property in ${property.area}!`,
        relatedId: match.id,
      },
    })

    res.status(201).json({ message: 'Match created', match })
  })(req, res)
}

export default withErrorHandler(handler)
