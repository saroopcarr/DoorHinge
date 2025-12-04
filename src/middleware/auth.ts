// src/middleware/auth.ts
// Purpose: Authentication middleware for protected API routes
// Verifies JWT token and user role before allowing access

import { NextApiRequest, NextApiResponse } from 'next'
import { getAccessTokenFromRequest, verifyToken, JwtPayload } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * Extend NextApiRequest to include authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * Middleware to verify JWT and attach user to request
 */
export function withAuth(
  handler: (req: NextApiRequest & { user: JwtPayload }, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = getAccessTokenFromRequest(req)

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - no token' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized - invalid token' })
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - user not found' })
    }

    (req as any).user = decoded

    return handler(req as any, res)
  }
}

/**
 * Middleware to verify user is an Owner
 */
export function withOwnerAuth(
  handler: (req: NextApiRequest & { user: JwtPayload }, res: NextApiResponse) => Promise<void>
) {
  return withAuth(async (req, res) => {
    if (req.user?.role !== 'OWNER') {
      return res.status(403).json({ error: 'Forbidden - owner access required' })
    }
    return handler(req, res)
  })
}

/**
 * Middleware to verify user is a Seeker
 */
export function withSeekerAuth(
  handler: (req: NextApiRequest & { user: JwtPayload }, res: NextApiResponse) => Promise<void>
) {
  return withAuth(async (req, res) => {
    if (req.user?.role !== 'SEEKER') {
      return res.status(403).json({ error: 'Forbidden - seeker access required' })
    }
    return handler(req, res)
  })
}
