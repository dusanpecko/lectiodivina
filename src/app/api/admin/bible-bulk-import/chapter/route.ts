import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/bible-bulk-import/chapter - Load chapter data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale_id = searchParams.get('locale_id');
    const translation_id = searchParams.get('translation_id');
    const book_id = searchParams.get('book_id');
    const chapter = searchParams.get('chapter');

    // Validate required parameters
    if (!locale_id || !translation_id || !book_id || !chapter) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Chýbajúce povinné parametre: locale_id, translation_id, book_id, chapter' 
        },
        { status: 400 }
      );
    }

    console.log('📖 Loading chapter with params:', { locale_id, translation_id, book_id, chapter });

    // Load verses and reference data in parallel
    const [versesRes, localeRes, translationRes, bookRes] = await Promise.all([
      supabase
        .from('bible_verses')
        .select('id, locale_id, translation_id, book_id, chapter, text, created_at')
        .eq('locale_id', locale_id)
        .eq('translation_id', translation_id)
        .eq('book_id', book_id)
        .eq('chapter', parseInt(chapter))
        .order('created_at'),
      supabase
        .from('locales')
        .select('*')
        .eq('id', locale_id)
        .single(),
      supabase
        .from('translations')
        .select('*')
        .eq('id', translation_id)
        .single(),
      supabase
        .from('books')
        .select('*')
        .eq('id', book_id)
        .single()
    ]);

    // Check for errors
    if (versesRes.error) {
      console.error('❌ Error loading verses:', versesRes.error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri načítaní veršov: ${versesRes.error.message}` 
        },
        { status: 500 }
      );
    }
    if (localeRes.error) {
      console.error('❌ Error loading locale:', localeRes.error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri načítaní jazyka: ${localeRes.error.message}` 
        },
        { status: 500 }
      );
    }
    if (translationRes.error) {
      console.error('❌ Error loading translation:', translationRes.error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri načítaní prekladu: ${translationRes.error.message}` 
        },
        { status: 500 }
      );
    }
    if (bookRes.error) {
      console.error('❌ Error loading book:', bookRes.error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri načítaní knihy: ${bookRes.error.message}` 
        },
        { status: 500 }
      );
    }

    console.log('✅ Successfully loaded chapter:', versesRes.data?.length, 'verses');

    return NextResponse.json({
      success: true,
      data: {
        verses: versesRes.data || [],
        locale: localeRes.data,
        translation: translationRes.data,
        book: bookRes.data
      }
    });

  } catch (error) {
    console.error('💥 Exception in GET chapter:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Neznáma chyba pri načítaní kapitoly' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bible-bulk-import/chapter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale_id = searchParams.get('locale_id');
    const translation_id = searchParams.get('translation_id');
    const book_id = searchParams.get('book_id');
    const chapter = searchParams.get('chapter');

    // Validate required parameters
    if (!locale_id || !translation_id || !book_id || !chapter) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Chýbajúce povinné parametre: locale_id, translation_id, book_id, chapter' 
        },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting chapter with params:', { locale_id, translation_id, book_id, chapter });

    // Delete all verses for this chapter
    const { data, error } = await supabase
      .from('bible_verses')
      .delete()
      .eq('locale_id', locale_id)
      .eq('translation_id', translation_id)
      .eq('book_id', book_id)
      .eq('chapter', parseInt(chapter))
      .select();

    if (error) {
      console.error('❌ Supabase error deleting chapter:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri mazaní kapitoly: ${error.message}`,
          error: error 
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No verses found to delete');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nenašli sa žiadne verše na vymazanie. Kapitola možno už bola vymazaná.' 
        },
        { status: 404 }
      );
    }

    console.log('✅ Successfully deleted chapter:', data.length, 'verses');

    return NextResponse.json({
      success: true,
      message: `Kapitola bola úspešne vymazaná (${data.length} veršov)`,
      deletedCount: data.length
    });

  } catch (error) {
    console.error('💥 Exception in DELETE chapter:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Neznáma chyba pri mazaní kapitoly' 
      },
      { status: 500 }
    );
  }
}
