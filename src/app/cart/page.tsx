"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { Product } from "@/types/ecommerce";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export default function CartPage() {
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartJson = localStorage.getItem("lectio_cart");
      console.log("📦 Cart from localStorage:", cartJson);
      
      if (!cartJson) {
        setCart([]);
        setLoading(false);
        return;
      }

      const cartItems: CartItem[] = JSON.parse(cartJson);
      console.log("📦 Parsed cart items:", cartItems);

      // Filter out invalid items (missing productId)
      const validCartItems = cartItems.filter(item => item.productId);
      
      if (validCartItems.length !== cartItems.length) {
        console.warn("⚠️ Found invalid cart items, cleaning up...");
        localStorage.setItem("lectio_cart", JSON.stringify(validCartItems));
      }

      if (validCartItems.length === 0) {
        setCart([]);
        setLoading(false);
        return;
      }

      // Fetch product details
      const productIds = validCartItems.map((item) => item.productId);
      console.log("📦 Product IDs to fetch:", productIds);
      
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      console.log("📦 Fetched products:", products, "Error:", error);

      if (products) {
        const enrichedCart = validCartItems.map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.productId) as Product,
        }));
        console.log("📦 Enriched cart:", enrichedCart);
        setCart(enrichedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = cart.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem(
      "lectio_cart",
      JSON.stringify(updatedCart.map(({ productId, quantity }) => ({ productId, quantity })))
    );
  };

  const removeItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem(
      "lectio_cart",
      JSON.stringify(updatedCart.map(({ productId, quantity }) => ({ productId, quantity })))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("lectio_cart");
  };

  const goToCheckout = () => {
    router.push("/checkout");
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const translations = {
    title: { sk: "Košík", en: "Shopping Cart", cz: "Košík", es: "Carrito" },
    empty: { sk: "Váš košík je prázdny", en: "Your cart is empty", cz: "Váš košík je prázdný", es: "Tu carrito está vacío" },
    continueShopping: { sk: "Pokračovať v nákupe", en: "Continue shopping", cz: "Pokračovat v nákupu", es: "Continuar comprando" },
    clear: { sk: "Vyprázdniť košík", en: "Clear cart", cz: "Vyprázdnit košík", es: "Vaciar carrito" },
    total: { sk: "Celkom", en: "Total", cz: "Celkem", es: "Total" },
    checkout: { sk: "Pokračovať na pokladňu", en: "Proceed to checkout", cz: "Pokračovat k pokladně", es: "Proceder al pago" },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#40467b' }}></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[30vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #40467b 0%, #5a6191 50%, #40467b 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <ShoppingCart size={48} className="text-white" />
            <h1 className="text-5xl font-bold text-white">
              {translations.title[lang as keyof typeof translations.title]}
            </h1>
          </motion.div>
          {cart.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onClick={clearCart}
              className="text-white/90 hover:text-white flex items-center gap-2 mx-auto backdrop-blur-sm bg-white/10 px-4 py-2 rounded-lg transition-all hover:bg-white/20"
            >
              <Trash2 size={18} />
              {translations.clear[lang as keyof typeof translations.clear]}
            </motion.button>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="relative -mt-8">
        <div className="max-w-5xl mx-auto px-4 pb-12">

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-md rounded-3xl p-12 text-center border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderColor: 'rgba(64, 70, 123, 0.15)'
            }}
          >
            <ShoppingCart size={64} className="mx-auto mb-4" style={{ color: '#40467b', opacity: 0.3 }} />
            <p className="text-xl mb-6" style={{ color: '#40467b' }}>
              {translations.empty[lang as keyof typeof translations.empty]}
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="text-white px-8 py-3 rounded-lg transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
            >
              {translations.continueShopping[lang as keyof typeof translations.continueShopping]}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {cart.map((item, index) => (
              <motion.div 
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="backdrop-blur-md rounded-3xl p-6 border hover:shadow-xl transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: 'rgba(64, 70, 123, 0.15)'
                }}
              >
                <div className="flex items-center gap-6">
                  {item.product?.images && item.product.images.length > 0 && (
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name[lang as keyof typeof item.product.name]}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: '#40467b' }}>
                      {item.product?.name[lang as keyof typeof item.product.name]}
                    </h3>
                    <p className="text-gray-600 text-sm font-medium">
                      €{item.product?.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:shadow-md"
                      style={{ 
                        backgroundColor: 'rgba(64, 70, 123, 0.1)',
                        color: '#40467b'
                      }}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-lg font-bold w-10 text-center" style={{ color: '#40467b' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:shadow-md"
                      style={{ 
                        backgroundColor: 'rgba(64, 70, 123, 0.1)',
                        color: '#40467b'
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold" style={{ color: '#40467b' }}>
                      €{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: cart.length * 0.1 }}
              className="backdrop-blur-md rounded-3xl p-6 border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(64, 70, 123, 0.2)'
              }}
            >
              <div className="flex items-center justify-between text-2xl font-bold mb-6" style={{ color: '#40467b' }}>
                <span>{translations.total[lang as keyof typeof translations.total]}:</span>
                <span>€{total.toFixed(2)}</span>
              </div>

              <button
                onClick={goToCheckout}
                className="w-full text-white px-6 py-4 rounded-xl transition-all text-lg font-semibold hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
              >
                {translations.checkout[lang as keyof typeof translations.checkout]}
              </button>
            </motion.div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
