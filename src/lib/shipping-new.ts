// Global shipping zones configuration
// NOTE: This is now stored in database (shipping_zones table)
// These types are kept for TypeScript compatibility

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  price: number;
  free_threshold: number;
  delivery_days: string;
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Get shipping zone for a country code from database
 * This is now a placeholder - use getShippingZoneFromDB in API routes
 */
export async function getShippingZoneFromDB(
  countryCode: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<ShippingZone | null> {
  const upperCountry = countryCode.toUpperCase();
  
  // Fetch all active zones from database
  const { data: zones, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !zones) {
    console.error('Error fetching shipping zones:', error);
    return null;
  }

  // Find zone that includes this country
  for (const zone of zones) {
    if (zone.countries.includes(upperCountry)) {
      return zone;
    }
  }
  
  // Find default zone (empty countries array)
  const defaultZone = zones.find((z: ShippingZone) => z.countries.length === 0);
  return defaultZone || null;
}

/**
 * Calculate shipping cost for a cart
 */
export function calculateShippingCost(
  zone: ShippingZone,
  subtotal: number
): {
  zone: ShippingZone;
  cost: number;
  isFree: boolean;
  amountUntilFree: number;
} {
  const isFree = subtotal >= zone.free_threshold;
  const cost = isFree ? 0 : zone.price;
  const amountUntilFree = isFree ? 0 : zone.free_threshold - subtotal;
  
  return {
    zone,
    cost,
    isFree,
    amountUntilFree: Math.max(0, amountUntilFree)
  };
}

// LEGACY: Client-side fallback zones (used in checkout before API call)
// These should match database defaults
export const FALLBACK_SHIPPING_ZONES: Record<string, ShippingZone> = {
  zone1: {
    id: 'zone1',
    name: 'Slovensko a Česko',
    countries: ['SK', 'CZ'],
    price: 2.99,
    free_threshold: 50,
    delivery_days: '2-4'
  },
  zone2: {
    id: 'zone2',
    name: 'Stredná Európa',
    countries: ['AT', 'HU', 'PL', 'DE'],
    price: 5.99,
    free_threshold: 80,
    delivery_days: '3-6'
  },
  zone3: {
    id: 'zone3',
    name: 'Západná a Južná Európa',
    countries: ['FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'IE', 'PT', 'GR', 'LU', 'MT', 'CY'],
    price: 7.99,
    free_threshold: 100,
    delivery_days: '4-8'
  },
  zone4: {
    id: 'zone4',
    name: 'Východná Európa a Balkán',
    countries: ['RO', 'BG', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'UA', 'MD', 'BY'],
    price: 8.99,
    free_threshold: 100,
    delivery_days: '5-10'
  },
  zone5: {
    id: 'zone5',
    name: 'Severná Európa',
    countries: ['SE', 'NO', 'DK', 'FI', 'IS', 'EE', 'LV', 'LT'],
    price: 9.99,
    free_threshold: 120,
    delivery_days: '5-10'
  },
  zone6: {
    id: 'zone6',
    name: 'USA a Kanada',
    countries: ['US', 'CA'],
    price: 14.99,
    free_threshold: 150,
    delivery_days: '7-14'
  },
  zone7: {
    id: 'zone7',
    name: 'Ázijsko-Pacifický región',
    countries: ['AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'TW', 'MY', 'TH', 'PH', 'ID', 'VN'],
    price: 19.99,
    free_threshold: 200,
    delivery_days: '10-20'
  },
  zone8: {
    id: 'zone8',
    name: 'Ostatný svet',
    countries: [],
    price: 24.99,
    free_threshold: 250,
    delivery_days: '14-30'
  }
};

/**
 * Client-side fallback: Get shipping zone from hardcoded config
 * Use this only in client components where database access is not available
 */
export function getShippingZoneFallback(countryCode: string): ShippingZone {
  const upperCountry = countryCode.toUpperCase();
  
  for (const zone of Object.values(FALLBACK_SHIPPING_ZONES)) {
    if (zone.countries.includes(upperCountry)) {
      return zone;
    }
  }
  
  return FALLBACK_SHIPPING_ZONES.zone8;
}

/**
 * Client-side: Calculate shipping with fallback zones
 */
export function calculateShipping(
  countryCode: string,
  subtotal: number
): {
  zone: ShippingZone;
  cost: number;
  isFree: boolean;
  amountUntilFree: number;
} {
  const zone = getShippingZoneFallback(countryCode);
  return calculateShippingCost(zone, subtotal);
}

/**
 * Get all shipping zones (fallback for client)
 */
export function getAllShippingZones() {
  return Object.values(FALLBACK_SHIPPING_ZONES);
}
