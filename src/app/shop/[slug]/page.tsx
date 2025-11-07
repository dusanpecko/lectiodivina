'use client';

import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import type { Product } from '@/types/ecommerce';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
  const params = useParams();
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const translations = {
    sk: {
      loading: 'Načítavam...',
      notFound: 'Produkt sa nenašiel',
      backToShop: 'Späť do obchodu',
      inStock: 'Skladom',
      outOfStock: 'Vypredané',
      quantity: 'Počet kusov',
      addToCart: 'Pridať do košíka',
      added: 'Pridané!',
      category: 'Kategória',
      description: 'Popis',
      relatedProducts: 'Podobné produkty',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Product not found',
      backToShop: 'Back to shop',
      inStock: 'In stock',
      outOfStock: 'Out of stock',
      quantity: 'Quantity',
      addToCart: 'Add to cart',
      added: 'Added!',
      category: 'Category',
      description: 'Description',
      relatedProducts: 'Related products',
    },
    cz: {
      loading: 'Načítám...',
      notFound: 'Produkt nebyl nalezen',
      backToShop: 'Zpět do obchodu',
      inStock: 'Skladem',
      outOfStock: 'Vyprodáno',
      quantity: 'Počet kusů',
      addToCart: 'Přidat do košíku',
      added: 'Přidáno!',
      category: 'Kategorie',
      description: 'Popis',
      relatedProducts: 'Podobné produkty',
    },
    es: {
      loading: 'Cargando...',
      notFound: 'Producto no encontrado',
      backToShop: 'Volver a la tienda',
      inStock: 'En stock',
      outOfStock: 'Agotado',
      quantity: 'Cantidad',
      addToCart: 'Añadir al carrito',
      added: '¡Añadido!',
      category: 'Categoría',
      description: 'Descripción',
      relatedProducts: 'Productos relacionados',
    },
  };

  const t = translations[lang as keyof typeof translations] || translations.sk;

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [params.slug, supabase]);

  const handleAddToCart = () => {
    if (!product) return;

    interface StoredCartItem {
      productId: string;
      quantity: number;
    }

    const cart: StoredCartItem[] = JSON.parse(localStorage.getItem('lectio_cart') || '[]');
    
    const existingItemIndex = cart.findIndex((item) => item.productId === product.id);
    
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        quantity,
      });
    }
    
    localStorage.setItem('lectio_cart', JSON.stringify(cart));
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);

    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: '#40467b' }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#40467b' }}>{t.notFound}</h1>
        <Link
          href="/shop"
          className="px-6 py-3 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
        >
          {t.backToShop}
        </Link>
      </div>
    );
  }

  const langKey = lang as 'sk' | 'en' | 'cz' | 'es';
  const productName = product.name[langKey] || product.name.sk;
  const productDescription = product.description[langKey] || product.description.sk;
  const inStock = product.stock > 0;

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-blue-50/30" />
      
      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:shadow-md"
            style={{ 
              color: '#40467b',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <ArrowLeft size={20} />
            {t.backToShop}
          </Link>
        </motion.nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div 
              className="relative aspect-square rounded-3xl overflow-hidden border backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(64, 70, 123, 0.15)'
              }}
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={productName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: selectedImage === index ? '#40467b' : 'rgba(64, 70, 123, 0.2)'
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div 
              className="backdrop-blur-md rounded-3xl p-8 border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(64, 70, 123, 0.15)'
              }}
            >
              <div className="mb-4">
                <span 
                  className="text-sm uppercase font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(64, 70, 123, 0.1)',
                    color: '#40467b'
                  }}
                >
                  {product.category}
                </span>
                <h1 className="text-4xl font-bold mt-4" style={{ color: '#40467b' }}>
                  {productName}
                </h1>
              </div>

              <div 
                className="text-4xl font-bold mb-6"
                style={{ color: '#40467b' }}
              >
                €{product.price.toFixed(2)}
              </div>

              <div className="flex items-center gap-2 mb-6">
                {inStock ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100">
                      <Check size={16} className="text-green-600" />
                      <span className="text-green-600 font-medium text-sm">{t.inStock}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({product.stock} {t.quantity.toLowerCase()})</span>
                  </>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-red-100">
                    <span className="text-red-600 font-medium text-sm">{t.outOfStock}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-6" style={{ borderColor: 'rgba(64, 70, 123, 0.1)' }}>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#40467b' }}>
                  {t.description}
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {productDescription}
                </p>
              </div>
            </div>

            {/* Add to Cart Section */}
            {inStock && (
              <div 
                className="backdrop-blur-md rounded-3xl p-8 border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: 'rgba(64, 70, 123, 0.15)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <label className="font-semibold text-lg" style={{ color: '#40467b' }}>
                    {t.quantity}:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl font-bold text-lg transition-all hover:shadow-md"
                      style={{
                        backgroundColor: 'rgba(64, 70, 123, 0.1)',
                        color: '#40467b'
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-20 h-12 text-center border rounded-xl font-bold text-lg"
                      style={{
                        borderColor: 'rgba(64, 70, 123, 0.3)',
                        color: '#40467b'
                      }}
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 rounded-xl font-bold text-lg transition-all hover:shadow-md"
                      style={{
                        backgroundColor: 'rgba(64, 70, 123, 0.1)',
                        color: '#40467b'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl flex items-center justify-center gap-2 mb-4"
                  style={
                    addedToCart
                      ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }
                      : { background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)', color: 'white' }
                  }
                >
                  {addedToCart ? (
                    <>
                      <Check size={24} />
                      {t.added}
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={24} />
                      {t.addToCart}
                    </>
                  )}
                </button>

                <Link
                  href="/cart"
                  className="block w-full py-4 text-center rounded-xl border-2 font-semibold transition-all hover:shadow-lg"
                  style={{
                    borderColor: '#40467b',
                    color: '#40467b',
                    backgroundColor: 'rgba(64, 70, 123, 0.05)'
                  }}
                >
                  Prejsť do košíka
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
