import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  locale_name: string;
  topic_name: string; // Názov témy (name_sk)
  topic_id: string; // UUID témy
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

export async function GET(request: Request) {
  // Basic admin authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !isValidAdminToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('scheduled_notifications')
      .select(`
        *,
        locales(name),
        notification_topics(name_sk)
      `)
      .order('scheduled_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching scheduled notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch scheduled notifications' }, { status: 500 });
    }

    const notifications: ScheduledNotification[] = (data || []).map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      locale_name: notification.locales?.name || 'Unknown',
      topic_name: notification.notification_topics?.name_sk || 'Unknown',
      topic_id: notification.topic_id,
      scheduled_at: notification.scheduled_at,
      status: notification.status,
      created_at: notification.created_at,
      sent_at: notification.sent_at,
      error_message: notification.error_message
    }));

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error in scheduled-notifications GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function isValidAdminToken(authHeader: string): boolean {
  const token = authHeader.split(' ')[1];
  const validTokens = process.env.ADMIN_TOKENS?.split(',') || [];
  return validTokens.includes(token);
}
