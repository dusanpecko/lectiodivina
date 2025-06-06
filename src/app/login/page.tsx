"use client";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session !== undefined && session) {
      router.replace("/admin");
    }
  }, [session, router]);

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center">Načítavam…</div>;
  }
  if (session) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
  };

  return (
    <main className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prihlásenie do administrácie</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          className="border px-3 py-2 rounded"
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Heslo"
          value={password}
          className="border px-3 py-2 rounded"
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          Prihlásiť sa
        </button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </main>
  );
}
