// src/tests/unit/auth.test.ts
// Purpose: Unit tests for authentication functions

import { hashPassword, comparePassword, generateAccessToken, verifyToken } from '@/lib/auth'

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      expect(hash).not.toBe(password)
    })

    it('should verify correct password', async () => {
      const password = 'TestPassword123!'
      const hash = await hashPassword(password)
      const isValid = await comparePassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject wrong password', async () => {
      const password = 'TestPassword123!'
      const wrongPassword = 'WrongPassword123!'
      const hash = await hashPassword(password)
      const isValid = await comparePassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })
  })

  describe('JWT Tokens', () => {
    it('should generate and verify token', () => {
      const payload = { id: 'user-123', email: 'test@example.com', role: 'SEEKER' as const }
      const token = generateAccessToken(payload)
      const decoded = verifyToken(token)
      expect(decoded?.id).toBe(payload.id)
      expect(decoded?.email).toBe(payload.email)
    })

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here')
      expect(decoded).toBeNull()
    })
  })
})
