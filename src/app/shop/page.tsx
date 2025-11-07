"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import Toast from "@/app/components/Toast";
import { Product } from "@/types/ecommerce";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ShopPage() {
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    loadProducts();
    
    // Listen for cart add events
    const handleCartAdd = (e: Event) => {
      const customEvent = e as CustomEvent;
      setToastMessage(customEvent.detail.message);
      setShowToast(true);
    };
    
    window.addEventListener('productAddedToCart', handleCartAdd);
    return () => window.removeEventListener('productAddedToCart', handleCartAdd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: null, label: { sk: "Všetko", en: "All", cz: "Vše", es: "Todo" } },
    { value: "knihy", label: { sk: "Knihy", en: "Books", cz: "Knihy", es: "Libros" } },
    { value: "pera", label: { sk: "Perá", en: "Pens", cz: "Pera", es: "Bolígrafos" } },
    { value: "snurky", label: { sk: "Šnúrky na kľúče", en: "Keychains", cz: "Šňůrky na klíče", es: "Llaveros" } },
    { value: "zurnal", label: { sk: "Žurnál", en: "Journal", cz: "Deník", es: "Diario" } },
    { value: "kalendar", label: { sk: "Kalendár", en: "Calendar", cz: "Kalendář", es: "Calendario" } },
  ];

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const translations = {
    title: { sk: "Obchod", en: "Shop", cz: "Obchod", es: "Tienda" },
    subtitle: {
      sk: "Produkty inšpirované Lectio Divina",
      en: "Products inspired by Lectio Divina",
      cz: "Produkty inspirované Lectio Divina",
      es: "Productos inspirados en Lectio Divina",
    },
    addToCart: { sk: "Pridať do košíka", en: "Add to cart", cz: "Přidat do košíku", es: "Añadir al carrito" },
    inStock: { sk: "Skladom", en: "In stock", cz: "Skladem", es: "En stock" },
    outOfStock: { sk: "Vypredané", en: "Out of stock", cz: "Vyprodáno", es: "Agotado" },
    addedToCart: { 
      sk: "pridané do košíka!", 
      en: "added to cart!", 
      cz: "přidáno do košíku!", 
      es: "añadido al carrito!" 
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      <Toast 
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              {translations.title[lang as keyof typeof translations.title]}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
              {translations.subtitle[lang as keyof typeof translations.subtitle]}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="backdrop-blur-md rounded-3xl p-8 mb-12 border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(64, 70, 123, 0.1)'
          }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value || "all"}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.value
                    ? "text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
                style={
                  selectedCategory === category.value
                    ? { background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }
                    : undefined
                }
              >
                {category.label[lang as keyof typeof category.label]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Žiadne produkty v tejto kategórii</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <ProductCard
                  product={product}
                  lang={lang}
                  translations={translations}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  lang,
  translations,
}: {
  product: Product;
  lang: string;
  translations: {
    addToCart: { sk: string; en: string; cz: string; es: string };
    inStock: { sk: string; en: string; cz: string; es: string };
    outOfStock: { sk: string; en: string; cz: string; es: string };
    addedToCart: { sk: string; en: string; cz: string; es: string };
  };
}) {
  const addToCart = () => {
    // Get existing cart from localStorage
    const cartJson = localStorage.getItem("lectio_cart");
    const cart = cartJson ? JSON.parse(cartJson) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: { productId: string }) => item.productId === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ productId: product.id, quantity: 1 });
    }

    localStorage.setItem("lectio_cart", JSON.stringify(cart));

    // Trigger cart update event for navbar badge
    window.dispatchEvent(new Event('cartUpdated'));

    // Show toast notification via custom event
    const message = `${product.name[lang as keyof typeof product.name]} ${translations.addedToCart[lang as keyof typeof translations.addedToCart]}`;
    window.dispatchEvent(new CustomEvent('productAddedToCart', { detail: { message } }));
  };

  return (
    <div 
      className="backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border h-full flex flex-col"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(64, 70, 123, 0.15)'
      }}
    >
      <Link href={`/shop/${product.slug}`}>
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name[lang as keyof typeof product.name]}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-xl font-bold mb-2 transition-colors duration-300 hover:opacity-80" style={{ color: '#40467b' }}>
            {product.name[lang as keyof typeof product.name]}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
          {product.description[lang as keyof typeof product.description]}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#40467b' }}>
              €{product.price.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ {translations.inStock[lang as keyof typeof translations.inStock]}
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  {translations.outOfStock[lang as keyof typeof translations.outOfStock]}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-lg"
            style={
              product.stock > 0
                ? { background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }
                : undefined
            }
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
