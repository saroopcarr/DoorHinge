// src/pages/api/properties/[id].ts
// Purpose: Get, update, delete specific property
// GET: Property details
// PUT: Update property (owner only)
// DELETE: Delete property (owner only)

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { PropertyUpdateSchema } from '@/lib/validation'
import { withAuth, withOwnerAuth } from '@/middleware/auth'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: any, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    throw new ApiError(400, 'Invalid property ID')
  }

  if (req.method === 'GET') {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        photos: true,
        owner: {
          include: { user: { select: { id: true, email: true } } },
        },
        _count: { select: { likes: true, matches: true } },
      },
    })

    if (!property) {
      throw new ApiError(404, 'Property not found')
    }

    return res.status(200).json(property)
  }

  if (req.method === 'PUT') {
    return withOwnerAuth(async (req: any, res: NextApiResponse) => {
      const property = await prisma.property.findUnique({
        where: { id },
        include: { owner: true },
      })

      if (!property) {
        throw new ApiError(404, 'Property not found')
      }

      if (property.owner.userId !== req.user.id) {
        throw new ApiError(403, 'Forbidden - you do not own this property')
      }

      const validation = PropertyUpdateSchema.safeParse(req.body)
      if (!validation.success) {
        throw new ApiError(400, 'Validation failed', validation.error.flatten())
      }

      const updated = await prisma.property.update({
        where: { id },
        data: validation.data,
        include: { photos: true },
      })

      res.status(200).json(updated)
    })(req, res)
  }

  if (req.method === 'DELETE') {
    return withOwnerAuth(async (req: any, res: NextApiResponse) => {
      const property = await prisma.property.findUnique({
        where: { id },
        include: { owner: true },
      })

      if (!property) {
        throw new ApiError(404, 'Property not found')
      }

      if (property.owner.userId !== req.user.id) {
        throw new ApiError(403, 'Forbidden - you do not own this property')
      }

      await prisma.property.delete({ where: { id } })

      res.status(200).json({ message: 'Property deleted' })
    })(req, res)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

export default withErrorHandler(handler)
