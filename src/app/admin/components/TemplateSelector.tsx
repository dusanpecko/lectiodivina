"use client";

import { X } from 'lucide-react';
import { useState } from 'react';
import { LECTIO_TEMPLATES, LectioTemplate } from './LectioTemplates';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: LectioTemplate) => void;
}

export default function TemplateSelector({ 
  isOpen, 
  onClose, 
  onSelect 
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Všetky', icon: '📚' },
    { id: 'basic', label: 'Základné', icon: '📝' },
    { id: 'liturgical', label: 'Liturgické', icon: '✝️' },
    { id: 'seasonal', label: 'Cez rok', icon: '🗓️' },
    { id: 'special', label: 'Špeciálne', icon: '⭐' },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? LECTIO_TEMPLATES 
    : LECTIO_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>📋</span>
              Výber šablóny Lectio Divina
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Vyberte si šablónu pre rýchlejší štart
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition
                  ${selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                  }
                `}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.lucideIcon;
              
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelect(template);
                    onClose();
                  }}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-500 hover:shadow-lg transition-all duration-200 text-left"
                >
                  {/* Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {template.icon}
                    </div>
                    {Icon && (
                      <Icon 
                        size={24} 
                        className="text-purple-600 opacity-50 group-hover:opacity-100 transition" 
                      />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${template.category === 'liturgical' ? 'bg-blue-100 text-blue-800' : ''}
                      ${template.category === 'seasonal' ? 'bg-green-100 text-green-800' : ''}
                      ${template.category === 'special' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${template.category === 'basic' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {categories.find(c => c.id === template.category)?.label || template.category}
                    </span>
                    
                    {/* Preview indicator */}
                    {Object.keys(template.fields).length > 0 && (
                      <span className="text-xs text-gray-500">
                        • {Object.keys(template.fields).length} sekcií
                      </span>
                    )}
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 border-2 border-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </button>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">🔍</div>
              <p>Žiadne šablóny v tejto kategórii</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Tip: Šablóny sú len výchoské body, môžete ich kedykoľvek upraviť
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Zrušiť
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
