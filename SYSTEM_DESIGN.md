# 🗺️ DoorHinge System Architecture Diagram

Visual representation of the complete system architecture.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                    (Browser / Mobile)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │   Landing Page       │  │   Auth Pages         │                │
│  │  (index.tsx)         │  │  (signup, login)     │                │
│  └──────────┬───────────┘  └──────────┬───────────┘                │
│             │                         │                             │
│             ▼                         ▼                             │
│  ┌─────────────────────────────────────────────────┐                │
│  │     Profile Setup (Conditional)                  │                │
│  │  - Owner: Business info                          │                │
│  │  - Seeker: Preferences                           │                │
│  └─────────────────────────────────────────────────┘                │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────────────────────────────────┐                │
│  │         Role-Based Dashboard                     │                │
│  ├─────────────────────────────────────────────────┤                │
│  │ SEEKER                │ OWNER                    │                │
│  ├───────────────────────┼────────────────────────┤                │
│  │ • Swipe Interface    │ • Property Dashboard   │                │
│  │ • Like Properties    │ • View Likes           │                │
│  │ • See Matches        │ • Manage Listings      │                │
│  │ • Chat               │ • Chat with Seekers    │                │
│  └─────────────────────────────────────────────────┘                │
│             │                         │                             │
│             └────────────┬────────────┘                             │
│                          ▼                                          │
│              ┌──────────────────────┐                              │
│              │   Chat Interface     │                              │
│              │  (Real-time Messaging)                              │
│              └──────────────────────┘                              │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │ HTTP + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API LAYER                                         │
│              (Next.js API Routes)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ MIDDLEWARE STACK                                            │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 1. Method Validation (GET, POST, etc.)                     │   │
│  │ 2. Rate Limiting (authLimiter, apiLimiter, otpLimiter)    │   │
│  │ 3. Authentication (JWT verification)                       │   │
│  │ 4. Authorization (Role check: owner/seeker)                │   │
│  │ 5. Input Validation (Zod schemas)                          │   │
│  │ 6. Business Logic (Database operations)                    │   │
│  │ 7. Response (JSON or error)                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐   │
│  │  AUTH ENDPOINTS      │  │  PROPERTY ENDPOINTS              │   │
│  ├──────────────────────┤  ├──────────────────────────────────┤   │
│  │ • POST /signup       │  │ • GET /properties (list)         │   │
│  │ • POST /login        │  │ • POST /properties (create)      │   │
│  │ • POST /verify-otp   │  │ • GET /properties/:id            │   │
│  │ • POST /logout       │  │ • PUT /properties/:id            │   │
│  │                      │  │ • DELETE /properties/:id         │   │
│  └──────────────────────┘  └──────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐   │
│  │  PROFILE ENDPOINTS   │  │  MATCHING ENDPOINTS              │   │
│  ├──────────────────────┤  ├──────────────────────────────────┤   │
│  │ • GET /profiles/:id  │  │ • POST /matches/like             │   │
│  │ • POST /profiles/    │  │ • POST /matches/create           │   │
│  │   update             │  │ • GET /matches                   │   │
│  └──────────────────────┘  └──────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MESSAGING ENDPOINTS                                          │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • GET /messages?matchId=X (chat history with pagination)     │  │
│  │ • POST /messages/send (create message, broadcast Socket.IO)  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ SQL
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                    │
│              (PostgreSQL 15 + Prisma ORM)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ USER MODELS                                                 │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  User (core identity)                                       │    │
│  │  ├── id, email, phone, passwordHash                         │    │
│  │  ├── role (OWNER or SEEKER)                                 │    │
│  │  ├── isVerified, isProfileComplete                          │    │
│  │  │                                                           │    │
│  │  ├── One-to-One: OwnerProfile                               │    │
│  │  └── One-to-One: SeekerProfile                              │    │
│  │                                                              │    │
│  │  OwnerProfile                                               │    │
│  │  ├── businessName, bio                                      │    │
│  │  └── verificationStatus                                     │    │
│  │                                                              │    │
│  │  SeekerProfile                                              │    │
│  │  ├── firstName, age, gender                                 │    │
│  │  ├── employmentStatus, rentPurpose                          │    │
│  │  ├── maxBudget, preferredAreas                              │    │
│  │  └── moveInDate, familySize                                 │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ PROPERTY & MATCHING MODELS                                  │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  Property (listings)                                        │    │
│  │  ├── ownerId (FK to User)                                   │    │
│  │  ├── title, description, area, address                      │    │
│  │  ├── rentAmount, bedrooms, furnished                        │    │
│  │  ├── One-to-Many: Media (photos)                            │    │
│  │  ├── One-to-Many: Like (from seekers)                       │    │
│  │  └── One-to-Many: Match                                     │    │
│  │                                                              │    │
│  │  Like (Seeker likes Property)                               │    │
│  │  ├── seekerId (FK to User)                                  │    │
│  │  ├── propertyId (FK to Property)                            │    │
│  │  └── UNIQUE constraint: (seekerId, propertyId)              │    │
│  │                                                              │    │
│  │  Match (Mutual like - Seeker ↔ Property)                    │    │
│  │  ├── seekerId (FK to User)                                  │    │
│  │  ├── propertyId (FK to Property)                            │    │
│  │  ├── ownerId (FK to User - property owner)                  │    │
│  │  ├── status (PENDING, ACCEPTED, REJECTED)                   │    │
│  │  └── One-to-Many: Message                                   │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ COMMUNICATION MODELS                                        │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  Message (Chat in Match)                                    │    │
│  │  ├── matchId (FK to Match)                                  │    │
│  │  ├── senderId (FK to User)                                  │    │
│  │  ├── content (text)                                         │    │
│  │  ├── read, readAt                                           │    │
│  │  └── Indexed on: matchId, senderId, createdAt               │    │
│  │                                                              │    │
│  │  Notification (Alerts)                                      │    │
│  │  ├── userId (FK to User)                                    │    │
│  │  ├── type (NEW_LIKE, NEW_MATCH, NEW_MESSAGE)                │    │
│  │  ├── relatedId (propertyId, matchId, messageId)             │    │
│  │  └── read boolean                                           │    │
│  │                                                              │    │
│  │  Session (Token management)                                 │    │
│  │  ├── userId (FK to User)                                    │    │
│  │  ├── refreshToken (unique)                                  │    │
│  │  └── expiresAt (DateTime)                                   │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ INDEXES (Performance)                                       │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │ User: email, phone, role                                    │    │
│  │ Property: ownerId, area, isActive, createdAt                │    │
│  │ Like: propertyId, seekerId                                  │    │
│  │ Match: ownerId, seekerId                                    │    │
│  │ Message: matchId, senderId, createdAt                       │    │
│  │ Notification: userId, read                                  │    │
│  │ Session: userId                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

     ▲
     │ External Services
     │
     ├── SMS Provider (Mock or Twilio)
     │   └── Send OTP codes via SMS
     │
     ├── File Storage (Mock or Cloudinary)
     │   └── Store property photos/videos
     │
     └── Socket.IO Server
         └── Real-time message broadcasting
