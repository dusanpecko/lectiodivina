/**
 * AI Usage Tracking Library
 * 
 * Monitors OpenAI API usage to:
 * - Enforce daily article generation limits (10/day)
 * - Track costs and token usage
 * - Prevent rapid credit depletion
 * - Support tier-based limits
 * 
 * Daily Limits by Tier:
 * - Free: 5 articles/day
 * - Supporter: 10 articles/day
 * - Patron: 15 articles/day
 * - Benefactor: 30 articles/day
 * 
 * NOTE: Each article is generated in multiple languages (up to 8)
 * So 10 articles = 80 API calls total
 */

import { createClient } from "@/app/lib/supabase/server";

// Cost per 1K tokens (in EUR, approximate)
const COST_PER_1K_TOKENS = {
  "gpt-4o": 0.0025, // €0.0025 per 1K input tokens
  "gpt-4o-mini": 0.00015, // €0.00015 per 1K input tokens
  "gpt-4": 0.00003, // €0.03 per 1K tokens (legacy)
  "gpt-3.5-turbo": 0.000002, // €0.002 per 1K tokens
  "dall-e-3": 0.04, // €0.04 per image (not per token)
  "tts-1": 0.000015, // €0.015 per 1K characters
  "tts-1-hd": 0.00003, // €0.030 per 1K characters
} as const;

// Daily article limits by subscription tier
const DAILY_ARTICLE_LIMITS = {
  free: 5,
  supporter: 10,
  patron: 15,
  benefactor: 30,
} as const;

interface AIUsageLog {
  user_id: string;
  endpoint: string;
  model: string;
  tokens_used: number;
  estimated_cost: number;
  language?: string;
  article_batch_id?: string;
  metadata?: Record<string, unknown>;
}

interface DailyUsageStats {
  articles_generated: number;
  total_cost: number;
  tokens_used: number;
  limit_remaining: number;
}

/**
 * Check if user can generate more articles today
 * @param userId - User ID
 * @param customLimit - Optional custom limit (overrides tier-based limit)
 * @returns true if user is within limit, false if exceeded
 */
export async function checkAILimit(
  userId: string,
  customLimit?: number
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_daily_ai_limit", {
    p_user_id: userId,
    p_limit: customLimit || 10, // Default to 10 if not specified
  });

  if (error) {
    console.error("Failed to check AI usage limit:", error);
    throw new Error("Failed to check AI usage limit");
  }

  return data as boolean;
}

/**
 * Get daily usage statistics for a user
 * @param userId - User ID
 * @returns Usage statistics
 */
export async function getDailyAIUsage(
  userId: string
): Promise<DailyUsageStats> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_daily_ai_usage", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Failed to get daily AI usage:", error);
    throw new Error("Failed to get daily AI usage");
  }

  return data[0] as DailyUsageStats;
}

/**
 * Log an AI API call
 * @param params - Usage log parameters
 */
export async function logAIUsage(params: AIUsageLog): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("ai_usage_logs").insert({
    user_id: params.user_id,
    endpoint: params.endpoint,
    model: params.model,
    tokens_used: params.tokens_used,
    estimated_cost: params.estimated_cost,
    language: params.language,
    article_batch_id: params.article_batch_id,
    metadata: params.metadata,
  });

  if (error) {
    console.error("Failed to log AI usage:", error);
    // Don't throw - logging shouldn't break the main flow
  }
}

/**
 * Calculate estimated cost from token usage
 * @param model - OpenAI model name
 * @param tokens - Number of tokens used
 * @returns Estimated cost in EUR
 */
export function calculateCost(model: string, tokens: number): number {
  const costPerToken =
    COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS] || 0;
  return (tokens / 1000) * costPerToken;
}

/**
 * Get daily limit for user based on subscription tier
 * @param userId - User ID
 * @returns Daily article limit
 */
export async function getUserDailyLimit(userId: string): Promise<number> {
  const supabase = await createClient();

  // Get user's active subscription
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !subscription) {
    // No active subscription = free tier
    return DAILY_ARTICLE_LIMITS.free;
  }

  const tier = subscription.tier as keyof typeof DAILY_ARTICLE_LIMITS;
  return DAILY_ARTICLE_LIMITS[tier] || DAILY_ARTICLE_LIMITS.free;
}

/**
 * Generate a batch ID for multi-language article generation
 * This groups all language variants of the same article
 * @returns UUID batch ID
 */
export function generateBatchId(): string {
  return crypto.randomUUID();
}

/**
 * Get total AI costs (admin only)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Total costs and statistics
 */
export async function getTotalAICosts(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total_cost: number;
  total_tokens: number;
  total_calls: number;
  by_endpoint: Record<string, { calls: number; cost: number; tokens: number }>;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_total_ai_costs", {
    p_start_date: startDate?.toISOString() || undefined,
    p_end_date: endDate?.toISOString() || undefined,
  });

  if (error) {
    console.error("Failed to get total AI costs:", error);
    throw new Error("Failed to get total AI costs");
  }

  return data[0] as {
    total_cost: number;
    total_tokens: number;
    total_calls: number;
    by_endpoint: Record<
      string,
      { calls: number; cost: number; tokens: number }
    >;
  };
}
