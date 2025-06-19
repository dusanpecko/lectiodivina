import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

type Props = {
  children: ReactNode;
};

export default async function PasswordResetLayout({ children }: Props) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Buď presmeruj na login, alebo zobraz chybu
    // redirect("/login");
    return (
      <div style={{ maxWidth: 400, margin: "auto", padding: 40, textAlign: "center" }}>
        <h2>Auth session missing!</h2>
        <p>
          Pre reset hesla musíte byť prihlásený cez reset link v emaili.<br />
          Skúste to znova, alebo si vyžiadajte nový email na obnovenie hesla.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}