```

---

## Request Flow Example: Seeker Likes Property

```
Browser (Client)
    │
    │ 1. User clicks "Like ❤️" on property card
    │
    ▼
React Component (src/pages/seeker/swipe.tsx)
    │
    │ 2. Calls axios.post('/api/matches/like', { propertyId })
    │
    ▼
API Route (src/pages/api/matches/like.ts)
    │
    │ 3. Rate Limiting Check
    │    ├─ Is user rate limited? (100 req/15min)
    │    └─ Yes → return 429 Too Many Requests
    │
    │ 4. Authentication (withAuth middleware)
    │    ├─ Extract JWT from cookie
    │    ├─ Verify JWT signature
    │    └─ Fetch user from database
    │
    │ 5. Authorization (withSeekerAuth middleware)
    │    ├─ Check user.role === 'SEEKER'
    │    └─ Yes → proceed
    │
    │ 6. Input Validation (Zod)
    │    ├─ Validate { propertyId: string }
    │    └─ No errors → proceed
    │
    │ 7. Business Logic
    │    ├─ Verify property exists
    │    ├─ Check for duplicate like (unique constraint)
    │    ├─ Create Like row in database
    │    ├─ Create Notification for property owner
    │    └─ Return: Like object
    │
    ▼
Database (PostgreSQL)
    │
    │ 8. Transactions
    │    ├─ INSERT INTO Like (seekerId, propertyId)
    │    │  └─ Unique constraint prevents duplicates
    │    │
    │    └─ INSERT INTO Notification (userId, type, relatedId)
    │       └─ Owner notified: "Someone liked your property"
    │
    ▼
API Response
    │
    │ 9. Return 200 OK
    │    {
    │      "id": "like_123",
    │      "seekerId": "user_456",
    │      "propertyId": "prop_789",
    │      "createdAt": "2024-12-03T10:00:00Z"
    │    }
    │
    ▼
