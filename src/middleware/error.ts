// src/middleware/error.ts
// Purpose: Centralized error handling for API routes
// Provides consistent error response format

import { NextApiRequest, NextApiResponse } from 'next'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Centralized error handler for API routes
 */
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res)
    } catch (error) {
      console.error('API Error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : '',
        endpoint: `${req.method} ${req.url}`,
      })

      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          error: error.message,
          details: error.details,
        })
      }

      if (error instanceof SyntaxError) {
        return res.status(400).json({ error: 'Invalid JSON' })
      }

      // Handle Prisma errors
      if (error instanceof Error && error.message.includes('Prisma')) {
        return res.status(500).json({
          error: 'Database error',
          ...(process.env.NODE_ENV === 'development' && {
            message: error.message,
          }),
        })
      }

      return res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          message: error instanceof Error ? error.message : String(error),
        }),
      })
    }
  }
}
