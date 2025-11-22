import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Server-side Supabase client s service role (môže bypassovať RLS)
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
    const { email, password, fullName } = await request.json();

    // Validácia
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Najprv skontroluj, či používateľ už existuje v auth.users
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers();
    const authUserExists = existingAuthUser?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (authUserExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Skontroluj aj v users tabuľke
    const { data: existingDbUser } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingDbUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Použijeme admin API na vytvorenie používateľa s potvrdeným emailom
    console.log('Step 1: Creating auth user with admin API...');
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error('=== AUTH CREATE ERROR ===');
      console.error('Full error object:', authError);
      console.error('Message:', authError.message);
      console.error('Status:', authError.status);
      
      // Špeciálne ošetrenie pre "Database error"
      if (authError.message?.includes('Database error')) {
        console.log('Database error detected - this might be a trigger/RLS issue');
        console.log('Attempting alternative registration method...');
        
        // Skús vytvoriť používateľa bez triggera pomocou signUp
        const { data: altAuthData, error: altAuthError } = await supabaseAdmin.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (altAuthError) {
          console.error('Alternative method also failed:', altAuthError);
          return NextResponse.json(
            { error: 'Failed to create account. Please contact support.' },
            { status: 500 }
          );
        }

        if (altAuthData?.user) {
          console.log('Alternative method succeeded! User ID:', altAuthData.user.id);
          
          // Manuálne potvrď email
          await supabaseAdmin.auth.admin.updateUserById(altAuthData.user.id, {
            email_confirm: true
          });

          // Vytvor DB záznam
          await supabaseAdmin.from('users').upsert({
            id: altAuthData.user.id,
            email: altAuthData.user.email!,
            full_name: fullName || email.split('@')[0],
            role: 'user',
            provider: 'email'
          });

          return NextResponse.json({
            success: true,
            message: 'User registered successfully',
            userId: altAuthData.user.id
          });
        }
      }
      
      if (authError.message?.includes('already')) {
        return NextResponse.json(
          { error: 'Email is already registered' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    console.log('Step 2: Auth user created successfully:', authData.user?.id);

    if (!authData?.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Počkaj na propagáciu do databázy
    await new Promise(resolve => setTimeout(resolve, 800));

    // Skontroluj, či trigger vytvoril záznam
    const checkUser = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .maybeSingle();

    console.log('Check user result:', checkUser);

    // Ak trigger nevytvoril záznam, vytvor ho manuálne pomocou UPSERT
    if (!checkUser.data) {
      console.log('Creating user record manually...');
      
      const userRecord = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName || authData.user.email?.split('@')[0] || 'User',
        role: 'user',
        provider: 'email',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('User record to insert:', userRecord);

      const { data: insertedUser, error: dbError } = await supabaseAdmin
        .from('users')
        .upsert(userRecord, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      console.log('Insert result:', { insertedUser, dbError });

      if (dbError && dbError.code !== '23505') {
        console.error('Database insert error:', dbError);
        console.error('Error code:', dbError.code);
        console.error('Error details:', dbError.details);
        console.error('Error hint:', dbError.hint);
        
        // Aj s DB chybou, auth používateľ je vytvorený, tak vrátime success
        console.warn('Continuing despite database error - auth user created successfully');
      }
    } else {
      console.log('User record already exists (created by trigger)');
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