Browser (Client)
    │
    │ 10. React Query invalidates cache
    │     └─ 'matches' query refetches
    │
    │ 11. UI updates
    │     ├─ Toast notification: "Liked!"
    │     ├─ Button disables
    │     └─ Move to next property
    │
    ▼
Success!
```

---

## Authentication Flow

```
Signup Process
──────────────

1. User submits form
   │
   ├─ Email validation
   ├─ Phone validation
   ├─ Password strength check
   └─ Role selection (OWNER/SEEKER)
   
   ▼

2. API: POST /api/auth/signup
   │
   ├─ Check email not duplicate
   ├─ Check phone not duplicate
   ├─ Hash password with bcrypt (12 rounds, ~100ms)
   ├─ Create User row
   ├─ Generate 6-digit OTP
   ├─ Send OTP via SMS provider
   │  └─ Dev: logs to console
   │  └─ Prod: sends via Twilio
   │
   └─ Return: { userId, email }

   ▼

3. Frontend: OTP Verification
   │
   ├─ User enters OTP from SMS
   ├─ POST /api/auth/verify-otp
   │
   └─ API checks:
      ├─ SMS provider verifies OTP
      ├─ Mark user as verified
      └─ Return: success

   ▼

4. Frontend: Profile Creation
   │
   ├─ Conditional form based on role
   ├─ Seeker: firstName, age, budget, etc.
   ├─ Owner: businessName, bio
   │
   └─ POST /api/profiles/update
      ├─ Create profile row
      ├─ Mark user.isProfileComplete = true
      └─ Return: success

   ▼

5. Frontend: Login
   │
   ├─ Redirect to /seeker/swipe or /owner/dashboard
   └─ User is now authenticated


Login Process
─────────────

1. User enters email & password

   ▼

2. API: POST /api/auth/login
   │
   ├─ Find user by email
   ├─ Compare password with bcrypt
   │  └─ Returns true/false
   ├─ Generate tokens:
   │  ├─ Access token (JWT, 15 min expiry)
   │  └─ Refresh token (JWT, 7 day expiry)
   ├─ Create Session row in DB (for revocation)
   ├─ Set HTTP-only cookies:
   │  ├─ accessToken (expires 15 min)
   │  ├─ refreshToken (expires 7 days)
   │  ├─ Secure flag (HTTPS only)
   │  └─ SameSite=Strict (CSRF protection)
   │
   └─ Return: user object

   ▼

3. Browser stores cookies (automatic)
   │
   └─ Cannot access via JavaScript (XSS protection)

   ▼

4. All future requests
   │
   └─ Cookie sent automatically with each request
      ├─ Middleware extracts token
      ├─ Verifies JWT signature
      └─ Allows access
```

---

## Data Flow: Seeker Swipe → Match → Chat

```
Step 1: Load Properties (Seeker Page)
────────────────────────────────────────
  GET /api/properties?page=1&limit=50
  ├─ Filter: area, maxBudget, bedrooms
  ├─ Database: SELECT with indexes
  └─ Return: [Property] with photos


Step 2: User Likes Property
────────────────────────────
  POST /api/matches/like
  ├─ Create Like row
  ├─ Create Notification for owner
  └─ Return: success


Step 3: Owner Sees Who Liked
────────────────────────────
  GET /api/matches  (owner querying)
  ├─ Database: SELECT from Like table
  ├─ Show seeker who liked their property
  └─ Owner can now "like back"


Step 4: Owner Creates Match
───────────────────────────
  POST /api/matches/create
  ├─ Verify: seeker already liked property
  ├─ Create Match row
  ├─ Create Notification for seeker
  └─ Return: match created


Step 5: Both See Match
──────────────────────
  GET /api/matches  (seeker querying)
  ├─ Database: SELECT from Match table
  ├─ Show properties they matched with
  └─ Display chat button


Step 6: Open Chat
─────────────────
  Navigate to /matches/{matchId}/chat
  │
  ├─ Load message history
  │  └─ GET /api/messages?matchId=X&page=1
  │
  ├─ Connect WebSocket (future)
  │  └─ socket.on('connect')
  │
  └─ Display message form


Step 7: Send Message
────────────────────
  POST /api/messages/send
  ├─ Create Message row
  ├─ Create Notification for recipient
  ├─ Broadcast via Socket.IO (when implemented)
  └─ Update UI immediately


