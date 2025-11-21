'use client';

import { ArrowLeft, Upload, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'knihy', label: 'Knihy' },
  { value: 'pera', label: 'Perá' },
  { value: 'snurky', label: 'Šnúrky' },
  { value: 'zurnal', label: 'Žurnály' },
  { value: 'kalendar', label: 'Kalendáre' },
];

interface Product {
  id: string;
  name: { sk: string; en: string; cz: string; es: string };
  description: { sk: string; en: string; cz: string; es: string };
  slug: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  is_active: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id ? String(params.id) : "";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  const [formData, setFormData] = useState({
    name_sk: '',
    name_en: '',
    name_cz: '',
    name_es: '',
    description_sk: '',
    description_en: '',
    description_cz: '',
    description_es: '',
    slug: '',
    price: '',
    stock: '',
    category: 'knihy',
    is_active: true,
  });

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();

      if (data.error) {
        alert('Chyba: ' + data.error);
        router.push('/admin/shop/products');
      } else {
        const p = data.product;
        setProduct(p);
        setImages(p.images || []);
        setFormData({
          name_sk: p.name.sk || '',
          name_en: p.name.en || '',
          name_cz: p.name.cz || '',
          name_es: p.name.es || '',
          description_sk: p.description.sk || '',
          description_en: p.description.en || '',
          description_cz: p.description.cz || '',
          description_es: p.description.es || '',
          slug: p.slug || '',
          price: p.price.toString(),
          stock: p.stock.toString(),
          category: p.category || 'knihy',
          is_active: p.is_active ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Nepodarilo sa načítať produkt');
      router.push('/admin/shop/products');
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: {
            sk: formData.name_sk,
            en: formData.name_en,
            cz: formData.name_cz,
            es: formData.name_es,
          },
          description: {
            sk: formData.description_sk,
            en: formData.description_en,
            cz: formData.description_cz,
            es: formData.description_es,
          },
          slug: formData.slug,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category,
          images: images,
          is_active: formData.is_active,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert('Chyba: ' + data.error);
      } else {
        alert('Produkt bol úspešne aktualizovaný!');
        router.push('/admin/shop/products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Nepodarilo sa aktualizovať produkt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl">Načítavam...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Produkt sa nenašiel</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/shop/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Upraviť produkt</h1>
          <p className="text-gray-600 mt-1">Editujte informácie o produkte</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Základné informácie</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Názov (SK) *
              </label>
              <input
                type="text"
                name="name_sk"
                value={formData.name_sk}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (EN)
              </label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Název (CZ)
              </label>
              <input
                type="text"
                name="name_cz"
                value={formData.name_cz}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre (ES)
              </label>
              <input
                type="text"
                name="name_es"
                value={formData.name_es}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL produktu: /shop/{formData.slug || 'slug'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cena (€) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sklad (ks) *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategória *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              id="is_active"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Aktívny produkt (zobrazí sa v e-shope)
            </label>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Popis produktu</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Popis (SK) *
            </label>
            <textarea
              name="description_sk"
              value={formData.description_sk}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (EN)
            </label>
            <textarea
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Popis (CZ)
            </label>
            <textarea
              name="description_cz"
              value={formData.description_cz}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (ES)
            </label>
            <textarea
              name="description_es"
              value={formData.description_es}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Obrázky</h2>
          
          <div className="flex gap-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold flex items-center gap-2"
            >
              <Upload size={18} />
              Pridať
            </button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={img}
                    alt={`Product ${index + 1}`}
                    width={300}
                    height={160}
                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                      Hlavný
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500">
            Pridajte URL adresy obrázkov. Prvý obrázok bude hlavný.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Ukladám...' : 'Uložiť zmeny'}
          </button>
          <Link
            href="/admin/shop/products"
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Zrušiť
          </Link>
        </div>
      </form>
    </div>
  );
}
