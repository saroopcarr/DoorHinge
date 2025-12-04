// src/pages/api/profiles/update.ts
// Purpose: Update user profile
// Creates or updates owner/seeker profile details

import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/middleware/auth'
import { prisma } from '@/lib/db'
import {
  SeekerProfileSchema,
  OwnerProfileSchema,
} from '@/lib/validation'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: any, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = req.user
  const data = req.body

  if (user.role === 'OWNER') {
    const validation = OwnerProfileSchema.safeParse(data)
    if (!validation.success) {
      throw new ApiError(400, 'Validation failed', validation.error.flatten())
    }

    const profile = await prisma.ownerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...validation.data,
        isProfileComplete: true,
      },
      update: {
        ...validation.data,
        isProfileComplete: true,
      },
    })

    return res.status(200).json({ profile })
  } else {
    const validation = SeekerProfileSchema.safeParse(data)
    if (!validation.success) {
      throw new ApiError(400, 'Validation failed', validation.error.flatten())
    }

    const profile = await prisma.seekerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...validation.data,
        isProfileComplete: true,
      },
      update: {
        ...validation.data,
        isProfileComplete: true,
      },
    })

    return res.status(200).json({ profile })
  }
}

export default withAuth(withErrorHandler(handler))
