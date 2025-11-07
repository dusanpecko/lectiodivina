'use client';

import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { useShippingCalculation } from '@/hooks/useShippingCalculation';
import type { Product, ShippingAddress } from '@/types/ecommerce';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: Product;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    street: '',
    city: '',
    postal_code: '',
    country: 'SK',
    phone: '',
    email: '',
  });

  const translations = {
    sk: {
      title: 'Pokladňa',
      emptyCart: 'Váš košík je prázdny',
      backToShop: 'Späť do obchodu',
      shippingAddress: 'Dodacia adresa',
      name: 'Meno a priezvisko',
      street: 'Ulica a číslo domu',
      city: 'Mesto',
      postalCode: 'PSČ',
      country: 'Krajina',
      phone: 'Telefónne číslo',
      email: 'Email',
      orderSummary: 'Zhrnutie objednávky',
      subtotal: 'Medzisúčet',
      shipping: 'Doprava',
      shippingFree: 'Zdarma',
      total: 'Celkom',
      placeOrder: 'Dokončiť objednávku',
      processing: 'Spracovávam...',
      required: 'Toto pole je povinné',
      invalidEmail: 'Neplatná emailová adresa',
      quantity: 'ks',
    },
    en: {
      title: 'Checkout',
      emptyCart: 'Your cart is empty',
      backToShop: 'Back to shop',
      shippingAddress: 'Shipping address',
      name: 'Full name',
      street: 'Street and number',
      city: 'City',
      postalCode: 'Postal code',
      country: 'Country',
      phone: 'Phone number',
      email: 'Email',
      orderSummary: 'Order summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      shippingFree: 'Free',
      total: 'Total',
      placeOrder: 'Place order',
      processing: 'Processing...',
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      quantity: 'pcs',
    },
    cz: {
      title: 'Pokladna',
      emptyCart: 'Váš košík je prázdný',
      backToShop: 'Zpět do obchodu',
      shippingAddress: 'Dodací adresa',
      name: 'Jméno a příjmení',
      street: 'Ulice a číslo domu',
      city: 'Město',
      postalCode: 'PSČ',
      country: 'Země',
      phone: 'Telefonní číslo',
      email: 'Email',
      orderSummary: 'Shrnutí objednávky',
      subtotal: 'Mezisoučet',
      shipping: 'Doprava',
      shippingFree: 'Zdarma',
      total: 'Celkem',
      placeOrder: 'Dokončit objednávku',
      processing: 'Zpracovávám...',
      required: 'Toto pole je povinné',
      invalidEmail: 'Neplatná emailová adresa',
      quantity: 'ks',
    },
    es: {
      title: 'Caja',
      emptyCart: 'Su carrito está vacío',
      backToShop: 'Volver a la tienda',
      shippingAddress: 'Dirección de envío',
      name: 'Nombre completo',
      street: 'Calle y número',
      city: 'Ciudad',
      postalCode: 'Código postal',
      country: 'País',
      phone: 'Número de teléfono',
      email: 'Correo electrónico',
      orderSummary: 'Resumen del pedido',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      shippingFree: 'Gratis',
      total: 'Total',
      placeOrder: 'Realizar pedido',
      processing: 'Procesando...',
      required: 'Este campo es obligatorio',
      invalidEmail: 'Dirección de correo electrónico no válida',
      quantity: 'uds',
    },
  };

  const t = translations[lang as keyof typeof translations] || translations.sk;

  const countries = [
    { code: 'SK', name: 'Slovensko' },
    { code: 'CZ', name: 'Česko' },
    { code: 'AT', name: 'Rakúsko / Austria' },
    { code: 'HU', name: 'Maďarsko / Hungary' },
    { code: 'PL', name: 'Poľsko / Poland' },
    { code: 'DE', name: 'Nemecko / Germany' },
  ];

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCart() {
    interface StoredCartItem {
      productId: string;
      quantity: number;
    }

    const cart: StoredCartItem[] = JSON.parse(localStorage.getItem('lectio_cart') || '[]');
    
    // Filter out invalid items (missing productId)
    const validCart = cart.filter(item => item.productId);
    
    if (validCart.length === 0) {
      setLoading(false);
      return;
    }

    const productIds = validCart.map((item) => item.productId);
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true);

    if (products) {
      const items = validCart
        .map((cartItem) => {
          const product = products.find((p: Product) => p.id === cartItem.productId);
          return product ? {
            id: cartItem.productId,
            quantity: cartItem.quantity,
            product,
          } : null;
        })
        .filter((item): item is CartItemWithProduct => item !== null);
      
      setCartItems(items);
    }
    
    setLoading(false);
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  // Calculate shipping based on country and cart subtotal (from database)
  const { shipping: shippingCalc } = useShippingCalculation(shippingAddress.country, subtotal);
  const shipping = shippingCalc?.cost || 0;
  const total = subtotal + shipping;

  const validateForm = (): boolean => {
    if (!shippingAddress.name.trim()) {
      setError(t.required + ': ' + t.name);
      return false;
    }
    if (!shippingAddress.street.trim()) {
      setError(t.required + ': ' + t.street);
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setError(t.required + ': ' + t.city);
      return false;
    }
    if (!shippingAddress.postal_code.trim()) {
      setError(t.required + ': ' + t.postalCode);
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      setError(t.required + ': ' + t.phone);
      return false;
    }
    if (!shippingAddress.email.trim() || !shippingAddress.email.includes('@')) {
      setError(t.invalidEmail);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Get auth session if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('/api/checkout/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shippingAddress,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Nastala chyba pri vytváraní objednávky. Skúste to znova.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t.processing}</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{t.emptyCart}</h1>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t.backToShop}
        </button>
      </div>
    );
  }

  const langKey = lang as 'sk' | 'en' | 'cz' | 'es';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Form */}
        <div>
          <h2 className="text-xl font-bold mb-4">{t.shippingAddress}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.street} *
              </label>
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.city} *
                </label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.postalCode} *
                </label>
                <input
                  type="text"
                  value={shippingAddress.postal_code}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.country} *
              </label>
              <select
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.phone} *
              </label>
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t.email} *
              </label>
              <input
                type="email"
                value={shippingAddress.email}
                onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? t.processing : t.placeOrder}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-bold mb-4">{t.orderSummary}</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {item.product.name[langKey] || item.product.name.sk}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.quantity} {t.quantity} × €{item.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="font-semibold">
                  €{(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="space-y-2 pt-4">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.shipping}</span>
                {shippingCalc ? (
                  <span className={shippingCalc.isFree ? 'text-green-600 font-semibold' : ''}>
                    {shippingCalc.isFree ? t.shippingFree : `€${shipping.toFixed(2)}`}
                  </span>
                ) : (
                  <span className="text-gray-500">Vypočítava sa...</span>
                )}
              </div>
              
              {/* Free shipping progress */}
              {shippingCalc && !shippingCalc.isFree && shippingCalc.amountUntilFree > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-800">
                    💡 Pridajte ešte <span className="font-bold">€{shippingCalc.amountUntilFree.toFixed(2)}</span> do košíka
                    a získate <span className="font-bold">dopravu ZDARMA</span>!
                  </p>
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(subtotal / shippingCalc.zone.free_threshold) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
              
              {shippingCalc?.isFree && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  🎉 Máte dopravu ZDARMA!
                </div>
              )}
              
              {shippingCalc && (
                <div className="text-sm text-gray-600 pt-2">
                  <p>📦 Dopravná zóna: <span className="font-medium">{shippingCalc.zone.name}</span></p>
                  <p>🚚 Doba doručenia: <span className="font-medium">{shippingCalc.zone.delivery_days} dní</span></p>
                </div>
              )}
              
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-200">
                <span>{t.total}</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
