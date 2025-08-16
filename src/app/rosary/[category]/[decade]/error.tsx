"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full mx-4">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Chyba pri načítaní tajomstva
        </h2>
        <p className="text-gray-600 mb-6">
          Niečo sa pokazilo pri načítaní tohto ruženec.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Skúsiť znovu
          </button>
          <button
            onClick={() => router.push('/rosary')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Späť na ruženec
          </button>
        </div>
      </div>
    </div>
  );
}