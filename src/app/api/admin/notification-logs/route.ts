import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Tajný bezpečnostný kód pre mazanie notifikácií
// Môžete zmeniť alebo nastaviť cez ENV variable
const DELETE_SECURITY_CODE = process.env.NOTIFICATION_DELETE_CODE || '587321';

function isValidAdminToken(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const token = authHeader.split(' ')[1];
  const validTokens = process.env.ADMIN_TOKENS?.split(',') || [];
  return validTokens.includes(token);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!isValidAdminToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Získame notifikácie
    const { data: logsData, error: logsError, count } = await supabase
      .from('notification_logs')
      .select('*', { count: 'exact' })
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (logsError) {
      console.error('Error fetching notification logs:', logsError);
      // Ak tabuľka neexistuje, vrátime prázdny zoznam namiesto chyby
      if (logsError.code === '42P01') {
        return NextResponse.json({ logs: [], total: 0 });
      }
      return NextResponse.json({ error: 'Failed to fetch logs', details: logsError.message }, { status: 500 });
    }

    // Ak nemáme žiadne dáta, vrátime prázdny zoznam
    if (!logsData || logsData.length === 0) {
      return NextResponse.json({ logs: [], total: 0 });
    }

    // Získame locale informácie pre všetky notifikácie
    const localeIds = [...new Set(logsData.map(log => log.locale_id).filter(Boolean))];
    const { data: localesData } = await supabase
      .from('locales')
      .select('id, name, code')
      .in('id', localeIds);

    // Získame témy notifikácií
    const topicIds = [...new Set(logsData.map(log => log.topic_id).filter(Boolean))];
    const { data: topicsData } = await supabase
      .from('notification_topics')
      .select('id, name_sk')
      .in('id', topicIds);

    // Vytvoríme mapy
    const localesMap = new Map(localesData?.map(l => [l.id, l]) || []);
    const topicsMap = new Map(topicsData?.map(t => [t.id, t]) || []);

    // Transformujeme dáta pre frontend
    const logs = logsData.map(log => {
      const locale = localesMap.get(log.locale_id);
      const topic = topicsMap.get(log.topic_id);
      return {
        id: log.id,
        title: log.title,
        body: log.body,
        topic_name: topic?.name_sk || 'Neznáma téma',
        fcm_message_id: log.fcm_message_id,
        subscriber_count: log.subscriber_count,
        image_url: log.image_url,
        created_at: log.sent_at, // V databáze je stĺpec sent_at
        locale_name: locale?.name || 'Neznámy',
        locale_code: locale?.code || ''
      };
    });

    return NextResponse.json({
      logs,
      total: count || 0
    });
  } catch (error: any) {
    console.error('Error in notification-logs API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!isValidAdminToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, securityCode } = await request.json();

    // Overenie bezpečnostného kódu
    if (securityCode !== DELETE_SECURITY_CODE) {
      return NextResponse.json({ error: 'Nesprávny bezpečnostný kód' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notification_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification log:', error);
      return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Notifikácia bola úspešne vymazaná' });
  } catch (error) {
    console.error('Error in DELETE notification-logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
