# DoorHinge Architecture Guide 🏗️

A comprehensive breakdown of the full-stack architecture designed for production readiness and MAANG interview preparation.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  (Next.js Pages, React Components, Tailwind CSS)             │
└──────────────────────────┬──────────────────────────────────┘
                          │ HTTP/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                 │
│  (Next.js Routes, JWT Auth, Rate Limiting, Input Validation) │
└──────────────────────────┬──────────────────────────────────┘
                          │ SQL
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER                                      │
│  (PostgreSQL, Prisma ORM, Migrations)                        │
└─────────────────────────────────────────────────────────────┘

├── Authentication Layer (JWT, bcrypt, OTP)
├── Authorization Layer (Role-based middleware)
├── Validation Layer (Zod schemas)
└── Error Handling Layer (Consistent error responses)
```

---

## 1. Frontend Architecture

### Technology Choices

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Next.js 14 | SSR for SEO, built-in API routes, Vercel deployment |
| Language | TypeScript | Type safety catches bugs early, great IDE support |
| Styling | Tailwind CSS | Utility-first, no CSS in JS, fast build time |
| State | Zustand | Minimal boilerplate vs Redux, perfect for this scale |
| Data Fetch | React Query | Caching, background refetch, offline support |
| HTTP | Axios | Better interceptors than fetch, promise-based |
| Forms | React Hook Form | Uncontrolled components, great performance |
| UI/Alerts | React Hot Toast | Simple, no external dependencies |
| Icons | Lucide React | Tree-shakeable, SVG-based, lightweight |

### Page Structure

```
src/pages/
├── index.tsx           # Landing / home page
├── auth/
│   ├── signup.tsx      # Registration (step 1: form, step 2: OTP)
│   ├── login.tsx       # Email/password login
│   └── profile.tsx     # Profile setup (conditional: owner vs seeker)
├── seeker/
│   ├── swipe.tsx       # Tinder-like swipe interface
│   └── matches.tsx     # Grid of matched properties
├── owner/
│   └── dashboard.tsx   # List owner's properties
├── matches/
│   └── [id]/chat.tsx   # Real-time chat interface
└── _app.tsx            # Global app wrapper (providers, theme)
```

### Component Architecture

**Single Responsibility Principle:**
- Each component handles ONE feature
- Props-based composition for reusability
- Custom hooks for shared logic

**Example: SwipeDeck Component**
```typescript
// ✅ GOOD: Single responsibility
<SwipeDeck
  properties={properties}
  onLike={handleLike}
  onSkip={handleSkip}
/>

// ❌ BAD: Too many responsibilities
<SwipeDeck
  properties={properties}
  onLike={handleLike}
  onSkip={handleSkip}
  fetchProperties={fetch}
  createMatch={create}
  handleNotifications={notify}
/>
```

### State Management Strategy

**Global State (Zustand):**
```typescript
// What lives in Zustand: Auth state (user, isLoggedIn)
const authStore = {
  isLoggedIn: boolean,
  user: User | null,
  setUser: (user: User) => void,
  logout: () => void
}
```

**Server State (React Query):**
```typescript
// What lives in React Query: Properties, matches, messages
const { data: properties } = useQuery(
  ['properties'],
  fetchProperties,
  { staleTime: 5 * 60 * 1000 }  // 5 minutes
)
```

**Local State (useState):**
```typescript
// What lives in useState: Form inputs, UI toggles
const [currentIndex, setCurrentIndex] = useState(0)
const [isLoading, setIsLoading] = useState(false)
```

### Performance Optimizations

1. **Code Splitting:** Dynamic imports for heavy components
2. **Image Lazy Loading:** `next/image` with lazy attribute
3. **Query Caching:** React Query caches properties for 5min
4. **Memoization:** useMemo for expensive calculations
5. **Debouncing:** Search inputs debounced 300ms

---

## 2. API Layer (Backend)

### Architecture Pattern

**RESTful Endpoints with Middleware Composition:**

```typescript
// Each handler follows this pattern:
async function handler(req, res) {
  // 1. Method validation (GET, POST, etc.)
  // 2. Rate limiting (express-rate-limit)
  // 3. Authentication (JWT verification)
  // 4. Authorization (role check)
  // 5. Input validation (Zod)
  // 6. Business logic
  // 7. Database operations (Prisma)
  // 8. Response (or throw ApiError)
}

