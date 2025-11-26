'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
}

export default function BankImportPage() {
  const router = useRouter();
  const { session } = useSupabase();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [fileType, setFileType] = useState<'csv' | 'xml'>('csv');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Detect file type
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      setFileType(extension === 'xml' ? 'xml' : 'csv');
      
      // Preview first 5 lines
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(0, 6); // Header + 5 rows
        setPreview(lines);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use different endpoint based on file type
      const endpoint = fileType === 'xml' 
        ? '/api/admin/bank-payments/import-xml'
        : '/api/admin/bank-payments/import';

      // Get session for authorization
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      // Map XML response to common format
      setResult({
        success: data.success || false,
        imported: data.imported || 0,
        duplicates: data.skipped || data.duplicates || 0,
        errors: data.error ? [data.error] : data.errors || []
      });
    } catch (error) {
      console.error('Error importing:', error);
      setResult({
        success: false,
        imported: 0,
        duplicates: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setImporting(false);
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
            <Upload className="text-blue-600" size={32} />
            Import bankových platieb
          </h1>
          <p className="text-gray-600 mt-1">Nahrajte CSV alebo XML súbor z vašej banky</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle size={20} />
          Podporované formáty
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">📄 CSV formát</h4>
            <p className="text-blue-800 mb-2">
              CSV súbor musí obsahovať nasledujúce stĺpce (presne v tomto poradí):
            </p>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4 text-sm">
              <li>datum zauctovania</li>
              <li>suma</li>
              <li>mena</li>
              <li>referencia platitela</li>
              <li>typ transakcie</li>
              <li>cislo uctu protistrany</li>
              <li>banka protistrany</li>
              <li>nazov protistrany</li>
              <li>informacia pre prijemcu</li>
              <li>doplnujuce udaje</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">📋 XML formát (CAMT.053)</h4>
            <p className="text-blue-800 text-sm">
              Štandardný bankový výpis vo formáte CAMT.053 (ISO 20022). 
              Automaticky parsuje transakcie, variabilné symboly a údaje platiteľa.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <label
            htmlFor="csv-upload"
            className={`
              flex flex-col items-center justify-center w-full h-64 
              border-2 border-dashed rounded-xl cursor-pointer
              transition-all duration-200
              ${
                file
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }
            `}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="text-blue-600 mb-4" size={48} />
                <p className="text-lg font-semibold text-gray-900 mb-2">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-xs text-gray-500 mt-4">Kliknite pre výber iného súboru</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="text-gray-400 mb-4" size={48} />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Vyberte CSV alebo XML súbor
                </p>
                <p className="text-sm text-gray-500">alebo ho pretiahnite sem</p>
              </div>
            )}
            <input
              id="csv-upload"
              type="file"
              accept=".csv,.xml"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-6">
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Importuje sa...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Importovať platby
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && !result && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Náhľad súboru (prvých 5 riadkov)
          </h3>
          <div className="overflow-x-auto">
            <pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {preview.join('\n')}
            </pre>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl shadow-md border p-6 ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            )}
            <div className="flex-1">
              <h3
                className={`font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? 'Import úspešný' : 'Import zlyhal'}
              </h3>

              {result.success && (
                <div className="space-y-2 text-green-800">
                  <p>✓ Importovaných: {result.imported} platieb</p>
                  {result.duplicates > 0 && (
                    <p>⚠ Preskočených (duplikáty): {result.duplicates} platieb</p>
                  )}
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-red-900 mb-2">Chyby:</p>
                  <ul className="list-disc list-inside text-red-800 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.success && (
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/admin/shop/banka')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Zobraziť platby
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
