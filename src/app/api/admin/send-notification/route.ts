import { sendPushNotification } from '@/lib/firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

type DebugInfo = {
  reqId: string;
  debugEnabled: boolean;
  env: {
    hasProjectId: boolean;
    hasClientEmail: boolean;
    hasPrivateKey: boolean;
    supabaseUrlPresent: boolean;
    supabaseServiceRolePresent: boolean;
    // projectId zmaskujeme (prvé 4 znaky)
    projectIdMasked?: string;
  };
  request: {
    nowIso: string;
    titleLen: number;
    bodyLen: number;
    locale: string | null;
    topic: string | null;
    scheduled_at?: string | null;
    isScheduled: boolean;
  };
  messaging?: {
    topicName?: string;
    payloadPreview?: {
      notification?: { title?: string; body?: string };
      dataKeys?: string[];
      apns?: boolean;
      android?: boolean;
    };
    sendMessageId?: string;
  };
  supabase?: {
    localeLookupOk?: boolean;
    localeId?: number;
    scheduledInsertOk?: boolean;
    logInsertOk?: boolean;
    subscriberCount?: number;
  };
  error?: {
    stage:
      | 'validate'
      | 'locale_lookup'
      | 'schedule_insert'
      | 'fcm_send'
      | 'log_insert'
      | 'unknown';
    message: string;
    code?: string;
    stackTop?: string;
  };
};

interface NotificationPayload {
  title: string;
  body: string;
  locale: string;
  topic_id: string; // UUID témy notifikácie
  scheduled_at?: string;
  image_url?: string;
  // Deep linking fields
  screen?: string; // Cieľová obrazovka (e.g., 'lectio', 'rosary', 'article')
  screen_params?: string; // JSON string s parametrami (e.g., '{"articleId":"123"}')
}

interface SendResponse {
  success: boolean;
  message: string;
  sent_count?: number;
  debugInfo?: DebugInfo;
}