export default withErrorHandler(handler)
```

### Middleware Stack

**Authentication Middleware (`src/middleware/auth.ts`)**
```typescript
withAuth(handler)         // Verify JWT, fetch user
withOwnerAuth(handler)    // Verify JWT + role === 'OWNER'
withSeekerAuth(handler)   // Verify JWT + role === 'SEEKER'
```

**Error Handling Middleware (`src/middleware/error.ts`)**
```typescript
withErrorHandler(handler) // Try-catch + consistent error response
```

**Rate Limiting (`src/lib/rateLimit.ts`)**
```typescript
apiLimiter         // 100 requests / 15 minutes (general API)
authLimiter        // 5 requests / 15 minutes (auth endpoints)
otpLimiter         // 3 requests / 1 hour (OTP verification)
```

### API Endpoints by Feature

#### Authentication Flow

**1. Signup (`POST /api/auth/signup`)**
```
Input validation (email, phone, password strength)
  ↓
Check for duplicate email/phone
  ↓
Hash password (bcrypt 12 rounds)
  ↓
Create User in DB
  ↓
Generate 6-digit OTP
  ↓
Send via SMS provider (mock or Twilio)
  ↓
Return: userId, email (user must verify OTP next)
```

**2. Login (`POST /api/auth/login`)**
```
Validate credentials (email exists + password matches)
  ↓
Generate JWT tokens:
  - Access token (15min expiry)
  - Refresh token (7d expiry)
  ↓
Create Session in DB (for token revocation)
  ↓
Set HTTP-only cookies (secure, sameSite=strict)
  ↓
Return: user object, profile completion status
```

**3. Verify OTP (`POST /api/auth/verify-otp`)**
```
Validate phone and OTP format
  ↓
Call SMS provider (mock checks memory, Twilio verifies)
  ↓
Mark user as verified in DB
  ↓
Return: success message
```

**4. Logout (`POST /api/auth/logout`)**
```
Delete all sessions for user (revokes all tokens)
  ↓
Clear HTTP-only cookies
  ↓
Prevents token reuse after logout
```

#### Property Management

**List Properties (`GET /api/properties`)**
```
Query parameters:
  - page: 1, limit: 10
  - area: "Mumbai" (substring search)
  - maxBudget: 50000
  - bedrooms: 2

SQL Query:
SELECT * FROM Property
WHERE active = true
  AND area LIKE '%Mumbai%'
  AND rentAmount <= 50000
  AND bedrooms = 2
ORDER BY createdAt DESC
LIMIT 10 OFFSET 0

Response: [Property] with photos, like count
```

**Create Property (`POST /api/properties`)**
```
Authenticate: Must be owner
  ↓
Validate input (PropertyCreateSchema)
  ↓
Create Property row
  ↓
Create Media rows for photos
  ↓
Return: Property with photos
```

#### Matching Logic

**Seeker Likes Property (`POST /api/matches/like`)**
```
Input: propertyId
Authentication: Must be seeker
  ↓
Verify property exists
  ↓
Check for duplicate like (unique constraint)
  ↓
Create Like row
  ↓
Create Notification for owner ("Someone liked your property")
  ↓
Return: Like object
```

**Owner Creates Match (`POST /api/matches/create`)**
```
Input: propertyId, seekerId (who to match with)
Authentication: Must be owner of property
  ↓
Verify Like exists (seeker already liked this property)
  ↓
Create Match row (enables chat)
  ↓
Create Notifications for both users
  ↓
Return: Match object
```

**Get Matches (`GET /api/matches`)**
```
Authentication: Any user
  ↓
If owner: Get all matches for their properties
If seeker: Get all matches for their likes

