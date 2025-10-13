import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/bible-bulk-import/list - Load verses with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale_id = searchParams.get('locale_id');
    const translation_id = searchParams.get('translation_id');
    const book_id = searchParams.get('book_id');
    const chapter = searchParams.get('chapter');
    const search = searchParams.get('search');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '1000');

    console.log('📋 Loading verses list with filters:', { 
      locale_id, translation_id, book_id, chapter, search, offset, limit 
    });

    // Build base query
    let query = supabase
      .from('bible_verses')
      .select('locale_id, translation_id, book_id, chapter, text, created_at');

    // Apply filters
    if (locale_id) {
      query = query.eq('locale_id', locale_id);
    }
    if (translation_id) {
      query = query.eq('translation_id', translation_id);
    }
    if (book_id) {
      query = query.eq('book_id', book_id);
    }
    if (chapter) {
      query = query.eq('chapter', parseInt(chapter));
    }
    if (search) {
      query = query.ilike('text', `%${search}%`);
    }

    // Apply pagination
    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('locale_id')
      .order('translation_id')
      .order('book_id')
      .order('chapter');

    if (error) {
      console.error('❌ Supabase error loading verses:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri načítaní dát: ${error.message}`,
          error: error 
        },
        { status: 500 }
      );
    }

    console.log('✅ Loaded verses batch:', data?.length || 0);

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      hasMore: data && data.length === limit
    });

  } catch (error) {
    console.error('💥 Exception in GET verses list:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Neznáma chyba pri načítaní veršov' 
      },
      { status: 500 }
    );
  }
}
