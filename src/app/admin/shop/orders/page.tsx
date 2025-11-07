'use client';

import { Package, Search, Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: string;
  shipping_address: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  order_items?: Array<{
    quantity: number;
    price: number;
    product_snapshot: {
      name: { sk: string };
      slug: string;
    };
  }>;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Čaká', color: 'bg-gray-100 text-gray-800' },
  { value: 'paid', label: 'Zaplatené', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Spracováva sa', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'shipped', label: 'Odoslané', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Dokončené', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Zrušené', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching orders:', data.error);
      } else {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await response.json();

      if (data.error) {
        alert('Chyba pri aktualizácii: ' + data.error);
      } else {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Nepodarilo sa aktualizovať objednávku');
    }
  };

  const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingNumber }),
      });

      const data = await response.json();

      if (data.error) {
        alert('Chyba pri aktualizácii: ' + data.error);
      } else {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber });
        }
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Nepodarilo sa aktualizovať tracking');
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

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
      <div>
        <h1 className="text-3xl font-bold">Správa objednávok</h1>
        <p className="text-gray-600 mt-1">Zobrazujte a spravujte všetky objednávky</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Celkom objednávok</div>
          <div className="text-3xl font-bold mt-2">{orders.length}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="text-sm text-yellow-600">Spracováva sa</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {orders.filter(o => ['pending', 'paid', 'processing'].includes(o.status)).length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-6">
          <div className="text-sm text-purple-600">Odoslané</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {orders.filter(o => o.status === 'shipped').length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600">Dokončené</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {orders.filter(o => o.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Hľadať podľa ID, mena alebo emailu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Všetky stavy</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Objednávka
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Zákazník
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Suma
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Dátum
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Akcie
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-900">
                      #{order.id.slice(0, 8)}
                    </div>
                    {order.tracking_number && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Truck size={12} />
                        {order.tracking_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {order.shipping_address.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.shipping_address.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    €{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('sk-SK', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-semibold"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery || filterStatus !== 'all' 
              ? 'Žiadne objednávky podľa filtrov'
              : 'Zatiaľ nemáte žiadne objednávky'
            }
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Detail objednávky</h2>
                  <p className="text-gray-600 mt-1">#{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stav objednávky
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="inline mr-1" size={16} />
                  Tracking číslo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={selectedOrder.tracking_number || ''}
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.tracking_number) {
                        updateTrackingNumber(selectedOrder.id, e.target.value);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Zadajte tracking číslo..."
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-bold mb-3">Dodacia adresa</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">{selectedOrder.shipping_address.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shipping_address.email}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shipping_address.phone}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedOrder.shipping_address.street}<br />
                    {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}<br />
                    {selectedOrder.shipping_address.country}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Položky objednávky</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <Package size={20} className="text-gray-400" />
                          <div>
                            <div className="font-medium">{item.product_snapshot.name.sk}</div>
                            <div className="text-sm text-gray-500">
                              {item.quantity}x €{item.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="font-semibold">
                          €{(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between">
                    <span className="text-lg font-bold">Celkom</span>
                    <span className="text-lg font-bold">€{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-bold mb-2">Poznámky</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="text-sm text-gray-500">
                Vytvorené: {new Date(selectedOrder.created_at).toLocaleString('sk-SK')}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Zavrieť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
