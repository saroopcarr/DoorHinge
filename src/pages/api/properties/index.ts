// src/pages/api/properties/index.ts
// Purpose: List and create properties
// GET: List all active properties (with pagination and filtering for seekers)
// POST: Create new property (owners only)

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { PropertyCreateSchema } from '@/lib/validation'
import { withAuth, withOwnerAuth } from '@/middleware/auth'
import { withErrorHandler, ApiError } from '@/middleware/error'
import { cacheWithTTL, cacheKeys, invalidateCache } from '@/lib/cache'

async function handler(req: any, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List properties with caching for hot data
    const { page = '1', limit = '10', area, maxBudget, bedrooms } = req.query

    const pageNum = Math.max(1, parseInt(page as string) || 1)
    const limitNum = Math.min(50, parseInt(limit as string) || 10)
    const skip = (pageNum - 1) * limitNum

    // Cache key includes filters to avoid cache collisions
    const cacheKey = `${cacheKeys.propertyList(area)}:p${pageNum}:l${limitNum}:b${bedrooms}:m${maxBudget}`

    // Check cache first, then hit database
    const cached = await cacheWithTTL(
      cacheKey,
      300, // Cache for 5 minutes
      async () => {
        const where: any = { isActive: true }

        if (area) {
          where.area = { contains: area, mode: 'insensitive' }
        }

        if (maxBudget) {
          where.rentAmount = { lte: parseInt(maxBudget as string) }
        }

        if (bedrooms) {
          where.bedrooms = bedrooms
        }

        const [properties, total] = await Promise.all([
          prisma.property.findMany({
            where,
            include: {
              photos: { take: 3 },
              owner: { include: { user: { select: { id: true } } } },
              _count: { select: { likes: true } },
            },
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.property.count({ where }),
        ])

        return {
          properties,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        }
      }
    )

    return res.status(200).json(cached)
  }

  if (req.method === 'POST') {
    // Create property (owners only) and invalidate cache
    return withOwnerAuth(async (req: any, res: NextApiResponse) => {
      const validation = PropertyCreateSchema.safeParse(req.body)
      if (!validation.success) {
        throw new ApiError(400, 'Validation failed', validation.error.flatten())
      }

      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { userId: req.user.id },
      })

      if (!ownerProfile) {
        throw new ApiError(
          404,
          'Owner profile not found. Complete profile first.'
        )
      }

      const property = await prisma.property.create({
        data: {
          ownerId: ownerProfile.id,
          ...validation.data,
          photos: {
            create: (req.body.photos || []).map((url: string, i: number) => ({
              url,
              type: 'IMAGE',
              order: i,
            })),
          },
        },
        include: { photos: true },
      })

      // Invalidate property list cache when new property is added
      await invalidateCache(cacheKeys.propertyList())

      res.status(201).json(property)
    })(req, res)
  }

  res.status(405).json({ error: 'Method not allowed' })
}

export default withErrorHandler(handler)
