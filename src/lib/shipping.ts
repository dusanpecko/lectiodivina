// Global shipping zones configuration
export interface ShippingZone {
  name: string;
  countries: string[];
  price: number;
  free_threshold: number;
  delivery_days: string;
}

export const SHIPPING_ZONES: Record<string, ShippingZone> = {
  zone1: {
    name: 'Slovensko a Česko',
    countries: ['SK', 'CZ'],
    price: 2.99,
    free_threshold: 50,
    delivery_days: '2-4'
  },
  
  zone2: {
    name: 'Stredná Európa',
    countries: ['AT', 'HU', 'PL', 'DE'],
    price: 5.99,
    free_threshold: 80,
    delivery_days: '3-6'
  },
  
  zone3: {
    name: 'Západná a Južná Európa',
    countries: ['FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'IE', 'PT', 'GR', 'LU', 'MT', 'CY'],
    price: 7.99,
    free_threshold: 100,
    delivery_days: '4-8'
  },
  
  zone4: {
    name: 'Východná Európa a Balkán',
    countries: ['RO', 'BG', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'UA', 'MD', 'BY'],
    price: 8.99,
    free_threshold: 100,
    delivery_days: '5-10'
  },
  
  zone5: {
    name: 'Severná Európa',
    countries: ['SE', 'NO', 'DK', 'FI', 'IS', 'EE', 'LV', 'LT'],
    price: 9.99,
    free_threshold: 120,
    delivery_days: '5-10'
  },
  
  zone6: {
    name: 'USA a Kanada',
    countries: ['US', 'CA'],
    price: 14.99,
    free_threshold: 150,
    delivery_days: '7-14'
  },
  
  zone7: {
    name: 'Ázijsko-Pacifický región',
    countries: ['AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'TW', 'MY', 'TH', 'PH', 'ID', 'VN'],
    price: 19.99,
    free_threshold: 200,
    delivery_days: '10-20'
  },
  
  zone8: {
    name: 'Ostatný svet',
    countries: [], // Default fallback for all other countries
    price: 24.99,
    free_threshold: 250,
    delivery_days: '14-30'
  }
};

/**
 * Get shipping zone for a country code
 */
export function getShippingZone(countryCode: string): ShippingZone {
  const upperCountry = countryCode.toUpperCase();
  
  // Find zone that includes this country
  for (const zone of Object.values(SHIPPING_ZONES)) {
    if (zone.countries.includes(upperCountry)) {
      return zone;
    }
  }
  
  // Default to zone8 (rest of world)
  return SHIPPING_ZONES.zone8;
}

/**
 * Calculate shipping cost for a cart
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
  const zone = getShippingZone(countryCode);
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

/**
 * Get all available shipping zones (for admin display)
 */
export function getAllShippingZones() {
  return Object.entries(SHIPPING_ZONES).map(([key, zone]) => ({
    id: key,
    ...zone
  }));
}
