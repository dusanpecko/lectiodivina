// app/auth/login/page.tsx
import { Suspense } from "react";
import PublicLoginPage from "./PublicLoginPage";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Načítavam prihlasovanie...</div>}>
      <PublicLoginPage />
    </Suspense>
  );
}
