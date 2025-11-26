'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import { ArrowLeft, Calendar, CheckCircle2, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ImportRecord {
  id: string;
  message_id: string;
  statement_id: string;
  account_iban: string;
  statement_date_from: string;
  statement_date_to: string;
  file_name: string;
  file_size: number;
  payments_count: number;
  imported_count: number;
  skipped_count: number;
  imported_at: string;
}

export default function ImportHistoryPage() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [importToDelete, setImportToDelete] = useState<ImportRecord | null>(null);
  const [deletePayments, setDeletePayments] = useState(false);

  useEffect(() => {
    const fetchImports = async () => {
      if (!supabase || !session) return;

      try {
        const { data, error } = await supabase
          .from('bank_statement_imports')
          .select('*')
          .order('imported_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setImports(data || []);
      } catch (error) {
        console.error('Error fetching imports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImports();
  }, [supabase, session]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDelete = (importRecord: ImportRecord) => {
    setImportToDelete(importRecord);
    setDeletePayments(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!importToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/bank-statement-imports/${importToDelete.id}?deletePayments=${deletePayments}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete import');
      }

      setImports(imports.filter(imp => imp.id !== importToDelete.id));
      setShowDeleteModal(false);
      setImportToDelete(null);
      setDeletePayments(false);
    } catch (error) {
      console.error('Error deleting import:', error);
      alert('Chyba pri mazaní importu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/shop/banka')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            História XML importov
          </h1>
          <p className="text-gray-600 mt-1">Prehľad naimportovaných bankových výpisov</p>
        </div>
      </div>

      {/* Imports Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Načítavam históriu...</p>
          </div>
        ) : imports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Zatiaľ neboli naimportované žiadne XML súbory</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Súbor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IBAN</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Obdobie</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Platby</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Importované</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dátum importu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {imports.map((imp) => (
                  <tr key={imp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        <div>
                          <div className="font-medium text-gray-900">{imp.file_name}</div>
                          <div className="text-sm text-gray-500">{formatFileSize(imp.file_size)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-gray-700">{imp.account_iban}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                          {new Date(imp.statement_date_from).toLocaleDateString('sk-SK')}
                          {' - '}
                          {new Date(imp.statement_date_to).toLocaleDateString('sk-SK')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-900 font-medium">{imp.payments_count}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CheckCircle2 className="text-green-600" size={16} />
                        <span className="text-green-700 font-medium">{imp.imported_count}</span>
                        {imp.skipped_count > 0 && (
                          <span className="text-sm text-gray-500">({imp.skipped_count} preskočených)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {new Date(imp.imported_at).toLocaleString('sk-SK')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(imp)}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Vymazať import"
                      >
                        <X size={14} />
                        Vymazať
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="text-red-600" size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Vymazať import</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Naozaj chcete vymazať tento záznam o importe?
              </p>
              
              {importToDelete && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-900">Import obsahuje:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {importToDelete.imported_count} naimportovaných platieb</li>
                    <li>• Obdobie: {new Date(importToDelete.statement_date_from).toLocaleDateString('sk-SK')} - {new Date(importToDelete.statement_date_to).toLocaleDateString('sk-SK')}</li>
                  </ul>
                </div>
              )}
              
              <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-red-300 transition-colors">
                <input
                  type="checkbox"
                  checked={deletePayments}
                  onChange={(e) => setDeletePayments(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Vymazať aj platby</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Vymaže všetky platby v danom období. Toto sa nedá vrátiť späť!
                  </div>
                </div>
              </label>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setImportToDelete(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Zrušiť
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Vymazať
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {imports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="text-blue-600 text-sm font-semibold mb-2">Celkom importov</div>
            <div className="text-3xl font-bold text-blue-900">{imports.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-green-600 text-sm font-semibold mb-2">Celkom platieb</div>
            <div className="text-3xl font-bold text-green-900">
              {imports.reduce((sum, imp) => sum + imp.imported_count, 0)}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="text-gray-600 text-sm font-semibold mb-2">Preskočených (duplikáty)</div>
            <div className="text-3xl font-bold text-gray-900">
              {imports.reduce((sum, imp) => sum + imp.skipped_count, 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
