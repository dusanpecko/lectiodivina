'use client';

import { Edit, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  price: number;
  free_threshold: number;
  delivery_days: string;
  is_active: boolean;
  sort_order: number;
}

export default function ShippingSettingsPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/admin/shipping-zones');
      const data = await response.json();
      setZones(data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (zone: ShippingZone) => {
    try {
      const method = isCreating ? 'POST' : 'PATCH';
      const response = await fetch('/api/admin/shipping-zones', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zone),
      });

      if (response.ok) {
        await fetchZones();
        setEditingZone(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving zone:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj chcete odstrániť túto zónu?')) return;

    try {
      const response = await fetch(`/api/admin/shipping-zones?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchZones();
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingZone({
      id: `zone${zones.length + 1}`,
      name: '',
      countries: [],
      price: 0,
      free_threshold: 0,
      delivery_days: '',
      is_active: true,
      sort_order: zones.length + 1,
    });
  };

  if (loading) {
    return <div className="container mx-auto p-6">Načítavam...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Nastavenia poštovného</h1>
          <p className="text-gray-600 mt-2">
            Spravujte dopravné zóny, ceny a podmienky
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nová zóna
        </button>
      </div>

      {/* Zones Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Zóna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Krajiny
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cena
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Doprava zdarma nad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Doba doručenia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Akcie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {zones.map((zone) => (
              <tr key={zone.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{zone.name}</div>
                  <div className="text-sm text-gray-500">{zone.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {zone.countries.length === 0 ? (
                      <span className="text-gray-500 italic">Všetky ostatné</span>
                    ) : zone.countries.length <= 5 ? (
                      zone.countries.join(', ')
                    ) : (
                      `${zone.countries.slice(0, 5).join(', ')} +${zone.countries.length - 5}`
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-semibold text-blue-600">
                    €{zone.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">
                    €{zone.free_threshold.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900">{zone.delivery_days} dní</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      zone.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {zone.is_active ? 'Aktívna' : 'Neaktívna'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setEditingZone(zone);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {editingZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {isCreating ? 'Nová zóna' : 'Upraviť zónu'}
              </h2>
              <button
                onClick={() => {
                  setEditingZone(null);
                  setIsCreating(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* ID (only for new zones) */}
              {isCreating && (
                <div>
                  <label className="block text-sm font-medium mb-1">ID</label>
                  <input
                    type="text"
                    value={editingZone.id}
                    onChange={(e) =>
                      setEditingZone({ ...editingZone, id: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="zone1"
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Názov zóny</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) =>
                    setEditingZone({ ...editingZone, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Slovensko a Česko"
                />
              </div>

              {/* Countries */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Krajiny (kódy oddelené čiarkou)
                </label>
                <input
                  type="text"
                  value={editingZone.countries.join(', ')}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      countries: e.target.value
                        .split(',')
                        .map((c) => c.trim().toUpperCase())
                        .filter((c) => c),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="SK, CZ"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ISO 3166-1 alpha-2 kódy (napr. SK, CZ, DE). Nechajte prázdne pre &quot;Ostatný svet&quot;
                </p>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cena (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingZone.price}
                    onChange={(e) =>
                      setEditingZone({
                        ...editingZone,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Free Threshold */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Doprava zdarma nad (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingZone.free_threshold}
                    onChange={(e) =>
                      setEditingZone({
                        ...editingZone,
                        free_threshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Delivery Days */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Doba doručenia
                </label>
                <input
                  type="text"
                  value={editingZone.delivery_days}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      delivery_days: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="2-4"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingZone.is_active}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Aktívna zóna</label>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium mb-1">Poradie</label>
                <input
                  type="number"
                  value={editingZone.sort_order}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingZone(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Zrušiť
              </button>
              <button
                onClick={() => handleSave(editingZone)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={18} />
                Uložiť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
