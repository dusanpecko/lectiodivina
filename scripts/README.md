# Scripts Directory

Utility scripts for manual database operations. **Use with caution!**

⚠️ **All scripts use environment variables from `.env.local` for security.**

## Available Scripts

### 1. `check_donations.js`
Lists all donations in the database.

```bash
node scripts/check_donations.js
```

### 2. `get_user_id.js`
Find a user's ID by email address.

```bash
# Edit the script to set your email, then run:
node scripts/get_user_id.js
```

### 3. `add_manual_donation.js`
Manually add a donation record (when webhook fails).

```bash
# 1. First, get the user ID:
node scripts/get_user_id.js

# 2. Edit add_manual_donation.js with:
#    - userId (from step 1)
#    - amount (in EUR)
#    - sessionId (from Stripe email/dashboard)
#    - message (optional)

# 3. Run the script:
node scripts/add_manual_donation.js
```

## Security Notes

- ✅ All scripts read credentials from `.env.local`
- ✅ Never commit these scripts with hardcoded credentials
- ✅ Service role key should be rotated if exposed
- ⚠️ These scripts bypass RLS policies - use carefully!

## When to Use

- **Webhook failures**: Stripe payment succeeded but webhook didn't record it
- **Data corrections**: Fix incorrect donation amounts or metadata
- **Debugging**: Check database state during development

## Production Use

For production issues, prefer using:
1. Stripe Dashboard → Events → Manual webhook trigger
2. Supabase Dashboard → SQL Editor for direct queries
3. These scripts only as last resort
