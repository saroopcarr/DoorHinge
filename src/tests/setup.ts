// src/tests/setup.ts
// Purpose: Jest test setup and configuration
// Global mocks, test utilities

import '@testing-library/jest-dom'

// Mock environment variables
process.env.DATABASE_URL = 'postgres://localhost/doorhinge_test'
process.env.JWT_SECRET = 'test-secret'
