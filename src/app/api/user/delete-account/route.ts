import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/user/delete-account
 * 
 * Bezpečne vymaže používateľský účet vrátane:
 * - Všetkých dát používateľa z databázy (cascade delete)
 * - Supabase Auth účtu
 * - FCM tokenov
 * - Notification preferences
 * - Notes
 * 
 * POŽIADAVKY:
 * - Autorizácia: Bearer token v Authorization header
 * - User musí byť prihlásený
 * 
 * BEZPEČNOSŤ:
 * - Používa service role key pre admin operácie
 * - Validuje že user vymazáva svoj vlastný účet
 * - Soft delete možnosť (zakomentované)
 */

// Initialize Supabase admin client (server-side only!)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key - never expose to client!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function DELETE(request: NextRequest) {
  try {
    // 1. Získaj authorization token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Validuj token a získaj user ID
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log(`🗑️ Delete account request for user: ${userId}`);

    // 3. Get user's avatar URL before deletion
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    // 4. SOFT DELETE OPTION (zakomentované - ak chceš obnoviť účty)
    // await supabaseAdmin
    //   .from('users')
    //   .update({ 
    //     deleted_at: new Date().toISOString(),
    //     email: `deleted_${userId}@deleted.com` // anonymizuj email
    //   })
    //   .eq('id', userId);

    // 5. Delete avatar from storage if exists
    if (userData?.avatar_url) {
      try {
        const fileName = userData.avatar_url.split('/').pop();
        if (fileName) {
          await supabaseAdmin.storage
            .from('avatars')
            .remove([`avatars/${fileName}`]);
          console.log(`✅ Avatar deleted: ${fileName}`);
        }
      } catch (storageError) {
        console.warn('Error deleting avatar:', storageError);
        // Continue anyway - not critical
      }
    }

    // 6. Vymaž všetky závislé záznamy (v správnom poradí kvôli foreign keys)
    
    // Vymaž FCM tokeny
    const { error: fcmError } = await supabaseAdmin
      .from('user_fcm_tokens')
      .delete()
      .eq('user_id', userId);
    
    if (fcmError) {
      console.warn('Error deleting FCM tokens:', fcmError);
      // Continue anyway - not critical
    }

    // Vymaž notification preferences
    const { error: prefsError } = await supabaseAdmin
      .from('user_notification_preferences')
      .delete()
      .eq('user_id', userId);
    
    if (prefsError) {
      console.warn('Error deleting notification preferences:', prefsError);
      // Continue anyway
    }

    // Vymaž poznámky
    const { error: notesError } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('user_id', userId);
    
    if (notesError) {
      console.warn('Error deleting notes:', notesError);
      // Continue anyway
    }

    // Vymaž modlitebné úmysly (ak má user nejaké)
    const { error: intentionsError } = await supabaseAdmin
      .from('intentions')
      .delete()
      .eq('user_id', userId);
    
    if (intentionsError) {
      console.warn('Error deleting intentions:', intentionsError);
      // Continue anyway
    }

    // 7. Vymaž hlavný user záznam z users tabuľky
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Error deleting user record:', userError);
      return NextResponse.json(
        { 
          error: 'Failed to delete user data',
          details: userError.message 
        },
        { status: 500 }
      );
    }

    // 8. Vymaž Supabase Auth účet (KRITICKÉ - toto ho definitívne vymaže)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      
      // User data už sú vymazané, ale auth účet zostal
      // Informuj klienta o čiastočnom úspechu
      return NextResponse.json(
        { 
          warning: 'User data deleted but auth account deletion failed',
          details: authDeleteError.message,
          dataDeleted: true,
          authDeleted: false
        },
        { status: 207 } // 207 Multi-Status
      );
    }

    console.log(`✅ User ${userId} successfully deleted (data + auth)`);

    // 9. Úspech!
    return NextResponse.json(
      {
        success: true,
        message: 'Account successfully deleted',
        userId,
        deletedAt: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error in delete-account:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS pre CORS (ak potrebuješ)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
