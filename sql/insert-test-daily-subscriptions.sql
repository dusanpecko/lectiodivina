-- Insert missing test_daily subscriptions into database
-- Run this in Supabase SQL Editor

-- Subscription 1: sub_1SQayCKF1O52aJAIXxUbEcTq (latest)
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  tier,
  amount,
  interval,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
) VALUES (
  'd0d8b50c-48a2-41c7-9d8d-a0b87422438c',
  'sub_1SQayCKF1O52aJAIXxUbEcTq',
  'cus_TNLf7dXFzm0lDJ',
  'test_daily',
  1.00,
  'day',
  'active',
  '2025-11-06 22:30:30+00',
  '2025-11-07 22:31:44+00',
  false,
  '2025-11-06 22:30:30+00',
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  current_period_end = EXCLUDED.current_period_end,
  updated_at = NOW();

-- Subscription 2: sub_1SQasGKF1O52aJAI5lncnRY2
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  tier,
  amount,
  interval,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
) VALUES (
  'd0d8b50c-48a2-41c7-9d8d-a0b87422438c',
  'sub_1SQasGKF1O52aJAI5lncnRY2',
  'cus_TNLZM35Tu6BDRX',
  'test_daily',
  1.00,
  'day',
  'active',
  '2025-11-06 22:24:22+00',
  '2025-11-07 22:24:22+00',
  false,
  '2025-11-06 22:24:22+00',
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  current_period_end = EXCLUDED.current_period_end,
  updated_at = NOW();

-- Subscription 3: sub_1SQaoGKF1O52aJAIjRtiNM0v
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  tier,
  amount,
  interval,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
) VALUES (
  'd0d8b50c-48a2-41c7-9d8d-a0b87422438c',
  'sub_1SQaoGKF1O52aJAIjRtiNM0v',
  'cus_TNLV3YJ8FS8vic',
  'test_daily',
  1.00,
  'day',
  'active',
  '2025-11-06 22:20:14+00',
  '2025-11-07 22:20:14+00',
  false,
  '2025-11-06 22:20:14+00',
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  current_period_end = EXCLUDED.current_period_end,
  updated_at = NOW();

-- Verify the inserts
SELECT 
  id,
  stripe_subscription_id,
  tier,
  amount,
  interval,
  status,
  current_period_end,
  cancel_at_period_end,
  created_at
FROM subscriptions 
WHERE user_id = 'd0d8b50c-48a2-41c7-9d8d-a0b87422438c'
  AND tier = 'test_daily'
ORDER BY created_at DESC;