Step 8: Real-time Update (Future)
──────────────────────────────────
  socket.on('message:received')
  ├─ New message appears in chat
  ├─ Mark as read automatically
  └─ Show typing indicators
```

---

## Authentication State Machine

```
┌─────────────┐
│  Not Auth   │ (Initial state)
│  Logged Out │
└──────┬──────┘
       │
       │ POST /api/auth/signup
       │ + POST /api/auth/verify-otp
       │ + POST /api/profiles/update
       │
       ▼
┌──────────────────┐
│ Profile Complete │
│ Ready to Login   │
└──────┬───────────┘
       │
       │ POST /api/auth/login
       │ (Sets accessToken + refreshToken cookies)
       │
       ▼
┌───────────────────────────────────────┐
│         Authenticated                 │
│  (JWT in HTTP-only cookie)           │
│  Access Token: 15 min                │
│  Refresh Token: 7 days               │
└──────┬────────────────────────────────┘
       │
       ├─────────── All protected routes now accessible ─────────────┐
       │                                                             │
       │ GET /api/properties                                        │
       │ POST /api/matches/like                                     │
       │ GET /api/messages                                          │
       │ POST /api/messages/send                                    │
       │                                                             │
       │ (withAuth middleware verifies JWT)                         │
       │
       │ After 15 minutes:
       │   • Access token expires
       │   • Refresh token still valid
       │   • Auto-refresh (can implement)
       │
       ▼
┌───────────────────────────────────────┐
│   POST /api/auth/logout              │
│   • Delete all sessions              │
│   • Clear cookies (maxAge=0)         │
│   • Revoke all tokens                │
└──────┬────────────────────────────────┘
       │
       ▼
┌─────────────┐
│  Not Auth   │ (Back to start)
│  Logged Out │
└─────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                   │
├────────────────────────────────────────────────────┤
│ • HTTP-only cookies (immune to XSS)                │
│ • SameSite=Strict cookies (immune to CSRF)         │
│ • CORS validation                                  │
└────────────────────────────────────────────────────┘
                       ▼ HTTPS/TLS
┌────────────────────────────────────────────────────┐
│ NETWORK (Encrypted in transit)                     │
│ • All traffic encrypted                            │
│ • No plaintext passwords over network              │
└────────────────────────────────────────────────────┘
                       ▼
┌────────────────────────────────────────────────────┐
│ API LAYER                                          │
├────────────────────────────────────────────────────┤
│ 1. Rate Limiting                                   │
│    • Auth: 5 attempts/15 min (brute force proof)   │
│    • OTP: 3 attempts/hour (prevent guessing)       │
│    • API: 100 requests/15 min (DDoS proof)         │
│                                                    │
│ 2. Input Validation                                │
│    • Zod schemas for all inputs                    │
│    • SQL injection impossible (Prisma ORM)        │
│    • Type checking prevents buffer overflow       │
│                                                    │
│ 3. Authentication                                  │
│    • JWT verification                             │
│    • Token expiry checks                          │
│    • Session-based revocation                     │
│                                                    │
│ 4. Authorization                                   │
│    • Role-based access control                    │
│    • Resource ownership verification              │
│    • Middleware enforces permissions              │
│                                                    │
│ 5. Error Handling                                  │
│    • Generic error messages (no info leakage)     │
│    • Detailed logging (debug only)                │
└────────────────────────────────────────────────────┘
                       ▼
┌────────────────────────────────────────────────────┐
│ DATABASE LAYER                                     │
├────────────────────────────────────────────────────┤
│ • Passwords hashed with bcrypt (one-way)           │
│ • No plaintext secrets stored                      │
│ • Foreign key constraints enforce relationships    │
│ • Unique constraints prevent duplicates            │
│ • Transactions ensure data consistency             │
└────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
Development                Production
─────────────             ─────────────

Docker Compose            Vercel (Frontend)
├─ PostgreSQL             ├─ Auto-deploys from GitHub
└─ Next.js                ├─ Global CDN
                          ├─ Serverless functions
localhost:3000            └─ Custom domain + HTTPS

                          Railway (Backend + DB)
                          ├─ Docker container
                          ├─ PostgreSQL
                          ├─ Environment variables
                          └─ Custom domain + HTTPS

                          Git Workflow
                          ├─ Push to main branch
                          ├─ GitHub Actions CI/CD
                          ├─ Tests run automatically
                          ├─ Deploy on success
                          └─ Monitor in production
```

---

This diagram provides a complete visual reference for the entire DoorHinge system! 🗺️

