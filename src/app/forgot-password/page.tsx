// app/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabase = createPagesBrowserClient();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError('Nepodarilo sa odoslať email. Skontrolujte adresu.');
    } else {
      setMessage('Na váš email bol odoslaný odkaz na obnovenie hesla.');
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <main className="max-w-sm mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Zabudnuté heslo</h1>

      {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-100 text-green-800 p-2 rounded mb-4">{message}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Váš email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded font-semibold"
        >
          {loading ? 'Odosielam...' : 'Odoslať obnovovací email'}
        </button>
      </form>
    </main>
  );
}
