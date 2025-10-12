import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST - Registrovať FCM token pre používateľa
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Získať používateľa z auth headera
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Chýba autentifikácia' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Neplatný token' },
        { status: 401 }
      );
    }

    const { fcm_token, device_id, device_type, app_version } = await request.json();

    if (!fcm_token) {
      return NextResponse.json(
        { error: 'FCM token je povinný' },
        { status: 400 }
      );
    }

    // Upsert FCM token - ak existuje, aktualizuje sa, ak nie, vytvorí sa nový
    const { data, error } = await supabase
      .from('user_fcm_tokens')
      .upsert({
        user_id: user.id,
        token: fcm_token,
        device_id: device_id || null,
        device_type: device_type || 'unknown',
        app_version: app_version || null,
        is_active: true,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'token'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting FCM token:', error);
      return NextResponse.json(
        { error: 'Chyba pri registrácii FCM tokenu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'FCM token úspešne zaregistrovaný',
      token_id: data.id
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}

// DELETE - Odstrániť FCM token (napr. pri odhlásení)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Získať používateľa z auth headera
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Chýba autentifikácia' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Neplatný token' },
        { status: 401 }
      );
    }

    const { fcm_token } = await request.json();

    if (!fcm_token) {
      return NextResponse.json(
        { error: 'FCM token je povinný' },
        { status: 400 }
      );
    }

    // Označiť token ako neaktívny namiesto mazania
    const { error } = await supabase
      .from('user_fcm_tokens')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('token', fcm_token)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deactivating FCM token:', error);
      return NextResponse.json(
        { error: 'Chyba pri deaktivácii FCM tokenu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'FCM token úspešne deaktivovaný'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}

// GET - Získať FCM tokeny používateľa
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Získať používateľa z auth headera
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Chýba autentifikácia' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Neplatný token' },
        { status: 401 }
      );
    }

    const { data: tokens, error } = await supabase
      .from('user_fcm_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching FCM tokens:', error);
      return NextResponse.json(
        { error: 'Chyba pri načítaní FCM tokenov' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      tokens: tokens || []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}