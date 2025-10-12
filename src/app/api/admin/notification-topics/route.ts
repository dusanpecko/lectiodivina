import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Získať všetky témy
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('notification_topics')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: topics, error } = await query;

    if (error) {
      console.error('Error fetching topics:', error);
      return NextResponse.json(
        { error: 'Chyba pri načítaní tém' },
        { status: 500 }
      );
    }

    // Pridať počet odberateľov pre každú tému
    const topicsWithSubscriberCount = await Promise.all(
      (topics || []).map(async (topic) => {
        const { count: subscriberCount } = await supabase
          .from('user_notification_preferences')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id)
          .eq('is_enabled', true);

        return {
          ...topic,
          subscriber_count: subscriberCount || 0,
        };
      })
    );

    return NextResponse.json({ topics: topicsWithSubscriberCount });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}

// POST - Vytvoriť novú tému
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
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
      is_active,
      is_default,
      display_order,
      category,
    } = body;

    // Validácia povinných polí
    if (!name_sk || !slug) {
      return NextResponse.json(
        { error: 'Slovenský názov a slug sú povinné' },
        { status: 400 }
      );
    }

    // Kontrola, či slug už neexistuje
    const { data: existing } = await supabase
      .from('notification_topics')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Téma s týmto slug už existuje' },
        { status: 400 }
      );
    }

    const { data: topic, error } = await supabase
      .from('notification_topics')
      .insert({
        name_sk,
        name_en,
        name_cs,
        name_es,
        slug,
        description_sk,
        description_en,
        description_cs,
        description_es,
        icon: icon || 'bell',
        color: color || '#4A5085',
        is_active: is_active !== undefined ? is_active : true,
        is_default: is_default || false,
        display_order: display_order || 0,
        category: category || 'other',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating topic:', error);
      return NextResponse.json(
        { error: 'Chyba pri vytváraní témy' },
        { status: 500 }
      );
    }

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}
