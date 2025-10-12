import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Získať nastavenia notifikácií pre používateľa
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

    // Verifikácia JWT tokenu
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Neplatný token' },
        { status: 401 }
      );
    }

    // Získať všetky aktívne témy s preferencami používateľa
    const { data: topicsWithPreferences, error } = await supabase
      .from('notification_topics')
      .select(`
        id,
        name_sk,
        name_en,
        name_cs,
        name_es,
        slug,
        description_sk,
        description_en,
        description_cs,
        description_es,
        icon,
        color,
        is_default,
        category,
        display_order,
        user_notification_preferences!inner(
          is_enabled,
          created_at
        )
      `)
      .eq('is_active', true)
      .eq('user_notification_preferences.user_id', user.id)
      .order('display_order');

    // Získať aj témy, na ktoré používateľ nie je prihlásený
    const { data: allActiveTopics, error: allTopicsError } = await supabase
      .from('notification_topics')
      .select(`
        id,
        name_sk,
        name_en,
        name_cs,
        name_es,
        slug,
        description_sk,
        description_en,
        description_cs,
        description_es,
        icon,
        color,
        is_default,
        category,
        display_order
      `)
      .eq('is_active', true)
      .order('display_order');

    if (allTopicsError) {
      console.error('Error fetching all topics:', allTopicsError);
      return NextResponse.json(
        { error: 'Chyba pri načítaní tém' },
        { status: 500 }
      );
    }

    // Spojiť údaje - vytvorí kompletný zoznam tém s informáciou o prihlásení
    const userPreferences = new Map();
    if (topicsWithPreferences) {
      topicsWithPreferences.forEach((topic: any) => {
        userPreferences.set(topic.id, {
          is_enabled: topic.user_notification_preferences[0]?.is_enabled || false,
          subscribed_at: topic.user_notification_preferences[0]?.created_at
        });
      });
    }

    const result = allActiveTopics.map(topic => ({
      ...topic,
      is_subscribed: userPreferences.has(topic.id),
      is_enabled: userPreferences.get(topic.id)?.is_enabled || false,
      subscribed_at: userPreferences.get(topic.id)?.subscribed_at || null
    }));

    return NextResponse.json({ 
      topics: result || [],
      total_subscribed: userPreferences.size
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}

// POST - Upraviť nastavenia notifikácií
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

    const { topic_id, is_enabled } = await request.json();

    if (!topic_id) {
      return NextResponse.json(
        { error: 'ID témy je povinné' },
        { status: 400 }
      );
    }

    // Overenie, že téma existuje a je aktívna
    const { data: topic, error: topicError } = await supabase
      .from('notification_topics')
      .select('id')
      .eq('id', topic_id)
      .eq('is_active', true)
      .single();

    if (topicError || !topic) {
      return NextResponse.json(
        { error: 'Téma nebola nájdená alebo nie je aktívna' },
        { status: 404 }
      );
    }

    if (is_enabled) {
      // Prihlásiť sa na tému alebo povoliť existujúce nastavenie
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          topic_id,
          is_enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,topic_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error subscribing to topic:', error);
        return NextResponse.json(
          { error: 'Chyba pri prihlásení na tému' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Úspešne ste sa prihlásili na tému',
        preference: data
      });
    } else {
      // Odhlásiť sa z témy (nastaviť is_enabled na false)
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          topic_id,
          is_enabled: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,topic_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error unsubscribing from topic:', error);
        return NextResponse.json(
          { error: 'Chyba pri odhlásení z témy' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        message: 'Úspešne ste sa odhlásili z témy',
        preference: data
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}