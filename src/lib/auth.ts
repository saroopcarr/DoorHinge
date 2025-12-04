// src/lib/auth.ts
// Purpose: Authentication utilities (password hashing, JWT token generation/verification)
// These functions handle cryptographic operations for secure auth

import * as bcryptjs from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import { Role } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m' // 15 minutes
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d' // 7 days

// Type for decoded JWT payload
export interface JwtPayload {
  id: string
  email: string
  role: Role
  iat?: number
  exp?: number
}

/**
 * Hash a password using bcryptjs
 * Bcrypt adds salt automatically, making rainbow table attacks infeasible
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12)
}

/**
 * Compare plain password with hashed password
 * Used during login to verify credentials
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

/**
 * Generate JWT access token
 * Short-lived token used for API requests
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET || 'secret', {
    expiresIn: '15m',
  } as SignOptions)
}

/**
 * Generate JWT refresh token
 * Long-lived token used to get new access tokens
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET || 'secret', {
    expiresIn: '7d',
  } as SignOptions)
}

/**
 * Verify and decode JWT token
 * Returns null if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET || 'secret') as JwtPayload
  } catch (error) {
    return null
  }
}

/**
 * Extract access token from request cookies
 */
export function getAccessTokenFromRequest(
  req: NextApiRequest
): string | undefined {
  const cookieValue = req.headers.cookie
    ?.split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1]
  return cookieValue ? decodeURIComponent(cookieValue) : undefined
}

/**
 * Validate password strength
 * Follows OWASP guidelines
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) errors.push('Password must be at least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain number')
  if (!/[!@#$%^&*]/.test(password))
    errors.push('Password must contain special character (!@#$%^&*)')

  return {
    isValid: errors.length === 0,
    errors,
  }
}
