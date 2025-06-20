// app/auth/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Session } from "@supabase/supabase-js";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PublicLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg === "password_updated") {
      setMessage("Heslo bolo úspešne zmenené. Môžete sa prihlásiť.");
    }

    // kontrola existujúcej session
    supabase.auth.getSession().then(({ data, error }) => {
      if (data?.session) {
        setSession(data.session);
        router.replace("/"); // presmeruj ak už prihlásený
      }
    });
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/"); // alebo napr. '/dashboard'
    }
    setLoading(false);
  };

  return (
    <main className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Prihlásenie</h1>

      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          className="border px-3 py-2 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Heslo"
          value={password}
          className="border px-3 py-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          {loading ? "Prihlasujem..." : "Prihlásiť sa"}
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>

      <div className="mt-4 text-sm text-center text-gray-600">
        <p>
          Zabudli ste heslo?{' '}
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Obnoviť heslo
          </Link>
        </p>
        <p className="mt-2">
          Nemáte účet?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Zaregistrovať sa
          </Link>
        </p>
      </div>
    </main>
  );
}