Response includes:
  - Property details
  - Other user details
  - Last message preview
  - Unread count
```

#### Messaging

**Send Message (`POST /api/messages/send`)**
```
Authentication: Must be in the match
  ↓
Validate: message content, matchId
  ↓
Create Message row in DB
  ↓
Update Match.updatedAt (for sorting)
  ↓
Create Notification for recipient
  ↓
Broadcast via Socket.IO (if connected)
  ↓
Return: Message object
```

**Get Messages (`GET /api/messages?matchId=X`)**
```
Authentication: Must be in the match
  ↓
Pagination: page, limit (default 50, max 200)
  ↓
Query: SELECT * FROM Message WHERE matchId = X
  ↓
Mark received messages as read
  ↓
Return: [Message] ordered by createdAt
```

---

## 3. Database Layer

### Schema Design

**Core Relationships:**

```
User
├── isOwner → has many Properties
│   └── Property
│       ├── has many Media (photos)
│       ├── receives Likes from Seekers
│       │   └── Like → creates Match
│       └── has many Matches
│           └── Match → has Messages
│
└── isSeeker → creates many Likes
    └── Like → can create Match
        └── Match → exchanges Messages

Session → User (1:many) - For token revocation
Notification → User (1:many) - For alert system
```

### 10 Core Models

**1. User**
```typescript
model User {
  id: String @id @default(cuid())
  email: String @unique
  phone: String @unique
  passwordHash: String
  role: Role  // OWNER or SEEKER
  
  // Verification
  isPhoneVerified: Boolean
  isVerified: Boolean
  isProfileComplete: Boolean
  
  // Relations
  ownerProfile: OwnerProfile?
  seekerProfile: SeekerProfile?
  properties: Property[]
  likes: Like[]
  matchesAsOwner: Match[] @relation("OwnerMatches")
  matchesAsSeeker: Match[] @relation("SeekerMatches")
  messages: Message[]
  sessions: Session[]
  notifications: Notification[]
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  @@index([email])
  @@index([phone])
}
```

**Key indices:**
- `email`: For login queries
- `phone`: For OTP verification
- `role`: For role-based queries

**2. OwnerProfile** (has many Properties)
```typescript
model OwnerProfile {
  userId: String @unique
  businessName: String
  bio: String?
  verificationStatus: VerificationStatus
  createdAt: DateTime @default(now())
}
```

**3. SeekerProfile** (preferences for matching)
```typescript
model SeekerProfile {
  userId: String @unique
  firstName: String
  lastName: String?
  age: Int?
  gender: Gender?
  employmentStatus: EmploymentStatus?
  rentPurpose: RentPurpose  // Self/Family/Friends
  occupantCount: Int
  maxBudget: Int
  preferredAreas: String[]  // JSONB array
  moveInDate: DateTime?
  familySize: Int?
  bio: String?
}
```

**4. Property** (rental listings)
```typescript
model Property {
  id: String @id @default(cuid())
  ownerId: String
  
  title: String
  description: String
  area: String  // City/Neighborhood
  address: String?
  
  rentAmount: Int
  maintenanceFee: Int?
  depositAmount: Int?
  
  bedrooms: Int
  bathrooms: Int?
  furnishedStatus: FurnishedStatus
  amenities: String[]  // ["WiFi", "AC", "Kitchen"]
  
  // Availability
  isActive: Boolean @default(true)
  availableFrom: DateTime?
  
  // Relations
  media: Media[]
  likes: Like[]
  matches: Match[]
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  @@index([ownerId])
  @@index([area])
  @@index([isActive])
}
```

**Why indices matter:**
- `ownerId`: Fetch owner's properties quickly
- `area`: Filter by location in swipe page
- `isActive`: Show only active listings

**5. Media** (photos/videos)
```typescript
model Media {
  id: String @id @default(cuid())
  propertyId: String
  
  url: String
  cloudinaryId: String?  // For deletion
  type: MediaType  // IMAGE or VIDEO
  
  @@index([propertyId])
}
```

**6. Like** (Seeker → Property)
```typescript
model Like {
  id: String @id @default(cuid())
  seekerId: String
  propertyId: String
  
  // Unique: Each seeker can like each property once
  @@unique([seekerId, propertyId])
  @@index([propertyId])
}
```

**Query examples:**
```sql
-- Who liked this property?
SELECT * FROM Like WHERE propertyId = X