// Initialize Supabase client (server-only key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const reqId = randomUUID();
  const url = new URL(request.url);
  const debugEnabled =
    url.searchParams.get('debug') === '1' ||
    request.headers.get('x-debug') === '1' ||
    process.env.ENABLE_DEBUG === '1';

  const debug: DebugInfo = {
    reqId,
    debugEnabled: !!debugEnabled,
    env: {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      supabaseUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceRolePresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      projectIdMasked: process.env.FIREBASE_PROJECT_ID
        ? `${process.env.FIREBASE_PROJECT_ID.slice(0, 4)}***`
        : undefined,
    },
    request: {
      nowIso: new Date().toISOString(),
      titleLen: 0,
      bodyLen: 0,
      locale: null,
      topic: null,
      scheduled_at: null,
      isScheduled: false,
    },
  };

  const sendDebug = (payload: Omit<SendResponse, 'debugInfo'>, status: number) => {
    if (debugEnabled) {
      return NextResponse.json({ ...payload, debugInfo: debug }, { status });
    }
    return NextResponse.json(payload, { status });
  };

  // Metóda POST je definovaná v názve funkcie, takže táto kontrola už nie je potrebná
  // if (req.method !== 'POST') {
  //   return sendDebug({ success: false, message: 'Method not allowed' });
  // }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !isValidAdminToken(authHeader)) {
    return sendDebug({ success: false, message: 'Unauthorized' }, 401);
  }

  try {
    const payload: NotificationPayload = await request.json();
    const { title, body, locale, topic_id, scheduled_at } = payload || {};
    debug.request.titleLen = title?.length ?? 0;
    debug.request.bodyLen = body?.length ?? 0;
    debug.request.locale = locale || null;
    debug.request.topic = topic_id || null; // Pre debug účely
    debug.request.scheduled_at = scheduled_at || null;

    if (!title?.trim() || !body?.trim() || !locale || !topic_id) {
      debug.error = {
        stage: 'validate',
        message: 'Missing required fields',
      };
      return sendDebug({
        success: false,
        message: 'Missing required fields: title, body, locale, and topic_id are required.',
      }, 400);
    }

    // Načítanie témy notifikácie
    const { data: topicData, error: topicErr } = await supabase
      .from('notification_topics')
      .select('id, slug, name_sk, is_active')
      .eq('id', topic_id)
      .single();

    if (topicErr || !topicData) {
      debug.error = {
        stage: 'validate',
        message: 'Invalid topic_id or topic not found',
      };
      return sendDebug({
        success: false,
        message: 'Neplatná téma notifikácie.',
      }, 404);
    }

    if (!topicData.is_active) {
      debug.error = {
        stage: 'validate',
        message: 'Topic is not active',
      };
      return sendDebug({
        success: false,
        message: 'Táto téma notifikácií nie je aktívna.',
      }, 400);
    }

    const topicSlug = topicData.slug;

    // Locale lookup
    const { data: localeData, error: localeErr } = await supabase
      .from('locales')
      .select('id')
      .eq('code', locale)
      .single();

    if (localeErr || !localeData) {
      debug.error = {
        stage: 'locale_lookup',
        message: localeErr?.message || 'Invalid locale code',
      };
      return sendDebug({ success: false, message: 'Invalid locale code' }, 404);
    }

    debug.supabase = debug.supabase || {};
    debug.supabase.localeLookupOk = true;
    debug.supabase.localeId = localeData.id;

    const isScheduled = !!(scheduled_at && new Date(scheduled_at) > new Date());
    debug.request.isScheduled = isScheduled;

    if (isScheduled) {
      const { error: insErr } = await supabase.from('scheduled_notifications').insert({
        title,
        body,
        locale_id: localeData.id,
        topic_id: topic_id, // UUID témy
        scheduled_at,
        status: 'pending',
        image_url: payload.image_url
      });

      debug.supabase.scheduledInsertOk = !insErr;

      if (insErr) {
        debug.error = { stage: 'schedule_insert', message: insErr.message };
        return sendDebug({ success: false, message: 'Failed to schedule notification.' }, 500);
      }

      return sendDebug({
        success: true,
        message: `Notification scheduled for ${new Date(scheduled_at).toLocaleString('sk-SK')}`,
      }, 200);
    }

    // Immediate send
    const result = await sendImmediateNotification({
      title,
      body,
      locale,
      topicSlug, // Používame slug namiesto UUID
      topic_id,  // UUID pre uloženie do logu
      locale_id: localeData.id,
      image_url: payload.image_url,
      // Deep linking fields
      screen: payload.screen,
      screen_params: payload.screen_params
    }, debug);

    return sendDebug(result, result.success ? 200 : 500);
  } catch (err: unknown) {
    const error = err as Error;
    debug.error = {
      stage: 'unknown',
      message: error?.message || 'Unknown error',
      stackTop: typeof error?.stack === 'string' ? error.stack.split('\n').slice(0, 2).join('\n') : undefined,
    };
    console.error('[send-notification] Uncaught', debug.reqId, err);
    return sendDebug({ success: false, message: 'Internal server error' }, 500);
  }
}

