'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AuthConfirmPage() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    if (!tokenHash || !type) {
      setMessage('Invalid confirmation link.');
      return;
    }

    async function confirm() {
      if (type === 'password_reset') {
        // Tu môžeš spraviť custom logiku, napr. zobraziť reset password form
        setMessage('Please reset your password using the app.');
      } else if (type === 'signup') {
        // napr. potvrdenie emailu
        setMessage('Your email has been confirmed.');
      } else {
        setMessage('Unknown confirmation type.');
      }
    }

    confirm();
  }, [tokenHash, type]);

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h1>Confirmation</h1>
      <p>{message}</p>
    </div>
  );
}
