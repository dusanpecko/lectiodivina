-- AI Usage Tracking System
-- Tracks OpenAI API usage to monitor costs and enforce daily limits
-- Created: 24.11.2025

-- ============================================
-- AI Usage Logs Table
-- ============================================
-- Logs every AI API call with token usage and estimated costs

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL, -- 'generate-article', 'generate-image', 'text-to-speech'
  model TEXT NOT NULL, -- 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3', 'tts-1'
  tokens_used INTEGER, -- Total tokens consumed
  estimated_cost DECIMAL(10, 6), -- Cost in EUR
  language TEXT, -- 'sk', 'en', 'es', 'cz', etc.
  article_batch_id UUID, -- Groups multi-language article generations
  metadata JSONB, -- Additional data (prompt length, response time, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_endpoint ON ai_usage_logs(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_batch ON ai_usage_logs(article_batch_id);

-- Enable RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Service role can do everything (for logging from API)
CREATE POLICY "Service role has full access to ai_usage_logs"
  ON ai_usage_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can see their own usage
CREATE POLICY "Users can view their own AI usage logs"
  ON ai_usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can see all usage
CREATE POLICY "Admins can view all AI usage logs"
  ON ai_usage_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- Daily AI Limit Check Function
-- ============================================
-- Returns TRUE if user is within daily limit, FALSE if exceeded
-- Default limit: 10 articles per day

CREATE OR REPLACE FUNCTION check_daily_ai_limit(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS BOOLEAN AS $$
DECLARE
  daily_count INTEGER;
BEGIN
  -- Count articles generated in last 24 hours
  -- Group by batch_id to count articles, not individual language calls
  SELECT COUNT(DISTINCT article_batch_id) INTO daily_count
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND endpoint = 'generate-article'
    AND created_at > NOW() - INTERVAL '24 hours';
  
  RETURN daily_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Get Daily AI Usage Function
-- ============================================
-- Returns usage statistics for a user in the last 24 hours

CREATE OR REPLACE FUNCTION get_daily_ai_usage(p_user_id UUID)
RETURNS TABLE (
  articles_generated INTEGER,
  total_cost DECIMAL(10, 6),
  tokens_used INTEGER,
  limit_remaining INTEGER
) AS $$
DECLARE
  user_limit INTEGER;
BEGIN
  -- Get user's tier limit (default to 10 for free users)
  SELECT CASE
    WHEN s.tier = 'benefactor' THEN 30
    WHEN s.tier = 'patron' THEN 15
    WHEN s.tier = 'supporter' THEN 10
    ELSE 5 -- free users
  END INTO user_limit
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Default to 5 if no subscription
  IF user_limit IS NULL THEN
    user_limit := 5;
  END IF;
  
  -- Get usage stats
  RETURN QUERY
  SELECT
    COUNT(DISTINCT article_batch_id)::INTEGER as articles_generated,
    COALESCE(SUM(estimated_cost), 0) as total_cost,
    COALESCE(SUM(tokens_used), 0)::INTEGER as tokens_used,
    GREATEST(0, user_limit - COUNT(DISTINCT article_batch_id)::INTEGER) as limit_remaining
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND endpoint = 'generate-article'
    AND created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Admin: Get Total AI Costs
-- ============================================
-- Returns total OpenAI costs for monitoring

CREATE OR REPLACE FUNCTION get_total_ai_costs(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_cost DECIMAL(10, 6),
  total_tokens INTEGER,
  total_calls INTEGER,
  by_endpoint JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(estimated_cost), 0) as total_cost,
    COALESCE(SUM(tokens_used), 0)::INTEGER as total_tokens,
    COUNT(*)::INTEGER as total_calls,
    jsonb_object_agg(
      endpoint,
      jsonb_build_object(
        'calls', COUNT(*),
        'cost', COALESCE(SUM(estimated_cost), 0),
        'tokens', COALESCE(SUM(tokens_used), 0)
      )
    ) as by_endpoint
  FROM ai_usage_logs
  WHERE created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE ai_usage_logs IS 'Tracks OpenAI API usage for cost monitoring and daily limits';
COMMENT ON FUNCTION check_daily_ai_limit IS 'Returns TRUE if user can generate more articles today';
COMMENT ON FUNCTION get_daily_ai_usage IS 'Returns daily usage statistics for a user';
COMMENT ON FUNCTION get_total_ai_costs IS 'Admin function to monitor total AI costs';