-- What properties did this seeker like?
SELECT Property.* FROM Like
JOIN Property ON Like.propertyId = Property.id
WHERE Like.seekerId = X

-- Can create match? (Check if like exists)
SELECT * FROM Like WHERE seekerId = X AND propertyId = Y
```

**7. Match** (Seeker ↔ Property, Owner confirmed)
```typescript
model Match {
  id: String @id @default(cuid())
  propertyId: String
  ownerId: String  // Property owner
  seekerId: String  // Person who liked
  
  status: MatchStatus  // PENDING, ACCEPTED, REJECTED
  
  messages: Message[]
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt  // Updated when messages sent
  
  @@unique([propertyId, seekerId])
  @@index([ownerId])
  @@index([seekerId])
}
```

**Why this structure:**
- One match per seeker-property pair (enforced by unique constraint)
- Owner can have many matches for one property
- Seeker can have matches with multiple properties
- `updatedAt` allows sorting matches by recency

**8. Message** (Chat in a Match)
```typescript
model Message {
  id: String @id @default(cuid())
  matchId: String
  senderId: String
  
  content: String
  read: Boolean @default(false)
  readAt: DateTime?
  
  createdAt: DateTime @default(now())
  
  @@index([matchId])
  @@index([senderId])
  @@index([createdAt])
}
```

**Query optimization:**
- `matchId`: Fetch all messages in a conversation
- `createdAt`: Sort by timestamp
- Pagination: `LIMIT 50 OFFSET (page-1)*50`

**9. Session** (Token revocation)
```typescript
model Session {
  id: String @id @default(cuid())
  userId: String
  
  refreshToken: String @unique
  expiresAt: DateTime
  
  createdAt: DateTime @default(now())
  
  @@index([userId])
}
```

**Purpose:**
- Store refresh tokens in DB
- On logout: Delete all sessions → revoke all tokens
- On suspicious activity: Delete session → invalidate token
- Prevents token replay after logout

**10. Notification** (Event alerts)
```typescript
model Notification {
  id: String @id @default(cuid())
  userId: String  // Who gets notified
  
  type: NotificationType  // NEW_LIKE, NEW_MATCH, NEW_MESSAGE
  title: String
  message: String
  relatedId: String?  // propertyId, matchId, etc.
  
  read: Boolean @default(false)
  
  createdAt: DateTime @default(now())
  
  @@index([userId])
  @@index([read])
}
```

### Performance Strategy

**Indexes (O(log n) lookups):**
- All foreign keys (ownerId, propertyId, userId)
- Frequently filtered fields (email, phone, area, isActive)
- Timestamp fields (createdAt, updatedAt)

**Query Patterns:**
```typescript
// ✅ GOOD: Uses indices
properties = await prisma.property.findMany({
  where: {
    area: "Mumbai",
    isActive: true,
    rentAmount: { lte: maxBudget }
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" }
})

// ❌ BAD: Full table scan
properties = await prisma.property.findMany()
properties = properties.filter(p => p.description.includes(term))
```

**Pagination prevents memory bloat:**
```typescript
// Get 10 properties at a time (not all 10,000)
GET /api/properties?page=1&limit=10
```

---

## 4. Authentication & Security

### JWT Token Strategy

**Access Token (15 minutes)**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "role": "SEEKER",
  "iat": 1704067200,
  "exp": 1704068100
}
```
- Short-lived, used for every API call
- Stored in HTTP-only cookie (immune to XSS)

**Refresh Token (7 days)**
```json
{
  "id": "user_123",
  "type": "refresh",
  "iat": 1704067200,
  "exp": 1704672000
}
```
- Long-lived, rotated every time used
- Enables seamless "remember me"
- Stored in DB for revocation

### Password Security

**Bcrypt Hashing (One-way encryption):**
```typescript
// Signup
const hash = await bcrypt.hash(password, 12)  // 12 rounds = ~100ms
// Verifies password strength first

// Login
const matches = await bcrypt.compare(password, hash)

// Why bcrypt?
// - Deliberately slow (prevents brute force)
// - Salted (same password → different hash)
// - OWASP approved
// - No reversible (like plaintext or MD5)
```

**Password Strength Requirements:**
```typescript
// Must have:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)
```

### Rate Limiting

**DDoS Prevention:**
```typescript
// General API: 100 requests per 15 minutes
apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})

// Authentication: 5 requests per 15 minutes
authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
})

// OTP: 3 requests per hour
otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3
})
```

**Why these limits:**
- Auth endpoints are sensitive (brute force risk)
- OTP can be brute-forced (6 digits = 1M combinations)
- General API protects against resource exhaustion

### Input Validation (Zod)

**Benefits:**
```typescript
// Type-safe validation
const result = signupSchema.parse(req.body)
// If invalid: throws ZodError with field-specific messages
// If valid: TypeScript knows type of result

// Example error:
{
  "email": ["Invalid email format"],
  "password": ["Password must be 8+ characters"]
}
```

### CORS & Headers

```typescript
// Configured for localhost (easily extended)
cors: {
  origin: process.env.NEXTAUTH_URL,
  credentials: true
}

// Security headers
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

## 5. Real-time Features (Socket.IO)

### Current State
- ✅ Infrastructure scaffolding complete
- ✅ Socket client configured in `src/lib/socket.ts`
- 🟡 Event stubs in place (ready to uncomment)
- ❓ Production WebSocket bridge not yet connected

### How It Works (When Implemented)

**Connection Flow:**
```
Client connects to Socket.IO server
  ↓
Server authenticates user via JWT
  ↓
User joins rooms:
  - "match_{matchId}" room (for chat)
  - "user_{userId}" room (for notifications)
  ↓
Events can be emitted/received
```

**Message Send Event:**
```typescript
// Client sends
socket.emit('message:send', { matchId, content })

// Server receives
socket.on('message:send', ({ matchId, content }) => {
  // Save to DB
  // Broadcast to match room
  socket.to(`match_${matchId}`).emit('message:received', message)
})

// Other user receives
socket.on('message:received', (message) => {
  // Show in chat UI
  // Play notification sound
})
```

### Architecture Benefits

| Feature | Without Socket.IO | With Socket.IO |
|---------|-------------------|-----------------|
| Message latency | 100-500ms (polling) | <50ms (real-time) |
| Server load | High (constant polling) | Lower (event-driven) |
| Offline support | ❌ | ✅ (graceful degradation) |
| Typing indicators | ❌ | ✅ |
| Read receipts | ❌ | ✅ |

---

## 6. File Storage Architecture

### Abstraction Pattern

**Swap storage providers without code changes:**

```typescript
interface StorageProvider {
  upload(file: Buffer, folder: string): Promise<string>
  delete(url: string): Promise<void>
}

class MockStorageProvider implements StorageProvider {
  // Development: Logs to console
  async upload(file, folder) {
    return `/uploads/${folder}/${Date.now()}`
  }
}

// Always use mock for local development
export const storage = new MockStorageProvider()
```

### File Upload Flow

```
Client selects file
  ↓
Validate: size (<50MB), type (image/video only)
  ↓
POST /api/media/signed-upload
  ↓
Server checks auth + ownership
  ↓
Call storage.upload(file, folder)
  ↓
Create Media row in DB
  ↓
Return media URL
  ↓
Client shows preview
```

---

## 7. Error Handling Strategy

### Consistent Error Responses

**All errors follow same format:**
```json
{
  "error": "ValidationError",
  "message": "Invalid input",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Must be 8+ characters"]
  },
  "statusCode": 400
}
```

### Error Types & HTTP Status Codes

| Error | Status | Example |
|-------|--------|---------|
| ValidationError | 400 | Invalid email format |
| AuthenticationError | 401 | Invalid credentials |
| AuthorizationError | 403 | Must be owner to delete |
| NotFoundError | 404 | Property not found |
| ConflictError | 409 | Email already registered |
| RateLimitError | 429 | Too many requests |
| ServerError | 500 | Database connection failed |

### Error Handling Middleware

```typescript
async function handler(req, res) {
  try {
    // Business logic
    return res.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'ValidationError',
        details: error.flatten().fieldErrors
      })
    }
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error)
    }
    // Unexpected error
    return res.status(500).json({
      error: 'InternalError',
      message: 'Something went wrong'
    })
  }
}

