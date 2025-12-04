// src/pages/api/matches/like.ts
// Purpose: Like a property endpoint
// Seekers like properties; if owner likes back -> match is created

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withAuth, withSeekerAuth } from '@/middleware/auth'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return withSeekerAuth(async (req: any, res: NextApiResponse) => {
    const { propertyId } = req.body

    if (!propertyId) {
      throw new ApiError(400, 'Property ID required')
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: { include: { user: true } } },
    })

    if (!property) {
      throw new ApiError(404, 'Property not found')
    }

    // Check if already liked
    const existing = await prisma.like.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId,
        },
      },
    })

    if (existing) {
      throw new ApiError(409, 'Already liked this property')
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        userId: req.user.id,
        propertyId,
      },
    })

    // Create notification for owner
    await prisma.notification.create({
      data: {
        userId: property.owner.userId,
        type: 'NEW_LIKE',
        message: 'Someone liked your property!',
        relatedId: propertyId,
      },
    })

    res.status(201).json({ message: 'Property liked', like })
  })(req, res)
}

export default withErrorHandler(handler)
