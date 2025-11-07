import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, slug, price, stock, category, images, is_active } = body;

    // Validate required fields
    if (!name?.sk || !description?.sk || !slug || !price || stock === undefined || !category) {
      return NextResponse.json(
        { error: 'Chýbajú povinné polia' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Produkt s týmto slug už existuje' },
        { status: 400 }
      );
    }

    // Insert product
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        slug,
        price,
        stock,
        category,
        images: images || [],
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