export default withErrorHandler(handler)
```

---

## 8. Testing Strategy

### Unit Tests (Jest)

**Testing utilities (no DB, no network):**
```typescript
// Password hashing
test('bcrypt hashes password correctly', () => {
  const hash = hashPassword('password123')
  expect(hash).not.toBe('password123')  // One-way
  expect(comparePassword('password123', hash)).toBe(true)
})

// JWT tokens
test('JWT token can be verified', () => {
  const token = generateAccessToken({ id: 'user123' })
  const payload = verifyToken(token)
  expect(payload.id).toBe('user123')
})
```

**Run:** `npm test`

### E2E Tests (Playwright)

**Testing complete flows (with real DB, server running):**

**Signup → OTP → Profile → Dashboard:**
```typescript
test('Seeker can sign up and complete profile', async ({ page }) => {
  // 1. Sign up
  await page.goto('/auth/signup')
  await page.fill('input[name=email]', 'seeker@test.com')
  await page.fill('input[name=password]', 'TestPass123!')
  await page.fill('input[name=phone]', '+919876543210')
  await page.selectOption('select[name=role]', 'SEEKER')
  await page.click('button:has-text("Next")')
  
  // 2. Verify OTP
  const otp = await getOTPFromConsole()  // From mock SMS
  await page.fill('input[name=otp]', otp)
  await page.click('button:has-text("Verify")')
  
  // 3. Complete profile
  await page.fill('input[name=firstName]', 'John')
  await page.selectOption('select[name=age]', '25')
  await page.fill('input[name=maxBudget]', '50000')
  await page.click('button:has-text("Save")')
  
  // 4. Assert redirected to swipe page
  await expect(page).toHaveURL('/seeker/swipe')
})
```

**Run:** `npm run test:e2e`

---

## 9. Deployment Architecture

### Local Development

```bash
# Docker compose starts:
# - PostgreSQL (port 5432)
# - Node.js app (port 3000)
# - Hot reload on code changes