async function sendImmediateNotification(
  payload: {
    title: string;
    body: string;
    locale: string;
    topicSlug: string;  // Slug témy (napr. 'daily-readings')
    topic_id: string;   // UUID témy pre uloženie do logu
    locale_id: number;
    image_url?: string;
    // Deep linking fields
    screen?: string;
    screen_params?: string;
  },
  debug: DebugInfo
): Promise<SendResponse> {
  try {
    const { title, body, locale, topic_id, locale_id } = payload;

    // Získať FCM tokeny používateľov, ktorí majú danú tému povolenú
    const { data: subscribersData, error: subscribersError } = await supabase
      .from('user_notification_preferences')
      .select('user_id, is_enabled')
      .eq('topic_id', topic_id)
      .eq('is_enabled', true);

    if (subscribersError) {
      debug.error = {
        stage: 'fcm_send',
        message: `Failed to fetch subscribers: ${subscribersError.message}`
      };
      return {
        success: false,
        message: 'Chyba pri získavaní odberateľov',
      };
    }

    if (!subscribersData || subscribersData.length === 0) {
      return {
        success: true,
        message: 'Notifikácia nebola odoslaná - žiadni odberatelia tejto témy',
        sent_count: 0,
      };
    }

    const userIds = subscribersData.map((sub: { user_id: string }) => sub.user_id);

    // Získať aktívne FCM tokeny pre týchto používateľov s daným locale
    const { data: tokensData, error: tokensError } = await supabase
      .from('user_fcm_tokens')
      .select('token, user_id')
      .eq('is_active', true)
      .eq('locale_code', locale)
      .in('user_id', userIds);

    if (tokensError) {
      debug.error = {
        stage: 'fcm_send',
        message: `Failed to fetch FCM tokens: ${tokensError.message}`
      };
      return {
        success: false,
        message: 'Chyba pri získavaní FCM tokenov',
      };
    }

    if (!tokensData || tokensData.length === 0) {
      return {
        success: true,
        message: `Notifikácia nebola odoslaná - žiadne aktívne zariadenia pre jazyk ${locale}`,
        sent_count: 0,
      };
    }

    const fcmTokens = tokensData.map((t: { token: string }) => t.token);
    const subscriberCount = fcmTokens.length;
    
    debug.supabase = debug.supabase || {};
    debug.supabase.subscriberCount = subscriberCount;

    // Pripraviť dáta pre deep linking
    const notificationData: Record<string, string> = {
      locale,
      topic_id,
      timestamp: Date.now().toString(),
    };

    if (payload.image_url) {
      notificationData.image_url = payload.image_url;
    }
    if (payload.screen) {
      notificationData.screen = payload.screen;
    }
    if (payload.screen_params) {
      notificationData.screen_params = payload.screen_params;
    }

    debug.messaging = {
      payloadPreview: {
        notification: { title, body },
        dataKeys: Object.keys(notificationData),
      },
    };

    // Odoslať notifikácie pomocou sendPushNotification z firebase-admin.ts
    const result = await sendPushNotification(
      fcmTokens,
      { 
        title, 
        body
      },
      notificationData
    );

    debug.messaging.sendMessageId = `${result.successCount}/${fcmTokens.length} successful`;

    // Log do databázy
    const { error: logErr } = await supabase.from('notification_logs').insert({
      title,
      body,
      locale_id: locale_id,
      topic_id: topic_id,
      fcm_message_id: `${result.successCount}/${fcmTokens.length}`,
      subscriber_count: result.successCount,
      image_url: payload.image_url || null
    });

    debug.supabase.logInsertOk = !logErr;

    if (logErr) {
      debug.error = { stage: 'log_insert', message: logErr.message };
      // Nezlyhávaj celé odoslanie, len ohlás, že log zlyhal
      return {
        success: true,
        message: `Notification sent (log failed: ${logErr.message})`,
        sent_count: result.successCount,
      };
    }

    return {
      success: true,
      message: result.successCount === fcmTokens.length 
        ? 'Notifikácia úspešne odoslaná všetkým odberateľom'
        : `Notifikácia odoslaná ${result.successCount}/${fcmTokens.length} odberateľom`,
      sent_count: result.successCount,
    };
  } catch (err: unknown) {
    const error = err as Error;
    debug.error = {
      stage: 'fcm_send',
      message: error?.message || 'FCM send failed',
      stackTop: typeof error?.stack === 'string' ? error.stack.split('\n').slice(0, 2).join('\n') : undefined,
    };
    console.error('[send-notification] FCM error', debug.reqId, err);

    return {
      success: false,
      message: `Failed to send notification: ${error?.message || 'Unknown error'}`,
    };
  }
}

function isValidAdminToken(authHeader: string): boolean {
  const token = authHeader.split(' ')[1];
  const validTokens = process.env.ADMIN_TOKENS?.split(',') || [];
  return validTokens.includes(token);
}
