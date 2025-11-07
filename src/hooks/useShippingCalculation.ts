import { useEffect, useState } from 'react';

interface ShippingZone {
  id: string;
  name: string;
  price: number;
  free_threshold: number;
  delivery_days: string;
}

interface ShippingCalculation {
  zone: ShippingZone;
  cost: number;
  isFree: boolean;
  amountUntilFree: number;
}

/**
 * Hook to calculate shipping cost from database
 * Fetches real-time shipping zones and calculates cost
 */
export function useShippingCalculation(country: string, subtotal: number) {
  const [shipping, setShipping] = useState<ShippingCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!country) {
      setLoading(false);
      return;
    }

    const fetchShipping = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/shipping/calculate?country=${country}&subtotal=${subtotal}`
        );

        if (!response.ok) {
          throw new Error('Failed to calculate shipping');
        }

        const data = await response.json();
        setShipping(data);
      } catch (err) {
        console.error('Error calculating shipping:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate shipping');
        
        // Fallback to default zone
        setShipping({
          zone: {
            id: 'fallback',
            name: 'Standard Shipping',
            price: 5.99,
            free_threshold: 50,
            delivery_days: '3-7',
          },
          cost: subtotal >= 50 ? 0 : 5.99,
          isFree: subtotal >= 50,
          amountUntilFree: Math.max(0, 50 - subtotal),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShipping();
  }, [country, subtotal]);

  return { shipping, loading, error };
}
