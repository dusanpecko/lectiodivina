import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ParsedVerse {
  verse: number;
  text: string;
}

interface BulkImportRequest {
  locale_id: number;
  translation_id: number;
  book_id: number;
  chapter: number;
  verses: ParsedVerse[];
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  skippedCount?: number;
  errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse<ImportResult>> {
  try {
    const body: BulkImportRequest = await request.json();
    
    // Validate request body
    const { locale_id, translation_id, book_id, chapter, verses } = body;
    
    if (!locale_id || !translation_id || !book_id || !chapter || !verses || verses.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Chýbajú povinné parametre pre import.',
      }, { status: 400 });
    }

    // Validate that all verse numbers are positive
    const invalidVerses = verses.filter(v => v.verse <= 0 || !v.text.trim());
    if (invalidVerses.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Všetky verše musia mať platné číslo verša (väčšie ako 0) a neprázdny text.',
        errors: invalidVerses.map(v => `Verš ${v.verse}: neplatné údaje`),
      }, { status: 400 });
    }

    // Validate that locale, translation and book exist and are active
    const [localeResult, translationResult, bookResult] = await Promise.all([
      supabase
        .from('locales')
        .select('id, is_active')
        .eq('id', locale_id)
        .eq('is_active', true)
        .single(),
      
      supabase
        .from('translations')
        .select('id, locale_id, is_active')
        .eq('id', translation_id)
        .eq('is_active', true)
        .single(),
      
      supabase
        .from('books')
        .select('id, locale_id, is_active')
        .eq('id', book_id)
        .eq('is_active', true)
        .single()
    ]);

    if (localeResult.error || !localeResult.data) {
      return NextResponse.json({
        success: false,
        message: 'Zadaná lokalita nebola nájdená alebo nie je aktívna.',
      }, { status: 400 });
    }

    if (translationResult.error || !translationResult.data) {
      return NextResponse.json({
        success: false,
        message: 'Zadaný preklad nebol nájdený alebo nie je aktívny.',
      }, { status: 400 });
    }

    if (bookResult.error || !bookResult.data) {
      return NextResponse.json({
        success: false,
        message: 'Zadaná kniha nebola nájdená alebo nie je aktívna.',
      }, { status: 400 });
    }

    // Validate that translation belongs to the locale
    if (translationResult.data.locale_id !== locale_id) {
      return NextResponse.json({
        success: false,
        message: 'Preklad nepatrí k zadanej lokalite.',
      }, { status: 400 });
    }

    // Validate that book belongs to the locale
    if (bookResult.data.locale_id !== locale_id) {
      return NextResponse.json({
        success: false,
        message: 'Kniha nepatrí k zadanej lokalite.',
      }, { status: 400 });
    }

    // Check for existing verses to avoid duplicates
    const existingVersesQuery = await supabase
      .from('bible_verses')
      .select('verse')
      .eq('locale_id', locale_id)
      .eq('translation_id', translation_id)
      .eq('book_id', book_id)
      .eq('chapter', chapter);

    const existingVerses = new Set(
      existingVersesQuery.data?.map(v => v.verse) || []
    );

    // Filter out duplicates
    const newVerses = verses.filter(v => !existingVerses.has(v.verse));
    const skippedVerses = verses.filter(v => existingVerses.has(v.verse));

    if (newVerses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Všetky verše už existujú v databáze.',
        importedCount: 0,
        skippedCount: skippedVerses.length,
      });
    }

    // Prepare data for bulk insert
    const versesToInsert = newVerses.map(verse => ({
      locale_id,
      translation_id,
      book_id,
      chapter,
      verse: verse.verse,
      text: verse.text.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Perform bulk insert
    const insertResult = await supabase
      .from('bible_verses')
      .insert(versesToInsert);

    if (insertResult.error) {
      console.error('Database insert error:', insertResult.error);
      return NextResponse.json({
        success: false,
        message: 'Chyba pri vkladaní veršov do databázy.',
        errors: [insertResult.error.message],
      }, { status: 500 });
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `Úspešne importované ${newVerses.length} veršov do bible_verses tabuľky.`,
      importedCount: newVerses.length,
      skippedCount: skippedVerses.length,
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({
      success: false,
      message: 'Nastala neočakávaná chyba pri importe.',
      errors: [error instanceof Error ? error.message : 'Neznáma chyba'],
    }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Metóda GET nie je podporovaná. Použite POST pre bulk import.',
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    message: 'Metóda PUT nie je podporovaná. Použite POST pre bulk import.',
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    message: 'Metóda DELETE nie je podporovaná. Použite POST pre bulk import.',
  }, { status: 405 });
}