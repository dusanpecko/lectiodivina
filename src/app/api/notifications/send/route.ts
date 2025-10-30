import { sendPushNotification } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface TokenData {
  token: string;
  user_id: string;
  locale_code: string;
}

interface UserPreference {
  user_id: string;
  is_enabled: boolean;
}

/**
 * POST /api/notifications/send
 * 
 * Odošle push notifikáciu používateľom na základe kritérií
 * 
 * Body:
 * {
 *   "topicId": "daily-lectio", // ID notification topic
 *   "title": "Dnešné zamyslenie",
 *   "body": "Prečítajte si dnešnú Lectio Divina",
 *   "data": { // Voliteľné custom dáta
 *     "type": "lectio",
 *     "lectioId": "123"
 *   },
 *   "localeCode": "sk", // Voliteľné - posle len pre daný jazyk
 *   "userIds": ["user-1", "user-2"], // Voliteľné - posle len pre konkrétnych userov
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Pre server-side API môžeme skipnúť auth alebo implementovať API key
    // Zatiaľ pokračujeme bez auth check (môžeš pridať API key)
    
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.NOTIFICATIONS_API_KEY;
    
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const { 
      topicId, 
      title, 
      body: notificationBody, 
      data = {},
      localeCode,
      userIds,
    } = body;

    // Validácia
    if (!topicId || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields: topicId, title, body' },
        { status: 400 }
      );
    }

    // Získaj FCM tokeny pre daný topic
    let query = supabase
      .from('user_fcm_tokens')
      .select('token, user_id, locale_code')
      .eq('is_active', true);

    // Filter by locale if specified
    if (localeCode) {
      query = query.eq('locale_code', localeCode);
    }

    // Filter by user IDs if specified
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data: tokenData, error: tokenError } = await query;

    if (tokenError) {
      console.error('Error fetching tokens:', tokenError);
      return NextResponse.json(
        { error: 'Failed to fetch tokens' },
        { status: 500 }
      );
    }

    if (!tokenData || tokenData.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'No tokens found for the specified criteria',
          successCount: 0,
          failureCount: 0,
        },
        { status: 200 }
      );
    }

    // Filter tokens based on user preferences for this topic
    const userIdsWithTokens = [...new Set((tokenData as TokenData[]).map(t => t.user_id))];
    
    const { data: preferences, error: prefError } = await supabase
      .from('user_notification_preferences')
      .select('user_id, is_enabled')
      .eq('topic_id', topicId)
      .in('user_id', userIdsWithTokens);

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      // Continue without preferences - default to enabled
    }

    // Create a map of user preferences
    const preferencesMap = new Map<string, boolean>();
    if (preferences) {
      (preferences as UserPreference[]).forEach(pref => {
        preferencesMap.set(pref.user_id, pref.is_enabled);
      });
    }

    // Filter tokens - only include users who have the topic enabled (or no preference set - default enabled)
    const enabledTokens = (tokenData as TokenData[])
      .filter(tokenObj => {
        const isEnabled = preferencesMap.get(tokenObj.user_id);
        // If no preference is set, default to enabled (true)
        return isEnabled === undefined ? true : isEnabled;
      })
      .map(tokenObj => tokenObj.token);

    if (enabledTokens.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'No users have this topic enabled',
          successCount: 0,
          failureCount: 0,
        },
        { status: 200 }
      );
    }

    console.log(`📤 Sending notification to ${enabledTokens.length} tokens for topic: ${topicId}`);

    // Odošli push notifikácie
    const result = await sendPushNotification(
      enabledTokens,
      { title, body: notificationBody },
      data
    );

    // Log notification to database for analytics
    try {
      await supabase.from('notification_logs').insert({
        topic_id: topicId,
        title,
        body: notificationBody,
        locale_code: localeCode,
        tokens_count: enabledTokens.length,
        success_count: result.successCount,
        failure_count: result.failureCount,
        sent_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log notification:', logError);
      // Continue anyway - notification was sent
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Notifications sent successfully',
        tokensCount: enabledTokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
