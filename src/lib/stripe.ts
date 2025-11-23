// Stripe configuration and utilities for lectio.one e-commerce

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  test_daily: {
    name: { sk: 'Test Denné', en: 'Test Daily', cz: 'Test Denní', es: 'Test Diario' },
    price: 1,
    interval: 'day',
    priceId: process.env.STRIPE_PRICE_TEST_DAILY, // For testing daily renewals
    features: {
      sk: ['🧪 TEST: Obnovuje sa každý deň', '€1/deň'],
      en: ['🧪 TEST: Renews daily', '€1/day'],
      cz: ['🧪 TEST: Obnovuje se každý den', '€1/den'],
      es: ['🧪 TEST: Se renueva diariamente', '€1/día'],
    },
  },
  free: {
    name: { sk: 'Zdarma', en: 'Free', cz: 'Zdarma', es: 'Gratis' },
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: {
      sk: ['Prístup k základným lectio', 'Denná citácia'],
      en: ['Access to basic lectio', 'Daily quote'],
      cz: ['Přístup k základním lectio', 'Denní citát'],
      es: ['Acceso a lectio básico', 'Cita diaria'],
    },
  },
  supporter: {
    name: { sk: 'Podporovateľ', en: 'Supporter', cz: 'Podporovatel', es: 'Partidario' },
    price: 3,
    priceId: process.env.STRIPE_PRICE_SUPPORTER, // Set in .env
    features: {
      sk: ['Všetky lectio bez reklám', 'Pokročilé funkcie', 'Podpora projektu'],
      en: ['All lectio ad-free', 'Advanced features', 'Support the project'],
      cz: ['Všechna lectio bez reklam', 'Pokročilé funkce', 'Podpora projektu'],
      es: ['Todos los lectio sin anuncios', 'Funciones avanzadas', 'Apoyar el proyecto'],
    },
  },
  patron: {
    name: { sk: 'Patrón', en: 'Patron', cz: 'Patron', es: 'Patrón' },
    price: 20,
    priceId: process.env.STRIPE_PRICE_PATRON,
    features: {
      sk: ['Všetko z Podporovateľ', 'Prístup k exkluzívnemu obsahu', 'Prioritná podpora'],
      en: ['Everything in Supporter', 'Access to exclusive content', 'Priority support'],
      cz: ['Vše z Podporovatel', 'Přístup k exkluzivnímu obsahu', 'Prioritní podpora'],
      es: ['Todo en Partidario', 'Acceso a contenido exclusivo', 'Soporte prioritario'],
    },
  },
  benefactor: {
    name: { sk: 'Dobrodinci', en: 'Benefactor', cz: 'Dobrodinci', es: 'Benefactor' },
    price: 50,
    priceId: process.env.STRIPE_PRICE_BENEFACTOR,
    features: {
      sk: ['Všetko z Patrón', 'Osobné poďakovanie', 'Možnosť ovplyvniť budúci obsah'],
      en: ['Everything in Patron', 'Personal acknowledgment', 'Influence future content'],
      cz: ['Vše z Patron', 'Osobní poděkování', 'Možnost ovlivnit budoucí obsah'],
      es: ['Todo en Patrón', 'Reconocimiento personal', 'Influir en el contenido futuro'],
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Predefined donation amounts
export const DONATION_AMOUNTS = [5, 10, 25, 50, 100];

// Helper function to format price
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Helper to create Stripe Checkout session for subscription
export async function createSubscriptionCheckoutSession(
  userId: string,
  priceId: string,
  tier: SubscriptionTier,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail && customerEmail.trim() ? customerEmail : undefined,
    client_reference_id: userId,
    metadata: {
      user_id: userId,
      tier,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        tier,
      },
    },
  });

  return session;
}

// Helper to create Stripe Checkout session for one-time donation
export async function createDonationCheckoutSession(
  amount: number,
  userId: string | null,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  message?: string
) {
  // Disable Stripe Link for anonymous donations to prevent card association
  const isAnonymous = customerEmail === 'stripe@lectio.one';
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Donation to Lectio Divina',
            description: message || 'Thank you for your support!',
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail && customerEmail.trim() ? customerEmail : undefined,
    client_reference_id: userId || undefined,
    metadata: {
      user_id: userId || 'anonymous',
      type: 'donation',
      message: message || '',
    },
    // Disable Link for anonymous donations
    ...(isAnonymous && {
      payment_method_options: {
        card: {
          setup_future_usage: undefined,
        },
      },
    }),
  });

  return session;
}

// Helper to create Stripe Checkout session for product purchase
export async function createProductCheckoutSession(
  items: Array<{ productId: string; quantity: number; price: number; name: string }>,
  userId: string | null,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
    email?: string;
  },
  shippingCost?: number,
  shippingZone?: string
) {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));

  // Add shipping as a line item if cost > 0
  if (shippingCost && shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Poštovné a balné - ${shippingZone || 'Shipping'}`,
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    client_reference_id: userId || undefined,
    shipping_address_collection: {
      allowed_countries: ['SK', 'CZ', 'AT', 'HU', 'PL', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'IE', 'PT', 
                         'RO', 'BG', 'HR', 'SI', 'RS', 'UA', 'SE', 'NO', 'DK', 'FI', 'US', 'CA', 'AU', 'NZ', 
                         'JP', 'KR', 'SG', 'HK'],
    },
    metadata: {
      user_id: userId || 'guest',
      type: 'product_order',
      items: JSON.stringify(items.map((i) => ({ id: i.productId, qty: i.quantity }))),
      shipping_cost: shippingCost?.toString() || '0',
      shipping_zone: shippingZone || '',
      ...(shippingAddress && { shipping_address: JSON.stringify(shippingAddress) }),
    },
  });

  return session;
}

// Helper to retrieve subscription
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Helper to cancel subscription
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
}

// Helper to update subscription
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}
