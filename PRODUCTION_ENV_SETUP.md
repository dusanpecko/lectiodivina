# Production Environment Variables Setup

## Critical: Add these variables to your production server

Po poslednej aktualizácii subscriptions musíš pridať tieto environment variables na produkčný server:

```bash
# Friend tier (Priateľ)
NEXT_PUBLIC_STRIPE_PRICE_FRIEND_MONTHLY=price_1SQUUsGrGKpSpokk7PtIDvy0
NEXT_PUBLIC_STRIPE_PRICE_FRIEND_YEARLY=price_1SVYYiGrGKpSpokkQMrIqRYL

# Patron tier (Patrón)
NEXT_PUBLIC_STRIPE_PRICE_PATRON_MONTHLY=price_1SQYSSGrGKpSpokkCSnAuMPr
NEXT_PUBLIC_STRIPE_PRICE_PATRON_YEARLY=price_1SVYbMGrGKpSpokkP0a2Bbo4

# Founder tier (Zakladateľ)
NEXT_PUBLIC_STRIPE_PRICE_FOUNDER_MONTHLY=price_1SQYauGrGKpSpokkHQhkJUhe
NEXT_PUBLIC_STRIPE_PRICE_FOUNDER_YEARLY=price_1SVYd9GrGKpSpokkbvQ0nXeG
```

## Postup podľa hosting platformy

### Vercel
```bash
vercel env add NEXT_PUBLIC_STRIPE_PRICE_FRIEND_MONTHLY production
# Enter value: price_1SQUUsGrGKpSpokk7PtIDvy0
# Repeat for all 6 variables above
```

### Railway / Render / DigitalOcean App Platform
1. Go to project settings → Environment Variables
2. Add each variable with its value
3. Trigger redeploy

### VPS (PM2/systemd)
1. Update `.env` file on server:
```bash
ssh user@your-server
cd /path/to/lectiodivina/backend
nano .env
# Add the 6 variables above
pm2 restart lectio-backend
```

### Docker
Update `docker-compose.yml` or pass via `docker run -e`:
```yaml
environment:
  - NEXT_PUBLIC_STRIPE_PRICE_FRIEND_MONTHLY=price_1SQUUsGrGKpSpokk7PtIDvy0
  # ... etc
```

## After adding variables

**IMPORTANT:** After adding env variables, you MUST rebuild:
```bash
npm run build
# or on your hosting platform: trigger redeploy
```

`NEXT_PUBLIC_*` variables are embedded at **build time**, not runtime!

## Verification

After deploy, check in browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_STRIPE_PRICE_FRIEND_MONTHLY)
// Should output: "price_1SQUUsGrGKpSpokk7PtIDvy0"
```

If it shows `undefined`, the build didn't include the variables → rebuild needed.
