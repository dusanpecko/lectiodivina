import { ReactNode } from 'react';

export const metadata = {
  title: 'Správa chýb | Admin',
  description: 'Správa používateľských hlásení o chybách v Lectio Divina obsahu',
};

export default function ErrorReportsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#40467b' }}>
              Správa chýb
            </h1>
            <p className="text-gray-600">
              Kontrola a spracovanie používateľských hlásení o chybách v obsahu
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: '#40467b' }}>
                Quality Control
              </div>
              <div className="text-sm text-gray-500">
                Community-driven corrections
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
