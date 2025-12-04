# Deployment & Scaling Architecture

## Separation of Concerns: Frontend ≠ Backend

### Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐
│   Frontend Tier     │         │   Backend Tier       │
│   (Next.js App)     │         │   (Next.js API)      │
│   - Vercel          │◄───────►│   - Railway/Heroku   │
│   - Pages & UI      │ HTTP    │   - API Routes       │
│   - Client routing  │         │   - Database access  │
└─────────────────────┘         └──────────────────────┘
         │                                │
         │                                │
    Static CDN                     PostgreSQL + Redis
         │                                │
         └────────────────────────────────┘
```

### Why Separate Repos?

**Frontend (Vercel):**
- React/Next.js pages only
- Client-side state (Zustand)
- Communicates via API calls
- Auto-deploys on every git push
- Zero knowledge of database

**Backend (Railway/Heroku):**
- Stateless API routes
- Database & business logic
- Can scale horizontally (multiple instances)
- Session stored in DB, not server memory
- Independent deployment cycles

### Benefits

1. **Horizontal Scaling:** Spin up multiple backend instances without state conflicts
2. **Independent Deployment:** Update UI without redeploying backend
3. **Technology Independence:** Frontend can use any framework
4. **Team Separation:** Large teams can work independently
5. **Cost Optimization:** Auto-scale backend during peak hours

## Stateless API Design

### Core Principle: No Server Memory

Every request must be independently processable by ANY server instance.

**✅ Stateless (GOOD):**
```typescript
// Session stored in database, retrieved per-request
const session = await prisma.session.findUnique({ 
  where: { refreshToken: req.cookies.refreshToken }
})
```

**❌ Stateful (BAD):**
```typescript
// Memory on server instance A - fails if request goes to instance B
const activeUsers = new Map() // ❌ DON'T DO THIS
activeUsers.set(userId, userState)
```

### Implementation

- **JWT Tokens:** Stateless auth, verified on every request
- **Database Sessions:** Refresh tokens stored in Prisma, not memory
- **No global caches:** Use Redis (external) instead of server memory
- **No WebSocket state:** Use Redis pub/sub for real-time across instances

## Caching Strategy: Redis

### Hot Data (Frequently Accessed)

```typescript
// Property listings cached for 5 minutes
// Reduces database queries from 1000s/min to 100s/min
const properties = await cacheWithTTL(
  'properties:list',
  300, // 5 minutes
  () => prisma.property.findMany(...)
)
```

### Cache Invalidation

```typescript
// When property is created/updated, clear cache
await invalidateCache(cacheKeys.propertyList())
```

### Deployment with Redis

**Development:** In-memory mock Redis (not production-safe)
**Production:** UpstashRedis or AWS ElastiCache

```bash
# Production env
REDIS_URL=redis://default:password@host:port
```

## Horizontal Scaling Timeline

### Phase 1: Single Instance (Current)
- Backend on Railway: `backend.example.com`
- 1 Dyno, handles ~100 concurrent users
- Database: PostgreSQL (shared)
- Cache: Redis (shared)

### Phase 2: Multiple Instances
```bash
# Railway scales to 3 dynos automatically
# Load balancer distributes requests
# Each dyno handles 33 users concurrently
# Total: ~300 concurrent users
# All share same database + Redis
```

### Phase 3: Database Replication (If >1000 users)
- Primary DB (write)
- Read replicas (queries distributed)
- Redis cluster for cache distribution

## Deployment Commands

### Frontend (Vercel)
```bash
# Auto-deployed on push to main
# No configuration needed
```

### Backend (Railway)
```bash
# Connect GitHub repo → auto-deploys on push
# Environment variables set in Railway dashboard

# Manual deploy
npm run build
npm start
```

## Monitoring Scaling Health

### Metrics to Watch
- **API Response Time:** Should stay <200ms
- **Database Queries/sec:** Should drop with caching
- **Cache Hit Rate:** Target >70% for properties list
- **Memory Usage:** Should be consistent per dyno

### Alerts
```
⚠️  Database slow query (>1s)
⚠️  Cache hit rate dropped below 60%
⚠️  API p95 latency >500ms
⚠️  Memory leak detected (dyno restart)
```

## Why This Matters for MAANG

✅ **Google Scale:** Designed for millions of users, not just thousands
✅ **Amazon DevOps:** Separation of concerns = independent team scaling
✅ **Apple Quality:** Stateless = no mysterious bugs from shared state
✅ **Netflix Resilience:** One failing dyno doesn't take down entire service
✅ **Meta Infrastructure:** Redis caching reduces compute costs

This architecture is how production systems at FAANG handle user growth.
