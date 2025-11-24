# 🔧 Technical Implementation Guide - Backend Improvements

**Related to:** BACKEND_HODNOTENIE.md  
**Priority:** Critical Security & Performance Fixes  
**Estimated Time:** 40-80 hours

---

## 🚨 CRITICAL FIXES (Week 1)

### 1. Fix npm Security Vulnerabilities

#### Issue
```bash
3 vulnerabilities (2 moderate, 1 high)
├── js-yaml (moderate) - Prototype pollution
├── tar (moderate) - Race condition  
└── xlsx (HIGH) - Prototype pollution + ReDoS
```

#### Solution
```bash
# Step 1: Run audit fix
npm audit fix

# Step 2: Replace xlsx with safer alternative
npm uninstall xlsx
npm install exceljs
# or
npm install xlsx-populate
```

#### Code Changes
```typescript
// OLD: src/app/api/admin/products/route.ts
import * as XLSX from 'xlsx';

// NEW: Use exceljs
import ExcelJS from 'exceljs';

// Example: Reading Excel file
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(filePath);
const worksheet = workbook.getWorksheet(1);
worksheet.eachRow((row, rowNumber) => {
  // Process row
});
```

---

### 2. Implement Rate Limiting

#### Install Package
```bash
npm install express-rate-limit
npm install @types/express-rate-limit --save-dev
```

#### Implementation

**File: `src/middleware/rateLimit.ts`** (NEW)
```typescript
import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// Configuration
const limiterConfigs = {
  // Strict limit for sensitive endpoints
  strict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Príliš mnoho požiadaviek. Skúste znova o chvíľu.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // Moderate limit for API endpoints
  moderate: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Príliš mnoho požiadaviek. Skúste znova o chvíľu.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
  
  // Relaxed limit for public endpoints
  relaxed: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per window
    message: 'Príliš mnoho požiadaviek. Skúste znova o chvíľu.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// Wrapper for Next.js API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  type: 'strict' | 'moderate' | 'relaxed' = 'moderate'
) {
  return async (req: NextRequest) => {
    try {
      // Apply rate limiting
      const limiter = limiterConfigs[type];
      await limiter(req as any, {} as any);
      return await handler(req);
    } catch (error) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
  };
}
```

**Usage in API Routes:**
```typescript
// src/app/api/admin/send-notification/route.ts
import { withRateLimit } from '@/middleware/rateLimit';

async function handler(request: Request) {
  // ... existing code
}

export const POST = withRateLimit(handler, 'strict');
```

```typescript
// src/app/api/checkout/subscription/route.ts
import { withRateLimit } from '@/middleware/rateLimit';

async function handler(request: NextRequest) {
  // ... existing code
}

export const POST = withRateLimit(handler, 'moderate');
```

---

### 3. Stripe Webhook Verification

#### Issue
Currently missing signature verification for Stripe webhooks - critical security risk!

#### Solution

**File: `src/app/api/webhooks/stripe/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    // ✅ CRITICAL: Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Process event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSub);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Update database with payment info
  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;
  
  // TODO: Update user subscription in database
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update subscription status in database
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as cancelled in database
}
```

**Get Webhook Secret:**
```bash
# Using Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook secret (whsec_...) to .env.local

# Or create in Stripe Dashboard:
# Developers → Webhooks → Add endpoint
# URL: https://yourdomain.com/api/webhooks/stripe
```

**Update .env.local:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

### 4. Security Headers

#### Add to `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com https://*.supabase.co",
              "frame-src https://js.stripe.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## ⚡ PERFORMANCE IMPROVEMENTS (Week 2-3)

### 5. Redis Caching Layer

#### Install Redis
```bash
npm install ioredis
npm install @types/ioredis --save-dev
```

#### Setup Redis Client

**File: `src/lib/redis.ts`** (NEW)
```typescript
import Redis from 'ioredis';

// Singleton pattern for Redis client
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (error) => {
      console.error('Redis error:', error);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  return redis;
}

// Cache helper functions
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600 // 1 hour default
): Promise<T> {
  const redis = getRedisClient();
  
  // Try to get from cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedisClient();
  const keys = await redis.keys(pattern);
  
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

#### Usage Example

**Before:**
```typescript
// src/app/api/products/route.ts
export async function GET(request: Request) {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);
  
  return NextResponse.json(products);
}
```

**After:**
```typescript
// src/app/api/products/route.ts
import { getCached, invalidateCache } from '@/lib/redis';

export async function GET(request: Request) {
  const products = await getCached(
    'products:active',
    async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      return data;
    },
    3600 // Cache for 1 hour
  );
  
  return NextResponse.json(products);
}

// Invalidate cache when products are updated
export async function POST(request: Request) {
  // ... create product logic
  
  // Invalidate cache
  await invalidateCache('products:*');
  
  return NextResponse.json({ success: true });
}
```

**Add to .env.local:**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

---

### 6. Input Validation with Zod

#### Install Zod
```bash
npm install zod
```

#### Create Validation Schemas

**File: `src/lib/validations.ts`** (NEW)
```typescript
import { z } from 'zod';

// Notification validation
export const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  locale: z.enum(['sk', 'en', 'cz', 'es']),
  topic_id: z.string().uuid(),
  scheduled_at: z.string().datetime().optional(),
  image_url: z.string().url().optional(),
  screen: z.string().max(50).optional(),
  screen_params: z.string().max(500).optional(),
});

