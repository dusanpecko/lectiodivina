-- Step 1: Add interval column if it doesn't exist
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS interval VARCHAR(20) DEFAULT 'month';

-- Step 2: Insert/update test_daily subscriptions
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
  1,
  'day',
  'active',
  to_timestamp(1762465704),
  to_timestamp(1762552104),
  false,
  to_timestamp(1762465430),
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  status = EXCLUDED.status,
  interval = EXCLUDED.interval,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  amount = EXCLUDED.amount,
  updated_at = NOW();

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
  1,
  'day',
  'active',
  to_timestamp(1762465062),
  to_timestamp(1762551462),
  false,
  to_timestamp(1762465062),
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  status = EXCLUDED.status,
  interval = EXCLUDED.interval,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  amount = EXCLUDED.amount,
  updated_at = NOW();

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
  1,
  'day',
  'active',
  to_timestamp(1762464814),
  to_timestamp(1762551214),
  false,
  to_timestamp(1762464814),
  NOW()
)
ON CONFLICT (stripe_subscription_id) 
DO UPDATE SET
  status = EXCLUDED.status,
  interval = EXCLUDED.interval,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  amount = EXCLUDED.amount,
  updated_at = NOW();

-- Step 3: Verify the data
SELECT 
  id,
  stripe_subscription_id,
  tier,
  amount,
  interval,
  status,
  TO_CHAR(current_period_end, 'YYYY-MM-DD HH24:MI:SS') as renews_at,
  created_at
FROM subscriptions 
WHERE tier = 'test_daily'
ORDER BY created_at DESC;
