import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient(); // už nie je potrebné await!
  const url = new URL(req.url);

  // Získaj token_hash a type z URL
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const redirectUrl = url.searchParams.get("redirectUrl") || "/reset-password";

  if (!token_hash || type !== "email") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Over token_hash cez Supabase
  const {
    data: { session },
    error,
  } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // (Optional) Tu už cookies nastavuje Supabase automaticky cez SSR client.
  // Ak potrebuješ custom redirect s cookies, môžeš to spracovať tu.

  // Presmeruj na stránku pre nastavenie nového hesla
  return NextResponse.redirect(redirectUrl);
}