// Subscription validation
export const subscriptionSchema = z.object({
  tier: z.enum(['supporter', 'friend', 'patron', 'benefactor', 'founder']),
  priceId: z.string().min(1),
  userId: z.string().uuid(),
  email: z.string().email().optional(),
});

// Product validation
export const productSchema = z.object({
  name: z.record(z.string(), z.string().min(1)),
  description: z.record(z.string(), z.string().min(1)),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  price: z.number().positive().max(10000),
  stock: z.number().int().min(0),
  category: z.enum(['knihy', 'pera', 'snurky', 'zurnal', 'kalendar']).optional(),
  images: z.array(z.string().url()).optional(),
  is_active: z.boolean().default(true),
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  recaptchaToken: z.string().optional(),
});

// Order validation
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().max(100),
  })).min(1),
  shippingAddress: z.object({
    name: z.string().min(2).max(100),
    street: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    postal_code: z.string().min(3).max(20),
    country: z.string().length(2),
    phone: z.string().min(9).max(20).optional(),
    email: z.string().email().optional(),
  }),
});
```

#### Usage in API Routes

**Before:**
```typescript
export async function POST(request: Request) {
  const payload = await request.json();
  const { title, body, locale, topic_id } = payload || {};
  
  if (!title?.trim() || !body?.trim() || !locale || !topic_id) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }
  
  // ... rest of logic
}
```

**After:**
```typescript
import { notificationSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Validate with Zod
    const validatedData = notificationSchema.parse(payload);
    
    // Use validated data (guaranteed to be correct type)
    const { title, body, locale, topic_id } = validatedData;
    
    // ... rest of logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 7. Replace console.log with Winston Logger

#### Install Winston
```bash
npm install winston
npm install @types/winston
```

#### Setup Logger

**File: `src/lib/logger.ts`** (NEW)
```typescript
import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
    // File output for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File output for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add request ID support
export function withRequestId(requestId: string) {
  return {
    info: (message: string, meta?: any) => 
      logger.info(message, { ...meta, requestId }),
    error: (message: string, meta?: any) => 
      logger.error(message, { ...meta, requestId }),
    warn: (message: string, meta?: any) => 
      logger.warn(message, { ...meta, requestId }),
    debug: (message: string, meta?: any) => 
      logger.debug(message, { ...meta, requestId }),
  };
}
```

#### Usage

**Before:**
```typescript
console.log('🔵 Subscription checkout request:', { tier, priceId, userId });
console.error('❌ Error creating subscription:', error);
```

**After:**
```typescript
import { logger } from '@/lib/logger';

logger.info('Subscription checkout request', { tier, priceId, userId });
logger.error('Error creating subscription', { error: error.message, stack: error.stack });
```

**Create logs directory:**
```bash
mkdir -p logs
echo "logs/" >> .gitignore
```

---

### 8. Health Check Endpoint

**File: `src/app/api/health/route.ts`** (NEW)
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.2.0-beta.5',
    services: {
      database: 'unknown',
      redis: 'unknown',
      stripe: 'unknown',
    },
  };

  // Check Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data, error } = await supabase
      .from('locales')
      .select('id')
      .limit(1);
    
    health.services.database = error ? 'unhealthy' : 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
  }

  // Check Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
  }

  // Check Stripe
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    await stripe.balance.retrieve();
    health.services.stripe = 'healthy';
  } catch (error) {
    health.services.stripe = 'unhealthy';
  }

  // Overall status
  const allHealthy = Object.values(health.services).every(s => s === 'healthy');
  health.status = allHealthy ? 'healthy' : 'degraded';

  const statusCode = allHealthy ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

**Test:**
```bash
curl http://localhost:3000/api/health
```

---

## 📊 MONITORING (Week 4)

### 9. Sentry Integration for Error Tracking

#### Install Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

#### Configure Sentry

**File: `sentry.client.config.ts`**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception) {
      const error = hint.originalException;
      // Don't send certain errors to Sentry
      if (error && error.toString().includes('ResizeObserver')) {
        return null;
      }
    }
    return event;
  },
});
```

**Add to .env.local:**
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_auth_token_here
```

---

## 📚 Additional Resources

### Development Workflow
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Run development server
npm run dev

# 4. Run linter
npm run lint

# 5. Build for production
npm run build

# 6. Start production server
npm start
```

### Testing Strategy
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @types/jest

# Create test config
# jest.config.js
```

### Database Migrations
```sql
-- Create migrations directory structure
-- sql/migrations/001_initial_setup.sql
-- sql/migrations/002_add_feature_x.sql

-- Run migrations manually or use a tool like:
-- npm install node-pg-migrate
```

---

## ✅ Implementation Checklist

### Week 1 - Critical Security
- [ ] Fix npm vulnerabilities
- [ ] Implement rate limiting
- [ ] Add Stripe webhook verification
- [ ] Configure security headers
- [ ] Test all changes

### Week 2 - Performance
- [ ] Setup Redis caching
- [ ] Add input validation (Zod)
- [ ] Replace console.log with Winston
- [ ] Create health check endpoint
- [ ] Optimize database queries

### Week 3 - Monitoring
- [ ] Setup Sentry error tracking
- [ ] Add performance monitoring
- [ ] Create logging dashboard
- [ ] Setup alerts

### Week 4 - Testing & Documentation
- [ ] Write unit tests for critical paths
- [ ] Add API documentation (Swagger)
- [ ] Update README with new features
- [ ] Performance testing

---

**Last Updated:** November 24, 2025  
**Version:** 1.0  
**Author:** Backend Improvement Team