docker-compose up
npm run dev
```

### Production Deployment

**Frontend (Vercel):**
```
GitHub → Vercel
  ↓
npm run build (Next.js static generation)
  ↓
Deploy to Vercel Edge Network
  ↓
Automatic HTTPS, custom domains, CI/CD
```

**Backend + Database (Railway/AWS):**
```
GitHub → Railway
  ↓
npm run build
  ↓
Docker image pushed to registry
  ↓
Deploy container + PostgreSQL
  ↓
Environment variables set securely
```

### Environment Configuration

**Development (.env.local):**
```
DATABASE_URL=postgres://user:pass@localhost:5432/doorhinge
JWT_SECRET=dev-secret (not used in prod)
MOCK_SMS=true
```

**Production (.env):**
```
DATABASE_URL=postgres://prod-user:strong-pass@prod-db:5432/doorhinge
JWT_SECRET=super-secret-random-string (from vault)
MOCK_SMS=false (use real Twilio)
NODE_ENV=production
```

---

## 10. Scaling Considerations

### Horizontal Scaling

**Problem:** Single server becomes bottleneck

**Solution:**
```
Load Balancer (nginx)
  ├── App Server 1 (port 3000)
  ├── App Server 2 (port 3001)
  └── App Server 3 (port 3002)
     ↓
  PostgreSQL Read Replicas
