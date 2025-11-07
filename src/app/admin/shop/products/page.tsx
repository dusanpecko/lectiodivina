'use client';

import type { Product } from '@/types/ecommerce';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching products:', data.error);
      } else {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function deleteProduct(id: string) {
    if (!confirm('Naozaj chcete vymazať tento produkt?')) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error deleting product:', data.error);
        alert('Chyba pri mazaní produktu');
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Chyba pri mazaní produktu');
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          is_active: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error updating product:', data.error);
        alert('Chyba pri aktualizácii produktu');
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Chyba pri aktualizácii produktu');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl">Načítavam...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Správa produktov</h1>
          <p className="text-gray-600 mt-1">Spravujte produkty v e-shope</p>
        </div>
        <Link
          href="/admin/shop/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          <Plus size={20} />
          Pridať produkt
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Celkom produktov</div>
          <div className="text-3xl font-bold mt-2">{products.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600">Aktívne</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {products.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="text-sm text-red-600">Neaktívne</div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {products.filter(p => !p.is_active).length}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="text-sm text-yellow-600">Nízky sklad</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {products.filter(p => p.stock < 5).length}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Produkt
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Kategória
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Cena
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Sklad
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Stav
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Akcie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.images && product.images.length > 0 && (
                      <Image
                        src={product.images[0]}
                        alt={product.name.sk}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {product.name.sk}
                      </div>
                      <div className="text-sm text-gray-500">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  €{product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className={`font-medium ${product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock} ks
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(product.id, product.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.is_active ? 'Aktívny' : 'Neaktívny'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/shop/${product.slug}`}
                      target="_blank"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Zobraziť"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/admin/shop/products/edit/${product.id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Upraviť"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Vymazať"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatiaľ nemáte žiadne produkty. Začnite pridaním prvého produktu.
          </div>
        )}
      </div>
    </div>
  );
}
