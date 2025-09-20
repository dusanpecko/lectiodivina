import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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
  topic: 'regular' | 'occasional';
  scheduled_at?: string;
  image_url?: string;
}

interface SendResponse {
  success: boolean;
  message: string;
  sent_count?: number;
  debugInfo?: DebugInfo;
}

// Initialize Firebase Admin SDK (if not already initialized)
// Kontrola, či admin.apps.length existuje, aby sa predišlo chybe pri prvom spustení v App Routeri
if (typeof window === 'undefined' && !admin.apps.length) {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
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
    const { title, body, locale, topic, scheduled_at } = payload || {};
    debug.request.titleLen = title?.length ?? 0;
    debug.request.bodyLen = body?.length ?? 0;
    debug.request.locale = locale || null;
    debug.request.topic = topic || null;
    debug.request.scheduled_at = scheduled_at || null;

    if (!title?.trim() || !body?.trim() || !locale || !topic) {
      debug.error = {
        stage: 'validate',
        message: 'Missing required fields',
      };
      return sendDebug({
        success: false,
        message: 'Missing required fields: title, body, locale, and topic are required.',
      }, 400);
    }

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
        topic,
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
      topic,
      locale_id: localeData.id,
      image_url: payload.image_url
    }, debug);

    return sendDebug(result, result.success ? 200 : 500);
  } catch (err: any) {
    debug.error = {
      stage: 'unknown',
      message: err?.message || 'Unknown error',
      code: err?.code,
      stackTop: typeof err?.stack === 'string' ? err.stack.split('\n').slice(0, 2).join('\n') : undefined,
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
    topic: string;
    locale_id: number;
    image_url?: string; 
  },
  debug: DebugInfo
): Promise<SendResponse> {
  try {
    const { title, body, locale, topic, locale_id } = payload;

    const topicName = `${topic}-${locale}`; // e.g., regular-sk
    debug.messaging = {
      topicName,
      payloadPreview: {
        notification: { title, body },
        dataKeys: ['locale', 'topic', 'timestamp'],
        apns: true,
        android: true,
      },
    };

    const message: admin.messaging.Message = {
      notification: { title, body, imageUrl: payload.image_url },
      data: {
        locale,
        topic,
        timestamp: Date.now().toString(),
        image_url: payload.image_url || ''
      },
      topic: topicName,
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            badge: 1,
            sound: 'default',
            'mutable-content': payload.image_url ? 1 : 0
          },
        },
        fcmOptions: payload.image_url ? { imageUrl: payload.image_url } : undefined
      },
      android: {
        notification: {
          title,
          body,
          icon: 'ic_notification',
          color: '#4A5085',
          sound: 'default',
          channelId: 'lectio_divina_notifications',
          imageUrl: payload.image_url
        },
        priority: 'high',
      },
    };

    // Send to FCM
    const response = await admin.messaging().send(message);
    debug.messaging.sendMessageId = response;

    // Count subscribers for the topic
    const { count } = await supabase
      .from('push_tokens')
      .select('*', { count: 'exact', head: true })
      .contains('topics', [topicName]); // topics je array(JSON)

    const subscriberCount = count || 0;
    debug.supabase = debug.supabase || {};
    debug.supabase.subscriberCount = subscriberCount;

    // Log to DB
    const { error: logErr } = await supabase.from('notification_logs').insert({
      title,
      body,
      locale_id,
      topic,
      fcm_message_id: response,
      subscriber_count: subscriberCount,
      image_url: payload.image_url
    });

    debug.supabase.logInsertOk = !logErr;

    if (logErr) {
      debug.error = { stage: 'log_insert', message: logErr.message };
      // Nezlyhávaj celé odoslanie, len ohlás, že log zlyhal
      return {
        success: true,
        message: `Notification sent (log failed: ${logErr.message})`,
        sent_count: subscriberCount,
      };
    }

    return {
      success: true,
      message: 'Notification sent successfully',
      sent_count: subscriberCount,
    };
  } catch (err: any) {
    debug.error = {
      stage: 'fcm_send',
      message: err?.message || 'FCM send failed',
      code: err?.code || err?.errorInfo?.code,
      stackTop: typeof err?.stack === 'string' ? err.stack.split('\n').slice(0, 2).join('\n') : undefined,
    };
    console.error('[send-notification] FCM error', debug.reqId, err);

    return {
      success: false,
      message: `Failed to send notification: ${err?.message || 'Unknown error'}`,
    };
  }
}

function isValidAdminToken(authHeader: string): boolean {
  const token = authHeader.split(' ')[1];
  const validTokens = process.env.ADMIN_TOKENS?.split(',') || [];
  return validTokens.includes(token);
}