```

### Database Optimization

**Problem:** Queries get slow with 1M+ records

**Solutions:**
```
1. Add database indices (done)
2. Implement read replicas (for analytics queries)
3. Add Redis caching layer
   - Cache popular properties
   - Cache user profiles
   - Reduces DB load by 70%+
4. Implement database sharding
   - Shard by userId (matches, messages)
   - Shard by propertyId (likes)
```

### Caching Strategy

```typescript
// Redis cache
const cache = new Redis()

async function getProperty(id) {
  // Check cache first
  const cached = await cache.get(`property:${id}`)
  if (cached) return JSON.parse(cached)
  
  // Cache miss: query DB
  const property = await prisma.property.findUnique({ where: { id } })
  
  // Store in cache (1 hour TTL)
  await cache.setex(`property:${id}`, 3600, JSON.stringify(property))
  
  return property
}
```

### CDN for Media

```
User requests property photo
  ↓
Requests /photos/property_123.jpg
  ↓
CDN checks if cached (usually yes)
  ↓
Serves from nearest edge location (<50ms latency)
  ↓
If not cached: fetches from origin, caches for 30 days
```

---

## 11. Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
logger.info('User logged in', { userId, email, timestamp })
logger.error('Database query failed', { query, error, userId })
logger.warn('Rate limit exceeded', { ip, endpoint })
```

### Metrics to Track

```
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Database query time
- Cache hit rate
- User signup conversion funnel
- Match creation rate
- Message delivery latency
```

### Alerting

```
IF error_rate > 5% for 5min
  → Page on-call engineer
  → Slack alert #incidents

IF database latency > 1sec for 10min
  → Alert team, check replication lag
```

---

## Interview Talking Points

### 1. System Design
"How would you architect a scalable rental matching platform?"

**Answer:**
- Monolith with Next.js initially (fast MVP)
- Separate frontend/backend when traffic grows
- PostgreSQL for transactional data
- Redis for caching + sessions
- S3/CDN for media
- Socket.IO for real-time features

### 2. Database Design
"Walk us through the schema relationships"

**Answer:**
- User → Properties (owner has many)
- User → Likes (seeker can like many)
- Like + Like → Match (mutual like)
- Match → Messages (1-to-many)
- Indexes on frequently queried fields

### 3. Authentication
"How do you handle auth securely?"

**Answer:**
- JWT tokens (access + refresh)
- Bcrypt hashing (12 rounds)
- HTTP-only cookies (XSS proof)
- Rate limiting (brute force proof)
- Session invalidation (logout everywhere)

### 4. Real-time Features
"How do you implement live messaging?"

**Answer:**
- Socket.IO for WebSocket connection
- Messages persist in DB first
- Socket broadcasts to connected users
- Graceful degradation to polling if WebSocket unavailable

### 5. Scaling
"What bottlenecks would you encounter at 1M users?"

**Answer:**
- Single database: Add read replicas
- Slow queries: Add Redis cache layer
- High latency: Use CDN for media
- Connection pool exhaustion: Add PgBouncer
- Real-time events: Horizontal scale app servers with Redis Pub/Sub

---

## 12. Best Practices Implemented

✅ **Type Safety:** TypeScript strict mode, Zod validation
✅ **Error Handling:** Try-catch, custom ApiError class, consistent responses
✅ **Security:** Bcrypt, JWT, rate limiting, input validation
✅ **Testing:** Jest unit tests + Playwright E2E tests
✅ **Performance:** Pagination, indices, caching, lazy loading
✅ **Maintainability:** Single responsibility, clear naming, documentation
✅ **DevOps:** Docker, docker-compose, environment config
✅ **Monitoring:** Structured logging, error tracking

---

## Conclusion

This architecture is designed to be:
- **Production-ready:** Security, error handling, testing
- **Interview-friendly:** Demonstrates MAANG-level engineering
- **Scalable:** Patterns for growth (caching, sharding, CDN)
- **Maintainable:** Clean code, good documentation

Start with the monolith, scale horizontally as needed.

