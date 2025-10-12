// JEDNODUCHÝ: src/app/api/auth/callback/route.ts
// Len redirect bez komplexného spracovania

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error_code = requestUrl.searchParams.get('error_code');
  const error_description = requestUrl.searchParams.get('error_description');

  console.log('\n=== SIMPLE CALLBACK START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Full URL:', requestUrl.toString());
  console.log('Code parameter:', code ? `Found (${code.substring(0, 10)}...)` : 'Not found');
  console.log('Error code:', error_code);
  console.log('Error description:', error_description);

  // Ak je chyba z Supabase
  if (error_code) {
    console.log('❌ Supabase returned error');
    const errorUrl = `${requestUrl.origin}/auth/reset-password?error=supabase_error&message=${encodeURIComponent(error_description || error_code)}`;
    console.log('🔀 Redirecting to error page:', errorUrl);
    return NextResponse.redirect(errorUrl);
  }

  // Ak máme code, presmerujeme na reset password s kódom
  if (code) {
    console.log('✅ Code found, redirecting to reset password page');
    const resetUrl = `${requestUrl.origin}/auth/reset-password?code=${code}`;
    console.log('🔀 Redirecting to reset page:', resetUrl);
    console.log('=== SIMPLE CALLBACK SUCCESS ===\n');
    return NextResponse.redirect(resetUrl);
  }

  // Ak nie je ani code ani error
  console.log('❌ No code or error parameters');
  const errorUrl = `${requestUrl.origin}/auth/reset-password?error=no_code`;
  console.log('🔀 Redirecting to no code page:', errorUrl);
  console.log('=== SIMPLE CALLBACK NO PARAMS ===\n');
  
  return NextResponse.redirect(errorUrl);
}