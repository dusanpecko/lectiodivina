import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH /api/admin/bible-bulk-import/verse - Update a verse
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, text } = body;

    // Validate required parameters
    if (!id || !text) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Chýbajúce povinné parametre: id, text' 
        },
        { status: 400 }
      );
    }

    // Validate text is not empty
    if (text.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Text verša nemôže byť prázdny' 
        },
        { status: 400 }
      );
    }

    console.log('✏️ Updating verse:', { id, textLength: text.length });

    // Update the verse
    const { data, error } = await supabase
      .from('bible_verses')
      .update({ text: text.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error updating verse:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri aktualizácii verša: ${error.message}`,
          error: error 
        },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn('⚠️ Verse not found');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Verš sa nenašiel v databáze' 
        },
        { status: 404 }
      );
    }

    console.log('✅ Successfully updated verse');

    return NextResponse.json({
      success: true,
      message: 'Verš bol úspešne aktualizovaný',
      data: data
    });

  } catch (error) {
    console.error('💥 Exception in PATCH verse:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Neznáma chyba pri aktualizácii verša' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bible-bulk-import/verse - Delete a verse
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate required parameters
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Chýbajúci povinný parameter: id' 
        },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting verse:', id);

    // Delete the verse
    const { data, error } = await supabase
      .from('bible_verses')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error deleting verse:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: `Chyba pri mazaní verša: ${error.message}`,
          error: error 
        },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn('⚠️ Verse not found');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Verš sa nenašiel v databáze' 
        },
        { status: 404 }
      );
    }

    console.log('✅ Successfully deleted verse');

    return NextResponse.json({
      success: true,
      message: 'Verš bol úspešne vymazaný',
      data: data
    });

  } catch (error) {
    console.error('💥 Exception in DELETE verse:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Neznáma chyba pri mazaní verša' 
      },
      { status: 500 }
    );
  }
}
