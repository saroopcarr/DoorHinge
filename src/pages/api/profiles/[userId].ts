// src/pages/api/profiles/[userId].ts
// Purpose: Get user profile by ID
// Returns owner or seeker profile based on role

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withErrorHandler, ApiError } from '@/middleware/error'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (typeof userId !== 'string') {
    throw new ApiError(400, 'Invalid user ID')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownerProfile: true,
      seekerProfile: true,
    },
  })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const profile =
    user.role === 'OWNER' ? user.ownerProfile : user.seekerProfile

  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    },
    profile,
  })
}

export default withErrorHandler(handler)
