// app/api/auth/callback/route.ts - OPRAVENÝ
import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Presmeruj na reset password stránku s tokenom
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  }

  // Presmeruj na error stránku ak niečo zlyhalo
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}