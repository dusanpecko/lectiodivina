import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !isValidAdminToken(authHeader)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await context.params;
    const { id } = params;
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('scheduled_notifications')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating scheduled notification:', error);
      return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in scheduled-notifications PATCH:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function isValidAdminToken(authHeader: string): boolean {
  const token = authHeader.split(' ')[1];
  const validTokens = process.env.ADMIN_TOKENS?.split(',') || [];
  return validTokens.includes(token);
}
