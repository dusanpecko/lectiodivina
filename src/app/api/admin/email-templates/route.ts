import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * GET /api/admin/email-templates
 * Fetch all email templates
 */
export async function GET(request: NextRequest) {
  try {
    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // Fetch templates
    let query = supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error in GET /api/admin/email-templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email-templates
 * Create a new email template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.template_key || !body.name || !body.category || !body.subject_sk || !body.body_sk) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert template
    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .insert({
        template_key: body.template_key,
        name: body.name,
        description: body.description,
        category: body.category,
        subject_sk: body.subject_sk,
        subject_en: body.subject_en,
        subject_cz: body.subject_cz,
        subject_es: body.subject_es,
        body_sk: body.body_sk,
        body_en: body.body_en,
        body_cz: body.body_cz,
        body_es: body.body_es,
        available_variables: body.available_variables || [],
        from_email: body.from_email || 'noreply@lectiodivina.org',
        from_name: body.from_name || 'Lectio Divina',
        reply_to: body.reply_to,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/email-templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
