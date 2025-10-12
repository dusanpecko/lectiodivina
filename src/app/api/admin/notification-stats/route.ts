// src/app/api/admin/notification-stats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StatsResponse {
  total_sent: number;
  by_locale: Record<string, { count: number; name: string }>;
  by_topic: Record<string, number>;
  by_date: Record<string, number>;
}

export async function GET(request: Request) {
  // Basic admin authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !isValidAdminToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    
    // Validate required query parameters
    if (!start || !end) {
        return NextResponse.json({ error: 'Start and end dates are required query parameters' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('get_notification_stats', {
      start_date: start,
      end_date: end
    });
    
    if (error) {
      console.error('Error fetching notification stats:', error);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
    
    // Handle empty result
    const stats = data?.[0] || {
      total_sent: 0,
      by_locale: {},
      by_topic: {},
      by_date: {}
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in notification-stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function isValidAdminToken(authHeader: string): boolean {
  const token = authHeader.split(' ')[1];
  const validTokens = process.env.ADMIN_TOKENS?.split(',') || [];
  return validTokens.includes(token);
}
