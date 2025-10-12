import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - Získať detail témy
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const params = await context.params;
    const { id } = params;

    const { data: topic, error } = await supabase
      .from('notification_topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !topic) {
      return NextResponse.json(
        { error: 'Téma nebola nájdená' },
        { status: 404 }
      );
    }

    // Získať počet používateľov s touto témou
    const { count: subscriberCount } = await supabase
      .from('user_notification_preferences')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', id)
      .eq('is_enabled', true);

    return NextResponse.json({
      topic: {
        ...topic,
        subscriber_count: subscriberCount || 0,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}

// PUT - Upraviť tému
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const params = await context.params;
    const { id } = params;
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

    // Kontrola, či slug už neexistuje u inej témy
    const { data: existing } = await supabase
      .from('notification_topics')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Téma s týmto slug už existuje' },
        { status: 400 }
      );
    }

    const { data: topic, error } = await supabase
      .from('notification_topics')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating topic:', error);
      return NextResponse.json(
        { error: 'Chyba pri úprave témy' },
        { status: 500 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}

// DELETE - Zmazať tému
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const params = await context.params;
    const { id } = params;

    // Kontrola, či téma existuje
    const { data: topic } = await supabase
      .from('notification_topics')
      .select('is_default, name_sk')
      .eq('id', id)
      .single();

    if (!topic) {
      return NextResponse.json(
        { error: 'Téma nebola nájdená' },
        { status: 404 }
      );
    }

    // Zabránenie zmazaniu predvolenej témy
    if (topic.is_default) {
      return NextResponse.json(
        { error: 'Predvolenú tému nemožno zmazať' },
        { status: 400 }
      );
    }

    // Zmazanie témy (CASCADE automaticky zmaže aj user_notification_preferences)
    const { error } = await supabase
      .from('notification_topics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting topic:', error);
      return NextResponse.json(
        { error: 'Chyba pri mazaní témy' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Téma bola úspešne zmazaná',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Neočakávaná chyba' },
      { status: 500 }
    );
  }
}
